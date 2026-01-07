import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HeroSocialButtons from '../components/HeroSocialButtons';
import { Heart, MessageCircle, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

export default function Wedding() {
  const [formData, setFormData] = useState({
    from_name: '',
    phone: '',
    city: '',
    age: '',
    services: [],
    wedding_date: '',
    privacy_consent: false,
  });
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Endonezya\'da evlilik süreci ortalama ne kadar sürer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Belgelerinizin hazır olma durumuna, başvurduğunuz şehre ve kurum yoğunluğuna göre değişmekle birlikte, çoğu çift için sürecin planlama ve resmi işlemler bölümü birkaç hafta ile birkaç ay arasında tamamlanır.',
        },
      },
      {
        '@type': 'Question',
        name: 'Endonezya\'da evlilik için önce hangi adımı atmalıyım?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Önce hangi belgelerin sizden istendiğini netleştirmek gerekir. Belgeler listesini inceledikten sonra, bulunduğunuz şehir ve durumunuza göre sizin için güncel bir kontrol listesi oluşturmak üzere bizimle WhatsApp üzerinden iletişime geçebilirsiniz.',
        },
      },
      {
        '@type': 'Question',
        name: 'Evlilik sürecini baştan sona siz mi takip ediyorsunuz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Talebinize göre yalnızca belirli adımlarda destek verebildiğimiz gibi, uçtan uca tüm evrak, randevu ve resmi işlemleri sizin adınıza organize ederek süreci baştan sona takip edebiliyoruz.',
        },
      },
      {
        '@type': 'Question',
        name: 'Evlilik işlemlerimi kendim yapabilir miyim?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Evet, süreci kendi başınıza da yürütebilirsiniz; ancak tüm adımları ve istenen belgeleri detaylarıyla bildiğinizden emin olmanız çok önemlidir. Yapacağınız küçük bir hata, yanlış bir başvuru veya eksik bir evrak hem zaman hem de maddi açıdan ciddi kayıplara yol açabilir ve süreci manevi olarak da olumsuz etkileyebilir.',
        },
      },
    ],
  };

  useEffect(() => {
    emailjs.init({
      publicKey: 'RD9IcpOFrg9qQ4QdV',
      blockHeadless: false,
    });
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const services = [
    'Danışmanlık',
    'Evrak Takibi',
    'Ailelerarası İletişim',
    'Ulaşım',
    'Tercümelik',
    'Süreç Boyunca Rehberlik',
    'Konaklama',
    'Balayı',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.privacy_consent) {
      setError('Gizlilik politikasını okuduğunuzu ve kabul ettiğinizi onaylamalısınız.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await emailjs.send('service_j96qdb7', 'template_rsmu1gk', {
        from_name: formData.from_name,
        phone: formData.phone,
        city: formData.city,
        age: formData.age,
        services: formData.services.join(', '),
        wedding_date: formData.wedding_date,
        to_email: 'articelikkapi@gmail.com',
      });

      if (response.status === 200) {
        if (window.gtag) {
          window.gtag('event', 'conversion', {
            send_to: 'AW-17732388792/X1NRCLaZ4sQbELiPu4dC',
            value: 1.0,
            currency: 'TRY',
            transaction_id: response.status,
          });
        }
        setSuccess(true);
        setFormData({
          from_name: '',
          phone: '',
          city: '',
          age: '',
          services: [],
          wedding_date: '',
          privacy_consent: false,
        });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError('Teklif gönderilirken hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('EmailJS Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section
        className="pt-20 pb-12 px-4 relative overflow-hidden min-h-80"
        style={{
		  backgroundImage: 'url(https://res.cloudinary.com/dj1xg1c56/image/upload/v1767352126/ChatGPT_Image_16_Ara_2025_20_55_54_cncrpw.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center text-center min-h-80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/80 shadow-md mb-3">
            <Heart size={18} className="text-white" />
            <span
              className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide text-white drop-shadow-md"
            >
              Türk – Endonezyalı çiftlere özel rehberlik
            </span>
          </div>

          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-3 drop-shadow-[0_6px_20px_rgba(0,0,0,0.65)]"
          >
            Endonezya'da Evlilik Hazırlıklarınız İçin Yanınızdayız
          </h1>

          <p
            className="text-xs md:text-sm text-white/95 max-w-2xl mb-5 md:mb-6 leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]"
          >
            Evraklar, resmi işlemler, ailelerarası iletişim ve Endonezya'daki tüm organizasyon sürecini birlikte planlayarak bu süreci
            kafanızı kurcalayan sorulardan uzak, güven veren bir yolculuğa dönüştürüyoruz.
          </p>
        </div>

        {/* Hero alt buton grubu */}
        <div className="absolute inset-x-0 bottom-5 md:bottom-7 z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('wedding-form');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600/95 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full font-medium text-xs md:text-sm shadow-md hover:bg-rose-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Heart size={18} className="text-white" />
              Evlilik Planı Formunu Aç
            </button>

            <a
              href="https://wa.me/905550343852?text=Endonezya'da%20evlilik%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/95 text-rose-700 px-5 md:px-6 py-2 md:py-2.5 rounded-full font-medium text-xs md:text-sm shadow-md hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Phone size={18} className="text-rose-500" />
              WhatsApp ile Hızlı Görüşme
            </a>
          </div>
        </div>

        <HeroSocialButtons />
      </section>

      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* İçerik Bölümü */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-16">
          {/* Sol Taraf - Yazılar */}
          <div className="space-y-8 order-2 lg:order-1 flex flex-col justify-center">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 rounded-xl shadow-lg border border-rose-100">
                <h3 className="text-3xl font-bold text-rose-600 mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>Hizmetlerimiz</h3>

                {/* Hizmet Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-rose-100">
                  <h4 className="font-semibold text-rose-600 mb-2 text-sm">Evrak ve Resmî İşlemler</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Gerekli tüm evrakların hazırlanması ve kontrolü</li>
                    <li>✓ Nikâh için resmi başvuru ve süreç takibi</li>
                    <li>✓ Nikâh sonrası resmî işlemlerin tamamlanması</li>
                  </ul>
                </div>

                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-rose-100">
                  <h4 className="font-semibold text-rose-600 mb-2 text-sm">İletişim ve Tercümanlık</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Eş adayınız ve ailesiyle iletişim desteği</li>
                    <li>✓ WhatsApp ve yüz yüze görüşmelerde tercümanlık</li>
                    <li>✓ Süreç boyunca aklınızdaki sorulara net yanıtlar</li>
                  </ul>
                </div>

                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-rose-100">
                  <h4 className="font-semibold text-rose-600 mb-2 text-sm">Ulaşım ve Konaklama</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ İlk kez yurt dışına çıkacaklar için yolculuk planı</li>
                    <li>✓ Endonezya içinde özel araçla ulaşım organizasyonu</li>
                    <li>✓ Otel ve konaklama planlaması</li>
                  </ul>
                </div>

                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-rose-100">
                  <h4 className="font-semibold text-rose-600 mb-2 text-sm">Sürekli Rehberlik ve Vize</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Nikâh tamamlanana kadar kesintisiz rehberlik</li>
                    <li>✓ Endonezya'da yaşamak için vize ve oturum izni danışmanlığı</li>
                    <li>✓ Türkiye'de yaşamak için eş vizesi ve oturum süreci yönlendirmesi</li>
                  </ul>
                </div>
              </div>

              {/* Alt Açıklama / Dipnot */}
              <div className="mt-4 pt-6 border-t border-rose-200">
                <h4 className="text-xl font-bold text-rose-600 mb-3" style={{ fontFamily: '"Poppins", sans-serif' }}>Esnek Hizmet Anlayışı</h4>
                <p className="text-gray-700 leading-relaxed text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Tüm hizmetlerimizden A'dan Z'ye faydalanabileceğiniz gibi, yalnızca ihtiyaç duyduğunuz alanlarda destek talep edebilirsiniz.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  YouTube sayfamızdaki videoları izleyerek süreci, bizi ve çalışma şeklimizi daha yakından tanıyabilirsiniz.
                </p>

                <p className="text-xs font-light text-gray-600 mt-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Aşağıdan "Evlilik Planı" formunu doldurabilir ya da "Endonezya'da Evlilik Belgeleri" sekmesinden gerekli evrakları detaylı inceleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* 3 Adımda Süreç */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col items-start bg-white border border-rose-100 rounded-xl p-4 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600 mb-3">
                  <span className="font-semibold text-sm">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>Sizi ve Durumunuzu Tanıyoruz</h4>
                <p className="text-xs text-gray-600" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Formu dolduruyorsunuz; sizden aldığımız bilgilerle ihtiyaçlarınızı netleştiriyoruz.
                </p>
              </div>

              <div className="flex flex-col items-start bg-white border border-rose-100 rounded-xl p-4 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600 mb-3">
                  <span className="font-semibold text-sm">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>Sizinle Birlikte Planlıyoruz</h4>
                <p className="text-xs text-gray-600" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Belgeler, tarih ve süreç adımlarını; bütçenize ve beklentilerinize göre birlikte şekillendiriyoruz.
                </p>
              </div>

              <div className="flex flex-col items-start bg-white border border-rose-100 rounded-xl p-4 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600 mb-3">
                  <span className="font-semibold text-sm">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>Süreci Adım Adım Yönetiyoruz</h4>
                <p className="text-xs text-gray-600" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Endonezya'ya inişinizden nikâhın tamamlanmasına kadar her adımda yanınızdayız.
                </p>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Görseller */}
          <div className="order-1 lg:order-2 flex items-start justify-center">
            <div className="w-full max-w-md mx-auto space-y-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl h-64 md:h-72 lg:h-72">
                <img
                  src="https://cvcou9szpd.ucarecd.net/84807d3a-fc15-4eb8-ab91-df06aafd02b9/-/preview/562x1000/"
                  alt="Endonezya'da evlilik hazırlığı detay"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="https://cvcou9szpd.ucarecd.net/b85878d8-0625-4881-9e5b-b36981b06970/20250917_155623.jpg"
                  alt="Endonezya'da evlilik töreni"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-12 bg-gray-50 p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab('plan')}
              className={
                activeTab === 'plan'
                  ? 'px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex-1 bg-white text-rose-600 shadow-lg border border-rose-200'
                  : 'px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex-1 bg-rose-600 text-white hover:bg-rose-700'
              }
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Evlilik Planı
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={
                activeTab === 'documents'
                  ? 'px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex-1 bg-white text-rose-600 shadow-lg border border-rose-200'
                  : 'px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex-1 bg-rose-600 text-white hover:bg-rose-700'
              }
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Endonezya'da Evlilik Belgeleri
            </button>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'plan' && (
          <div id="wedding-form" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Evlilik Planınızı Bize İletin
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Aşağıdaki alanları doldurun; size en kısa sürede, durumunuza özel bir dönüş yapalım.
          </p>

          {success && (
            <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-rose-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-rose-800" style={{ fontFamily: '"Poppins", sans-serif' }}>Talebiniz başarıyla gönderildi!</p>
                <p className="text-sm text-rose-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  formu doldurdugunuz icin tesekkur ederiz 24 saat icinde size geri donus yapacagiz
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <p className="text-red-800" style={{ fontFamily: '"Poppins", sans-serif' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Adım 1: Temel Bilgiler */}
            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/60">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>1. Temel Bilgileriniz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="from_name"
                    value={formData.from_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                    placeholder="Adınız ve soyadınız"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    İletişim Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                    placeholder="+90 555 034 3852"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Şehir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                    placeholder="Yaşadığınız şehir"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Yaş <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                    placeholder="Yaşınız"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Adım 2: İhtiyaç Duyduğunuz Hizmetler */}
            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/60">
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>2. İhtiyaç Duyduğunuz Hizmetler</h3>
              <p className="text-xs text-gray-600 mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Birden fazla seçenek işaretleyebilirsiniz. Emin olmadığınız alanlar varsa boş bırakabilirsiniz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => handleServiceChange(service)}
                    className={
                      `flex items-center justify-between w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-150 ` +
                      (formData.services.includes(service)
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50/60')
                    }
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <span>{service}</span>
                    {formData.services.includes(service) && (
                      <CheckCircle size={16} className="text-rose-500 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Adım 3: Tarih ve Onay */}
            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/60 space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Planlanan Evlilik Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="wedding_date"
                  value={formData.wedding_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                />
              </div>

              <div className="flex items-start p-4 bg-white rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="privacy_consent"
                  name="privacy_consent"
                  checked={formData.privacy_consent}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="privacy_consent" className="ml-3 text-gray-700 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <span className="font-semibold">
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">
                      Gizlilik Politikası
                    </a>
                    nı okudum ve onaylıyorum
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Paylaştığınız bilgiler yalnızca düğün planlama amaçlı kullanılacaktır ve hiçbir şekilde üçüncü taraflara verilmeyecektir.
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-semibold hover:bg-rose-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {loading ? 'Gönderiliyor...' : 'Evlilik Planım İçin Teklif Al'}
              </button>
              <p className="text-xs text-gray-500 text-center" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Formu doldurmak istemiyorsanız, sayfanın altındaki WhatsApp butonundan da bize direkt ulaşabilirsiniz.
              </p>
            </div>
          </form>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Endonezya'da Yabancı – Endonezyalı Evlilik İçin Gerekli Belgeler
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Aşağıdaki başlıklar genel bilgilendirme içindir. Sizin durumunuz için net ve güncel listeyi birlikte kontrol ediyoruz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {/* Yabancı Eş Kartı */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-full flex flex-col">
              <h3 className="text-xl font-bold text-rose-600 mb-3">Yabancı Eş İçin Belgeler</h3>
              <p className="text-gray-600 text-sm mb-3">
                Genel olarak yabancı eşten talep edilen temel belgeler:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                <li>Geçerli pasaport (en az 6 ay geçerlilik süresi ile)</li>
                <li>Endonezya'ya giriş vizesi veya ITAS/ITAP</li>
                <li>Evlenme Ehliyet Belgesi (Endonezya Türk Büyükelçiliğinden)</li>
                <li>Doğum belgesi (çok dilli)</li>
                <li>Bekârlık belgesi (Endonezce çevrili ve apostilli)</li>
                <li>Varsa boşanma kararı veya vefat belgesi (çevrili ve noter onaylı)</li>
                <li>İkamet belgesi</li>
                <li>Son 6 ayda çekilmiş vesikalık fotoğraf</li>
              </ul>
            </div>

            {/* Endonezyalı Eş Kartı */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-full flex flex-col">
              <h3 className="text-xl font-bold text-rose-600 mb-3">Endonezyalı Eş İçin Belgeler</h3>
              <p className="text-gray-600 text-sm mb-3">
                Endonezya vatandaşı eşten ise çoğu başvuruda şu belgeler istenir:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                <li>KTP (kimlik kartı)</li>
                <li>Akte Lahir (doğum belgesi)</li>
                <li>Kartu Keluarga (aile nüfus kaydı)</li>
                <li>Medeni durum belgesi (bekâr / boşanmış / dul)</li>
                <li>N1-N10 arası formlar ve RW-RT onayları</li>
                <li>Son 6 ayda çekilmiş vesikalık fotoğraf</li>
              </ul>
            </div>
          </div>

          {/* Ek Belgeler & Bilgilendirme */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-rose-600 mb-3">Ek Olarak İstenebilecekler</h3>
              <p className="text-gray-600 text-sm mb-3">
                Her dosyada zorunlu olmamakla birlikte bazı şehirlerde aşağıdaki belgeler de talep edilebilir:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                <li>Gelir belgesi veya maddi durum beyanı</li>
                <li>Adli sicil kaydı</li>
                <li>Sağlık raporu</li>
                <li>Diploma</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <h3 className="text-lg font-bold text-blue-700 mb-3">📌 Önemli Notlar</h3>
              <ul className="space-y-2 text-sm text-blue-900 list-disc list-inside">
                <li>Birçok belge için apostil ve Endonezce tercüme zorunludur. (Eş adayınızın bağlı olduğu KUA'dan öğrenin)</li>
                <li>Yapılacak bir harf hatası, eksik bir belge veya bilgi işlem sıralamasındaki bir hata tüm işlemleri olumsuz etkileyebilir.</li>
                <li>Şehir, kurum ve memura göre evrak listesi ve işleyiş değişebilir.</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Kişisel Durum Farklılıkları</h3>
              <p className="text-sm text-yellow-900 mb-2">
                Bu başlıklar genel çerçeveyi anlatır; önceki evlilik, çocuk durumu, vatandaşlık gibi konular evrak listenizi değiştirebilir.
              </p>
              <p className="text-sm text-yellow-900">
                Sizin durumunuz için net listeyi birlikte kontrol edip, eksiksiz hazırlamanız için adım adım yönlendiriyoruz.
              </p>
            </div>
          </div>

          {/* Sık Sorulan Sorular (Kısa) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sık Sorulan Sorular</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold">Evlilik süreci ortalama ne kadar sürüyor?</p>
                <p>
                  Belgelerinizin hazır olma durumuna, başvurduğunuz şehre ve kurum yoğunluğuna göre değişmekle birlikte, çoğu çift için
                  sürecin planlama + resmi işlemler bölümü birkaç hafta ile birkaç ay arasında tamamlanıyor.
                </p>
              </div>
              <div>
                <p className="font-semibold">Önce hangi adımı atmalıyım?</p>
                <p>
                  Öncelikle hangi belgelerin sizden istendiğini netleştirmek gerekir. Belgeler sekmesindeki listeyi okuduktan sonra
                  WhatsApp üzerinden bize yazarak bulunduğunuz şehir ve durumunuza göre kontrol listesi oluşturabiliriz.
                </p>
              </div>
              <div>
                <p className="font-semibold">Tüm süreci siz mi takip ediyorsunuz?</p>
                <p>
                  Evet, isterseniz sadece belirli adımlarda, isterseniz de uçtan uca tüm süreçte yanınızda olup evrak, randevu ve iletişim
                  trafiğini sizin adınıza organize ediyoruz.
                </p>
              </div>
              <div>
                <p className="font-semibold">Evlilik işlemlerimi kendim yapabilir miyim?</p>
                <p>
                  Elbette, süreci kendi başınıza da yürütebilirsiniz; ancak tüm adımları ve istenen belgeleri detaylarıyla bildiğinizden emin
                  olmanız çok önemlidir. Yapacağınız küçük bir hata, yanlış bir başvuru veya eksik bir evrak hem zaman hem de maddi açıdan
                  ciddi kayıplara yol açabilir ve süreci manevi olarak da olumsuz etkileyebilir.
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <div>
              <h3 className="text-lg font-bold mb-1">Belgelerle İlgili Emin Olamadınız mı?</h3>
              <p className="text-sm opacity-90">
                Bize yazın; bulunduğunuz şehir, vatandaşlık ve durumunuza göre en güncel belge listesini birlikte netleştirelim.
              </p>
            </div>
            <a
              href="https://wa.me/905550343852?text=Merhaba%2C%20Endonezya'da%20evlilik%20i%C5%9Flemleri%20ve%20gerekli%20belgeler%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-3 rounded-xl font-bold hover:bg-rose-50 transition shadow-md"
            >
              <MessageCircle size={20} />
              WhatsApp'tan Belge Listemi Sor
            </a>
          </div>
        </div>
        )}
      </div>

      {/* CTA Bölümü - Formun Altında */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-8 md:p-12 rounded-3xl text-center text-white mx-4 md:mx-0 mb-8">
        <h3 className="text-xl md:text-2xl font-medium mb-3">Evliliğinizi Birlikte Planlayalım</h3>
        <p className="text-sm md:text-base mb-6 md:mb-8 opacity-90">
          Aşağıdaki formu doldurun veya hemen WhatsApp'tan iletişime geçin.
        </p>
        <a
          href="https://wa.me/905550343852?text=Merhaba%20Düğün%20Paketi%20Hakkında%20Bilgi%20Almak%20İstiyorum"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-rose-600 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-rose-50 transition shadow-lg text-sm md:text-base"
        >
          <MessageCircle size={20} />
          WhatsApp'ta Şimdi Sor
        </a>
        <p className="text-xs md:text-sm mt-4 opacity-90">
          Mesajlarınıza Türkçe yanıt veriyoruz; gerektiğinde Endonezce olarak da aile tarafı ile iletişimde size yardımcı oluyoruz.
        </p>
      </div>

      <Footer />
    </div>
  );
}

