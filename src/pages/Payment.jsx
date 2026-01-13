import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { openWhatsApp } from "../utils/whatsapp";
import { useAuth } from "../auth/AuthProvider";
import { createReservationFromPaymentState } from "../utils/reservations";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "905550343852";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = location?.state || {};

  const [reservationId, setReservationId] = useState(state.reservationId || "");
  const [paymentReference, setPaymentReference] = useState(state.paymentReference || "");
  const [reservationBusy, setReservationBusy] = useState(false);
  const [reservationError, setReservationError] = useState("");

  const DEFAULT_FLIGHT_INCLUDED_LIMIT_USD = 750;
  const isFlightIncluded = state.includeFlight !== false;
  const effectiveFlightLimitPerPersonUsd = isFlightIncluded
    ? DEFAULT_FLIGHT_INCLUDED_LIMIT_USD
    : null;

  const amount = Number(state.amountToPayNowUsd) || 0;
  const reservationType = state.reservationType === "deposit" ? "deposit" : "full";

  const extrasSelected = Array.isArray(state.extrasSelected) ? state.extrasSelected : [];

  const people = Number(state.people) || 0;
  const packageTotalUsd = Number(state.packageTotalUsd) || 0;
  const extrasTotalUsd = Number(state.extrasTotalUsd) || 0;
  const grandTotalUsd = Number(state.grandTotalUsd) || 0;
  const depositPercent = Number(state.depositPercent) || 0;

  const perPersonPackageUsd = people > 0 ? Math.round((packageTotalUsd / people) * 100) / 100 : 0;
  const perPersonExtrasUsd = people > 0 ? Math.round((extrasTotalUsd / people) * 100) / 100 : 0;
  const perPersonGrandUsd = people > 0 ? Math.round((grandTotalUsd / people) * 100) / 100 : 0;

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      if (reservationId) return;
      if (!state?.tourId) return;

      setReservationBusy(true);
      setReservationError("");
      try {
        const result = await createReservationFromPaymentState({
          user,
          paymentState: state,
        });
        setReservationId(result?.id || "");
        setPaymentReference(result?.paymentReference || "");
      } catch (e) {
        console.error("Rezervasyon kaydı oluşturulamadı:", e);
        setReservationError("Rezervasyon kaydı oluşturulamadı. Lütfen sayfayı yenileyin veya WhatsApp'tan yazın.");
      } finally {
        setReservationBusy(false);
      }
    };

    run();
  }, [reservationId, state, user]);

  const paymentOptionsWhatsappText = useMemo(() => {
    const lines = [];
    lines.push("Ödeme yöntemleri hakkında bilgi almak istiyorum.");
    lines.push("");

    if (reservationId) lines.push(`Rezervasyon No: ${reservationId}`);
    if (paymentReference) lines.push(`Ödeme Referansı: ${paymentReference}`);

    if (state.tourName) lines.push(`Tur: ${state.tourName}`);
    if (state.packageName) lines.push(`Paket: ${state.packageName}`);
    lines.push(`Katılımcı sayısı: ${Number(state.people) || 0}`);
    lines.push(`Uçak bileti: ${isFlightIncluded ? "Dahil" : "Hariç"}`);
    if (isFlightIncluded) {
      lines.push(`Uçak bileti limiti: kişi başı $${Number(effectiveFlightLimitPerPersonUsd) || 0}’a kadar`);
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
    effectiveFlightLimitPerPersonUsd,
    isFlightIncluded,
    reservationId,
    paymentReference,
    reservationType,
    state.contact,
    state.depositPercent,
    state.extrasTotalUsd,
    state.grandTotalUsd,
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

  const cardPaymentRequestText = useMemo(() => {
    const lines = [];
    lines.push("Kredi kartı ile (3D Secure zorunlu) ödeme yapmak istiyorum.");
    lines.push("Kredi kartından IDR (veya mümkünse USD) tahsilat seçeneklerini paylaşır mısınız?");
    lines.push("");

    if (reservationId) lines.push(`Rezervasyon No: ${reservationId}`);
    if (paymentReference) lines.push(`Ödeme Referansı: ${paymentReference}`);

    if (state.tourName) lines.push(`Tur: ${state.tourName}`);
    if (state.packageName) lines.push(`Paket: ${state.packageName}`);
    lines.push(`Katılımcı sayısı: ${Number(state.people) || 0}`);
    lines.push(reservationType === "deposit"
      ? `Kapora (%${Number(state.depositPercent) || 0}): $${amount}`
      : `Ödenecek tutar: $${amount}`);

    const contact = state.contact || {};
    if (contact.name || contact.phone || contact.email) {
      lines.push("");
      lines.push("İletişim:");
      if (contact.name) lines.push(`Ad Soyad: ${contact.name}`);
      if (contact.phone) lines.push(`Telefon: ${contact.phone}`);
      if (contact.email) lines.push(`E-posta: ${contact.email}`);
    }

    return lines.join("\n");
  }, [amount, reservationId, paymentReference, reservationType, state.contact, state.depositPercent, state.packageName, state.people, state.tourName]);

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
              Rezervasyon No:{" "}
              <span className="font-semibold">
                {reservationBusy ? "Oluşturuluyor…" : reservationId || "-"}
              </span>
            </p>
            <p>
              Ödeme Referansı:{" "}
              <span className="font-semibold">
                {reservationBusy ? "Oluşturuluyor…" : paymentReference || "-"}
              </span>
              <span className="text-gray-600"> (Wise/SWIFT/EFT açıklamasına yazın)</span>
            </p>
            {reservationError ? (
              <p className="text-xs text-rose-700">{reservationError}</p>
            ) : null}
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
              Uçak bileti: {isFlightIncluded ? (
                <span className="font-semibold">Dahil</span>
              ) : (
                <span className="font-semibold">Hariç</span>
              )}
              {isFlightIncluded ? (
                <span className="text-gray-600"> (kişi başı ${effectiveFlightLimitPerPersonUsd}’a kadar)</span>
              ) : null}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-1">
              <p>
                Paket toplamı: <span className="font-semibold">${packageTotalUsd}</span>
                {people ? <span className="text-gray-600"> (kişi başı ${perPersonPackageUsd})</span> : null}
              </p>
              <p>
                Opsiyonel aktiviteler: <span className="font-semibold">${extrasTotalUsd}</span>
                {people ? <span className="text-gray-600"> (kişi başı ${perPersonExtrasUsd})</span> : null}
              </p>
              <p>
                Genel toplam: <span className="font-semibold">${grandTotalUsd}</span>
                {people ? <span className="text-gray-600"> (kişi başı ${perPersonGrandUsd})</span> : null}
              </p>
              {reservationType === "deposit" && (
                <p>
                  Kapora (%{depositPercent || 0}): <span className="font-semibold">${amount}</span>
                </p>
              )}
              {reservationType === "full" && (
                <p>
                  Ödenecek tutar: <span className="font-semibold">${amount}</span>
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-gray-900">Seçilen opsiyonel aktiviteler</p>
              {extrasSelected.length === 0 ? (
                <p className="text-sm text-gray-600 mt-1">Seçili ekstra yok.</p>
              ) : (
                <div className="mt-2 space-y-1 text-sm text-gray-800">
                  {extrasSelected.map((ex) => {
                    const title = ex?.title || 'Ekstra';
                    const day = Number(ex?.day);
                    const per = Number(ex?.estimatedPricePerPersonUsd) || 0;
                    const estTotal = per * (people || 0);
                    return (
                      <div key={ex?.id || ex?.title} className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                        <div>
                          <span className="font-semibold">{title}</span>
                          {Number.isFinite(day) && day > 0 ? <span className="text-gray-600"> • Gün {day}</span> : null}
                        </div>
                        <div className="text-gray-700">
                          {people ? `${people} kişi × $${per} ≈ $${estTotal}` : `Kişi başı ≈ $${per}`}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-500 mt-2">Not: Ekstra fiyatları tahminidir; nihai toplam teklif aşamasında netleşir.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-gray-900">İletişim</p>
              <div className="mt-2 space-y-1 text-sm text-gray-800">
                <p>Ad Soyad: <span className="font-semibold">{state?.contact?.name || '-'}</span></p>
                <p>Telefon: <span className="font-semibold">{state?.contact?.phone || '-'}</span></p>
                <p>E-posta: <span className="font-semibold">{state?.contact?.email || user?.email || '-'}</span></p>
                {state?.contact?.notes ? <p>Not: <span className="font-semibold">{state.contact.notes}</span></p> : null}
              </div>
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
            <a
              href="/docs/odeme-yontemleri.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors text-center"
            >
              Ödeme yöntemlerini görüntüle
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-gray-800 font-semibold">Ödeme seçenekleri</p>
            <p className="text-xs text-slate-600 mt-1">
              Fiyatlar USD olarak gösterilebilir; tahsilat işlem anındaki kur/komisyonlara göre IDR veya desteklenen para biriminde yapılabilir.
              Kredi kartında 3D Secure (3DS) zorunludur.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openWhatsAppWithText(cardPaymentRequestText)}
                className="w-full px-5 py-3 rounded-2xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors text-left"
              >
                Kredi Kartı (3D Secure) ile öde
                <div className="text-xs font-normal text-white/90 mt-1">IDR (veya mümkünse USD) tahsilat</div>
              </button>

              <a
                href="/docs/wise-odeme-talimatlari.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors text-left"
              >
                Wise ile ödeme
                <div className="text-xs font-normal text-slate-600 mt-1">Talimatları görüntüle</div>
              </a>

              <a
                href="/docs/swift-odeme-talimatlari.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors text-left"
              >
                SWIFT ile ödeme
                <div className="text-xs font-normal text-slate-600 mt-1">Banka transferi</div>
              </a>

              <a
                href="/docs/eft-fast-odeme-talimatlari.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors text-left"
              >
                EFT / FAST (Türkiye)
                <div className="text-xs font-normal text-slate-600 mt-1">Alternatif ödeme</div>
              </a>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600 font-medium">WhatsApp ile ödeme talebi gönder</p>
              <button
                type="button"
                onClick={() => openWhatsAppWithText(paymentOptionsWhatsappText)}
                className="mt-2 w-full px-5 py-2 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Ödeme özeti + alternatif yöntemler
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
