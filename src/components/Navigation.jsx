import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();

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

  // Aktif sayfayı kontrol et
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-emerald-50 to-white shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center items-center md:justify-between gap-4">
          <Link to="/" className="text-xl md:text-2xl font-bold text-emerald-600" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {t('navigation.siteTitle')}
          </Link>

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

      {/* Mobil Sekmeler - Sayfa İçinde Alt Alta */}
      <div className="md:hidden bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-2">
        <Link to="/" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/') 
            ? 'bg-emerald-500 text-white' 
            : 'text-gray-700 hover:bg-emerald-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.home')}
        </Link>
        <Link to="/about" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/about')
            ? 'bg-emerald-500 text-white'
            : 'text-gray-700 hover:bg-emerald-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.about')}
        </Link>
        <Link to="/travel" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/travel')
            ? 'bg-emerald-500 text-white'
            : 'text-gray-700 hover:bg-emerald-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.travel')}
        </Link>
        <Link to="/tours" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/tours')
            ? 'bg-emerald-500 text-white'
            : 'text-gray-700 hover:bg-emerald-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.tours')}
        </Link>
        <Link to="/kesfet" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/kesfet')
            ? 'bg-orange-500 text-white'
            : 'text-gray-700 hover:bg-orange-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.explore')}
        </Link>
        <Link to="/wedding" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/wedding')
            ? 'bg-emerald-500 text-white'
            : 'text-gray-700 hover:bg-emerald-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.wedding')}
        </Link>
        <Link to="/youtube" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/youtube')
            ? 'bg-red-500 text-white'
            : 'text-red-600 hover:bg-red-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          YouTube
        </Link>
        <Link to="/contact" className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive('/contact')
            ? 'bg-blue-500 text-white'
            : 'text-blue-600 hover:bg-blue-50'
        }`} style={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('navigation.contact')}
        </Link>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>
      </div>
    </div>
    </>
  );
}













