import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Building2, BadgeCheck, Globe, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Corporate() {
  const company = {
    brand: 'Endonezya Kaşifi',
    legalName: 'PT MoonStar Global Indonesia',
    address:
      'Perum. Taman Serua Jalan Elodia Blok P1 No.1 RT 008 RW 008, Serua Bojongsari / Depok, Jawa Barat, Indonesia',
    tax: 'NPWP 59.422.0162-405.000',
    nib: '3275056712830021',
    email: 'endonezyakasifi@gmail.com',
    phoneTR: '+90 555 034 3852',
    phoneID: '+62 858 8897 8383',
    instagram: 'https://www.instagram.com/endonezyakasifi',
    youtube: 'https://www.youtube.com/@endonezyakasifi',
    dameTurk: 'https://www.dameturk.com',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section
        className="pt-20 pb-12 px-4 relative overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(15,23,42,0.80) 0%, rgba(30,64,175,0.65) 40%, rgba(16,185,129,0.55) 100%), url(https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 70%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-emerald-100 tracking-wide uppercase mb-2">
            <Building2 size={16} />
            Kurumsal
          </p>
          <h1
            className="text-3xl md:text-5xl font-semibold text-white mb-4"
            style={{ fontFamily: '"Poppins", sans-serif', textShadow: '0 4px 12px rgba(0,0,0,0.7)' }}
          >
            {company.brand} <span className="text-white/80">—</span> {company.legalName}
          </h1>
          <p
            className="text-base md:text-lg text-white/95 max-w-3xl mx-auto"
            style={{ fontFamily: '"Poppins", sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            Tur organizasyonu, Endonezya’da evlilik rehberliği ve grup şirketi markalarıyla sahada yürütülen hizmetler.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/60">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Marka ve ünvan
              </h2>
              <div className="space-y-2 text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <p>
                  <span className="font-semibold">Marka:</span> {company.brand}
                </p>
                <p>
                  <span className="font-semibold">Yasal ünvan:</span> {company.legalName}
                </p>
                <p>
                  <span className="font-semibold">NPWP:</span> {company.tax}
                </p>
                <p>
                  <span className="font-semibold">NIB:</span> {company.nib}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                YouTube ve Instagram hesap adlarımız <span className="font-semibold">endonezyakasifi</span> olarak kalır ve marka
                iletişimimizi destekler.
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3" style={{ fontFamily: '"Poppins", sans-serif' }}>
                İletişim ve adres
              </h2>
              <div className="space-y-3 text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="mt-0.5 text-emerald-700" />
                  <p>{company.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-emerald-700" />
                  <a className="hover:underline" href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-emerald-700" />
                  <a className="hover:underline" href="tel:+905550343852">
                    {company.phoneTR}
                  </a>
                  <span className="text-gray-500">(TR / WhatsApp)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-emerald-700" />
                  <a className="hover:underline" href="tel:+6285888978383">
                    {company.phoneID}
                  </a>
                  <span className="text-gray-500">(ID)</span>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={company.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-sm hover:shadow-sm transition"
                  >
                    <Globe size={16} /> Instagram
                  </a>
                  <a
                    href={company.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-sm hover:shadow-sm transition"
                  >
                    <Globe size={16} /> YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-slate-200 bg-white">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Faaliyet alanları ve markalar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {company.brand}
                </p>
                <p className="text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Endonezya tur organizasyonu, butik tur paketleri ve Endonezya’da evlilik rehberliği hizmetleri.
                </p>
              </div>

              <a
                href={company.dameTurk}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-sm transition block"
                aria-label="DaMeTurk web sitesini aç"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-slate-700 mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    DaMeTurk
                  </p>
                  <ExternalLink size={16} className="text-slate-500" />
                </div>
                <p className="text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  PT MoonStar Global Indonesia bünyesindeki orijinal Türk dondurması markamız.
                </p>
                <p className="mt-2 text-sm text-emerald-700 font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  dameturk.com
                </p>
              </a>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-slate-200 bg-slate-50">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Sık sorulan kısa sorular
            </h2>
            <div className="space-y-3">
              <details className="group rounded-xl bg-white border border-slate-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-2">
                  <BadgeCheck size={18} className="text-emerald-700" />
                  Bu site hangi şirkete bağlı?
                </summary>
                <p className="mt-2 text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Endonezya Kaşifi web sitesi ve operasyonlar, PT MoonStar Global Indonesia çatısı altında yürütülür.
                </p>
              </details>

              <details className="group rounded-xl bg-white border border-slate-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-2">
                  <BadgeCheck size={18} className="text-emerald-700" />
                  DaMeTurk sizin mi?
                </summary>
                <p className="mt-2 text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Evet. DaMeTurk, PT MoonStar Global Indonesia bünyesinde faaliyet gösteren alt markalarımızdan biridir ve kendi web
                  sitesi üzerinden hizmet verir.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
