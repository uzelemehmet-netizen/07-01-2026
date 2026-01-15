import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const SUPPORTED_LANGS = ["tr", "en", "id"];

function normalizeLang(raw) {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (!v) return null;
  const base = v.split(/[-_]/)[0];
  if (base === "in") return "id"; // eski ISO kodu
  if (SUPPORTED_LANGS.includes(base)) return base;
  return null;
}

function detectFromQuerystring() {
  try {
    const url = new URL(window.location.href);
    return normalizeLang(url.searchParams.get("lang"));
  } catch {
    return null;
  }
}

function detectFromStorage() {
  try {
    return normalizeLang(localStorage.getItem("lang") || localStorage.getItem("i18nextLng"));
  } catch {
    return null;
  }
}

function detectFromCookie() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/i);
    return normalizeLang(m?.[1]);
  } catch {
    return null;
  }
}

function detectFromNavigator() {
  try {
    const langs = Array.isArray(navigator.languages) ? navigator.languages : [];
    for (const l of langs) {
      const normalized = normalizeLang(l);
      if (normalized) return normalized;
    }
    return normalizeLang(navigator.language);
  } catch {
    return null;
  }
}

function detectFromTimeZone() {
  // Ülke tespiti statik SPA'da kesin değildir; timeZone bir "en iyi tahmin".
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/^asia\/(jakarta|makassar|jayapura)$/i.test(tz)) return "id";
    if (/^europe\/istanbul$/i.test(tz)) return "tr";
    return null;
  } catch {
    return null;
  }
}

const languageDetector = {
  type: "languageDetector",
  async: false,
  init: () => {},
  detect: () => {
    return (
      detectFromQuerystring() ||
      detectFromStorage() ||
      detectFromCookie() ||
      detectFromNavigator() ||
      detectFromTimeZone() ||
      "tr"
    );
  },
  cacheUserLanguage: (lng) => {
    const normalized = normalizeLang(lng) || "tr";
    try {
      localStorage.setItem("lang", normalized);
      localStorage.setItem("i18nextLng", normalized);
    } catch {
      // ignore
    }
    try {
      document.cookie = `lang=${encodeURIComponent(normalized)}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }
  },
};

const resources = {
  tr: {
    translation: {
      navigation: {
        siteTitle: "Endonezya Kaşifi",
        siteSubtitle: "PT MoonStar Global Indonesia",
        home: "Ana Sayfa",
        about: "Hakkımızda",
        corporate: "Kurumsal",
        travel: "Seyahat",
        tours: "Tur Paketleri",
        explore: "Keşfet",
        wedding: "Evlilik",
        documents: "Dokümanlar",
        youtube: "YouTube",
        contact: "İletişim",
      },
    },
  },
  en: {
    translation: {
      navigation: {
        siteTitle: "Indonesia Explorer",
        siteSubtitle: "PT MoonStar Global Indonesia",
        home: "Home",
        about: "About",
        corporate: "Corporate",
        travel: "Travel",
        tours: "Tours",
        explore: "Explore",
        wedding: "Wedding Guidance",
        documents: "Documents",
        youtube: "YouTube",
        contact: "Contact",
      },
    },
  },
  id: {
    translation: {
      navigation: {
        siteTitle: "Endonezya Kaşifi",
        siteSubtitle: "PT MoonStar Global Indonesia",
        home: "Beranda",
        about: "Tentang Kami",
        corporate: "Perusahaan",
        travel: "Perjalanan",
        tours: "Paket Tur",
        explore: "Jelajahi",
        wedding: "Panduan Pernikahan",
        documents: "Dokumen",
        youtube: "YouTube",
        contact: "Kontak",
      },
    },
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: SUPPORTED_LANGS,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  try {
    document.documentElement.lang = normalizeLang(lng) || "tr";
  } catch {
    // ignore
  }
});

export default i18n;
