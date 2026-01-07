import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function IslandDestinationsPage() {
  const [imageUrls, setImageUrls] = useState({});
  const { island } = useParams();

  // localStorage'dan resim URL'lerini ilk değer olarak yükle
  useEffect(() => {
    const saved = localStorage.getItem('imageUrls');
    if (saved) {
      try {
        setImageUrls(JSON.parse(saved));
      } catch (e) {
        console.error('imageUrls localStorage parse hatası:', e);
      }
    }
  }, []);

  // Firestore'dan imageUrls konfigurasyonunu dinle
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'imageUrls', 'imageUrls'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() || {};
          setImageUrls((prev) => ({ ...prev, ...data }));
        }
      },
      (error) => {
        console.error('Firestore imageUrls dinleme hatası:', error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Google Analytics - Page View Tracking
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `Keşfet - ${island?.charAt(0).toUpperCase()}${island?.slice(1)}`,
        page_path: `/kesfet/${island}`,
      });
      // Track destination view
      window.gtag('event', 'view_item', {
        items: [
          {
            item_name: island,
            item_category: 'destination',
          }
        ]
      });
    }
  }, [island]);

  // Helper function to get image URL
  const getImageUrl = (defaultUrl, storageKey) => {
    return imageUrls[storageKey] || defaultUrl;
  };

  // Island data with destinations
  const islandData = {
    bali: {
      name: "Bali",
      description:
        "Bali, muhteşem tapınakları, yeşil pirinç terasları ve dünya çapında ünlü plajlarıyla öne çıkan; doğası ve sakin atmosferiyle ziyaretçilerini kendine çeken bir adadır.",
      heroImage:
        getImageUrl("https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1200", 'bali-hero-dest-hero'),
      meta: {
        stay: "10-14 gün (3-4 bölge)",
        budget: "$$ - $$$",
        vibe: "Spa, tapınak ve plaj dengesi",
      },
      destinations: [
        {
          id: "ubud",
          name: "Ubud",
          image:
            getImageUrl("https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=600", 'bali-ubud-hero'),
          description:
            "Bali'nin ruhani kalbi; pirinç terasları, mistik tapınaklar ve Monkey Forest arasında geçen sakin ama dopdolu günler",
          rating: 4.8,
          activities: ["Tapınaklar", "Pirinç Terasları", "Yoga", "Spa"],
          crowd: "Sakin & ruhani",
        },
        {
          id: "kuta",
          name: "Kuta",
          image:
            getImageUrl("https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600", 'bali-kuta-hero'),
          description:
            "İlk kez sörf denemek ya da gün batımını kalabalık beach barlarda yakalamak için Bali'nin en hareketli sahil hattı",
          rating: 4.8,
          activities: ["Sörf", "Gün Batımı", "Plaj", "Su Sporları"],
          crowd: "Kalabalık & canlı",
        },
        {
          id: "seminyak",
          name: "Seminyak",
          description: "Tasarım butik oteller, şık restoranlar ve gün batımında dolup taşan beach club'larla biraz daha şık bir Bali deneyimi",
          image:
            "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: ["Plaj", "Sörf", "Alışveriş", "Restoran"],
          crowd: "Şık & hareketli",
        },
        {
          id: "uluwatu",
          name: "Uluwatu",
          description:
            "Okyanusa bakan uçurum tapınağı, efsanevi sörf dalgaları ve gün batımında Kecak dansı ile Bali'yi en dramatik haliyle gösteren nokta",
          image:
            "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.9,
          activities: ["Tapınak", "Sörf", "Uçurum", "Kecak Dansı"],
          crowd: "Kalabalık ama ikonik",
        },
        {
          id: "nusa-dua",
          name: "Nusa Dua",
          description: "Sessiz, güvenli ve bakımlı bir resort bölgesinde, sakin deniz ve su sporlarını bir arada bulabileceğin konfor alanı",
          image:
            "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.6,
          activities: ["Lüks Resort", "Su Sporları", "Golf", "Spa"],
          crowd: "Aile dostu & düzenli",
        },
        {
          id: "canggu",
          name: "Canggu",
          description: "Sörf tahtaları, laptoplu dijital göçebeler ve üçüncü dalga kahvecilerle Bali'nin en genç, en 'cool' mahallesi",
          image:
            "https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: ["Sörf", "Beach Club", "Yoga", "Café"],
          crowd: "Genç & trendy",
        },
        {
          id: "sanur",
          name: "Sanur",
          description: "Gün doğumunda yürüyüş, çocuklarla rahat plaj keyfi ve acele etmeyen bir tatil ritmi arayanlar için eski usul sahil kasabası",
          image:
            "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.5,
          activities: ["Gün Doğumu", "Bisiklet", "Dalış", "Plaj"],
          crowd: "Aileler için sakin",
        },
        {
          id: "munduk",
          name: "Munduk",
          description: "Sislerin arasındaki şelaleler, kahve tarlaları ve serin hava ile Bali'nin dağ köyü atmosferini hissedeceğin rota",
          image:
            "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.8,
          activities: ["Şelaleler", "Trekking", "Kahve Turu", "Doğa"],
          crowd: "Serin & huzurlu",
        },
        {
          id: "amed",
          name: "Amed",
          description:
            "Siyah kumlu sakin plajlar, kıyıdan şnorkelle girilebilen mercanlar ve dalış meraklıları için dingin bir balıkçı kasabası",
          image:
            "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.6,
          activities: ["Dalış", "Snorkeling", "Plaj", "Geleneksel Köy"],
          crowd: "Oldukça sakin",
        },
      ],
    },
    java: {
      name: "Java",
      description:
        "Endonezya'nın kültürel ve ekonomik kalbi, muhteşem volkanlar ve tarihi tapınaklarla dolu.",
      heroImage:
        getImageUrl("https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1200", 'java-hero-dest-hero'),
      meta: {
        stay: "7-10 gün (2-3 şehir)",
        budget: "$$",
        vibe: "Kültür, şehir ve volkanlar",
      },
      destinations: [
        {
          id: "yogyakarta",
          name: "Yogyakarta",
          description: "Java'nın kültür başkenti; Borobudur ve Prambanan gibi UNESCO tapınaklarıyla tarih, sokak sanatı ve öğrenci şehri enerjisini bir arada yaşatan şehir",
          image:
            "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.9,
          activities: ["Borobudur", "Prambanan", "Saray", "Batik"],
        },
        {
          id: "pangandaran",
          name: "Pangandaran",
          description: "Sessiz sahiller, denize sıfır küçük pansiyonlar ve arkasındaki yemyeşil ormanlarla deniz–doğa dengesini koruyan sahil kasabası",
          image:
            "https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: ["Dalış", "Snorkeling", "Doğa", "Deniz Ürünleri"],
        },
        {
          id: "bandung",
          name: "Bandung",
          description:
            "'Paris van Java' lakabını hak eden, serin dağ havası, tasarım kafeleri, outlet alışverişi ve çevresini saran volkanik manzaralarıyla hafta sonu kaçamaklarının klasiği",
          image:
            "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.5,
          activities: ["Alışveriş", "Çay Bahçeleri", "Volkan", "Café"],
        },
        {
          id: "banyuwangi",
          name: "Banyuwangi",
          description: "Gece yarısı başlayan Kawah Ijen tırmanışında mavi alevi görüp, ertesi gün yakın sahillerde sörf yapabileceğin doğa odaklı bir rota",
          image:
            "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.8,
          activities: ["Mavi Alev", "Trekking", "Sörf", "Dalış"],
        },
        {
          id: "malang",
          name: "Malang",
          description: "Serin iklimi, renkli çiçek bahçeleri ve çevresine yayılmış şelaleleriyle hem şehir hem doğa isteyenler için yumuşak geçişli bir dağ şehri",
          image:
            "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.6,
          activities: ["Bahçe", "Şelaleler", "Trekking", "Café"],
        },
      ],
    },
    lombok: {
      name: "Lombok",
      description:
        "Bali'nin sakin komşusu, muhteşem Rinjani Volkanı ve cennet Gili Adaları ile ünlü.",
      heroImage:
        getImageUrl("https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=1200", 'lombok-hero-dest-hero'),
      meta: {
        stay: "7-10 gün (2-3 bölge)",
        budget: "$$",
        vibe: "Sakin koylar ve sörf",
      },
      destinations: [
        {
          id: "gili-trawangan",
          name: "Gili Trawangan",
          description: "Gündüz bisikletle ada turu ve şnorkelle kaplumbağa arayışı, gece ise sahil barlarında müzikle devam eden küçük ama enerjik bir ada",
          image:
            "https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.8,
          activities: ["Dalış", "Snorkeling", "Parti", "Bisiklet"],
        },
        {
          id: "mount-rinjani",
          name: "Mount Rinjani",
          description: "Krater gölü manzaralı zorlu tırmanış rotalarıyla, gün doğumunu bulutların üzerinden izlemek isteyenler için Lombok'un efsanevi volkanı",
          image:
            "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.9,
          activities: ["Trekking", "Volkan", "Göl", "Kamp"],
        },
        {
          id: "senggigi",
          name: "Senggigi",
          description: "Lombok'un klasik resort hattı; palmiyeli plajlar, sahil yolu boyunca gün batımı manzaraları ve Gili adalarına açılan tekne turları",
          image:
            "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.5,
          activities: ["Plaj", "Gün Batımı", "Snorkeling", "Resort"],
        },
        {
          id: "kuta-lombok",
          name: "Kuta Lombok",
          description: "Beyaz kumlu, çoğu hâlâ bakir koylar, sörf spotları ve dağ–deniz manzaralı tepeleriyle daha sakin bir 'Bali öncesi' atmosfer",
          image:
            "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: ["Sörf", "Plaj", "Trekking", "Fotoğrafçılık"],
        },
        {
          id: "benang-stokel",
          name: "Benang Stokel Şelalesi",
          description: "Ormanın içinden geçen kısa yürüyüş rotaları sonunda karşına çıkan çok katlı, serinletici şelale havuzları",
          image:
            "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.6,
          activities: ["Şelale", "Trekking", "Yüzme", "Piknik"],
        },
      ],
    },
    komodo: {
      name: "Komodo",
      description:
        "Dünyaca ünlü Komodo ejderleri ve eşsiz bir ada.",
      heroImage:
        getImageUrl("https://images.pexels.com/photos/11896657/pexels-photo-11896657.jpeg?auto=compress&cs=tinysrgb&w=1200", 'komodo-hero-dest-hero'),
      meta: {
        stay: "3-4 gün (tekne turu)",
        budget: "$$$ (tur ile)",
        vibe: "Tam macera ve milli park",
      },
      destinations: [
        {
          id: "komodo-island",
          name: "Komodo Adası",
          description: "Komodo ejderlerini doğal ortamında görmek için rehberli patikalarda yürüdüğün, hem kara hem deniz tarafında vahşi yaşam hissi veren milli park adası",
          image:
            "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 5.0,
          activities: ["Komodo Ejderleri", "Trekking", "Vahşi Yaşam", "Safari"],
        },
        {
          id: "labuan-bajo",
          name: "Labuan Bajo",
          description:
            "Komodo turlarının başlangıç limanı; gün boyu tekne gezileri, akşamları ise tepelere tırmanıp gün batımını izleyebileceğin küçük balıkçı kasabası",
          image:
            "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.4,
          activities: ["Tekne Turu", "Dalış", "Gün Batımı", "Seafood"],
        },
      ],
    },
    sulawesi: {
      name: "Sulawesi",
      description:
        "Benzersiz şekliyle dikkat çeken ada, Toraja kültürü ve muhteşem dalış noktaları.",
      heroImage:
        getImageUrl("https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200", 'sulawesi-hero-dest-hero'),
      meta: {
        stay: "8-12 gün (2-3 bölge)",
        budget: "$$",
        vibe: "Toraja kültürü ve dalış",
      },
      destinations: [
        {
          id: "bunaken",
          name: "Bunaken",
          description: "Duvar dalışları, rengârenk mercan resifleri ve kaplumbağalarla yüzme ihtimaliyle dünyanın en ünlü dalış noktalarından biri",
          image:
            "https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.9,
          activities: ["Dalış", "Snorkeling", "Deniz Yaşamı", "Tekne Turu"],
        },
        {
          id: "makassar",
          name: "Makassar",
          description: "Gün batımında Losari sahilinde yürüyüş, tarihi liman dokusu ve bol baharatlı deniz ürünleri sofralarıyla Güney Sulawesi'nin giriş kapısı",
          image:
            "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.4,
          activities: ["Tarihi Yerler", "Seafood", "Plaj", "Kale"],
        },
        {
          id: "wakatobi",
          name: "Wakatobi",
          description: "Uçak + tekne kombinasyonuyla ulaşılan, berrak sular ve neredeyse el değmemiş mercan resifleriyle profesyonel dalgıçların rüya destinasyonu",
          image:
            "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 5.0,
          activities: ["Dalış", "Snorkeling", "Resort", "Deniz Yaşamı"],
        },
        {
          id: "togean",
          name: "Togean Adaları",
          description: "Elektrik ve internetin sınırlı olduğu, cam gibi koyları ve medüz (jellyfish) gölüyle zamanın yavaşladığı izole ada grubu",
          image:
            "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: ["Adalar", "Snorkeling", "Jellyfish Gölü", "Plaj"],
        },
      ],
    },
    sumatra: {
      name: "Sumatra",
      description:
        "Yağmun ormanları, Toba Gölü ve vahşi orangutanların evidir.",
      heroImage:
        getImageUrl("https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=1200", 'sumatra-hero-dest-hero'),
      meta: {
        stay: "10-14 gün (2-3 bölge)",
        budget: "$$",
        vibe: "Yağmur ormanı ve göl kaçışı",
      },
      destinations: [
        {
          id: "lake-toba",
          name: "Toba Gölü",
          description: "Eski bir süpervolkan kraterinin doldurduğu dev göl, ortasındaki Samosir Adası ve göl kıyısındaki Batak köyleriyle sakin ama etkileyici bir manzara",
          image:
            "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.8,
          activities: ["Göl", "Ada", "Batak Kültürü", "Bisiklet"],
        },
        {
          id: "bukit-lawang",
          name: "Bukit Lawang",
          description: "Rehberli orman yürüyüşlerinde vahşi orangutan görme ihtimali ve nehir kıyısındaki bungalovlarda doğa sesleriyle uyuma deneyimi",
          image:
            "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.9,
          activities: ["Orangutan", "Trekking", "Yağmun Ormanı", "Rafting"],
        },
        {
          id: "mentawai",
          name: "Mentawai Adaları",
          description: "Dünyanın en tutarlı dalgalarından bazılarını sunan, tekneyle ulaşılan sörf kampları ve hâlâ yaşayan yerel kabile kültürüyle izole ada zinciri",
          image:
            "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: ["Sörf", "Tekne Turu", "Kültür", "Plaj"],
        },
        {
          id: "bukittinggi",
          name: "Bukittinggi",
          description: "Serin dağ havası, Minangkabau mimarisiyle süslü evler ve şehrin içinden geçen kanyon manzarasıyla Sumatra'nın en karakteristik şehirlerinden biri",
          image:
            "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.6,
          activities: ["Kültür", "Geleneksel Ev", "Kanyon", "Pazar"],
        },
        {
          id: "kerinci",
          name: "Kerinci",
          description: "Endonezya'nın en yüksek zirvesine giden uzun trekking rotaları ve yamaçlara yayılan çay bahçeleriyle hem zorlu hem ödüllendirici bir rota",
          image:
            "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.7,
          activities: [
            "Volkan Tırmanışı",
            "Çay Bahçeleri",
            "Şelale",
            "Vahşi Yaşam",
          ],
        },
        {
          id: "nias",
          name: "Nias Adası",
          description: "Güçlü dalgalarıyla sörfçülerin uğrak noktası, köy meydanlarında yapılan taş sıçrama gösterileri ve megalitik yapılarıyla kültür + macera karışımı bir ada",
          image:
            "https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&w=600",
          rating: 4.5,
          activities: ["Sörf", "Kültür", "Savaş Dansları", "Müzik", "Taş Sıçrama", "Plaj"],
        },
      ],
    },
  };

  const currentIsland = islandData[island] || islandData.bali;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
      {/* Navigation */}
      <Navigation />

      <div className="flex flex-1">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Hero Section with Island Image */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
          <img
            src={currentIsland.heroImage}
            alt={`${currentIsland.name} island`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Island Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            {/* Back Button */}
            <a
              href={`/kesfet`}
              className="inline-flex items-center mb-4 px-4 py-2 bg-black/35 dark:bg-black/35 backdrop-blur-sm rounded-full text-white/90 border border-white/25 hover:bg-black/45 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span className="text-[13px] sm:text-[14px] font-poppins font-semibold">
                Adalara Dön
              </span>
            </a>

            <h1 className="text-[32px] sm:text-[44px] lg:text-[56px] font-poppins font-bold text-white leading-tight mb-3">
              {currentIsland.name}
            </h1>
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-poppins font-normal text-white/90 max-w-3xl mb-4">
              {currentIsland.description}
            </p>

            {currentIsland.meta && (
              <div className="inline-flex flex-wrap items-center gap-3 text-[11px] sm:text-[12px] font-inter text-white/90 bg-black/35 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="flex items-center gap-1">
                  <span className="text-xs">📍</span>
                  <span>{currentIsland.destinations.length} destinasyon</span>
                </span>
                <span className="hidden sm:inline-block h-3 w-px bg-white/40" />
                <span className="flex items-center gap-1">
                  <span className="text-xs">⏱️</span>
                  <span>Önerilen süre: {currentIsland.meta.stay}</span>
                </span>
                <span className="hidden sm:inline-block h-3 w-px bg-white/40" />
                <span className="flex items-center gap-1">
                  <span className="text-xs">💰</span>
                  <span>Ortalama bütçe: {currentIsland.meta.budget}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Destinations Section */}
        <div className="bg-white dark:bg-[#121212]">
          <div className="max-w-none ml-0 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-poppins font-bold text-black dark:text-white leading-tight mb-2">
                Popüler Destinasyonlar
              </h2>
              <p className="text-[14px] sm:text-[16px] font-poppins font-normal text-[#555555] dark:text-[#A0A0A0]">
                {currentIsland.destinations.length} destinasyon sizi bekliyor
              </p>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {currentIsland.destinations.map((destination) => (
                <a
                  key={destination.id}
                  href={`/kesfet/${island}/${destination.id}`}
                  className="group bg-white dark:bg-[#1E1E1E] border border-[#E4E4E4] dark:border-[#404040] rounded-2xl overflow-hidden cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.08)] hover:translate-y-[-4px] hover:border-[#6A54E7] dark:hover:border-[#7C69FF] transition-all duration-300 focus:outline-2 focus:outline-[#6A54E7] dark:focus:outline-[#7C69FF] focus:outline-offset-2"
                >
                  {/* Destination Image */}
                  <div className="relative h-[180px] overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center">
                      <Star
                        size={12}
                        className="text-yellow-500 fill-yellow-500 mr-1"
                      />
                      <span className="text-[12px] font-poppins font-semibold text-black dark:text-white">
                        {destination.rating}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Destination Name */}
                    <h3 className="text-[18px] sm:text-[20px] font-poppins font-bold text-black dark:text-white leading-tight mb-2 line-clamp-1">
                      {destination.name}
                    </h3>

                    {/* Crowd level / vibe */}
                    {destination.crowd && (
                      <span className="inline-flex items-center px-2.5 py-0.5 mb-2 rounded-full text-[11px] font-poppins font-medium bg-[#F5F3FF] dark:bg-[#2E2E3E] text-[#6A54E7] dark:text-[#7C69FF]">
                        {destination.crowd}
                      </span>
                    )}

                    {/* Description */}
                    <p className="text-[12px] sm:text-[13px] font-poppins font-normal text-[#6D6D6D] dark:text-[#A0A0A0] leading-relaxed mb-3 line-clamp-3">
                      {destination.description}
                    </p>

                    {/* Activities */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {destination.activities
                        .slice(0, 3)
                        .map((activity, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-[#F5F3FF] dark:bg-[#2E2E3E] rounded text-[11px] font-poppins font-medium text-[#6A54E7] dark:text-[#7C69FF]"
                          >
                            {activity}
                          </span>
                        ))}
                      {destination.activities.length > 3 && (
                        <span className="px-2 py-0.5 bg-[#F5F3FF] dark:bg-[#2E2E3E] rounded text-[11px] font-poppins font-medium text-[#6A54E7] dark:text-[#7C69FF]">
                          +{destination.activities.length - 3}
                        </span>
                      )}
                    </div>

                    {/* View Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-[#6A54E7] dark:text-[#7C69FF]">
                        <MapPin size={14} className="mr-1" />
                        <span className="text-[12px] font-poppins font-medium">
                          {currentIsland.name}
                        </span>
                      </div>
                      <span className="text-[13px] font-poppins font-semibold text-[#6A54E7] dark:text-[#7C69FF] group-hover:underline">
                        Detaylar →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <Footer />

        {/* Privacy & Security Notice */}
        <div className="bg-gray-100 dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-[12px] sm:text-[13px] font-inter text-gray-600 dark:text-gray-400 text-center">
              🔒 <strong>Gizlilik & Güvenlik:</strong> Bu sayfa Google Analytics ile izlenir. Verileriniz SSL/TLS şifreleme ile korunmaktadır. 
              <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">Gizlilik Politikası</a>
            </p>
          </div>
        </div>
      </div>
    </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}