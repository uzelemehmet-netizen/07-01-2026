import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { openWhatsApp } from "../utils/whatsapp";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "905550343852";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPaymentDownModal, setShowPaymentDownModal] = useState(false);

  const state = location?.state || {};

  const amount = Number(state.amountToPayNowUsd) || 0;
  const reservationType = state.reservationType === "deposit" ? "deposit" : "full";

  const extrasSelected = Array.isArray(state.extrasSelected) ? state.extrasSelected : [];

  const paymentOptionsWhatsappText = useMemo(() => {
    const lines = [];
    lines.push("Havale/EFT ile ödeme yapmak istiyorum.");
    lines.push("");

    if (state.tourName) lines.push(`Tur: ${state.tourName}`);
    if (state.packageName) lines.push(`Paket: ${state.packageName}`);
    lines.push(`Katılımcı sayısı: ${Number(state.people) || 0}`);
    lines.push(`Uçak bileti: ${state.includeFlight ? "Dahil" : "Hariç"}`);
    if (state.includeFlight && state.flightLimitPerPersonUsd) {
      lines.push(`Uçak bileti limiti: kişi başı $${Number(state.flightLimitPerPersonUsd) || 0}’a kadar`);
    }
    if (!state.includeFlight && state.flightDeductionTotalUsd) {
      lines.push(`Uçak hariç indirimi: -$${Number(state.flightDeductionTotalUsd) || 0}`);
    }

    if (extrasSelected.length > 0) {
      lines.push("");
      lines.push("Seçilen opsiyonel aktiviteler:");
      extrasSelected.forEach((extra) => {
        const title = extra?.title || "";
        const day = Number(extra?.day);
        const perPerson = Number(extra?.estimatedPricePerPersonUsd) || 0;
        const dayPrefix = Number.isFinite(day) && day > 0 ? `${day}. gün | ` : "";
        lines.push(`- ${dayPrefix}${title} (kişi başı ~$${perPerson})`);
      });
    }

    lines.push("");
    lines.push(`Paket toplamı: $${Number(state.packageTotalUsd) || 0}`);
    lines.push(`Opsiyonel aktiviteler toplamı: $${Number(state.extrasTotalUsd) || 0}`);
    lines.push(`Genel toplam: $${Number(state.grandTotalUsd) || 0}`);
    lines.push(reservationType === "deposit"
      ? `Kapora (%${Number(state.depositPercent) || 0}): $${amount}`
      : `Ödenecek tutar: $${amount}`);

    const contact = state.contact || {};
    if (contact.name || contact.phone || contact.email || contact.notes) {
      lines.push("");
      lines.push("İletişim bilgileri:");
      if (contact.name) lines.push(`Ad Soyad: ${contact.name}`);
      if (contact.phone) lines.push(`Telefon: ${contact.phone}`);
      if (contact.email) lines.push(`E-posta: ${contact.email}`);
      if (contact.notes) lines.push(`Not: ${contact.notes}`);
    }

    return lines.join("\n");
  }, [
    amount,
    extrasSelected,
    reservationType,
    state.contact,
    state.depositPercent,
    state.extrasTotalUsd,
    state.flightDeductionTotalUsd,
    state.flightLimitPerPersonUsd,
    state.grandTotalUsd,
    state.includeFlight,
    state.packageName,
    state.packageTotalUsd,
    state.people,
    state.tourName,
  ]);

  const openWhatsAppWithText = (text) => {
    if (!WHATSAPP_NUMBER) {
      console.warn("VITE_WHATSAPP_NUMBER tanımlı değil.");
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    openWhatsApp(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-sky-50/40">
      <Navigation />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ödeme</h1>
          <p className="text-sm text-gray-600 mb-6">
            Bu sayfa, rezervasyon özetinizi gösterir ve ödeme adımına yönlendirir.
          </p>

          <div className="space-y-2 text-sm text-gray-800">
            <p>
              Tur: <span className="font-semibold">{state.tourName || "-"}</span>
            </p>
            <p>
              Paket: <span className="font-semibold">{state.packageName || "-"}</span>
            </p>
            <p>
              Katılımcı sayısı: <span className="font-semibold">{state.people || 0}</span>
            </p>
            <p>
              Uçak bileti: {state.includeFlight ? (
                <span className="font-semibold">Dahil</span>
              ) : (
                <span className="font-semibold">Hariç</span>
              )}
              {state.includeFlight && state.flightLimitPerPersonUsd ? (
                <span className="text-gray-600"> (kişi başı ${state.flightLimitPerPersonUsd}’a kadar)</span>
              ) : null}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-1">
              <p>
                Paket toplamı: <span className="font-semibold">${Number(state.packageTotalUsd) || 0}</span>
              </p>
              <p>
                Opsiyonel aktiviteler: <span className="font-semibold">${Number(state.extrasTotalUsd) || 0}</span>
              </p>
              <p>
                Genel toplam: <span className="font-semibold">${Number(state.grandTotalUsd) || 0}</span>
              </p>
              {reservationType === "deposit" && (
                <p>
                  Kapora (%{state.depositPercent || 0}): <span className="font-semibold">${amount}</span>
                </p>
              )}
              {reservationType === "full" && (
                <p>
                  Ödenecek tutar: <span className="font-semibold">${amount}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Geri dön
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPaymentDownModal(true);
              }}
              className="px-5 py-2 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              Ödeme adımına geç
            </button>
          </div>

          {showPaymentDownModal && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-gray-800">
                Kredi kartıyla ödeme sistemimiz şu an bakım nedeniyle kullanılamıyor, dilerseniz ödemeyi havale/EFT ile tamamlayın ya da kredi kartıyla ödeme sistemimiz yeniden aktif olduğunda size bildirelim.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs text-slate-600 font-medium">
                  Talebi WhatsApp ile gönder
                </p>
                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppWithText(paymentOptionsWhatsappText);
                  }}
                  className="w-full px-5 py-2 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
                >
                  Havale/EFT ile ödeme
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppWithText("kredi kartiyla odemek istiyorum");
                  }}
                  className="w-full px-5 py-2 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Kredi kartı ile ödemek istiyorum
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
