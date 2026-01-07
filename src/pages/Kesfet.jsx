import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Palmtree } from "lucide-react";
import Navigation from "../components/Navigation";
import HeroSocialButtons from "../components/HeroSocialButtons";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function KesfetPage() {
  const [imageUrls, setImageUrls] = useState({});
  const [activeFilter, setActiveFilter] = useState("hepsi");

  // localStorage'dan resim URL'lerini ilk değer olarak yükle
  useEffect(() => {
    const saved = localStorage.getItem("imageUrls");
    if (saved) {
      try {
        setImageUrls(JSON.parse(saved));
      } catch (e) {
        console.error("imageUrls localStorage parse hatası:", e);
      }
    }
  }, []);

  // Firestore'dan imageUrls konfigurasyonunu dinle
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "imageUrls", "imageUrls"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() || {};
          setImageUrls((prev) => ({ ...prev, ...data }));
        }
      },
      (error) => {
        console.error("Firestore imageUrls dinleme hatası:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Google Analytics - Page View Tracking
  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_title: "Keşfet - Adaları Keşfedin",
        page_path: "/kesfet",
      });
    }
  }, []);

  const filters = [
    { id: "hepsi", label: "Tümü" },
    { id: "balayi", label: "Balayı" },
    { id: "aile", label: "Aile" },
    { id: "macera", label: "Macera" },
    { id: "sakin", label: "Sakinlik" },
  ];

  const tagLabels = {
    balayi: "Balayı için ideal",
    aile: "Aile dostu",
    macera: "Macera & keşif",
    sakin: "Sakin kaçış",
  };

  const islands = [
    {
      id: "bali",
      name: "Bali",
      description:
        "Tapınakların dumanı, pirinç tarlalarının yeşili ve gün batımı plajlarının turuncusu aynı günde buluşur; Bali'de her sabah yeni bir hikâyenin ilk sayfası gibi başlar. Kendini spa ritüelleri, gizli şelaleler ve sahil kasabaları arasında yavaş yavaş bu adanın ritmine bırakırsın.",
      image:
        imageUrls["bali-hero"] ||
        "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800",
      destinationCount: 9,
      highlights: ["Tapınaklar", "Plajlar", "Pirinç Terasları"],
      tags: ["balayi", "aile"],
    },
    {
      id: "java",
      name: "Java",
      description:
        "Aktif volkanların gölgesinde sabah sisinin içinden yükselen tapınaklar, akşam olduğunda yerini hareketli sokaklara ve sokak lezzetlerine bırakır. Java'da her köşe, Endonezya'nın hem modern yüzünü hem de yüzyıllardır değişmeyen geleneklerini aynı anda hissettirir.",
      image:
        imageUrls["java-hero"] ||
        "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=800",
      destinationCount: 5,
      highlights: ["Borobudur", "Volkanlar", "Jakarta"],
      tags: ["macera"],
    },
    {
      id: "lombok",
      name: "Lombok",
      description:
        "Uzun, sessiz kumsalların arkasında yükselen Rinjani silueti ve gün boyu dalga sesine karışan balıkçı tekneleri… Lombok, kalabalıktan uzaklaşıp yavaşlamayı sevenler için, Bali'ye göre daha sakin ama en az onun kadar büyüleyici bir kaçış sunar.",
      image:
        imageUrls["lombok-hero"] ||
        "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=800",
      destinationCount: 5,
      highlights: ["Mt. Rinjani", "Gili Adaları", "Şelaleler"],
      tags: ["sakin", "macera"],
    },
    {
      id: "komodo",
      name: "Komodo",
      description:
        "Pembe kumsallar, masmavi koylar ve yalnızca belgesellerde görmeye alışık olduğun Komodo ejderleri… Bu adalar topluluğu, dalış noktalarından gün batımı turlarına kadar, sanki gerçek değilmiş gibi hissettiren ama tamamen gerçek bir dünyanın kapısını aralar.",
      image:
        imageUrls["komodo-hero"] ||
        "https://images.pexels.com/photos/11896657/pexels-photo-11896657.jpeg?auto=compress&cs=tinysrgb&w=800",
      destinationCount: 2,
      highlights: ["Komodo Ejderleri", "Labuan Bajo"],
      tags: ["macera"],
    },
    {
      id: "sulawesi",
      name: "Sulawesi",
      description:
        "Dağ köylerindeki Toraja törenlerinden, dünya çapında ünlü mercan resiflerine uzanan uzun bir yolculuk gibi hissedilir Sulawesi. Her durakta bambaşka bir kültür, manzara ve hikâye karşına çıkar; ada kendini acele etmeden, yavaş yavaş keşfetmeni ister.",
      image:
        imageUrls["sulawesi-hero"] ||
        "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=800",
      destinationCount: 4,
      highlights: ["Toraja", "Bunaken", "Geleneksel Evler"],
      tags: ["macera"],
    },
    {
      id: "sumatra",
      name: "Sumatra",
      description:
        "Sisli dağların arasına gizlenmiş köyler, derin yağmur ormanları ve ağaçların arasında özgürce dolaşan orangutanlar… Sumatra'da doğa, kendini en vahşi ve en saf haliyle gösterirken, sen de bu büyük adanın her köşesinde farklı bir keşfe davet edilirsin.",
      image:
        imageUrls["sumatra-hero"] ||
        "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=800",
      destinationCount: 6,
      highlights: ["Toba Gölü", "Orangutanlar", "Sörf"],
      tags: ["macera", "sakin"],
    },
  ];

  const filteredIslands =
    activeFilter === "hepsi"
      ? islands
      : islands.filter((island) => island.tags?.includes(activeFilter));

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
        <Navigation />

        <div className="flex flex-1">
          <div className="flex-1">
            <div
              className="relative py-12 sm:py-16 lg:py-20 overflow-hidden"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="max-w-none ml-0 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl">
                  <div className="flex items-center mb-4">
                    <Palmtree size={32} className="text-white mr-3" />
                    <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-poppins font-bold text-white leading-tight">
                      Endonezya'yı Keşfedin
                    </h1>
                  </div>
                  <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-poppins font-normal text-white/90 max-w-2xl mb-4">
                    Cennet adaları, egzotik kültürler ve unutulmaz anılar sizi bekliyor. Hayalinizdeki balayı veya tatil için mükemmel destinasyonu keşfedin.
                  </p>

                  <div className="inline-flex flex-wrap items-center gap-3 text-[12px] sm:text-[13px] font-inter text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="flex items-center gap-1">
                      <span className="text-xs">🏝</span>
                      <span>6 ada</span>
                    </span>
                    <span className="h-3 w-px bg-white/40 hidden sm:inline-block" />
                    <span className="flex items-center gap-1">
                      <span className="text-xs">📍</span>
                      <span>30'dan fazla destinasyon</span>
                    </span>
                    <span className="h-3 w-px bg-white/40 hidden sm:inline-block" />
                    <span className="flex items-center gap-1">
                      <span className="text-xs">✨</span>
                      <span>Balayı ve tatil önerileri</span>
                    </span>
                  </div>
                </div>
                <HeroSocialButtons align="right" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#121212]">
              <div className="max-w-none ml-0 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="mb-8">
                  <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-poppins font-bold text-black dark:text-white leading-tight mb-2">
                    Adaları Keşfedin
                  </h2>
                  <p className="text-[14px] sm:text-[16px] font-poppins font-normal text-[#555555] dark:text-[#A0A0A0]">
                    Her ada, benzersiz deneyimler ve unutulmaz anılar sunuyor
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-inter border transition-all duration-200 ${
                          activeFilter === filter.id
                            ? "bg-[#FF8940] text-white border-[#FF8940] shadow-sm"
                            : "bg-white/70 dark:bg-[#1E1E1E] text-[#555555] dark:text-[#CCCCCC] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#232323]"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {filteredIslands.map((island) => (
                    <a
                      key={island.id}
                      href={`/kesfet/${island.id}`}
                      className="group bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img
                          src={island.image}
                          alt={island.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="w-full px-4 pb-3 flex items-center justify-between text-[12px] sm:text-[13px] text-white/90">
                            <span className="font-medium">{island.name}'i daha yakından keşfet</span>
                            <ChevronRight size={16} className="shrink-0" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        <p className="text-[11px] sm:text-[12px] font-inter font-medium uppercase tracking-[0.16em] text-[#FF8940] dark:text-[#FF9D55] mb-1">
                          Endonezya Adaları
                        </p>
                        <h3 className="text-[18px] sm:text-[20px] font-poppins font-bold text-black dark:text-white mb-2">
                          {island.name}
                        </h3>
                        {island.tags && island.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {island.tags
                              .filter((tag) => tagLabels[tag])
                              .slice(0, 2)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-inter font-medium bg-[#FF8940]/10 text-[#FF8940] dark:text-[#FF9D55] border border-[#FF8940]/30"
                                >
                                  {tagLabels[tag]}
                                </span>
                              ))}
                          </div>
                        )}
                        <p className="text-[13px] sm:text-[14px] font-inter text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5 mb-4">
                          {island.description}
                        </p>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-[13px] font-inter font-semibold text-gray-700 dark:text-gray-300">
                            <MapPin size={16} className="inline mr-1 text-[#FF8940]" />
                            {island.destinationCount} Destinasyon
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {island.highlights.slice(0, 2).map((highlight, idx) => (
                            <span
                              key={idx}
                              className="text-[12px] font-inter font-medium px-3 py-1.5 bg-[#FF8940] bg-opacity-10 text-[#FF8940] dark:text-[#FF9D55] rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>

                        <div className="inline-flex items-center gap-1 text-[13px] sm:text-[14px] font-inter font-semibold text-[#FF8940] dark:text-[#FF9D55] bg-[#FF8940] bg-opacity-10 dark:bg-[#FF9D55] dark:bg-opacity-15 border border-[#FF8940] border-opacity-30 rounded-full px-4 py-2 transition-colors duration-300 hover:bg-opacity-20 dark:hover:bg-opacity-25">
                          <span>Detayları gör</span>
                          <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

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
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .line-clamp-5 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
        }
      `,
        }}
      />
    </>
  );
}
