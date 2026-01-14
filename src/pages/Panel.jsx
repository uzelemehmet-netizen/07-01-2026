import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { auth, db } from "../config/firebase";
import { useAuth } from "../auth/AuthProvider";
import { getReservationStatusLabel, normalizePhoneForWhatsApp, RESERVATION_STATUS } from "../utils/reservationStatus";
import { formatMaybeTimestamp } from "../utils/formatDate";
import { downloadJson } from "../utils/downloadFile";
import { downloadEk1Html, openEk1InNewTab } from "../utils/ek1";

export default function Panel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "reservations"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setReservations(items);
        setReservationsLoading(false);
      },
      (err) => {
        console.error("Rezervasyonlar yüklenemedi:", err);
        setReservationsLoading(false);
      }
    );

    return unsub;
  }, [user?.uid]);

  const whatsappNumber = useMemo(() => {
    const raw = import.meta.env.VITE_WHATSAPP_NUMBER || "905550343852";
    return String(raw).replace(/\D/g, "");
  }, []);

  const openWhatsApp = (text) => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-emerald-50/40">
      <Navigation />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panelim</h1>
              <p className="text-sm text-gray-600 mt-1">Rezervasyonlarınız ve ödeme adımlarınız burada görünecek.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Çıkış
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logos/moonstar-mark-square.png"
                alt="PT MoonStar Global Indonesia"
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white object-contain"
                loading="lazy"
              />
              <div>
                <p className="text-[11px] text-slate-600">Yasal satıcı</p>
                <p className="text-sm font-semibold text-slate-900">PT MoonStar Global Indonesia</p>
              </div>
            </div>
            <Link
              to="/kurumsal"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-white transition-colors text-center"
            >
              Kurumsal
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Hesap</p>
            <p className="text-sm text-slate-700 mt-1">E-posta: <span className="font-semibold">{user?.email || "-"}</span></p>
            {user?.displayName ? (
              <p className="text-sm text-slate-700">Ad: <span className="font-semibold">{user.displayName}</span></p>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Rezervasyonlar</p>
            {reservationsLoading ? (
              <p className="text-sm text-slate-600 mt-1">Yükleniyor…</p>
            ) : reservations.length === 0 ? (
              <p className="text-sm text-slate-600 mt-1">
                Henüz rezervasyon kaydınız yoksa, turlardan birini seçip kapora adımına geçebilirsiniz.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {reservations.map((r) => {
                  const statusLabel = getReservationStatusLabel(r.status);
                  const created = formatMaybeTimestamp(r.createdAt);
                  const amountNow = Number(r?.totalsUsd?.amountToPayNowUsd) || 0;
                  const packageTotalUsd = Number(r?.totalsUsd?.packageTotalUsd) || 0;
                  const extrasTotalUsd = Number(r?.totalsUsd?.extrasTotalUsd) || 0;
                  const grandTotalUsd = Number(r?.totalsUsd?.grandTotalUsd) || 0;
                  const depositPercent = Number(r?.totalsUsd?.depositPercent) || 0;
                  const people = Number(r?.people) || 0;
                  const contactPhone = r?.contact?.phone || "";

                  const perPersonPackageUsd = people > 0 ? Math.round((packageTotalUsd / people) * 100) / 100 : 0;
                  const perPersonExtrasUsd = people > 0 ? Math.round((extrasTotalUsd / people) * 100) / 100 : 0;
                  const perPersonGrandUsd = people > 0 ? Math.round((grandTotalUsd / people) * 100) / 100 : 0;

                  const extras = Array.isArray(r?.extrasSelected) ? r.extrasSelected : [];
                  const depositPaymentMethod = r?.depositPaymentMethod || '';
                  const paymentReference = r?.paymentReference || '';

                  const canRequestBalance = r.status === RESERVATION_STATUS.BALANCE_PAYMENT_OPEN;

                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{r.tourName || "Tur"}</p>
                          <p className="text-xs text-slate-600 mt-1">Rezervasyon No: <span className="font-semibold">{r.id}</span></p>
                          {created ? <p className="text-xs text-slate-500">Oluşturma: {created}</p> : null}
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-600">Durum</p>
                          <p className="text-sm font-semibold text-slate-900">{statusLabel}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">Kapora</p>
                          <p className="text-sm font-semibold text-slate-900">${amountNow}{depositPercent ? ` (\u0025${depositPercent})` : ''}</p>
                          <p className="text-[11px] text-slate-500 mt-1">Kapora alındıktan sonra teklif netleşir ve kalan ödeme açılır.</p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">Ödeme yöntemleri</p>
                          <a
                            href="/docs/odeme-yontemleri.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-sky-700 hover:underline"
                          >
                            Görüntüle
                          </a>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-white border border-slate-200 p-3">
                        <p className="text-xs text-slate-600">Ödeme referansı</p>
                        <p className="text-sm font-semibold text-slate-900">{paymentReference || '-'}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Wise/SWIFT/EFT açıklamasına yazmanız önerilir.</p>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">İletişim bilgileri</p>
                          <p className="text-sm text-slate-900 mt-1">
                            {r?.contact?.name ? <span className="font-semibold">{r.contact.name}</span> : <span className="text-slate-500">-</span>}
                          </p>
                          <p className="text-sm text-slate-700">E-posta: <span className="font-semibold">{r?.contact?.email || r?.userEmail || '-'}</span></p>
                          <p className="text-sm text-slate-700">Telefon: <span className="font-semibold">{r?.contact?.phone || '-'}</span></p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">Paket</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">{r?.packageName || '-'}</p>
                          <p className="text-sm text-slate-700">Kişi sayısı: <span className="font-semibold">{people || 0}</span></p>
                          {depositPaymentMethod ? (
                            <p className="text-[11px] text-slate-500 mt-1">Kapora ödeme yöntemi (admin): <span className="font-semibold">{depositPaymentMethod}</span></p>
                          ) : (
                            <p className="text-[11px] text-slate-500 mt-1">Kapora ödeme yöntemi: <span className="font-semibold">(henüz işaretlenmedi)</span></p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">Paket toplamı</p>
                          <p className="text-sm font-semibold text-slate-900">${packageTotalUsd}</p>
                          {people ? <p className="text-[11px] text-slate-500 mt-1">Kişi başı: ${perPersonPackageUsd}</p> : null}
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">Ekstralar toplamı</p>
                          <p className="text-sm font-semibold text-slate-900">${extrasTotalUsd}</p>
                          {people ? <p className="text-[11px] text-slate-500 mt-1">Kişi başı: ${perPersonExtrasUsd}</p> : null}
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-xs text-slate-600">Genel toplam</p>
                          <p className="text-sm font-semibold text-slate-900">${grandTotalUsd}</p>
                          {people ? <p className="text-[11px] text-slate-500 mt-1">Kişi başı: ${perPersonGrandUsd}</p> : null}
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-white border border-slate-200 p-3">
                        <p className="text-xs font-semibold text-slate-900">Seçilen opsiyonel aktiviteler</p>
                        {extras.length === 0 ? (
                          <p className="text-sm text-slate-600 mt-1">Seçili ekstra yok.</p>
                        ) : (
                          <div className="mt-2 space-y-1">
                            {extras.map((ex) => {
                              const title = ex?.title || 'Ekstra';
                              const day = Number(ex?.day);
                              const per = Number(ex?.estimatedPricePerPersonUsd) || 0;
                              const estTotal = per * (people || 0);
                              return (
                                <div key={ex?.id || ex?.title} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                                  <div className="text-slate-900">
                                    <span className="font-semibold">{title}</span>
                                    {Number.isFinite(day) && day > 0 ? <span className="text-slate-500"> • Gün {day}</span> : null}
                                  </div>
                                  <div className="text-slate-700">
                                    {people ? `${people} kişi × $${per} ≈ $${estTotal}` : `Kişi başı ≈ $${per}`}
                                  </div>
                                </div>
                              );
                            })}
                            <p className="text-[11px] text-slate-500 mt-2">Not: Ekstra fiyatları tahminidir; nihai toplam admin teklifinde netleşir.</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => downloadEk1Html({ reservation: { id: r.id, ...r } })}
                          className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                        >
                          Ek-1 indir (HTML)
                        </button>

                        <button
                          type="button"
                          onClick={() => openEk1InNewTab({ reservation: { id: r.id, ...r } })}
                          className="px-4 py-2 rounded-full border border-emerald-300 text-emerald-800 text-sm font-semibold hover:bg-emerald-50"
                        >
                          Ek-1 önizle
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadJson({ filename: `reservation-${r.id}`, data: { id: r.id, ...r } })}
                          className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                        >
                          Log indir (JSON)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openWhatsApp(
                              [
                                "Kapora ödememi yaptım, dekontu paylaşıyorum.",
                                `Rezervasyon No: ${r.id}`,
                                paymentReference ? `Ödeme Referansı: ${paymentReference}` : "",
                                r.tourName ? `Tur: ${r.tourName}` : "",
                                `Kapora: $${amountNow}`,
                              ].filter(Boolean).join("\n")
                            );
                          }}
                          className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                        >
                          Kapora dekontu gönder
                        </button>

                        <button
                          type="button"
                          disabled={!canRequestBalance}
                          onClick={() => {
                            openWhatsApp(
                              [
                                "Rezervasyonu tamamlamak (kalan ödeme) istiyorum.",
                                `Rezervasyon No: ${r.id}`,
                                r.tourName ? `Tur: ${r.tourName}` : "",
                                contactPhone ? `Telefon: ${normalizePhoneForWhatsApp(contactPhone)}` : "",
                              ].filter(Boolean).join("\n")
                            );
                          }}
                          className={
                            canRequestBalance
                              ? "px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
                              : "px-4 py-2 rounded-full border border-slate-300 text-slate-400 text-sm font-semibold cursor-not-allowed"
                          }
                        >
                          Rezervasyonu tamamla
                        </button>
                      </div>

                      {!canRequestBalance ? (
                        <p className="mt-2 text-xs text-slate-600">
                          Not: Kalan ödeme adımı, admin tur planı ve nihai fiyatları netleştirdikten sonra aktif edilir.
                        </p>
                      ) : null}

                      {r.status === RESERVATION_STATUS.DEPOSIT_PAID ? (
                        <p className="mt-2 text-xs text-emerald-700">
                          Kapora alındı. Tur planı ve nihai fiyatlar netleştiğinde kalan ödeme adımı açılacaktır.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/tours"
                className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Turları incele
              </Link>
              <a
                href="/docs/odeme-yontemleri.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50"
              >
                Ödeme yöntemleri
              </a>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Not: Kapora ödendikten sonra "Rezervasyonu Tamamla" adımı, admin tarafından tur planı ve nihai fiyatlar netleştirildikten sonra aktif edilir.
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
