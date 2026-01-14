import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Aktif sayfayı kontrol et
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getWhatsappLink = () => {
    const baseUrl = "https://wa.me/905550343852?text=";
    let message = "Merhaba, web sitenizden yazıyorum. Genel bilgi almak istiyorum.";

    if (location.pathname.startsWith("/wedding")) {
      message = "Endonezya'da evlilik hakkında bilgi almak istiyorum";
    } else if (location.pathname.startsWith("/travel")) {
      message = "Endonezya seyahati hakkında bilgi almak istiyorum";
    } else if (location.pathname.startsWith("/kesfet")) {
      message = "Endonezya'nın tatil destinasyonları hakkında bilgi almak istiyorum";
    } else if (location.pathname.startsWith("/youtube")) {
      message = "Merhaba, YouTube sayfanızı ziyaret ettim ve size bir şey sormak istiyorum";
    } else if (location.pathname.startsWith("/contact")) {
      message = "Merhaba, bir konu hakkında bilgi almak istiyorum";
    } else if (location.pathname === "/") {
      message = "Merhaba, size genel anlamda bir şey sormak istiyorum";
    }

    return baseUrl + encodeURIComponent(message);
  };

  const whatsappLink = getWhatsappLink();

  const navItems = useMemo(
    () => [
      { to: "/", label: t("navigation.home"), active: isActive("/") },
      { to: "/about", label: t("navigation.about"), active: isActive("/about") },
      { to: "/kurumsal", label: t("navigation.corporate"), active: isActive("/kurumsal") },
      { to: "/travel", label: t("navigation.travel"), active: isActive("/travel") },
      { to: "/tours", label: t("navigation.tours"), active: isActive("/tours") },
      { to: "/kesfet", label: t("navigation.explore"), active: isActive("/kesfet") },
      { to: "/wedding", label: t("navigation.wedding"), active: isActive("/wedding") },
      { to: "/dokumanlar", label: "Dokümanlar", active: isActive("/dokumanlar") },
      { to: "/youtube", label: "YouTube", active: isActive("/youtube") },
      { to: "/contact", label: t("navigation.contact"), active: isActive("/contact") },
    ],
    [location.pathname, t]
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-emerald-50 to-white shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 leading-tight"
            style={{ fontFamily: '"Poppins", sans-serif' }}
            aria-label="Ana sayfa"
          >
            {/* Mobile: icon mark only */}
            <img
              src="/ChatGPT%20Image%2014%20Oca%202026%2017_26_03.png"
              alt="Endonezya Kaşifi"
              className="h-12 w-auto md:hidden"
              loading="eager"
              decoding="async"
            />

            {/* Desktop: horizontal lockup */}
            <img
              src="/ChatGPT%20Image%2014%20Oca%202026%2017_26_03.png"
              alt="Endonezya Kaşifi"
              className="hidden md:block h-14 w-auto"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Mobil: WhatsApp + Menü */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full font-semibold shadow hover:shadow-lg transition-all duration-200"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
              <span className="text-xs">WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-emerald-200 bg-white text-gray-800 shadow-sm"
              aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <div className="hidden md:flex gap-3 items-center">
            <Link to="/" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/') 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-emerald-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.home')}
            </Link>
            <Link to="/about" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/about')
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.about')}
            </Link>
            <Link to="/kurumsal" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/kurumsal')
                ? 'bg-slate-800 text-white shadow-lg'
                : 'text-slate-700 hover:bg-slate-800 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.corporate')}
            </Link>
            <Link to="/travel" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/travel')
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.travel')}
            </Link>
            <Link to="/tours" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/tours')
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.tours')}
            </Link>
            <Link to="/kesfet" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/kesfet')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-orange-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.explore')}
            </Link>
            <Link to="/wedding" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/wedding')
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.wedding')}
            </Link>
            <Link to="/dokumanlar" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/dokumanlar')
                ? 'bg-sky-600 text-white shadow-lg'
                : 'text-sky-700 hover:bg-sky-600 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              Dokümanlar
            </Link>
            <Link to="/youtube" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/youtube')
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-red-600 hover:bg-red-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              YouTube
            </Link>
            <Link to="/contact" className={`px-2 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${
              isActive('/contact')
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-blue-600 hover:bg-blue-500 hover:text-white'
            }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('navigation.contact')}
            </Link>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* Mobil Menü (hamburger) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Menüyü kapat"
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-center pb-3">
                <img
                  src="/ChatGPT%20Image%2014%20Oca%202026%2017_26_03.png"
                  alt="Endonezya Kaşifi"
                  className="h-24 w-auto"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Menü</p>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 pb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={[
                      "w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                      item.active ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-800 hover:bg-slate-100",
                    ].join(" ")}
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {item.label}
                  </Link>
                ))}

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  <MessageCircle size={18} />
                  WhatsApp’tan yaz
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}













