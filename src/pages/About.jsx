import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HeroSocialButtons from '../components/HeroSocialButtons';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function About() {

  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <section className="pt-20 pb-12 px-4 relative overflow-hidden min-h-80" style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 64, 175, 0.65) 40%, rgba(16, 185, 129, 0.55) 100%), url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 80%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col justify-center items-center min-h-80">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6" style={{ fontFamily: '"Poppins", sans-serif', textShadow: '0 4px 12px rgba(0,0,0,0.7)' }}>
            Hakkımızda
          </h1>
          <p className="text-lg md:text-xl text-white" style={{ fontFamily: '"Poppins", sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Endonezya’da seyahat ve tur deneyiminizi, sahada kurduğumuz yapı ve birikimle adım adım kolaylaştırıyoruz.
          </p>
        </div>
        <HeroSocialButtons />
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 p-6 rounded-2xl border border-emerald-100 bg-emerald-50/60">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Marka yapımız
            </h2>
            <p className="text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Bu web sitesi, <span className="font-semibold">PT MoonStar Global Indonesia</span> çatısı altında yürüttüğümüz hizmetlerin
              vitrini ve iletişim noktasıdır. Kamuya dönük marka iletişimimizi ise <span className="font-semibold">Endonezya Kaşifi</span>
              adıyla sürdürüyoruz.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/tours" className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition block">
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Tur organizasyonu
                </p>
                <p className="text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Bali, Lombok, Komodo ve daha fazlası için planlı turlar ve kişiye özel seyahat planları.
                </p>
              </Link>
              <Link to="/wedding" className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition block">
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Evlilik rehberliği
                </p>
                <p className="text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Otel, ulaşım, tercümanlık ve resmi evrak süreci dahil uçtan uca takip.
                </p>
              </Link>
              <Link to="/contact" className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition block">
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  DaMeTurk
                </p>
                <p className="text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  PT MoonStar Global Indonesia bünyesindeki orijinal Türk dondurması markamız. Detaylar için dameturk.com.
                </p>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
              YouTube ve Instagram hesap adlarımız <span className="font-semibold">endonezyakasifi</span> olarak kalır ve bu marka çatısına
              içerik üretimiyle destek verir.
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-10 text-center" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Seyahati Nasıl Görüyoruz?
          </h2>

          <div className="space-y-6 text-base md:text-lg text-gray-700 leading-relaxed" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <p className="text-sm text-gray-700">
              Biz, seyahati yalnızca bir destinasyona gitmek olarak görmüyoruz. Bizim için seyahat; doğru planlandığında insanı
              yormayan, gerçekten dinlendiren, keşif hissi uyandıran ve sonunda “iyi ki gelmişim” dedirten bir deneyimdir. Bu bakış
              açısıyla yola çıktık ve tüm organizasyon anlayışımızı bu temel üzerine inşa ettik.
            </p>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Aracısız organizasyon, yerinde planlama</h3>
              <p className="text-sm text-gray-700">
                Hazırladığımız tüm tur programları, doğrudan Endonezya’daki saha ekibimiz tarafından planlanır ve uygulanır. Kataloglardan
                alınmış, birden fazla aracıdan geçmiş, masa başında oluşturulmuş paketler sunmayız. Bu yaklaşımın en büyük farkı şudur:
                tur bütçesi, aracı maliyetlerine değil doğrudan deneyimin kendisine harcanır.
              </p>
              <p className="text-sm text-gray-700">
                Misafirlerimiz böylece aynı bütçeyle daha dolu içeriklere, daha kaliteli aktivitelere ve daha net, şeffaf kapsama ulaşır.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Bilerek, ölçerek ve dengeleyerek planlıyoruz</h3>
              <p className="text-sm text-gray-700">
                Her tur programı; rota mantığı, günlük tempo dengesi, serbest zaman ve rehberli gün oranı, fiziksel yorgunluk faktörü ve
                farklı beklentilere sahip katılımcı profilleri dikkate alınarak hazırlanır. Amacımız, programı “kalabalık göstermek” değil;
                akıcı, dengeli ve gerçekten keyifli hale getirmektir.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Rehberli günlerde herkesin birlikte deneyimlemesi gereken aktiviteleri kapsama dahil ederiz.</li>
                <li>Serbest günlerde misafirlere özgürlük alanı tanırız.</li>
                <li>Ekstra deneyimleri baştan net şekilde sunarız.</li>
              </ul>
              <p className="text-sm text-gray-700">
                Böylece kimsenin aklında “Burada ne ekstra, ne dahil?” sorusu kalmaz.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Şeffaflık bizim için bir seçenek değil, standarttır</h3>
              <p className="text-sm text-gray-700">
                Bir turun neleri kapsadığı, neleri kapsamadığı en başından bellidir. Belirsiz ifadeler, sürpriz masraflar ve sonradan
                ortaya çıkan ek ödemeler bizim çalışma anlayışımızda yer almaz. Rehberli günlerde programda yer alan aktiviteler ve grup
                halinde gerçekleştirilen organizasyonlar tur kapsamındadır; serbest zamanlarda ise tercihler tamamen misafirlere aittir ve
                bu durum açıkça belirtilir.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Herkes için keyifli ve huzurlu bir tatil</h3>
              <p className="text-sm text-gray-700">
                Turlarımız, her katılımcının eşit şekilde tatil keyfi yaşayabilmesi prensibiyle organize edilir. Grup içi uyum, karşılıklı
                saygı ve nezaket bizim için en az program kadar önemlidir.
              </p>
              <p className="text-sm text-gray-700">
                Hedefimiz; kimsenin başkasının tatilini gölgelemediği, huzurlu, güvenli ve dengeli bir ortam sunmak ve herkesin memnun
                şekilde evine dönmesini sağlamaktır. Çünkü iyi bir tur, sadece gezilen yerlerle değil; nasıl bir atmosferde geçtiğiyle
                hatırlanır.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Sadece tur değil, gerçek rehberlik sunuyoruz</h3>
              <p className="text-sm text-gray-700">
                Sunduğumuz hizmet, bir tur paketinin çok ötesindedir. Sahada olan, bölgeyi yakından tanıyan ve gerektiğinde hızlı çözüm
                üretebilen bir ekiple çalışırız. Misafirlerimizin seyahat sürecinde kendini güvende hissetmesi, bizim için organizasyonun
                ayrılmaz bir parçasıdır.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Endonezya’da evlilik rehberliği</h3>
              <p className="text-sm text-gray-700">
                Seyahat organizasyonlarımızın yanı sıra, Endonezya’da evlilik gibi özel ve hassas süreçlerde de rehberlik sunuyoruz. Bu
                hizmeti ayrı bir başlık olarak ele almamızın nedeni, sürecin ciddiyetini ve sorumluluğunu bilmemizdir.
              </p>
              <p className="text-sm text-gray-700">
                Evlilik rehberliği; resmi prosedürler, yerel uygulamalar, zamanlama ve koordinasyon gibi detaylara hâkim olmayı gerektirir.
                Bu alanda sunduğumuz rehberlik, sahadaki deneyimimizin ve yerel bilgi birikimimizin doğal bir sonucudur. Bu yaklaşım,
                misafirlerimize sadece bir hizmet değil; güvenle ilerleyebilecekleri bir süreç yönetimi sunar.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Bizimle seyahat edenler ne bekleyeceğini bilir</h3>
              <p className="text-sm text-gray-700">
                Bizimle yola çıkanlar; ne alacağını, neye ödeme yaptığını bilir ve tatiline odaklanıp organizasyon detaylarını bize bırakır.
                Bizim için en büyük referans, tur sonunda “iyi ki bu ekiple gelmişim” diyen misafirlerdir.
              </p>
            </div>

            <p className="text-sm text-gray-700">
              Endonezya kültürü, ada ada rota önerileri ve detaylı yazılar için{' '}
              <Link to="/kesfet" className="text-emerald-700 font-semibold hover:underline">
                Keşfet
              </Link>
              {' '}bölümünde hazırladığımız içeriklere göz atabilir; planlı Endonezya tur paketleri için{' '}
              <Link to="/tours" className="text-emerald-700 font-semibold hover:underline">
                Toplu Tur Paketleri
              </Link>
              {' '}sayfasını, şirket veya okul grupları için özel organizasyonlar adına ise{' '}
              <Link to="/tours/groups" className="text-emerald-700 font-semibold hover:underline">
                Grup Turları
              </Link>
              {' '}sayfamızı ziyaret edebilirsiniz.
            </p>
          </div>

          {/* Mini Zaman Çizelgesi */}
          <div className="mt-10">
            <h3
              className="text-xl md:text-2xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Kısa hikâyemiz
            </h3>
            <div className="space-y-3 border-l border-emerald-200 pl-4">
              <div className="relative">
                <div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-0.5" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  1. Adım
                </p>
                <p className="text-sm text-gray-700">Endonezya’ya yerleşip kendi hayatımızı ve düzenimizi burada kurduk.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-0.5" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  2. Adım
                </p>
                <p className="text-sm text-gray-700">Farklı adaları gezerek ülkeyi yakından tanıdık, seyahat ve günlük yaşam ritmimizi oturttuk.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-0.5" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  3. Adım
                </p>
                <p className="text-sm text-gray-700">YouTube kanalımızı açarak Endonezya’daki hayatımızı ve seyahat deneyimlerimizi paylaşmaya başladık.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-0.5" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  4. Adım
                </p>
                <p className="text-sm text-gray-700">Bugün, Endonezya’ya seyahat ve tur planlayan misafirlerimize ve evlilik sürecindeki çiftlere bu deneyimle rehberlik ediyoruz.</p>
              </div>
            </div>
          </div>

          {/* Hizmet Kapsamı - Kısa Liste */}
          <div className="mt-12">
            <h3
              className="text-xl md:text-2xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Hangi konularda yanınızdayız?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Kart: Toplu turlara bireysel / aile katılım */}
              <Link
                to="/tours"
                className="p-4 rounded-2xl bg-sky-50 border border-sky-100 shadow-sm hover:shadow-md transition block"
              >
                <h4
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Toplu turlara bireysel / aile katılım
                </h4>
                <p className="text-sm text-gray-700">
                  Planlı Endonezya tur paketlerimize bireysel olarak, eşinizle ya da ailenizle birlikte katılabilirsiniz. Tarih,
                  kontenjan ve kapsamı net şekilde belirtilmiş turlar arasından size uyan programı seçip doğrudan rezervasyon
                  yapmanız için Toplu Tur Paketleri sayfasını kullanabilirsiniz.
                </p>
              </Link>

              {/* 2. Kart: Çeviri ve iletişim desteği */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                <h4
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Çeviri ve iletişim desteği
                </h4>
                <p className="text-sm text-gray-700">
                  Gerek rehberli günlerde, gerek serbest zamanlarınızda ve bireysel alışverişlerinizde Türkçe bilen bir tercüman
                  eşlik edebilir; böylece Endonezya’da dil bariyerini ortadan kaldırıp kendinizi daha güvende hissedebilirsiniz.
                </p>
              </div>

              {/* 3. Kart: Bireysel seyahat ve balayı planlama */}
              <Link
                to="/travel"
                className="p-4 rounded-2xl bg-teal-50 border border-teal-100 shadow-sm hover:shadow-md transition block"
              >
                <h4
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Bireysel seyahat ve balayı planlama
                </h4>
                <p className="text-sm text-gray-700">
                  Herhangi bir toplu tura katılmak yerine kendi Endonezya seyahatinizi ya da balayı tatilinizi planlamak
                  istiyorsanız; uçuş, konaklama, günlük rota ve deneyim önerilerini birlikte kurguluyor, size özel bir plan
                  çıkarıyoruz. Böylece kendi temponuza uygun, esnek ama iyi düşünülmüş bir programla seyahat edebilirsiniz.
                </p>
              </Link>

              {/* 4. Kart: Kurumsal ve arkadaş grupları için özel turlar */}
              <Link
                to="/tours/groups"
                className="p-4 rounded-2xl bg-violet-50 border border-violet-100 shadow-sm hover:shadow-md transition block"
              >
                <h4
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Kurumsal ve arkadaş grupları için özel turlar
                </h4>
                <p className="text-sm text-gray-700">
                  Şirketler, okullar, dernekler veya arkadaş grupları için tarih, bütçe ve beklentilere göre tamamen size özel tur
                  programları tasarlıyoruz. Kapalı grup turlarınız için Grup Turları sayfası üzerinden talep oluşturabilirsiniz.
                </p>
              </Link>
              {/* 5. Kart: Konaklama ve ulaşım planlama */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm">
                <h4
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Konaklama ve ulaşım planlama
                </h4>
                <p className="text-sm text-gray-700">
                  İsterseniz tur paketi veya kapsamlı bir seyahat planı almadan da; yalnızca otel rezervasyonu, uçak bileti alımı
                  veya araç kiralama gibi ekstra hizmetlerimizden faydalanabilirsiniz. Bütçenize ve konforunuza uygun, güvenilir
                  alternatifleri birlikte seçeriz.
                </p>
              </div>

              {/* 6. Kart: Endonezya’da evlilik sürecine rehberlik */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 shadow-sm">
                <h4
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Endonezya’da evlilik sürecine rehberlik
                </h4>
                <p className="text-sm text-gray-700">
                  Endonezya’da evlilik planlayan çiftler için, resmi adımların zamanlaması, yerel uygulamalar ve süreç koordinasyonu
                  konusunda rehberlik sunuyoruz. Bu hizmetin detaylarını, evlilik rehberliği sayfasında ayrı bir başlık olarak ele alıyoruz.
                </p>
              </div>
            </div>
          </div>

          {/* Galeriye Yönlendiren Hafif Blok */}
          <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-sky-50 via-emerald-50 to-sky-50 border border-emerald-100 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3
                  className="text-lg md:text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Seyahatlerimizden ve deneyimlerimizden birkaç örnek
                </h3>
                <p
                  className="text-sm md:text-base text-gray-700 max-w-2xl"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Aşağıda, Endonezya’daki seyahatlerimizden ve sahadaki deneyimlerimizden seçtiğimiz birkaç örnek kareyi
                  görebilirsiniz. Daha fazlası için galerimize göz atabilirsiniz.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-semibold bg-emerald-500 text-white shadow-md hover:shadow-lg hover:bg-emerald-600 transition-all text-center"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Fotoğrafların tamamını görmek için galerimizi ziyaret edin
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className="relative h-24 md:h-28 rounded-xl overflow-hidden shadow-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={() =>
                  setSelectedPreviewImage({
                    src: 'https://cvcou9szpd.ucarecd.net/57cf76e1-808a-46bf-b364-6db89ac043d8/IMG20250107WA0010.jpg',
                    alt: 'Endonezya’daki hayatımızdan bir kare',
                  })
                }
              >
                <img
                  src="https://cvcou9szpd.ucarecd.net/57cf76e1-808a-46bf-b364-6db89ac043d8/IMG20250107WA0010.jpg"
                  alt="Endonezya’daki hayatımızdan bir kare"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
              <button
                type="button"
                className="relative h-24 md:h-28 rounded-xl overflow-hidden shadow-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={() =>
                  setSelectedPreviewImage({
                    src: 'https://cvcou9szpd.ucarecd.net/3a3fd1ff-3eb2-4072-a4d5-cdf1ad1d3637/IMG_3394.JPG',
                    alt: 'Endonezya’da birlikte geçirdiğimiz bir günden kare',
                  })
                }
              >
                <img
                  src="https://cvcou9szpd.ucarecd.net/3a3fd1ff-3eb2-4072-a4d5-cdf1ad1d3637/IMG_3394.JPG"
                  alt="Endonezya’da birlikte geçirdiğimiz bir günden kare"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
              <button
                type="button"
                className="relative h-24 md:h-28 rounded-xl overflow-hidden shadow-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={() =>
                  setSelectedPreviewImage({
                    src: 'https://cvcou9szpd.ucarecd.net/7d53cbed-292f-4bbc-994c-bc55755f8648/IMG_3404.JPG',
                    alt: 'Endonezya’daki özel bir anımızdan kare',
                  })
                }
              >
                <img
                  src="https://cvcou9szpd.ucarecd.net/7d53cbed-292f-4bbc-994c-bc55755f8648/IMG_3404.JPG"
                  alt="Endonezya’daki özel bir anımızdan kare"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          </div>

          {/* YouTube'dan Öne Çıkan Videolar */}
          <div className="mt-12">
            <h3
              className="text-xl md:text-2xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Bizi en iyi anlatan videolar
            </h3>
            <p
              className="text-sm text-gray-700 mb-6 max-w-2xl"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              YouTube kanalımızda, Endonezya’daki hayatımızı, seyahatlerimizi ve keşiflerimizi anlattığımız videolar bulabilirsiniz. Aşağıdaki iki video, bizi ve sunduğumuz desteği en iyi özetleyen içeriklerdir.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.youtube.com/watch?v=VZiBxoD3zLA"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition"
              >
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src="https://img.youtube.com/vi/VZiBxoD3zLA/mqdefault.jpg"
                    alt="Endonezya’da evlilik sürecinde destek verdiğimiz bir çiftin hikâyesi"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-medium text-gray-900 group-hover:text-red-600 line-clamp-2"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Endonezya’da evlilik sürecinde destek verdiğimiz bir çiftin hikâyesi
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Endonezya’da evlilik sürecini bizimle birlikte yürüten bir çiftin deneyimini ve nasıl destek olduğumuzu görebilirsiniz.</p>
                </div>
              </a>

              <a
                href="https://www.youtube.com/watch?v=5ICrq1qT6Gc"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition"
              >
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src="https://img.youtube.com/vi/5ICrq1qT6Gc/mqdefault.jpg"
                    alt="Citumang macerası videosu"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-medium text-gray-900 group-hover:text-red-600 line-clamp-2"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Endonezya'da Böyle Bir Yer Olduğuna İnanamayacaksınız! Citumang Maceramız
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Doğa, macera ve Endonezya’daki günlük yaşamdan keyifli bir kesit.</p>
                </div>
              </a>
            </div>
          </div>

          <div className="mt-16 pt-16 border-t border-gray-200">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Neden Biz?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-base md:text-lg font-semibold text-blue-600 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>Doğrudan organizatörle çalışma</div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Aracı acenteler yerine, turu sahada planlayan ve yürüten ekiple çalışırsınız; kararlar ve cevaplar ilk kaynaktan gelir.
                </p>
              </div>
              <div className="text-center">
                <div className="text-base md:text-lg font-semibold text-green-600 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>Şeffaf ve net maliyetler</div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Program, dahil olanlar ve olmayanları en baştan netleştirir; gizli ücretler yerine öngörülebilir, açık bir maliyet tablosu sunarız.
                </p>
              </div>
              <div className="text-center">
                <div className="text-base md:text-lg font-semibold text-pink-600 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>Sahada sorumluluk alan ekip</div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Sadece turu satarken değil, sahada da yanınızdayız; program akışını takip eder, gerektiğinde yerinde çözüm üreterek misafir memnuniyetini en öncelikli hedef yaparız.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute -top-10 right-0 text-white text-sm md:text-base bg-black/60 hover:bg-black/80 px-3 py-1 rounded-full"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Kapat
            </button>
            <img
              src={selectedPreviewImage.src}
              alt={selectedPreviewImage.alt}
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
