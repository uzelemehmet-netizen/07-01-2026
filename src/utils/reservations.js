import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { RESERVATION_STATUS } from "./reservationStatus";

function generatePaymentReference() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `PAY-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
    }
  } catch {
    // ignore
  }
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PAY-${rand}`;
}

export async function createReservationFromPaymentState({ user, paymentState }) {
  const reservationType = paymentState?.reservationType === "full" ? "full" : "deposit";
  const paymentReference = String(paymentState?.paymentReference || "").trim() || generatePaymentReference();

  const audit = paymentState?.audit && typeof paymentState.audit === "object"
    ? {
        schemaVersion: Number(paymentState.audit.schemaVersion) || 1,
        auditId: paymentState.audit.auditId || null,
        createdAtClientIso: paymentState.audit.createdAtClientIso || null,
        acceptances: paymentState.audit.acceptances || null,
        legalDocs: paymentState.audit.legalDocs || null,
        client: paymentState.audit.client || null,
      }
    : null;

  const docRef = await addDoc(collection(db, "reservations"), {
    userId: user.uid,
    userEmail: user.email || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    paymentReference,

    status:
      reservationType === "deposit" ? RESERVATION_STATUS.PENDING_DEPOSIT : RESERVATION_STATUS.BALANCE_PAYMENT_OPEN,

    tourId: paymentState?.tourId || null,
    tourName: paymentState?.tourName || null,
    packageId: paymentState?.packageId || null,
    packageName: paymentState?.packageName || null,

    reservationType,
    people: Number(paymentState?.people) || 0,

    flight: {
      included: paymentState?.includeFlight !== false,
      limitPerPersonUsd: Number(paymentState?.flightLimitPerPersonUsd) || 0,
    },

    totalsUsd: {
      packageTotalUsd: Number(paymentState?.packageTotalUsd) || 0,
      extrasTotalUsd: Number(paymentState?.extrasTotalUsd) || 0,
      grandTotalUsd: Number(paymentState?.grandTotalUsd) || 0,
      amountToPayNowUsd: Number(paymentState?.amountToPayNowUsd) || 0,
      depositPercent: Number(paymentState?.depositPercent) || null,
    },

    extrasSelected: Array.isArray(paymentState?.extrasSelected) ? paymentState.extrasSelected : [],

    contact: {
      name: paymentState?.contact?.name || null,
      email: paymentState?.contact?.email || null,
      phone: paymentState?.contact?.phone || null,
      notes: paymentState?.contact?.notes || null,
    },

    paymentPolicy: {
      displayCurrency: "USD",
      chargeCurrencyPreferred: "IDR",
      require3ds: true,
      note:
        "Prices may be displayed in USD; card charge/settlement currency and FX rates depend on the provider and the card issuer.",
    },

    deliveryProof: {
      ek1: {
        channel: null,
        to: null,
        messageId: null,
        sentAt: null,
        note: null,
      },
    },

    audit,
  });

  return { id: docRef.id, paymentReference };
}
