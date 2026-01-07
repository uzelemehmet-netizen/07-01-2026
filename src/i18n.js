import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      navigation: {
        siteTitle: 'Evlilik ve Seyahat Rehberi',
        home: 'Ana Sayfa',
        about: 'Hakkımızda',
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
        siteTitle: 'Panduan Pernikahan & Liburan',
        home: 'Beranda',
        about: 'Tentang Kami',
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
