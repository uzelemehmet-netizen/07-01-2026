import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      navigation: {
        siteTitle: 'Endonezya Kaşifi',
        siteSubtitle: 'PT MoonStar Global Indonesia',
        home: 'Ana Sayfa',
        about: 'Hakkımızda',
        corporate: 'Kurumsal',
        travel: 'Seyahat',
        tours: 'Tur Paketleri',
        explore: 'Keşfet',
        wedding: 'Evlilik',
        youtube: 'YouTube',
        contact: 'İletişim',
      },
    },
  },
  id: {
    translation: {
      navigation: {
        siteTitle: 'Endonezya Kaşifi',
        siteSubtitle: 'PT MoonStar Global Indonesia',
        home: 'Beranda',
        about: 'Tentang Kami',
        corporate: 'Perusahaan',
        travel: 'Perjalanan',
        tours: 'Paket Tur',
        explore: 'Jelajahi',
        wedding: 'Pernikahan',
        youtube: 'YouTube',
        contact: 'Kontak',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
