import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HeroSocialButtons from '../components/HeroSocialButtons';
import { Heart, Plane, Video, MapPin, FileText, Users, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden min-h-96" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(30,64,175,0.65) 40%, rgba(16,185,129,0.55) 100%), url(https://24me1z7hg7.ucarecd.net/a3677a3d-16f3-4f04-9006-13bea58da607/vecteezy_thebeautifulriceterracesinbaliindonesia_69917255.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 75%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-10 items-center text-center">
            <div className="max-w-4xl mx-auto">
              <h1
	                className="text-3xl md:text-4xl font-medium text-white mb-4"
                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.7)' }}
              >
                Endonezya Seyahat ve Tur Organizasyonu
              </h1>
              <p
                className="text-xs md:text-sm text-emerald-100 mb-3 tracking-wide uppercase"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
              >
                Aracılara değil, turu sahada organize eden ekiple çalışın.
              </p>
              <p
	                className="text-base md:text-lg text-white mb-7 max-w-4xl mx-auto"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
              >
	                Endonezya’da balayı, keşif ve tatil odaklı butik tur paketleri ve kişiye özel seyahat planları tasarlıyoruz.
	                Aracılar üzerinden değil, organizasyonu sahada yürüten ekipten; şeffaf, sürpriz maliyet riski en aza indirilmiş
	                ve detaylı bilgilendirme ile tur almanızı sağlıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-18 px-4 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg md:text-xl font-normal text-center mb-6 text-gray-900">
            Sizin için neler yapıyoruz?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Kart: Toplu turlara katılım */}
            <a
              href="/tours"
              className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/bali-island-tropical-beach-temple.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/25" />
              <div className="relative z-10 p-6 flex flex-col h-full">
                <Plane className="text-emerald-200 mb-2" size={30} />
                <h3 className="text-base md:text-lg font-medium mb-1 text-white">Toplu turlara katılım</h3>
                <p className="text-sm text-emerald-50/95 flex-1">
                  Bali, Lombok, Komodo ve diğer Endonezya adalarına düzenlenen planlı tur paketlerimize bireysel, ailenizle veya
                  arkadaşlarınızla birlikte katılabilirsiniz.
                </p>
              </div>
            </a>

            {/* 2. Kart: Kurumsal tur organizasyonu */}
            <a
              href="/tours/groups"
              className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/tanah-lot-temple-sunset-ocean.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/25" />
              <div className="relative z-10 p-6 flex flex-col h-full">
                <Users className="text-emerald-200 mb-2" size={30} />
                <h3 className="text-base md:text-lg font-medium mb-1 text-white">Kurumsal tur organizasyonu</h3>
                <p className="text-sm text-emerald-50/95 flex-1">
                  Şirketler, okullar, dernekler ve arkadaş grupları için tarih, kişi sayısı ve bütçenize göre özel Endonezya grup
                  turları planlıyor; toplantı, etkinlik ve ekip çalışması programlarını birlikte tasarlıyoruz.
                </p>
              </div>
            </a>

            {/* 3. Kart: Bireysel / aile seyahati */}
            <a
              href="/travel"
              className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/bali-luxury-pool-villa.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/25" />
              <div className="relative z-10 p-6 flex flex-col h-full">
                <MapPin className="text-emerald-200 mb-2" size={30} />
                <h3 className="text-base md:text-lg font-medium mb-1 text-white">Bireysel / aile seyahati</h3>
                <p className="text-sm text-emerald-50/95 flex-1">
                  Kendiniz veya aileniz için uçuş, konaklama ve rota içeren kişiye özel Endonezya tatil planı hazırlıyor, Bali ve
                  çevresini kendi temponuzda keşfetmenizi sağlıyoruz.
                </p>
              </div>
            </a>

            {/* 4. Kart: Evlilik danışmanlığı */}
            <a
              href="/wedding"
              className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/bali-traditional-dance-kecak.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/25" />
              <div className="relative z-10 p-6 flex flex-col h-full">
                <Heart className="text-emerald-200 mb-2" size={30} />
                <h3 className="text-base md:text-lg font-medium mb-1 text-white">Evlilik danışmanlığı</h3>
                <p className="text-sm text-emerald-50/95 flex-1">
                  Evlilik sürecinizde belgeler, yasal işlemler, rehberlik, tercümanlık, ulaşım ve konaklama gibi tüm adımlarda
                  yanınızda olarak Endonezya&apos;da nikahınızı sorunsuzca tamamlamanıza yardımcı oluyoruz.
                </p>
              </div>
            </a>

            {/* 5. Kart: YouTube videoları */}
            <a
              href="/youtube"
              className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/bali-rice-terraces-green.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/25" />
              <div className="relative z-10 p-6 flex flex-col h-full">
                <Video className="text-emerald-200 mb-2" size={30} />
                <h3 className="text-base md:text-lg font-medium mb-1 text-white">YouTube videoları</h3>
                <p className="text-sm text-emerald-50/95 flex-1">
                  Seyahatlerimizden ve evlilik sürecimizden seçilmiş videoları bu sitede bulabilir; YouTube kanalımızda diğer
                  videolarımızı izleyerek Endonezya&apos;yı ve sunduğumuz desteği daha yakından tanıyabilirsiniz.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg md:text-xl font-normal text-center mb-6 text-gray-900">
            Neden bizimle ilerlemek daha kolay?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-2xl hover:shadow-md transition bg-white">
              <FileText className="text-emerald-600 mb-2" size={26} />
              <h3 className="text-base md:text-lg font-medium mb-1 text-gray-900">Deneyimden gelen rehberlik</h3>
              <p className="text-sm text-gray-700">
	                Endonezya&apos;da yaşamanın ve sahada tur organize etmenin getirdiği deneyimi; rota seçimi, konaklama ve günlük akışta sizin için kullanıyoruz.
              </p>
            </div>
            <div className="p-6 border rounded-2xl hover:shadow-md transition bg-white">
              <Heart className="text-emerald-600 mb-2" size={26} />
              <h3 className="text-base md:text-lg font-medium mb-1 text-gray-900">Sade ve şeffaf iletişim</h3>
              <p className="text-sm text-gray-700">
                Endonezce, Türkçe ve İngilizce desteğiyle, tüm süreci anlaşılır bir dille anlatıyor; soru işaretlerini en baştan temizliyoruz.
              </p>
            </div>
            <div className="p-6 border rounded-2xl hover:shadow-md transition bg-white">
              <MapPin className="text-emerald-600 mb-2" size={26} />
              <h3 className="text-base md:text-lg font-medium mb-1 text-gray-900">Bütçenize uygun planlama</h3>
              <p className="text-sm text-gray-700">
                Seyahat, konaklama ve günlük hayat masraflarını birlikte ele alarak, sürpriz maliyetleri en aza indiren bir plan çıkarıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs md:text-sm text-emerald-100 tracking-wide mb-2 uppercase">
            Sorularınızı çekinmeden sorun
          </p>
          <h2 className="text-xl md:text-2xl font-medium text-white mb-3">
            Endonezya ile ilgili aklınızdaki her şeyi birlikte netleştirelim
          </h2>
          <p className="text-sm md:text-base text-emerald-50/95 mb-7 max-w-2xl mx-auto">
	            İster planladığınız tur paketleri, ister kişisel Endonezya seyahat planınızla ilgili olsun… Kafanıza takılan tüm detayları
	            Türkçe olarak sorabilir, süreci birlikte sade ve anlaşılır hale getirebiliriz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-emerald-700 px-6 py-2.5 rounded-full font-medium hover:bg-emerald-50 transition text-center shadow-md hover:shadow-lg text-sm md:text-base"
            >
              İletişim formunu aç
            </a>
            <a
              href="https://wa.me/905550343852?text=Merhaba%2C%20Endonezya%27da%20seyahat%20ve%20tur%20planlar%C4%B1mla%20ilgili%20bir%20sorum%20olacakt%C4%B1."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-green-600 transition text-center inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm md:text-base"
            >
              <MessageCircle size={20} />
              WhatsApp ile sor
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}



