# Endonezya Turizm Web Sitesi

Vite + React ile inşa edilmiş basit ve hızlı bir web sitesi.

## Özellikler

- ✨ 8 sayfa (Ana Sayfa, Hakkımızda, Seyahat, Evlilik, İletişim, YouTube, Gizlilik, 404)
- 📱 Responsive tasarım (Tailwind CSS)
- 🚀 Çok hızlı (Vite build)
- ⚡ Client-side routing (React Router)
- 📝 İletişim ve Seyahat formu

## Kurulum

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

### Vercel'e Deploy

1. [Vercel](https://vercel.com) hesabı oluşturun
2. Projeyi GitHub'a push edin
3. Vercel dashboard'da `Import Project` tıklayın
4. GitHub repo'yu seçin
5. Deploy edin

### Alternatifler

Deployment:
- Vercel: `npm run build` sonrası Vercel ile otomatik deploy (önerilen)
- GitHub Pages: Vercel yerine GitHub Pages kullanabilirsiniz
- Heroku: Static host için uygun değildir

## Dosya Yapısı

```
web-sitem-new/
├── src/
│   ├── pages/        # Sayfa komponenti
│   ├── components/   # Reusable components
│   ├── App.jsx       # Router
│   ├── main.jsx      # Entry point
│   └── index.css     # Tailwind CSS
├── public/           # Static dosyalar
├── dist/             # Build output
├── index.html        # HTML template
├── vite.config.js    # Vite config
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Sayfalar

- `/` - Ana Sayfa
- `/about` - Hakkımızda
- `/contact` - İletişim Formu
- `/travel` - Seyahat Planı Formu
- `/wedding` - Evlilik Hizmetleri
- `/youtube` - YouTube Videoları
- `/privacy` - Gizlilik Politikası

## Teknolojiler

- React 18
- React Router 6
- Vite 5
- Tailwind CSS
- Lucide Icons

## Lisans

MIT
