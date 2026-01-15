import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

function buildWhatsappLink(pathname) {
  const baseUrl = "https://wa.me/905550343852?text=";
  let message = "Merhaba, web sitenizden yazıyorum. Genel bilgi almak istiyorum.";

  const path = pathname || "/";

  if (path.startsWith("/wedding")) {
    message = "Endonezya'da evlilik hakkında bilgi almak istiyorum";
  } else if (path.startsWith("/travel")) {
    message = "Endonezya seyahati hakkında bilgi almak istiyorum";
  } else if (path.startsWith("/kesfet")) {
    message = "Endonezya'nın tatil destinasyonları hakkında bilgi almak istiyorum";
  } else if (path.startsWith("/youtube")) {
    message = "Merhaba, YouTube sayfanızı ziyaret ettim ve size bir şey sormak istiyorum";
  } else if (path.startsWith("/contact")) {
    message = "Merhaba, bir konu hakkında bilgi almak istiyorum";
  } else if (path.startsWith("/tours")) {
    message = "Merhaba, tur paketleri hakkında bilgi almak istiyorum";
  } else if (path.startsWith("/dokumanlar")) {
    message = "Merhaba, dokümanlarla ilgili bir soru sormak istiyorum";
  } else if (path === "/") {
    message = "Merhaba, size genel anlamda bir şey sormak istiyorum";
  }

  return baseUrl + encodeURIComponent(message);
}

export default function FloatingWhatsApp() {
  const location = useLocation();

  const isHidden = useMemo(() => {
    const path = location.pathname || "/";
    return path.startsWith("/admin");
  }, [location.pathname]);

  const whatsappLink = useMemo(() => buildWhatsappLink(location.pathname), [location.pathname]);

  if (isHidden) return null;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[80] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 font-semibold shadow-lg hover:shadow-xl transition-shadow"
      aria-label="WhatsApp"
    >
      <MessageCircle size={18} />
      <span className="text-sm">WhatsApp</span>
    </a>
  );
}
