import { Instagram, Youtube, Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
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
  const instagramLink = "https://www.instagram.com/endonezyakasifi";
  const youtubeLink = "https://www.youtube.com/@endonezyakasifi";
  const email = "uzelemehmet@gmail.com";
  const phone = "+905550343852";
  const indonesiaPhoneTel = "+6285888978383";
  const indonesiaPhoneDisplay = "+62 858 8897 8383";

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Evlilik ve Seyahat Rehberi
            </h3>
            <p className="text-gray-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Endonezya'nın en güzel noktalarını keşfetmek için yanınızdayız.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Hızlı Linkler
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/kesfet" className="hover:text-white transition">
                  Keşfet
                </Link>
              </li>
              <li>
                <Link to="/travel" className="hover:text-white transition">
                  Seyahat
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/youtube" className="hover:text-white transition">
                  YouTube
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              İletişim
            </h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white transition"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5" />
                <div className="text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <p>Perum.Taman Serua jl.Elodia blok p1 no.1</p>
                  <p>DEPOK/ENDONEZYA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <div className="flex flex-col">
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-white transition"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {phone}
                  </a>
                  <span className="text-xs text-gray-500" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Türkiye hattı (WhatsApp destekli)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <div className="flex flex-col">
                  <a
                    href={`tel:${indonesiaPhoneTel}`}
                    className="hover:text-white transition"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {indonesiaPhoneDisplay}
                  </a>
                  <span className="text-xs text-gray-500" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Endonezya hattı
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Sosyal Ağlar
            </h4>
            <div className="flex gap-4 items-center">
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-90 transition bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-full flex items-center justify-center"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-90 transition bg-red-600 p-2 rounded-full flex items-center justify-center"
                title="YouTube"
              >
                <Youtube size={18} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-50 hover:opacity-90 transition bg-emerald-500 p-2 rounded-full flex items-center justify-center"
                title="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p style={{ fontFamily: '"Poppins", sans-serif' }}>
            &copy; {currentYear} Evlilik ve Seyahat Rehberi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
