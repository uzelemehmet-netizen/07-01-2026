import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { openWhatsApp } from "../utils/whatsapp";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { MapPin, Calendar, Users, Award, Hotel } from "lucide-react";
import ImageLightbox from "../components/ImageLightbox";
import { db } from "../config/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { TOURS_CONFIG } from "./Tours";

// Ön rezervasyon hesaplamaları için varsayılan kapora oranı (yüzde)
const DEPOSIT_PERCENT = 30;

// Metinler içinde geçen "dahil değildir" ve "dahildir" ifadelerini, ayrıca Bali turist vergisi linkini vurgulamak için yardımcı fonksiyon
const renderWithInclusionHighlight = (text) => {
  if (typeof text !== "string") return text;

  const negative = "dahil değildir";
  const positive = "dahildir";
  const baliTaxUrl = "https://lovebali.baliprov.go.id";

  const elements = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const idxNeg = remaining.indexOf(negative);
    const idxPos = remaining.indexOf(positive);
    const idxUrl = remaining.indexOf(baliTaxUrl);

    if (idxNeg === -1 && idxPos === -1 && idxUrl === -1) {
      elements.push(remaining);
      break;
    }

    // En önce gelen ifadeyi bul (negatif, pozitif veya URL)
    const candidates = [
      { index: idxNeg, type: "negative", phrase: negative },
      { index: idxPos, type: "positive", phrase: positive },
      { index: idxUrl, type: "url", phrase: baliTaxUrl },
    ].filter((c) => c.index !== -1);

    candidates.sort((a, b) => a.index - b.index);
    const { index, type, phrase } = candidates[0];

    if (index > 0) {
      elements.push(remaining.slice(0, index));
    }

    if (type === "url") {
      elements.push(
        <a
          key={`inc-${key}`}
          href={baliTaxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {phrase}
        </a>
      );
    } else if (type === "negative" || type === "positive") {
      elements.push(
        <span
          key={`inc-${key}`}
          className={
            type === "negative"
              ? "font-semibold text-red-600"
              : "font-semibold text-emerald-700"
          }
        >
          {phrase}
        </span>
      );
    }

    remaining = remaining.slice(index + phrase.length);
    key += 1;
  }

  return elements;
};

const toursData = {
  bali: {
    name: "Bali Adası",
    hero: "/bali-rice-terraces-green.jpg",
    summary:
      "Bali, pirinç terasları, şelaleleri ve tropik plajlarıyla; deneyim odaklı toplu tatil rotamızın en kapsamlı ve en detaylı hazırlanmış adasıdır.",
    suitableFor: [
      "Doğa & Macera",
      "Deniz & Plaj Tatili",
      "Kültürel Keşif",
      "Wellness & Spa",
    ],
    duration: "6 Gece 7 Gün",
    concept:
      "Uçak biletleri; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder.",
    price: "3.699",
    packages: [
      {
        id: "bali-basic",
        level: "temel",
        name: "Bali Keşif Temel",
        badge: "Bütçe dostu",
        headline:
          "Uçak bileti, konaklama ve kahvaltıyı sabitleyip, tüm aktiviteleri isteğe bağlı seçmek isteyenler için giriş seviyesi paket.",
        priceMultiplier: 0.7,
        highlights: [
          "İstanbul çıkışlı gidiş-dönüş uçak bileti (havayolu/aktarma detayları rezervasyon sonrası yazılı olarak paylaşılır)",
          "Ubud ve sahil bölgesinde seçili otellerde 6 gece konaklama, her gün otel restoranında kahvaltı dahil",
          "Havalimanı–otel–otel arası ana transferler ve 7/24 ulaşılabilir Türkçe destek",
          "Programdaki tüm günler serbesttir; Tegenungan Şelalesi ve Tegalalang pirinç terasları rehberli turu, Ubud Monkey Forest ziyareti, Ayung Nehri rafting günü, tam gün tekne turu, 3. gündeki ATV Quad Safari ve 5. gündeki Sea Walker, Jet Ski ve Parasailing gibi tüm deneyimler bu pakete dahil değildir; bu aktiviteleri isterseniz rezervasyon aşamasında veya sahada en az 24 saat önce opsiyonel olarak ekleyebilirsiniz",
        ],
        notes:
          "Bu paket, tamamen esnek bir tatil altyapısı sunar. Detaylı programda anlattığımız 2. gün Ubud rehberli turu (Tegenungan Şelalesi, Tegalalang pirinç terasları, Ubud Monkey Forest ve gün içindeki diğer duraklar), 4. gün Ayung Nehri rafting & doğa günü ve 6. gün tam gün tekne turu bu pakete dahil değildir; ayrıca 3. gündeki ATV Quad Safari ve 5. gündeki Sea Walker, Jet Ski, Parasailing gibi su sporları deneyimleri de bütçe dostu pakete dahil değildir. Tüm bu aktiviteleri, isterseniz rezervasyon aşamasında ya da sahada en az 24 saat önce opsiyonel olarak ekleyebilirsiniz. Amaç, uçak bileti + konaklama + kahvaltıyı sabitleyip, aktiviteleri ilgi ve bütçenize göre sonradan seçebilmenizi sağlamaktır.",
      },
      {
        id: "bali-plus",
        level: "plus",
        name: "Bali Deneyim Standart",
        badge: "Dengeli seçenek",
        headline:
          "Uçak bileti, konaklama, kahvaltı ve programdaki 2. ve 4. gün rehberli aktiviteleri dahil eden, dengeli bir konfor ve deneyim seviyesi.",
        priceMultiplier: 0.85,
        highlights: [
          "İstanbul çıkışlı gidiş-dönüş uçak bileti",
          "Ubud ve sahil bölgesinde seçili otellerde 6 gece konaklama, her gün otel restoranında kahvaltı dahil",
          "2. gün Ubud & çevresi için doğa ve deneyim odaklı rehberli gün pakete dahildir",
          "4. gün Ayung Nehri rafting & doğa macerası ve Sanur bölgesine geçiş pakete dahildir",
          "Bu rehberli günlerde grup halinde aynı restoranda öğle yemeği dahildir",
        ],
        notes:
          "6. gündeki tam gün tekne turu, 3. ve 5. gündeki ATV ve su sporları gibi serbest gün aktiviteleri bu pakete dahil değildir; dilerseniz rezervasyon sırasında ya da sahada en az 24 saat önce opsiyonel ek hizmet olarak eklenebilir. Standart paket, deneyimin kalbini oluşturan 2. ve 4. gün aktivitelerini dahil eder; diğer günleri bütçe ve ilgiye göre esnek bırakır.",
      },
      {
        id: "bali-premium",
        level: "premium",
        name: "Bali Deneyim Premium",
        badge: "En kapsamlı",
        headline:
          "Detaylı programda anlattığımız tam kapsamlı paket; uçak bileti, rafting ve tam gün tekne turu dahil, sürpriz maliyetleri en aza indirecek şekilde tasarlandı.",
        priceMultiplier: 1,
        highlights: [
	  "İstanbul çıkışlı gidiş-dönüş uçak bileti",
	  "Ubud ve sahil bölgesinde seçili üst segment otel veya butik tesislerde 6 gece konaklama, her gün otel restoranında kahvaltı dahil",
          "2. gün Ubud & çevresi rehberli turu, 4. gün Ayung Nehri rafting & doğa macerası ve 6. gün tam gün tekne turu bu pakete dahildir",
          "Rehberli günlerde grup halinde öğle yemekleri ve programda belirtilen pek çok ekstra detay fiyata dahildir",
        ],
        notes:
          "Bu paket, sayfada gün gün anlattığımız programın referans alındığı tam kapsamlı versiyondur; uçak bileti, 2. ve 4. gün rehberli aktiviteler ve 6. gün tam gün tekne turu baştan ücrete dahildir. Tam gün tekne turu, grup büyüklüğüne göre özel veya paylaşımlı tekne ile organize edilir; özel tekne tercih edilirse opsiyonel kişi başı fark oluşabilir. 3. gündeki ATV Quad Safari ve 5. gündeki su sporları paketi gibi opsiyonel deneyimler bu pakete dahil değildir; ancak Premium misafirler için yaklaşık %25'e varan indirimli özel fiyatlarla sunulur; kesin tutar seçiminizi onaylamadan önce yazılı olarak paylaşılır.",
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Bali Havalimanı'nda Buluşma, Otele Yerleşme ve Serbest Zaman",
        activities: [
		  "Uçuşlar paket dahilinde. Herkes kendi kalkış noktasından aynı gün Bali'ye geliyor.",
		  "Bali Havalimanı'nda ekibimiz sizi karşılıyor, tur programı resmi olarak burada başlıyor.",
          "Bali'den otele özel transfer ve check-in işlemleri",
          "Yolculuk sonrası dinlenme ve Bali atmosferine alışma için serbest zaman",
        ],
        accommodation: "Ubud bölgesinde seçili otel veya butik tesis",
      },
      {
        day: 2,
        title: "Ubud & Çevresi – Doğa ve Deneyim Odaklı Rehberli Gün",
        activities: [
          "08:30 – Otelden hareket",
          "Tegenungan Şelalesi'nde doğa yürüyüşü, fotoğraf ve dileyenler için yüzme molası",
          "Tegalalang pirinç terasları manzara noktalarında kısa yürüyüş ve fotoğraf molası",
          "Ubud Monkey Forest'ta doğal yaşam alanında yürüyüş ve gözlem (giriş ücreti dahildir)",
          "Ubud çevresinde yerel bir kahve ve çay tadım noktasında kısa mola",
          "Grup halinde aynı restoranda öğle yemeği, menüden bireysel seçim",
          "Ubud sokakları ve el sanatları bölgesinde kafeler, atölyeler ve serbest keşif zamanı",
          "17:30 – Otele dönüş, akşam serbest zaman",
        ],
        accommodation: "Ubud bölgesinde seçili otel veya butik tesis",
      },
      {
        day: 3,
        title: "Serbest Gün – Kişisel Planlama",
        activities: [
          "Programdaki otelde konaklama ile birlikte kahvaltı otel restoranında paket kapsamındadır",
          "Gün boyunca Ubud sokaklarını, kafelerini ve çevredeki doğa noktalarını keşfedebilir, otel havuzu ve spa alanında dinlenebilir veya alışveriş yapabilirsiniz",
          "Otel dışındaki restoran ve kafelerde yapacağınız yiyecek-içecek harcamaları pakete dahil değildir; talep halinde ekstra rehberlik ve organizasyon sağlanabilir. Dileyen katılımcılar, Ubud bölgesinde planlanan ATV Quad Safari ekstra aktivitesine yan taraftaki opsiyonel ekstra aktivite kartına tıklayarak içeriği kontrol ettikten sonra katılabilir",
        ],
        accommodation: "Ubud bölgesinde seçili otel veya butik tesis",
        optionalExtras: [
          {
            id: "bali-free-day-ubud-atv",
            title: "3. Gün | Ubud Bölgesi – ATV Quad Safari (Opsiyonel)",
            shortDescription:
              "Ubud'un pirinç tarlaları ve orman içi patikalarında, başlangıç seviyesine uygun ATV Quad Safari deneyimi (opsiyonel ve ücretli).",
            estimatedPricePerPerson: 155,
            priceNote:
	      "Paket içeriğine göre kişi başı ortalama 125–180 USD; tura dahil değildir ve isteğe bağlı ekstra bir hizmettir.",
            details: [
              "📍 Lokasyon: Ubud – Tegalalang / Payangan hattı",
              "⏱ Süre: Yaklaşık 1,5 – 2 saat sürüş (hazırlık ve transferlerle toplam 3–4 saatlik deneyim)",
              "🎒 Seviye: Başlangıç ve orta seviye katılımcılara uygundur",
              "👥 Kime uygun: Gençler, genç hissedenler ve adrenalin seven misafirler için idealdir",
              "Pirinç tarlaları arasında, manzaralı rotalarda sürüş",
              "Orman içi patikalarda ve doğal parkurlarda ilerleme",
              "Bazı bölümlerde çamurlu alanlar ve dere geçişleri ile eğlenceli etaplar",
              "Profesyonel rehber eşliğinde güvenli sürüş, kask ve temel ekipmanlar dahil",
              "Sürüş öncesi kısa güvenlik ve kullanım eğitimi",
            ],
            notes:
	      "Bu ATV deneyimi, turun ana paketine dahil değildir; tamamen opsiyonel ve ek ücrete tabidir. Fiyatlar, seçilen rota ve sezon yoğunluğuna göre kişi başı ortalama 125–180 USD bandındadır. Premium paket misafirleri için bu aktivite, liste fiyatı üzerinden yaklaşık %25 indirimli özel fiyatlarla sunulur; kesin tutar seçiminizi onaylamadan önce yazılı olarak paylaşılır.",
          },
        ],
      },
      {
        day: 4,
        title: "Ayung Nehri Rafting & Doğa Macerası – Rehberli Gün",
        activities: [
          "08:00 – Otelden hareket",
          "Ayung Nehri üzerinde, 2 kişilik veya 4–6 kişilik botlarla yaklaşık 2–2,5 saat süren rafting deneyimi",
          "Tropik orman manzaraları, küçük şelaleler ve sakin–orta seviye akıntılar eşliğinde keyifli bir parkur",
          "Tüm parkur boyunca profesyonel rehberlik, can yeleği, kask ve gerekli güvenlik ekipmanları dahildir",
          "13:30 – 14:30 arası aktivite alanına yakın restoranda öğle yemeği (grup halinde, bireysel menü seçimi)",
          "15:00 – 16:30 arası doğa yürüyüşü ve panoramik manzara noktalarında fotoğraf molaları",
          "17:30 – Sahile yakın Sanur bölgesindeki otele geçiş ve yeni otele yerleşme",
        ],
        accommodation: "Sanur sahil bölgesinde seçili otel veya resort",
      },
      {
        day: 5,
        title: "Serbest Gün – Sahil ve Kişisel Tercihler",
        activities: [
          "Programdaki otelde konaklama ile birlikte kahvaltı otel restoranında paket kapsamındadır",
          "Günü Sanur sahilinde deniz, havuz, spa veya şehir içi keşif ile değerlendirebilirsiniz",
          "Otel dışındaki restoran ve kafelerde yapacağınız yiyecek-içecek harcamaları pakete dahil değildir. Rehberlik veya özel organizasyon talepleri ekstra ücret karşılığında bireysel olarak organize edilir; dileyen katılımcılar serbest günde planlanan ek su sporları etkinliğine yan taraftaki opsiyonel ekstra aktivite kartına tıklayarak içeriği kontrol ettikten sonra katılabilir",
        ],
        accommodation: "Sanur sahil bölgesinde seçili otel veya resort",
        optionalExtras: [
          {
            id: "bali-free-day-watersports",
            title: "Serbest Gün – Ekstra Deniz & Su Sporları Deneyimi (Opsiyonel)",
            shortDescription:
              "Bali'nin tropik denizlerinde, aynı gün içinde Sea Walker, Jet Ski ve Parasailing gibi su sporlarını deneyimleyebileceğiniz özel paket (opsiyonel ve ücretli).",
            estimatedPricePerPerson: 230,
            priceNote:
	      "Paket içeriğine ve seçilen aktivitelere göre kişi başı ortalama 210–250 USD; tura dahil değildir ve isteğe bağlı ekstra bir hizmettir.",
            details: [
              "Bu gün tamamen serbesttir. Dileyen misafirler, Bali'nin tropik denizlerinde adrenalin ve eğlenceyi bir arada sunan Su Sporları Deneyim Paketi'ne katılabilir.",
              "Paket, farklı deneyimleri tek günde yaşamak isteyen misafirler için hazırlanmıştır ve tüm aktiviteler profesyonel ekipler eşliğinde, güvenlik önlemleri alınarak gerçekleştirilir.",
              "Sea Walker (Deniz Altı Yürüyüşü): Oksijenli kask ile deniz tabanında yürüyerek, Bali'nin renkli mercanlarını ve tropikal balıklarını yakından gözlemleme deneyimi. Yüzme bilmeyenler için de uygundur. (Süre: hazırlık dahil yaklaşık 30 dakika)",
              "Jet Ski: Hint Okyanusu'nun açık sularında, kontrollü ve rehberli, yüksek tempolu bir jet ski sürüş deneyimi. Adrenalin sevenler için kısa ama etkili bir aktivitedir. (Süre: yaklaşık 15 dakika)",
              "Parasailing: Denizin üzerinde yükselerek Bali sahil şeridini kuşbakışı izleme fırsatı sunar; manzara ve heyecanı bir arada yaşatan unutulmaz bir deneyimdir. (Uçuş süresi: yaklaşık 5–7 dakika)",
            ],
            note:
	      "Bu paket tur fiyatına dahil değildir. Katılmak isteyen misafirler, uygun saat ve kontenjan için en az 24–48 saat önce rehberimize veya operasyon ekibimize bilgi vermelidir ya da indirimli fiyattan yararlanmak için rezervasyon aşamasında işaretleyerek pakete dahil edebilir. Premium paket misafirleri için, bu su sporları paketi liste fiyatı üzerinden yaklaşık %25 indirimli özel fiyatlarla sunulur; kesin tutar seçiminizi onaylamadan önce yazılı olarak paylaşılır.",
          },
        ],
      },
      {
        day: 6,
        title: "Tam Gün Tekne Turu & Ada Deneyimi – Rehberli Gün",
        activities: [
          "08:00 – Sanur sahilindeki limandan teknemize biniş ve açılış hazırlıkları",
          "Sabah saatlerinde, Bali'nin doğu kıyısı boyunca yakın adalara (örneğin Nusa Lembongan çevresi) doğru keyifli bir tekne yolculuğu",
          "Gün içinde şnorkel ve temel dalış için uygun mercan resifi noktalarında duraklama; maske ve şnorkel ile deniz yaşamını yakından gözlemleme imkânı",
          "Sakin bir koyda demirleyip yüzme, güneşlenme ve fotoğraf molaları",
          "Dileyen misafirler için teknede amatör balık avlama deneyimi (temel ekipman sağlanır)",
          "Teknede veya uygun bir adada öğle yemeği (tur programı kapsamında dahildir)",
          "16:30 – 17:00 arası tekne üzerinde veya sahilde gün batımı deneyimi ve Sanur'a dönüş",
          "18:30 – Otele varış, akşam serbest zaman",
          "Tekne günü, grup büyüklüğüne göre özel veya paylaşımlı tekne ile planlanır; özel tekne tercih edilirse opsiyonel kişi başı fark oluşabilir",
        ],
        accommodation: "Sanur sahil bölgesinde seçili otel veya resort",
      },
      {
        day: 7,
        title: "Serbest Zaman, Bali Havalimanı'na Transfer ve Dönüş",
        activities: [
          "Sabah kahvaltısı",
          "Uçuş saatine göre Sanur veya yakın bölgede serbest zaman",
          "Uygun ise sahile yakın şık bir kafede küçük bir veda buluşması / kutlama",
          "Otel çıkış işlemleri ve Bali Havalimanı'na transfer",
          "Tur programı Bali Havalimanı'nda sona erer; buradan sonraki tüm uçuş ve aktarma süreçleri misafir sorumluluğundadır.",
        ],
        accommodation: "-",
      },
    ],
    activities: [
      {
        category: "Plaj & Su Sporları",
        items: [
          "Sörf dersleri ve dalga spotları",
          "Şnorkel alanlarında yüzme ve mercan resifleri",
          "Tam gün tekne turu ve ada ziyaretleri",
          "Stand-up paddle ve deniz aktiviteleri",
          "Plaj kulüpleri ve gün batımı deneyimleri",
        ],
      },
      {
        category: "Kültür & Tarih",
        items: [
          "Antik tapınak turları",
          "Geleneksel dans gösterileri",
          "Sanat galerileri",
          "Yerel pazar gezileri",
          "Balinese mutfağı workshop",
        ],
      },
      {
        category: "Doğa & Macera",
        items: [
          "Tegenungan Şelalesi ve doğa yürüyüşleri",
          "Body rafting ve kanyon parkuru deneyimi",
          "Orman ve köy yollarında manzara yürüyüşleri",
          "Bisiklet ve hafif trekking rotaları",
          "Ubud Monkey Forest ve doğal yaşam gözlemi",
        ],
      },
      {
        category: "Wellness & Spa",
        items: ["Balinese masajı", "Yoga seansları", "Spa tedavileri", "Meditasyon", "Wellness merkezi"],
      },
    ],
    about: {
      nature:
        "Bali, yeşil pirinç terasları, yanardağlar, muhteşem şelaleler ve kristal berraklığındaki plajlarıyla doğa harikası bir ada. Tropik iklimi sayesinde yıl boyunca yeşil kalan ada, palmiye ağaçları, egzotik çiçekler ve zengin bitki örtüsüyle dikkat çeker.",
      culture:
        "Hindu kültürünün yaşayan bir müzesi olan Bali, binlerce tapınak, günlük sunular ve geleneksel törenlerle mistik bir atmosfere sahip. Balinese halkının sanat, dans ve müziğe olan tutkusu adanın her köşesinde hissedilir.",
      lifestyle:
        "Bali'de zaman farklı akar. Sabahları yoga, gün boyunca plaj ve spa, akşamları gün batımı ve lezzetli yemekler... Ada, hem huzur arayanlar hem de macera tutkunları için mükemmel bir destinasyon.",
    },
    included: [
      "Tüm paketlerde: İstanbul çıkışlı gidiş-dönüş uçak bileti (paket açıklaması/broşür/teklif formunda belirtilen tutara kadar; aşan fark katılımcı tarafından ödenir)",
      "Tüm paketlerde: seçili otellerde 6 gece konaklama ve her gün otel restoranında kahvaltı",
      "Tüm paketlerde: havalimanı–otel–otel arası ana transferler ve 7/24 ulaşılabilir Türkçe destek",
      "Standart ve Premium paketlerde: rehberli günlerde programda yer alan geziler ve grup hizmetleri",
      "Standart ve Premium paketlerde: 2. gün Ubud & çevresi doğa ve deneyim odaklı rehberli tur",
      "Standart ve Premium paketlerde: 4. gün Ayung Nehri rafting deneyimi (bot, ekipman ve profesyonel rehberlik dahil)",
      "Yalnızca Premium pakette: 6. gün tam gün tekne turu ve ada ziyaretleri",
      "Standart ve Premium paketlerde: rehberli günlerde, tarafımızdan seçilen restoranda alınan öğle yemekleri (misafirler menüden diledikleri yemeği seçebilir)",
    ],
    notIncluded: [
      "Temel paket için: detaylı programda anlatılan rehberli günler ve tüm aktiviteler bu fiyata dahil değildir; buna 2. gündeki Ubud rehberli turu (Tegenungan Şelalesi, Tegalalang pirinç terasları, Ubud Monkey Forest ve diğer duraklar), 4. gündeki Ayung Nehri rafting & doğa günü, 6. gündeki tam gün tekne turu ile 3. gündeki ATV Quad Safari ve 5. gündeki Sea Walker, Jet Ski ve Parasailing gibi su sporları paketleri dahildir; bu deneyimler istenirse opsiyonel ekstra olarak planlanır",
      "Standart paket için: 6. gün tam gün tekne turu, su sporları paketi ve serbest günlerdeki diğer ekstra aktiviteler (katıldığınız kadar ekstra ücretlendirilir)",
      "Tüm paketlerde: akşam yemekleri ve serbest günlerde otel kapsamı dışında tercih edilen tüm yiyecek-içecek harcamaları",
      "Tüm paketlerde: kişisel harcamalar, spa, masaj ve bireysel tercihlere bağlı ekstra hizmetler",
      "Tüm paketlerde: 3. gündeki ATV Quad Safari ve 5. gündeki deniz & su sporları paketi gibi opsiyonel ekstra aktiviteler (Premium misafirler için indirimli fiyatlar uygulanır, ancak katılım gösterilen aktiviteler için ayrıca ücret ödenir)",
      "Endonezya/Bali turist vergisi ve resmi giriş harçları bu tur paketine dahil değildir; Bali'ye gelmeden önce turist vergisini https://lovebali.baliprov.go.id (Bali Eyalet Hükümeti'nin resmi sitesi) adresi üzerinden online kredi kartı ile ödemeniz ve sistemin telefonunuza göndereceği barkodu Bali Havalimanı'nda yetkililere göstermeniz gerekmektedir.",
      "Türkiye'den çıkışta ödenen yurtdışı çıkış harcı katılımcı tarafından ödenir ve bu paket kapsamına dahil değildir.",
    ],
    notes: {
      approach:
        "Bu rota, Premium paket referans alınarak tasarlanmış deneyim odaklı bir toplu tatil organizasyonudur. Uçak bileti; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder. Konaklama ve sabah kahvaltısı sabittir. Standart ve Premium paketlerde 2. ve 4. gün rehberli aktiviteler, Premium pakette ise ek olarak 6. gün tam gün tekne turu dahildir. Diğer öğünler ve opsiyonel aktiviteler için misafirler dilerse otel restoranını, dilerse dışarıdaki farklı mekanları ve deneyimleri tercih edebilir. Böylece bütçenizi, neye ne kadar harcayacağınıza kendiniz karar verebileceğiniz şeffaf bir yapı içinde yönetebilirsiniz.",
      freeTime:
        "Serbest zaman dilimleri, katılımcıların kendi damak zevki, bütçe ve ritmine göre hareket edebilmesi için bilerek esnek bırakılmıştır. Akşam yemekleri ve serbest günlerdeki öğünler için isterseniz otel restoranında dahil olan menüden seçim yapabilir, isterseniz dışarıda yeni mekânlar keşfedebilirsiniz. Otel dışındaki restoran ve kafelerde yapılacak yiyecek-içecek harcamaları tura dahil değildir; talep edilmesi halinde rehberimiz ve ekibimiz restoran ve mekân önerileriyle destek olur.",
      discipline:
        "Programın sağlıklı ve keyifli ilerleyebilmesi için grup düzenine saygı, zamanlamaya uyum ve karşılıklı nezaket esastır. Grup içi uyumu bozacak davranışlardan kaçınılması, herkesin huzurlu ve unutulmaz bir tatil yaşaması için önemlidir.",
    },
    routes: [
      { name: "Seminyak Plajı", description: "Şık beach club'lar ve gün batımı" },
      { name: "Ubud", description: "Sanat, kültür ve doğanın merkezi" },
      { name: "Tanah Lot", description: "Okyanusta ikonik tapınak" },
      { name: "Uluwatu", description: "Uçurum üstü tapınak ve Kecak dans" },
      { name: "Tegalalang", description: "Ünlü pirinç terasları" },
      { name: "Nusa Dua", description: "Lüks resort ve beyaz kumsal" },
    ],
    gallery: [
      "/bali-rice-terraces-green.jpg",
      "/tanah-lot-temple-sunset-ocean.jpg",
      "/bali-beach-seminyak-palm-trees.jpg",
      "/ubud-monkey-forest-bali.jpg",
      "/bali-traditional-dance-kecak.jpg",
      "/bali-luxury-pool-villa.jpg",
    ],
  },
  lombok: {
    name: "Lombok Adası",
    hero: "/lombok-island-beach-mountain-panoramic.jpg",
    summary:
      "Bali'nin sakin ve otantik kız kardeşi Lombok, el değmemiş beyaz kumlu plajları, muhteşem Rinjani Yanardağı ve turkuaz suları ile macera ve doğa severlerin cenneti. Gili Adaları'nın kristal berraklığındaki denizi, güneydeki sörf cenneti plajlar ve kuzeydeki şelaleler bu rotada bir araya gelir.",
    suitableFor: [
      "Doğa & Macera",
      "Deniz & Plaj Tatili",
      "Sörf",
      "Trekking",
      "Balayı",
      "Arkadaş Grubu",
    ],
    duration: "6 Gece 7 Gün",
    concept:
      "Uçak biletleri; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder.",
    price: "3.299",
    packages: [
      {
        id: "lombok-basic",
        level: "temel",
        name: "Lombok Keşif Temel",
        badge: "Bütçe dostu",
        headline:
          "Uçak bileti ve konaklamayı sabitleyip, Gili, şelaleler ve güney plaj turlarını isteğe göre sonradan eklemek isteyenler için giriş seviyesi paket.",
        priceMultiplier: 0.7,
        highlights: [
          "İstanbul çıkışlı gidiş-dönüş uçak bileti (havayolu/aktarma detayları rezervasyon sonrası yazılı olarak paylaşılır)",
          "İlk 3 gece için Senggigi sahil bölgesinde, son 3 gece için Kuta Lombok çevresinde seçili otel veya butik tesislerde toplam 6 gece konaklama, her gün otel kahvaltısı dahil",
          "Havalimanı–otel–otel arası ana transferler ve 7/24 ulaşılabilir Türkçe destek",
          "Gili Adaları tekne turu, Senaru şelale günü ve güney plajları & sörf turları bu pakete dahil değildir; isterseniz rezervasyon aşamasında veya sahada en az 24 saat önce opsiyonel ekstra olarak eklenebilir",
        ],
        notes:
          "Bu paket, Lombok'ta konaklama altyapısını ve uçuşları güvence altına alır; gün içi turları bütçe ve ilgiye göre sonradan ekleyebilmeniz için esnek bırakır. Gili Adaları tekne turu, Senaru şelaleleri ve güney plajları & sörf günü gibi detaylı turlar temel pakete dahil değildir; ancak talebinize göre tek tek veya paket halinde planlanabilir.",
      },
      {
        id: "lombok-plus",
        level: "plus",
        name: "Lombok Deneyim Standart",
        badge: "Dengeli seçenek",
        headline:
          "Gili Adaları tekne turu ve güney plajları & sörf gününü dahil edip, diğer günleri daha esnek bırakmak isteyenler için dengeli deneyim seviyesi.",
        priceMultiplier: 0.85,
        highlights: [
          "Uçak bileti, 6 gece konaklama ve kahvaltıya ek olarak bir tam gün Gili Adaları tekne turu pakete dahildir",
          "Gili gününde şnorkel ekipmanı, ada içi temel bisiklet turu ve ada üzerindeki belirlenmiş bir restoranda grup öğle yemeği dahildir",
          "Güney Lombok plajları (Tanjung Aan, Selong Belanak vb.) ve hafif sörf denemesi içeren bir rehberli gün pakete dahildir",
          "Pink Beach tekne turu gibi ek tekne turları bu pakete dahil değildir; Kuta veya Senggigi'deki serbest günlerinizde opsiyonel ekstra olarak eklenebilir",
        ],
        notes:
          "Standart paket, Lombok deneyiminin kalbini oluşturan Gili günü ile güney plajları & sörf gününü dahil eder. Böylece bir gün kuzeybatıdaki adalarda, bir gün de güney kıyılarda dolu dolu program yaşarken, aradaki serbest günlerde Senggigi ve Kuta çevresinde dinlenme ve esnek plan yapma imkânınız olur. Pink Beach tekne turu gibi turlar ise serbest günlerinizde opsiyonel ekstra olarak planlanabilir.",
      },
      {
        id: "lombok-premium",
        level: "premium",
        name: "Lombok Deneyim Premium",
        badge: "En kapsamlı",
        headline:
          "Gili tekne turu, Senaru şelaleleri & Rinjani manzaraları ve güney plajları & sörf günü dahil, sürpriz maliyetleri en aza indiren tam kapsamlı Lombok paketi.",
        priceMultiplier: 1,
        highlights: [
          "İstanbul çıkışlı gidiş-dönüş uçak bileti",
          "Senggigi ve Kuta Lombok bölgelerinde seçili üst segment otel veya butik tesislerde 6 gece konaklama, her gün otel kahvaltısı dahil",
          "Bir tam gün Gili Adaları tekne turu (şnorkel durakları, Gili Trawangan & Gili Air kombinasyonu, grup öğle yemeği dahil)",
          "Senaru bölgesinde Sendang Gile & Tiu Kelep şelaleleri yürüyüşü ve Rinjani manzara noktalarını içeren tam gün doğa turu dahildir",
          "Güney Lombok plajları (Tanjung Aan, Selong Belanak, Mawun vb.) ve başlangıç seviyesi sörf denemesi içeren rehberli bir gün pakete dahildir",
        ],
        notes:
          "Premium paket, Lombok'un kuzeydeki şelaleleri ve Rinjani manzaraları, batıdaki Senggigi sahilleri, Gili adalarının turkuaz denizi ve güneydeki sörf plajlarını tek bir akışta birleştirir. Gili, Senaru ve güney plajları & sörf günleri baştan pakete dahildir; Pink Beach tekne turu veya ileri seviye sörf ve dalış gibi spesifik deneyimler ise özellikle Kuta'daki serbest gününüzde opsiyonel ekstra olarak planlanır.",
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Lombok'a Varış, Senggigi'ye Transfer ve Gün Batımı",
        activities: [
          "İstanbul'dan Lombok Havalimanı'na (Praya) uçuş; aktarma ve havayolu detayları rezervasyon sonrası yazılı olarak paylaşılır",
          "Lombok Havalimanı'nda karşılama ve batı kıyısındaki Senggigi bölgesine özel transfer",
          "Sahile yakın seçili otel veya butik tesiste check-in ve odalara yerleşme",
          "Akşamüstü Senggigi sahilinde gün batımı yürüyüşü, hafif aklimatizasyon ve dinlenme",
          "Dileyen misafirler için sahil boyunca yerel restoranlarda akşam yemeği (yemekler fiyata dahil değildir)",
        ],
        accommodation: "Senggigi sahil bölgesinde seçili otel veya butik tesis",
      },
      {
        day: 2,
        title: "Gili Adaları – Şnorkel ve Ada Turu (Rehberli Gün)",
        activities: [
          "Sabah kahvaltısının ardından Senggigi'den tekne iskelesine kısa transfer",
          "Gili Trawangan'a tekne ile geçiş; ada etrafında şnorkel ve yüzme molaları",
          "Deniz kaplumbağalarını görebileceğiniz noktalarda maske & şnorkel ile deniz yaşamını gözlemleme",
          "Gili Trawangan'da bisiklet ile kısa ada turu ve kahve molaları için serbest zaman",
          "Öğle saatlerinde Gili Air veya belirlenmiş adada sahil kenarı restoranda grup öğle yemeği (Standart ve Premium paketlerde dahildir)",
          "Gün batımına yakın 'swing' noktalarında fotoğraf ve dinlenme molası",
          "Akşamüstü tekne ile Senggigi'ye dönüş ve otele transfer",
        ],
        accommodation: "Senggigi sahil bölgesinde seçili otel veya butik tesis",
      },
      {
        day: 3,
        title: "Serbest Gün – Senggigi & Çevresinde Kişisel Tercihler",
        activities: [
          "Kahvaltı sonrası gün boyu Senggigi sahilini ve çevresini kendi temponuzda keşfetme imkânı",
          "Sahil boyunca yürüyüş, deniz ve otel havuzunda dinlenme, yerel kafeler ve masaj & spa merkezleri için serbest zaman",
          "Dileyen misafirler için Gili çevresinde dalış veya ek şnorkel turları gibi aktiviteler opsiyonel olarak planlanabilir",
          "Akşam için yerel mutfak deneyimi, gün batımı barları veya sakin bir sahil yürüyüşü önerilir (yemekler pakete dahil değildir)",
        ],
        accommodation: "Senggigi sahil bölgesinde seçili otel veya butik tesis",
        optionalExtras: [
          {
            id: "lombok-gili-diving",
            title: "Gili Adaları'nda Dalış Deneyimi (Opsiyonel)",
            shortDescription:
              "Sertifikalı dalış merkezleriyle, Gili çevresindeki resiflerde 1 veya 2 dalışlık paket; başlangıç veya ileri seviye opsiyonları.",
            estimatedPricePerPerson: 180,
            priceNote:
              "Seçilen dalış sayısı ve ekipman ihtiyacına göre kişi başı ortalama 150–210 USD; tura dahil değildir ve isteğe bağlı ekstra bir dalış paketidir.",
            details: [
              "📍 Lokasyon: Gili Trawangan ve çevresindeki dalış noktaları",
              "⏱ Paket seçenekleri: 1 veya 2 tüplü dalış (hazırlık ve tekne ile birlikte yarım güne yakın deneyim)",
              "🎒 Seviye: Yeni başlayanlar için keşif dalışı, sertifikalı dalgıçlar için daha derin resif opsiyonları",
              "Tüm teknik ekipman, dalış hocası ve emniyet brifingi dahildir",
              "Dalış sonrası adada serbest zaman ve deniz kenarında dinlenme imkânı",
            ],
            note:
              "Bu dalış paketi tur fiyatına dahil değildir. Katılmak isteyen misafirler için, uygun saat ve kontenjanın ayrılabilmesi adına en az 48 saat önce bildirim yapılması gerekir. Premium paket misafirlerine, liste fiyatı üzerinden yaklaşık %20–25 indirimli özel fiyatlar sunulur; kesin tutar seçiminizi onaylamadan önce yazılı olarak paylaşılır.",
          },
        ],
      },
      {
        day: 4,
        title: "Senaru Şelaleleri & Rinjani Manzaraları – Konaklamanın Kuta'ya Taşınması",
        activities: [
          "Sabah kahvaltısı sonrası Senggigi'den kuzeye, Senaru bölgesine doğru panoramik yolculuk",
          "Sendang Gile şelalesine orman içi kısa yürüyüş ve fotoğraf molaları",
          "Tiu Kelep şelalesine, dere geçişleri içeren biraz daha tempolu yürüyüş ve isteyenler için yüzme molası",
          "Öğle saatlerinde Senaru çevresinde yerel bir restoranda manzaralı öğle yemeği (Premium paketlerde dahildir)",
          "Rinjani Yanardağı'nın silüetini görebileceğiniz manzara noktalarında kısa duraklar",
          "Öğleden sonra güney kıyılara doğru yola çıkış ve Kuta Lombok bölgesine varış",
          "Akşam saatlerinde Kuta çevresinde seçili otel veya butik tesise yerleşme",
        ],
        accommodation: "Kuta Lombok bölgesinde seçili otel veya butik tesis",
      },
      {
        day: 5,
        title: "Serbest Gün – Kuta & Çevresinde Kişisel Tercihler",
        activities: [
          "Kahvaltı sonrası gün boyu Kuta Lombok ve çevresini kendi temponuzda keşfetme imkânı",
          "Kafeler, sahil barları, butik mağazalar ve masaj & spa merkezleri için serbest zaman",
          "Dileyen misafirler için Pink Beach ve güneydoğu koyları tekne turu veya ekstra sörf/paraşüt deneyimleri opsiyonel olarak planlanabilir",
          "Akşam için yerel mutfak deneyimi, gün batımı barları veya sakin bir sahil yürüyüşü önerilir (yemekler pakete dahil değildir)",
        ],
        accommodation: "Kuta Lombok bölgesinde seçili otel veya butik tesis",
        optionalExtras: [
          {
            id: "lombok-pink-beach-boat",
            title: "Pink Beach & Güneydoğu Koyları Tekne Turu (Opsiyonel)",
            shortDescription:
              "Lombok'un güneydoğusundaki pembe kumlu plajlar ve turkuaz koylarda yüzme, şnorkel ve manzara durakları içeren tam gün tekne turu.",
            estimatedPricePerPerson: 210,
            priceNote:
              "Tekne tipi ve grup büyüklüğüne göre kişi başı ortalama 180–260 USD; tura dahil değildir ve isteğe bağlı ekstra bir tekne turudur.",
            details: [
              "📍 Lokasyon: Lombok'un güneydoğu kıyıları ve Pink Beach çevresi",
              "Sabah erken saatte Kuta'dan limana transfer ve tekneye biniş",
              "Gün içinde birkaç farklı koyda yüzme ve şnorkel molaları",
              "Pink Beach'te fotoğraf molası ve plajda serbest zaman",
              "Teknede veya sahilde hafif öğle yemeği (paket içeriğine göre dahil olabilir)",
              "Akşamüstü Kuta'ya dönüş ve otele transfer",
            ],
            note:
              "Pink Beach tekne turu tur fiyatına dahil değildir. Katılmak isteyen misafirler, deniz ve hava koşullarına göre net saat ve günün belirlenebilmesi için en az 48 saat önce bildirim yapmalıdır. Premium paket misafirleri için liste fiyatı üzerinden yaklaşık %20 civarında indirim uygulanabilir; kesin tutar seçiminizi onaylamadan önce yazılı olarak paylaşılır.",
          },
        ],
      },
      {
        day: 6,
        title: "Güney Lombok Plajları & Hafif Sörf Deneyimi – Rehberli Gün",
        activities: [
          "Sabah kahvaltısının ardından Kuta merkezinden hareket",
          "Tanjung Aan ve çevresindeki koylarda fotoğraf ve yüzme molaları",
          "Selong Belanak veya benzeri başlangıç dostu bir plajda temel sörf dersi ve dalga denemeleri (Standart ve Premium paketlerde dahildir)",
          "Gün içinde sahil kenarı bir restoranda öğle yemeği ve dinlenme",
          "Mawun veya benzeri saklı koylarda gün batımına yakın yüzme ve manzara molası",
          "Akşamüstü Kuta'daki otele dönüş, serbest akşam zamanı",
        ],
        accommodation: "Kuta Lombok bölgesinde seçili otel veya butik tesis",
      },
      {
        day: 7,
        title: "Serbest Zaman, Havalimanı'na Transfer ve Dönüş",
        activities: [
          "Sabah kahvaltısı ve uçuş saatinize göre Kuta veya yakın çevrede kısa serbest zaman",
          "Otel çıkış işlemleri ve Lombok Havalimanı'na özel transfer",
          "Uygun ise havalimanına geçmeden önce sahile yakın bir kafede kısa veda kahvesi veya atıştırmalık",
          "Tur programı Lombok Havalimanı'nda sona erer; buradan sonraki uçuş ve aktarma süreçleri misafir sorumluluğundadır",
        ],
        accommodation: "-",
      },
    ],
    activities: [
      {
        category: "Plaj & Su Sporları",
        items: [
          "Güney Lombok'ta başlangıç ve orta seviye sörf dersleri",
          "Gili Adaları çevresinde şnorkel ve deniz kaplumbağaları ile yüzme",
          "Pink Beach ve çevresinde tekne turları",
          "Stand-up paddle ve kano deneyimleri",
          "Sahilde gün batımı yürüyüşleri ve plaj barları",
        ],
      },
      {
        category: "Doğa & Macera",
        items: [
          "Sendang Gile ve Tiu Kelep şelalelerine doğa yürüyüşleri",
          "Rinjani Yanardağı manzara noktaları ve fotoğraf durakları",
          "Kırsal köy yollarında bisiklet turları",
          "Pink Beach ve çevresinde keşif rotaları",
          "Kaya formasyonları ve gizli koylara kısa trekkingler",
        ],
      },
      {
        category: "Kültürel Deneyimler",
        items: [
          "Sasak köyü ziyareti ve geleneksel evleri yakından görme",
          "Yerel dokuma atölyelerinde el işi kumaş ve sarong üretimini gözlemleme",
          "Kahve ve baharat çiftlikleri ziyaretleri",
          "Geleneksel Lombok mutfağı ve sahil restoranlarında deniz ürünleri",
          "Yerel pazarlar ve el işi ürün alışverişi",
        ],
      },
    ],
    about: {
      nature:
        "Lombok, muhteşem Rinjani Yanardağı'nın gölgesinde uzanan, el değmemiş beyaz kumlu plajları ve kristal berraklığındaki denizi ile doğa cenneti. Pink Beach'in pembe kumu, Gili Adaları'nın turkuaz suları ve kuzeydeki şelaleler; macera ve manzara severler için güçlü bir kombinasyon sunar.",
      culture:
        "Sasak halkının yaşadığı Lombok, geleneksel dokuma sanatı, özgün mimarisi ve otantik köyleri ile kültürel bir zenginlik sunar. Bali'ye göre daha sakin ve az turistik olan ada, yerel yaşamı daha çıplak ve doğal hâliyle gözlemleme fırsatı verir.",
      lifestyle:
        "Lombok, bir yanda sörf tutkunları için dünya çapında tanınan güney plajlarına, diğer yanda doğa severler için kuzeydeki trekking ve şelale rotalarına sahiptir. Gili adalarında gün boyu denizle iç içe olup akşamları sakin bir sahil kasabasında dinlenebileceğiniz, özgünlüğünü büyük ölçüde koruyan nadir adalardan biridir.",
    },
    included: [
      "Tüm paketlerde: İstanbul çıkışlı gidiş-dönüş uçak bileti (paket açıklaması/broşür/teklif formunda belirtilen tutara kadar; aşan fark katılımcı tarafından ödenir)",
      "Tüm paketlerde: Senggigi ve/veya Kuta Lombok bölgelerinde seçili otel veya butik tesislerde 6 gece konaklama ve her gün otel kahvaltısı",
      "Tüm paketlerde: Lombok Havalimanı–otel–otel arası ana transferler ve 7/24 ulaşılabilir Türkçe destek",
      "Standart ve Premium paketlerde: bir tam gün Gili Adaları tekne turu (programda belirtilen içerik dahilinde)",
      "Standart ve Premium paketlerde: güney plajları & sörf deneyimi içeren bir rehberli gün",
      "Yalnızca Premium pakette: Senaru şelaleleri ve Rinjani manzaralarını içeren tam gün doğa turu ve programda belirtilen öğle yemeği",
    ],
    notIncluded: [
      "Temel paket için: Gili Adaları tekne turu, Senaru şelale günü ve güney plajları & sörf turları bu fiyata dahil değildir; talebe göre opsiyonel ekstra olarak planlanır",
      "Standart paket için: Senaru şelaleleri & Rinjani manzara turu ve Pink Beach tekne turu gibi ek deneyimler bu fiyata dahil değildir",
      "Tüm paketlerde: akşam yemekleri ve serbest günlerde otel kapsamı dışındaki tüm yiyecek-içecek harcamaları",
      "Tüm paketlerde: kişisel harcamalar, spa, masaj ve bireysel tercihlere bağlı ekstra hizmetler",
      "Tüm paketlerde: dalış, ileri seviye sörf ve Pink Beach tekne turu gibi opsiyonel ekstra aktiviteler (katıldığınız kadar ayrıca ücretlendirilir)",
      "Endonezya/Lombok bölgesine yönelik turist vergileri ve resmi giriş harçları (varsa) bu tur paketine dahil değildir; güncel uygulama ve ödeme yöntemleri size yazılı olarak iletilir",
      "Türkiye'den çıkışta ödenen yurtdışı çıkış harcı katılımcı tarafından ödenir ve bu paket kapsamına dahil değildir.",
    ],
    notes: {
      approach:
        "Bu rota, Premium paket referans alınarak tasarlanmış deneyim odaklı bir Lombok tatilidir. Uçak bileti; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder. Konaklama ve sabah kahvaltısı sabittir. Standart ve Premium paketlerde Gili tekne turu ve güney plajları & sörf günü dahildir; Premium pakette ek olarak Senaru şelaleleri & Rinjani manzara turu da baştan ücrete dahildir. Diğer öğünler ve opsiyonel aktiviteler konusunda misafirler kendi bütçe ve ilgi alanlarına göre seçim yapabilir.",
      freeTime:
        "Serbest zaman blokları, Lombok'ta kendi ritminizi yakalayabilmeniz için bilerek korundu. Özellikle Kuta Lombok ve Senggigi çevresindeki akşamlar için sabit bir restoran zorunluluğu yoktur; dilerseniz sahil boyunca yerel warung'ları, dilerseniz daha şık restoran ve kafeleri tercih edebilirsiniz. Otel dışındaki yiyecek-içecek harcamaları tura dahil değildir; talep edilirse ekibimiz bölgeye uygun mekan ve aktivite önerileriyle destek olur.",
      discipline:
        "Programın sağlıklı ve keyifli ilerlemesi için grup düzenine saygı, zamanlamaya uyum ve karşılıklı nezaket esastır. Tekne turları, şelale yürüyüşleri ve sörf dersleri gibi aktivitelerde güvenlik talimatlarına uyulması özellikle önemlidir. Grup içi uyumu bozacak davranışlardan kaçınılması, herkesin huzurlu ve unutulmaz bir tatil yaşaması için kritik öneme sahiptir.",
    },
    routes: [
      { name: "Gili Trawangan", description: "Canlı ada hayatı, şnorkel ve gün batımı noktaları" },
      { name: "Gili Air", description: "Yerel yaşam ile sakin plaj atmosferinin dengesi" },
      { name: "Kuta Lombok", description: "Güney plajları, sörf spotları ve bohem atmosfer" },
      { name: "Senaru & Şelaleler", description: "Sendang Gile ve Tiu Kelep şelaleleri, Rinjani manzaraları" },
      { name: "Pink Beach", description: "Güneydoğuda pembe kum ve turkuaz koylar" },
      { name: "Senggigi", description: "Batı kıyısında gün batımı sahilleri ve kafeler" },
    ],
    gallery: [
      "/gili-islands-turquoise-water-beach.jpg",
      "/lombok-rinjani-volcano-mountain.jpg",
      "/lombok-beach-surfing-waves.jpg",
      "/placeholder.svg?height=600&width=900",
      "/placeholder.svg?height=600&width=900",
      "/placeholder.svg?height=600&width=900",
    ],
  },
  sumatra: {
    name: "Sumatra Adası",
    hero: "/sumatra-rainforest-orangutan-lake-toba.jpg",
    summary:
      "Vahşi ve el değmemiş Kuzey Sumatra; orangutanların doğal yaşam alanı olan yağmur ormanları (Bukit Lawang) ve dünyanın en büyük volkanik gölü Lake Toba (Samosir Adası) ile gerçek bir macera vadediyor. Uzun karayolu günlerinden sonra dinlenme ve serbest zaman blokları özellikle korunarak, tempo daha sürdürülebilir şekilde planlanmıştır.",
    suitableFor: ["Doğa & Macera", "Kültürel Keşif", "Yaban Hayatı", "Fotoğrafçılık"],
    duration: "8 Gece 9 Gün",
    concept: "Doğa & Macera",
    price: "3.499",
    packages: [
      {
        id: "sumatra-basic",
        level: "temel",
        name: "Sumatra Keşif Temel",
        badge: "Bütçe dostu",
        headline:
          "Uçuş + konaklamayı sabitleyip; trekking, kültür günü ve bazı deneyimleri bütçe/ilgi alanına göre sonradan eklemek isteyenler için giriş seviyesi paket.",
        priceMultiplier: 0.7,
        highlights: [
          "İstanbul çıkışlı gidiş-dönüş uçak bileti (paket açıklaması/broşür/teklif formunda belirtilen tutara kadar; aşan fark katılımcı tarafından ödenir)",
          "Medan (1 gece) + Bukit Lawang (3 gece) + Samosir/Lake Toba (4 gece) toplam 8 gece konaklama",
          "Havalimanı ve ana rota transferleri + feribot geçişi ve 7/24 ulaşılabilir Türkçe destek",
          "Varış günü kısa gün batımı tekne turu (Samosir) dahildir (hava/feribot koşullarına göre 6. güne kaydırılabilir)",
          "Orangutan trekking & tubing ve Batak kültür günü bu pakete dahil değildir; istenirse opsiyonel ekstra olarak planlanır",
        ],
        notes:
          "Temel paket, Sumatra rotasının lojistiğini (uçuş + konaklama + ana transfer akışı) güvence altına alır. Trekking, kültür günü ve opsiyonel turlar ise bütçenize göre sonradan eklenebilir.",
      },
      {
        id: "sumatra-plus",
        level: "plus",
        name: "Sumatra Deneyim Standart",
        badge: "Dengeli seçenek",
        headline:
          "Orangutan trekking & tubing gününü pakete dahil edip, diğer günlerde daha esnek ilerlemek isteyenler için dengeli deneyim seviyesi.",
        priceMultiplier: 0.85,
        highlights: [
          "Uçak bileti, 8 gece konaklama ve kahvaltıya ek olarak 3. gün orangutan trekking & tubing deneyimi (rehberli) dahildir",
          "Havalimanı ve ana rota transferleri + feribot geçişi ve 7/24 ulaşılabilir Türkçe destek",
          "Varış günü kısa gün batımı tekne turu (Samosir) dahildir (hava/feribot koşullarına göre 6. güne kaydırılabilir)",
          "Tele Observation Tower / panorama turu gibi ek turlar bu pakete dahil değildir; serbest günlerde opsiyonel olarak eklenebilir",
          "Batak kültür & ada turu bu pakete dahil değildir; istenirse opsiyonel ekstra olarak planlanır",
        ],
        notes:
          "Standart paket, Sumatra deneyiminin en güçlü günü olan orangutan trekking & nehir gününü baştan dahil eder. Lake Toba/Samosir tarafında ise serbest zamanlar korunur; ek panorama turları isteğe göre planlanır.",
      },
      {
        id: "sumatra-premium",
        level: "premium",
        name: "Sumatra Deneyim Premium",
        badge: "En kapsamlı",
        headline:
          "Trekking + kültür günü dahil; sürpriz maliyetleri en aza indiren, dolu dolu Sumatra deneyimi.",
        priceMultiplier: 1,
        highlights: [
          "İstanbul çıkışlı gidiş-dönüş uçak bileti (paket açıklaması/broşür/teklif formunda belirtilen tutara kadar; aşan fark katılımcı tarafından ödenir)",
          "Medan, Bukit Lawang ve Samosir/Lake Toba bölgelerinde 8 gece konaklama (program akışına göre)",
          "Havalimanı ve ana rota transferleri + feribot geçişi ve 7/24 ulaşılabilir Türkçe destek",
          "3. gün orangutan trekking & tubing deneyimi (rehberli) dahildir",
          "Batak kültür & ada turu (Samosir çevresi) dahildir (saha koşullarına göre akış esnetilebilir)",
        ],
        notes:
          "Premium paket, trekking ve kültürel keşif bloklarını baştan dahil ederek planlama yükünü azaltır. Opsiyonel ekstra deneyimler (özel turlar/ek aktiviteler) ise serbest günlerde isteğe göre ayrıca eklenebilir.",
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Medan'a Varış & Şehir Tanışması",
        activities: [
          "Tur programımız burada başlıyor.",
          "Uçuş planınıza göre Medan'a varış; havalimanında karşılama ve gün akışı için kısa bilgilendirme.",
          "Otele transfer (~45–60 dk) ve check-in; yol yorgunluğunu atmak için dinlenme.",
          "Zaman ve enerji uygunsa kısa şehir tanışması: Maimun Sarayı ve Büyük Cami çevresi (hafif tempo, fotoğraf molaları).",
          "Akşam: serbest zaman (yerel restoran önerileriyle kendi ritminizde yemek).",
        ],
        accommodation: "JW Marriott Medan (5⭐)",
      },
      {
        day: 2,
        title: "Medan → Bukit Lawang (Gunung Leuser Kapısı) | Yarı Serbest",
        activities: [
          "08:30 – Medan'da otelden check-out ve yola çıkış (saatler trafiğe göre esnetilebilir).",
          "Karayolu transferi ~3,5–4,5 saat: palmiyelikler, köy yolları ve doğal manzaralar eşliğinde rota.",
          "13:00 civarı Bukit Lawang'a varış, otele giriş ve dinlenme (odaların hazır olma durumuna göre bekleme olabilir).",
          "Bohorok Nehri boyunca hafif tempo yürüyüş: köy merkezi, nehir kıyısı ve fotoğraf noktaları.",
          "Trekking brifingi: milli park kuralları, güvenlik, ekipman önerileri (kapalı ayakkabı, yağmurluk, sülük çorabı vb.).",
          "Akşam: serbest zaman (hafif yemek + ertesi gün için erken dinlenme önerilir).",
        ],
        accommodation: "Ecolodge Bukit Lawang (Boutique)",
      },
      {
        day: 3,
        title: "Bukit Lawang | Orangutan Trekking & Nehir Deneyimi (Aktivite Günü)",
        activities: [
          "08:00 – Rehberle buluşma ve Gunung Leuser çevresinde orangutan gözlem trekkingi (yaklaşık 3–5 saat; kondisyon: orta).",
          "Trekking boyunca vahşi yaşam gözlemi: gibbons, Thomas leaf monkey ve tropik kuş türleri; hayvanlara yaklaşmadan güvenli mesafe kuralı.",
          "Öğleden sonra Bohorok Nehri'nde tubing: akıntıya göre güvenli parkur, can yeleği/rehber önerilerine uyum.",
          "Dileyenler için opsiyonel kısa keşif: Bat Cave (Yarasa Mağarası) – el feneri ve yerel rehber önerilir.",
          "Akşam: nehir kenarında dinlenme ve serbest zaman (jungle sesleri eşliğinde).",
        ],
        accommodation: "Ecolodge Bukit Lawang (Boutique)",
      },
      {
        day: 4,
        title: "Bukit Lawang | Serbest Gün (Dinlenme + Opsiyonel Ekstra Deneyimler)",
        activities: [
          "Serbest gün: uyku telafisi, nehir kenarı dinlenme, kafe molaları ve kısa yürüyüşlerle günü kendi ritminizde değerlendirme.",
          "Köy merkezi keşfi: yerel dükkanlar, nehir kıyısı yürüyüş yolları ve fotoğraf noktaları.",
          "Opsiyonel (ücretli) fikirler: kısa şelale yürüyüşü / rafting / ekstra tubing rotası (mevsim ve su seviyesine göre).",
          "Dilerseniz ekibimiz, ilgi alanınıza göre ücretli opsiyonel turların saatlerini ve lojistiğini planlamanıza yardımcı olur.",
        ],
        optionalExtras: [
          {
            id: "sumatra-bukitlawang-tangkahan-elephants",
            title: "4. Gün | Tangkahan Fil Kampı & Nehir Keyfi (Opsiyonel)",
            shortDescription:
              "Bukit Lawang'dan günübirlik çıkışla Tangkahan bölgesine geçip, fil kampı çevresinde doğa deneyimi ve nehir manzaraları (opsiyonel ve ücretli).",
            priceNote:
              "Tura dahil değildir; fiyat kişi sayısı, araç tipi ve sezon koşullarına göre değişir. Kesin ücret rezervasyon aşamasında netleştirilir.",
            details: [
              "📍 Lokasyon: Tangkahan (Kuzey Sumatra)",
              "⏱ Süre: Tam gün (transferler dahil; sabah erken çıkış önerilir)",
              "İçerik: doğa yürüyüşü / nehir çevresi keşfi / koruma projeleri hakkında kısa bilgilendirme",
              "Not: Program, sahadaki koşullara ve bölgedeki güncel uygulamalara göre değişebilir",
            ],
            note:
              "Bu tur, daha sakin ve farklı bir doğa atmosferi isteyen misafirler için iyi bir alternatiftir; yorucu bir trekking yerine daha dengeli bir gün planı sunar.",
          },
        ],
        accommodation: "Ecolodge Bukit Lawang (Boutique)",
      },
      {
        day: 5,
        title: "Bukit Lawang → Lake Toba (Samosir Adası) | Yarı Serbest",
        activities: [
          "08:00 – Bukit Lawang'da otelden check-out ve Lake Toba yönüne yola çıkış.",
          "Karayolu transferi ~5–6,5 saat (trafik/yağışa göre); yol üstü kısa mola ve manzara durakları.",
          "Parapat'tan Samosir (Tuk-Tuk) feribotu ~45–60 dk; göl manzaralı geçiş.",
          "16:30–18:00 – Samosir varış, otele giriş ve dinlenme.",
          "Akşam: göl kıyısında yürüyüş + gün batımı; serbest akşam yemeği.",
          "Varış günü kısa gün batımı tekne turu (60–90 dk) tur paketine dahildir; hava/feribot gecikmesi olursa 6. güne kaydırılabilir.",
        ],
        accommodation: "Toledo Inn Lake Toba (4⭐)",
      },
      {
        day: 6,
        title: "Samosir | Serbest Gün (Dinlenme + Göl Keyfi)",
        activities: [
          "Serbest gün: göl kenarında dinlenme, kafe molaları ve sakin yürüyüşlerle Samosir atmosferine yayılma.",
          "Güvenli alanlarda yüzme veya iskele çevresinde serbest vakit (mevsim/yerel tavsiyeye göre).",
          "Kısa bisiklet turu (Tuk-Tuk çevresi) veya kano gibi hafif aktivitelerle günü esnek değerlendirme.",
          "Dileyenler için ücretli opsiyonel turlar aşağıdaki kartlarda listelenmiştir.",
        ],
        optionalExtras: [
          {
            id: "sumatra-samosir-tele-aek-pano",
            title: "6. Gün | Tele Observation Tower + Aek Tano Ponggol Panorama Turu (Opsiyonel)",
            shortDescription:
              "Lake Toba'nın 360° manzarasını izleyebileceğiniz Tele seyir noktası ve Aek Tano Ponggol fotoğraf durağını içeren günübirlik rota (opsiyonel ve ücretli).",
            priceNote:
              "Tura dahil değildir; araç tipi ve kişi sayısına göre fiyat değişir. Kesin ücret rezervasyon aşamasında paylaşılır.",
            details: [
              "⏱ Süre: Yaklaşık 5–7 saat (durak sürelerine göre)",
              "📸 İçerik: Tele panoramik manzara + Aek Tano Ponggol köprüsü fotoğraf molası",
              "Uygunluk: Hafif tempo – manzara odaklı bir gün",
              "Not: Hava koşulları manzarayı etkileyebilir; esnek plan önerilir",
            ],
          },
        ],
        accommodation: "Toledo Inn Lake Toba (4⭐)",
      },
      {
        day: 7,
        title: "Samosir: Batak Kültürü & Göl Aktiviteleri (Aktivite Günü)",
        activities: [
          "08:30 – Tuk-Tuk bölgesinde kısa tanışma yürüyüşü: göl kıyısı, iskeleler ve günlük yaşamın ritmi.",
          "09:30 – Cultural Village Visit: geleneksel Batak ev mimarisi, kültürün temel ritüelleri ve yaşam biçimi hakkında rehber anlatımı.",
          "11:00 – Batak kral mezarları ve taş anıtlar: tarihî duraklarda fotoğraf + hikâye anlatımı (kısa ve akıcı rota).",
          "12:30 – Göl manzaralı öğle molası: menüden bireysel seçim (yemek dahil olup olmadığı paket seçimine göre netleşir).",
          "14:00 – Samosir bisiklet turu (2–3 saat): manzara noktalarında duraklayarak, grup temposuna uygun rahat rota.",
          "16:30 – Serbest zaman: güvenli alanlarda yüzme veya kano; isteyenler için kafe molaları.",
          "20:15 civarı – Müsait günlerde geleneksel Batak dans gösterisi: müzik/dans kültürünü yerinde izleme (program gününe göre).",
        ],
        accommodation: "Toledo Inn Lake Toba (4⭐)",
      },
      {
        day: 8,
        title: "Samosir → Medan | Dinlenme ve Serbest Akşam (Yol Sonrası Rahat Gün)",
        activities: [
          "09:30 – Samosir'de otelden check-out; feribot + karayolu ile Medan'a dönüşe başlama.",
          "Yolculuk toplam ~4–5,5 saat (trafik/feribot saatlerine göre); kısa mola planlanır.",
          "15:00–16:30 – Medan'a varış, otele giriş ve dinlenme.",
          "Akşam: serbest zaman (son alışveriş / yemek önerileri; ertesi gün uçuşuna uygun erken dinlenme önerilir).",
        ],
        accommodation: "JW Marriott Medan (5⭐)",
      },
      {
        day: 9,
        title: "Veda Sumatra",
        activities: [
          "Uçuş saatine göre kahvaltı ve otelden check-out (genelde uçuş saatinden 3–4 saat önce otelden çıkış planlanır).",
          "Medan Havalimanı'na (KNO) transfer ~45–90 dk; check-in ve pasaport işlemleri için zaman bırakılır.",
          "İstanbul'a dönüş uçuşu.",
          "Tur programımız burada son buluyor.",
        ],
        accommodation: "-",
      },
    ],
    activities: [
      {
        category: "Yaban Hayatı",
        items: [
          "Rehberli orangutan gözlem trekkingi (Gunung Leuser çevresi)",
          "Gibbons ve Thomas leaf monkey gözlemi",
          "Kuş gözlemi ve doğa fotoğrafçılığı",
        ],
      },
      {
        category: "Doğa Deneyimleri",
        items: [
          "Yağmur ormanı yürüyüşleri (1 günlük rota)",
          "Bohorok Nehri tubing",
          "Lake Toba'da yüzme (güvenli alanlarda) ve kano",
          "Tele panoramik seyir noktaları",
        ],
      },
      {
        category: "Kültürel Keşif",
        items: [
          "Batak kültür köyleri ve geleneksel evler",
          "Geleneksel Batak dans gösterisi (müsait günlere göre)",
          "El sanatları ve yerel pazarlar",
          "Sumatra mutfağı deneyimi (yerel restoran önerileri)",
        ],
      },
    ],
    about: {
      nature:
        "Sumatra, Dünya'nın en zengin biyoçeşitliliğine sahip adalarından biri. Gunung Leuser Milli Parkı'nın yağmur ormanları, nesli tükenmekte olan orangutanlara, kaplanları ve fillere ev sahipliği yapıyor. Toba Gölü, dünyanın en büyük volkanik gölü olarak muhteşem manzaralar sunuyor.",
      culture:
        "Batak halkının benzersiz mimarisi, müziği ve gelenek görenekleri Sumatra'yı kültürel açıdan zengin kılıyor. Geleneksel evler, törenler ve gastronomi meraklılarının ilgisini çeken lezzetler adanın öne çıkan özellikleri.",
      lifestyle:
        "Sumatra, turistik olmayan, otantik yaşamı deneyimlemek isteyenler için ideal. Jungle trekking'den göl kenarında dinlenmeyeçin, yaban hayatı gözleminden yerel kültürü keşfetmeye kadar geniş bir yelpazede deneyimler sunuyor.",
    },
    routes: [
      { name: "Bukit Lawang", description: "Orangutan trekkingi, Bat Cave ve Bohorok Nehri tubing" },
      { name: "Gunung Leuser NP", description: "UNESCO Dünya Mirası yağmur ormanı ekosistemi" },
      { name: "Lake Toba", description: "UNESCO Global Geopark – volkanik göl manzaraları" },
      { name: "Samosir (Tuk-Tuk)", description: "Bisiklet turu, Batak köyleri ve göl aktiviteleri" },
      { name: "Tele Observation Tower", description: "360° panoramik seyir noktası" },
      { name: "Aek Tano Ponggol", description: "Köprü ve fotoğraf noktaları" },
    ],
    gallery: [
      "/sumatra-rainforest-orangutan-lake-toba.jpg",
      "/ernests-vaga-mzJFI9o5_zc-unsplash.jpg",
      "/placeholder.jpg",
      "/placeholder.jpg",
      "/placeholder.jpg",
      "/placeholder.jpg",
    ],
  },
  java: {
    name: "Java Adası",
    hero: "/java-borobudur-temple-volcano-sunrise.jpg",
    summary:
      "Java'yı klasik bir 'tek şehir turu' gibi değil; Jakarta'dan başlayıp Bandung'un yaylalarına, Pangandaran'ın nehir & kanyonlarına ve Yogyakarta'nın kültür rotalarına uzanan, az konaklama noktasıyla çok farklı atmosfer sunan konforlu bir road trip olarak yaşayın.",
    suitableFor: ["Road Trip", "Kültürel Keşif", "Doğa & Macera", "Fotoğrafçılık", "Şehir Turu"],
    duration: "10 Gece 11 Gün",
    concept: "Road Trip & Şehirler",
    price: "3.199",
    notes: {
      freeTime:
        "Serbest günler; şehri kendi ritminizde keşfetmeniz, alışveriş ve kafe/restoran planınızı özgürce yapabilmeniz için bilerek esnek bırakılır. Dilerseniz bu zamanlara opsiyonel duraklar ve deneyimler eklenebilir.",
      discipline:
        "Programın sağlıklı ilerlemesi için zamanlamaya uyum ve grup düzenine saygı esastır. Güvenlik brifingleri ve rehber yönlendirmelerine uyulması beklenir. Önemli bilgilendirme notu (mutlaka okuyun): Seçmiş olduğunuz bu Java turu, kısa rota geçişleri dışında kalan uzun bir kara yolu yolculuğu da kapsamındadır. Bu nedenle küçük çocuklu ailelerin, 50 yaş üzeri misafirlerin, kara yolu yolculuğunu sevmeyen kişilerin ve tatil beklentisi ağırlıklı olarak su sporları/adrenalin/gece kulüpleri olan kişilerin katılması tavsiye edilmez. Bu tur; uzun yolculukları seven, doğa turizmini, tarihi ve kültürel gezileri önemseyen ve yeni kültürler öğrenmeye açık misafirler için tasarlanmıştır.",
    },
    packages: [
      {
        id: "temel",
        level: "temel",
        name: "Temel Paket",
        badge: "Bu turda sunulmaz",
        headline: "Bu Java turu yalnızca Premium paket olarak planlanmıştır.",
        priceMultiplier: 0,
        highlights: [],
        notes: "Bu paket satışta değildir; fiyatlandırma 0 olarak gösterilir.",
      },
      {
        id: "plus",
        level: "plus",
        name: "Standart Paket",
        badge: "Bu turda sunulmaz",
        headline: "Bu Java turu yalnızca Premium paket olarak planlanmıştır.",
        priceMultiplier: 0,
        highlights: [],
        notes: "Bu paket satışta değildir; fiyatlandırma 0 olarak gösterilir.",
      },
      {
        id: "premium",
        level: "premium",
        name: "Premium Paket",
        badge: "Aktif paket",
        headline: "Bu Java turunun planlanan tek paketidir.",
        priceMultiplier: 1,
        highlights: [
          "Bu sayfadaki gün gün program Premium paket içindir.",
          "Rota, konaklama standardı ve operasyon planı Premium seviyeye göre kurgulanır.",
        ],
        notes:
          "Net hizmet kapsamı ve operasyon detayları; tarih, kişi sayısı ve tercihlere göre rezervasyon öncesinde yazılı olarak paylaşılır.",
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Jakarta Varış, Dinlenme ve Serbest Zaman",
        activities: [
          "İstanbul'dan Jakarta'ya varış (uçuş detayları rezervasyon sonrası yazılı olarak paylaşılır)",
          "Havalimanında karşılama, kısa bilgilendirme ve otele transfer",
          "Otele giriş (check-in) ve yolculuk sonrası dinlenme",
          "Dileyenler için kısa şehir tanışması (zaman ve enerjiye göre): Monas çevresi veya Kota Tua bölgesi",
          "Akşam: serbest zaman (dinlenme / kısa yürüyüş / opsiyonel akşam yemeği önerileri)",
        ],
        accommodation: "The Hermitage Jakarta (5⭐)",
      },
      {
        day: 2,
        title: "Serbest Gün – Jakarta → Bandung (Tren) Geçişi ve Serbest Akşam",
        activities: [
          "Kahvaltı sonrası saat 10:25 Whoosh hızlı treni ile Bandung şehrine hareket",
          "11:15 Bandung şehrine varış",
          "11:35 otele geçiş, check-in işlemleri ve kısa dinlenme",
          "Öğle yemeği (grup planına göre)",
          "Ardından kısa Bandung şehir turu (dileyen misafirler günü tamamen serbest geçirebilir)",
          "Akşama doğru otele dönüş ve serbest zaman",
        ],
        accommodation: "Bandung şehir merkezinde seçili otel (4⭐/5⭐)",
      },
      {
        day: 3,
        title: "Ciwidey Yaylaları – Çay Bahçeleri, Situ Patengan ve Rengganis Asma Köprü (Rehberli Gün)",
        activities: [
          "Sabah kahvaltısından sonra otelden çıkıyoruz ve 1,5-2 saatlik araç yolculuğunun ardından Ciwidey bölgesine ulaşıyoruz",
          "Situ Patenggang (Situ Patengan) çevresinde çay bahçeleri, göl ve yayla gezisi: piknik alanları, manzara ve fotoğraf molaları",
          "Yerel pazar ziyareti ve alışveriş için serbest zaman",
          "Rengganis bölgesine 10-15 dakikalık araç yolculuğu",
          "Rengganis bölgesinde 1500 metre uzunluğundaki sallanan asma köprüden geçerken manzara ve fotoğraf molası",
          "Günün sonunda ormanın içinde doğa harikası olan açık termal kaplıcayı keşfedebilir ve sıcak suyu deneyimleyebilirsiniz",
          "Akşam Bandung'a dönüş ve serbest zaman",
        ],
        accommodation: "Bandung şehir merkezinde seçili otel (4⭐/5⭐)",
      },
      {
        day: 4,
        title: "Serbest Gün – Bandung Şehir ve Kişisel Tercihler",
        activities: [
          "Otelde kahvaltı sonrası tamamen sizin belirlediğiniz serbest gün",
          "Kafeler, alışveriş merkezleri ve şehir içi keşif: lokal yaşamı yakından takip edebilir, alışveriş yapabilir, bir şeyler içerek günü değerlendirebilirsiniz",
          "Şehir içi gezileriniz için Gojek, GoCar veya Grab mobil uygulamaları ile taksi ya da motosiklet ulaşımını kolayca sağlayabilirsiniz",
          "Serbest günlerde şehir gezileri, alışveriş, kafe ve restoranlar konusunda rehberlik talep etmeniz halinde ücret karşılığında size eşlik etmesi için rehber tedarik edilir",
          "Dileyenler için: kısa müze/seyir noktası veya yerel pazar ziyareti (opsiyonel)",
          "Akşam: serbest zaman",
        ],
        accommodation: "Bandung şehir merkezinde seçili otel (4⭐/5⭐)",
      },
      {
        day: 5,
        title: "Bandung → Pangandaran (Kara Yolu) ve Sahil Akşamı",
        activities: [
          "Kahvaltıdan sonra otelden check-out işlemleri ve Bandung şehrinden ayrılış",
          "Bandung'dan Pangandaran'a kara yolu ile geçiş (yaklaşık 5–6 saat; mola planlanır)",
          "Pangandaran'a varışta otel check-in işlemleri, otele yerleşme ve akşam saatine kadar dinlenme süresi",
          "Akşama doğru sahile inip dinlenme alanlarında coconut suyu eşliğinde gün batımı keyfi",
          "Akşam: serbest zaman",
        ],
        accommodation: "Pangandaran sahil bölgesinde seçili otel veya resort",
      },
      {
        day: 6,
        title: "Pangandaran – Body Rafting & Doğa Günü (Rehberli Gün)",
        activities: [
          "Kahvaltı sonrası otelden ayrılıyoruz ve 45 dakikalık kara yolculuğunun ardından Citumang body rafting alanına ulaşıyoruz",
          "Body rafting alanında kısa bir bilgilendirmenin ardından can yeleklerini giyiyoruz",
          "Kısa bir yürüyüşün ardından başlangıç noktasına ulaşıyoruz",
          "Rehber eşliğinde Citumang Nehri'nin sakin akıntılarına kendimizi bırakıyoruz",
          "Yaklaşık 2 km boyunca ilerlerken bazı noktalardaki küçük atlama noktalarından atlamak etkinliğin en keyifli anlarındandır",
          "Etkinliğin sonunda ayrılmadan önce öğle yemeği ve Pangandaran sahiline dönüp dinlenme molası",
          "Akşam: serbest zaman",
        ],
        accommodation: "Pangandaran sahil bölgesinde seçili otel veya resort",
      },
      {
        day: 7,
        title: "Pangandaran Serbest Gün – Sahil & Kişisel Tercihler",
        activities: [
          "Kahvaltı sonrası sahilde serbest zaman",
          "Dileyenler için opsiyonel: Green Canyon tekne/nehir rotası veya Citumang gibi alternatif doğa aktiviteleri",
          "Kafe, deniz, dinlenme ve fotoğraf için serbest akış",
          "Akşam: serbest zaman",
        ],
        accommodation: "Pangandaran sahil bölgesinde seçili otel veya resort",
      },
      {
        day: 8,
        title: "Serbest Gün – Pangandaran → Yogyakarta (Kara Yolu) ve Akşam Serbest",
        activities: [
          "Kahvaltı ve otelden çıkış",
          "Pangandaran'dan Yogyakarta'ya kara yolu ile geçiş (yaklaşık 5–6 saat; mola planlanır)",
          "Varışta check-in ve kısa dinlenme",
          "Akşam: Malioboro çevresinde serbest yürüyüş / alışveriş (enerjiye göre)",
        ],
        accommodation: "Yogyakarta şehir merkezinde seçili otel (4⭐/5⭐)",
      },
      {
        day: 9,
        title: "Merapi Yanardağı Off-Road (Jeep) Turu (Rehberli Gün)",
        activities: [
          "Kahvaltı sonrası Merapi bölgesine doğru hareket (süre operasyon planına göre)",
          "Jeep ile Merapi çevresinde off-road rota: lav alanları ve manzara durakları",
          "Program akışına göre kısa müze/seyir noktası durakları (müsaitlik ve hava durumuna bağlı)",
          "Öğle yemeği molası (operasyon planına göre)",
          "Öğleden sonra Obelix Sea View'a geçiş: eğlence alanları, fotoğraf noktaları ve Yogyakarta manzarası",
          "Gün batımı saatine doğru Obelix Sea View seyir terasında gün batımı keyfi (hava durumuna göre)",
          "Akşam otele dönüş ve dinlenme",
          "Akşam: serbest zaman",
        ],
        accommodation: "Yogyakarta şehir merkezinde seçili otel (4⭐/5⭐)",
      },
      {
        day: 10,
        title: "Prambanan & Plaosan Jeep Turu (Rehberli Gün)",
        activities: [
          "Prambanan Tapınak Kompleksi ziyareti: UNESCO mirası olan bu etkileyici Hindu tapınaklar grubunda rehber eşliğinde ana tapınakları (Şiva, Brahma ve Vişnu) geziyor; avlular, kabartmalar ve hikâye anlatan taş işlemelerini inceleyerek fotoğraf ve serbest keşif için zaman ayırıyoruz",
          "Prambanan ziyaretinin ardından Plaosan bölgesinde jeep turu: kırsal rota, manzara durakları ve fotoğraf molaları",
          "Öğle yemeği ve program akışına göre kısa dinlenme/mola",
          "Akşam: serbest zaman",
        ],
        accommodation: "Yogyakarta şehir merkezinde seçili otel (4⭐/5⭐)",
      },
      {
        day: 11,
        title: "Borobudur Ziyareti ve Dönüş",
        activities: [
          "Kahvaltı ve check-out (uçuş saatine göre)",
          "Borobudur ziyareti (saat ve giriş kuralları operasyon planına göre netleşir)",
          "Havalimanına transfer",
          "İstanbul'a dönüş (uçuş detayları rezervasyon sonrası yazılı olarak paylaşılır)",
          "Bu aşamada vedalaşıyoruz ve uzun Java yolculuğumuz tamamlanıyor",
        ],
        accommodation: "-",
      },
    ],
    activities: [
      {
        category: "Kültürel Deneyimler",
        items: [
          "Kraton Sarayı ve geleneksel Java yaşamı",
          "Batik tanıtımı ve atölye deneyimi",
          "Yerel pazarlar ve sokak lezzetleri",
          "Geleneksel dans/müzik gösterisi (opsiyonel)",
        ],
      },
      {
        category: "Tarih & Mimari",
        items: [
          "Borobudur Tapınağı",
          "Prambanan Tapınak Kompleksi",
          "Mendut Tapınağı",
          "Kota Tua kolonyal mimari yürüyüşü",
        ],
      },
      {
        category: "Doğa & Manzara",
        items: [
          "Bromo Yanardağı gün doğumu manzara noktası",
          "Kaldera içinde kısa yürüyüş ve fotoğraf molaları",
          "Savana ve kum denizi bölgesi",
          "Mevsime göre çay/yeşil rota durakları (opsiyonel)",
        ],
      },
    ],
    about: {
      nature:
        "Java, aktif yanardağları, yemyeşil pirinç tarlaları ve çay plantasyonları ile büyüleyici doğal manzaralar sunuyor. Bromo ve Ijen yanardağları, dünyanın en etkileyici doğal oluşumları arasında yer alıyor.",
      culture:
        "Endonezya'nın kültürel merkezi olan Java, Hindu, Budist ve İslam medeniyetlerinin izlerini taşıyor. Borobudur ve Prambanan gibi UNESCO Dünya Mirası tapınakları, adanın zengin tarihine tanıklık ediyor. Batik sanatı, wayang gösterileri ve gamelan müziği Java kültürünün vazgeçilmezleri.",
      lifestyle:
        "Java, geleneksel köy yaşamından modern Jakarta'nın kozmopolit atmosferine kadar geniş bir yelpaze sunuyor. Yogyakarta'nın sanatsal ruhu, yerel pazarların canlılığı ve misafirperver halk, adayı özel kılıyor.",
    },
    routes: [
      { name: "Jakarta", description: "Varış, dinlenme ve kısa şehir atmosferi" },
      { name: "Bandung", description: "Kafe şehir kültürü ve yayla rotaları" },
      { name: "Ciwidey", description: "Çay bahçeleri, göl/yayla ve kaplıca" },
      { name: "Pangandaran", description: "Sahil + nehir/kanyon doğa deneyimleri" },
      { name: "Yogyakarta", description: "Şehir kültürü ve UNESCO tapınak rotaları" },
      { name: "Prambanan", description: "UNESCO Hindu tapınak kompleksi" },
      { name: "Borobudur", description: "UNESCO Budist tapınağı" },
    ],
    gallery: [
      "/java-borobudur-temple-volcano-sunrise.jpg",
      "/ernests-vaga-mzJFI9o5_zc-unsplash.jpg",
      "/placeholder.jpg",
      "/placeholder.jpg",
      "/placeholder.jpg",
      "/placeholder.jpg",
    ],
  },
  komodo: {
    name: "Komodo Adası",
    hero:
      "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=1200",
    summary:
      "Labuan Bajo çıkışlı tekne rotalarıyla UNESCO Dünya Mirası Komodo Ulusal Parkı'nı keşfedeceğiniz; Komodo ejderleri, Rinca trekkingi, Padar panoraması, Pink Beach ve Manta Point şnorkeli gibi öne çıkan durakları bir araya getiren macera odaklı rota.",
    suitableFor: [
      "Doğa & Macera",
      "Deniz & Şnorkel",
      "Fotoğrafçılık",
      "Kültürel Keşif",
      "Aileler (yavaş tempolu opsiyonlarla)",
    ],
    duration: "6 Gece 7 Gün",
    concept: "Doğa • Deniz • Macera • Kültür",
    price: "3.899",
    packages: [
      {
        id: "komodo-basic",
        level: "temel",
        name: "Komodo Macera Temel",
        badge: "Esnek & ekonomik",
        headline:
          "Konaklama ve temel koordinasyonu sabitleyip, tekne/dalış yoğunluğunu tercihinize göre şekillendirmek isteyenlere uygun.",
        priceMultiplier: 0.7,
        highlights: [
          "6 gece Labuan Bajo 4★ konaklama (kahvaltı dahil)",
          "Havalimanı transferleri + yerel koordinasyon",
          "Seçime göre ada/tekne günleri (opsiyonel eklenebilir)",
          "7/24 destek hattı",
        ],
        notes:
          "Temel paket, konaklama ve ana koordinasyonu sabitler. Ada/tekne günleri ve milli park ücretleri tercihe göre opsiyonel olarak eklenebilir.",
      },
      {
        id: "komodo-plus",
        level: "plus",
        name: "Komodo Macera Standart",
        badge: "Dengeli seçenek",
        headline:
          "Komodo'nun en güçlü duraklarını (Rinca/Komodo, Padar, Pink Beach, Manta Point) dengeli yoğunlukla deneyimlemek isteyenlere.",
        priceMultiplier: 0.85,
        highlights: [
          "6 gece Labuan Bajo 4★ konaklama (kahvaltı dahil)",
          "Rinca & Komodo trekking rotaları",
          "Padar + Pink Beach + Manta Point şnorkel rotası",
          "Tekne turu günlerinde öğle yemeği",
        ],
        notes:
          "Standart paket, bu sayfadaki gün gün akışın ana duraklarını referans alır. Operasyonel detaylar (saat/rota gibi) rezervasyon sonrası yazılı olarak paylaşılır.",
      },
      {
        id: "komodo-premium",
        level: "premium",
        name: "Komodo Macera Premium",
        badge: "En kapsamlı",
        headline:
          "Daha yüksek konfor, daha net kapsam ve daha yoğun tekne/şnorkel programı isteyenlere.",
        priceMultiplier: 1,
        highlights: [
          "6 gece Labuan Bajo üst segment konaklama opsiyonu (müsaitliğe göre)",
          "Daha kapsamlı tekne/ada rotası planlaması",
          "Milli park giriş/liman vergileri kapsamının netleştirilmesi",
          "Öncelikli rezervasyon koordinasyonu",
        ],
        notes:
          "Premium paket, kapsamı en net hale getirecek şekilde planlanır. Dalış gibi özel talepler ve ekipman ihtiyacı seçime göre ayrıca planlanır.",
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Labuan Bajo'ya Varış",
        activities: [
          "Flores (Labuan Bajo) havalimanında karşılama ve hızlı bir hoş geldiniz karşılaması",
          "Otele transfer, check-in ve yol yorgunluğunu atmanız için kısa dinlenme",
          "Dilerseniz marinada kısa bir yürüyüş: teknelerin, sahil kasabasının ve akşam ışıklarının tadını çıkarma",
          "Turun akışı için kısa bilgilendirme: ertesi günlerin rota mantığı, tekne günlerinde dikkat edilmesi gerekenler",
          "Gün batımı için Seraya Hill veya Bukit Cinta: Labuan Bajo'yu yukarıdan izleyip fotoğraf için en güzel ışığı yakalama (uçuş saatine göre)",
        ],
        accommodation: "Labuan Bajo butik otel (4⭐)",
      },
      {
        day: 2,
        title: "Rinca Adası & Komodo Trekking",
        activities: [
          "Sabah erken tekneye geçiş ve denize açılış: günün ilk saatlerinde daha sakin koylarda ilerleme",
          "Rinca Adası milli park turu: park rehberi ile güvenli rota ve doğa anlatımı",
          "Rehber eşliğinde trekking: Komodo ejderleri ve vahşi yaşam gözlemi (güvenlik kuralları rehber tarafından aktarılır)",
          "Kalong (uçan tilki) noktası: gün batımına yakın saatte gökyüzünü kaplayan uçuşları izleme (hava/rota uygunluğuna göre)",
          "Akşam Labuan Bajo'ya dönüş ve serbest zaman",
        ],
        accommodation: "Labuan Bajo butik otel (4⭐)",
      },
      {
        day: 3,
        title: "Komodo & Pink Beach (Padar Panoraması + Şnorkel)",
        activities: [
          "Sabah hareket – Padar Adası seyir noktası: kısa bir tırmanışla efsane üç koy manzarası ve bol fotoğraf",
          "Pink Beach: pembe kumlarda serbest zaman; suya girme & şnorkel için en keyifli duraklardan biri",
          "Teknede öğle yemeği: gün boyu deniz üstünde olduğumuz için pratik ve keyifli bir mola",
          "Kanawa veya Taka Makassar: mercanlar ve renkli balıklar için şnorkel, dinlenme ve güneşi toplama (rota uygunluğuna göre)",
        ],
        accommodation: "Labuan Bajo butik otel (4⭐)",
      },
      {
        day: 4,
        title: "Manta Point & Su Altı Keşfi",
        activities: [
          "Sabah erken Manta Point: doğru şans ve doğru zamanda dev mantaları görme ihtimali",
          "Şnorkel ile su altını keşfetme; isteyenler için tüplü dalış planı (opsiyonel, tercihe göre)",
          "Siaba veya Bidadari gibi küçük adalarda rota devamı: daha sakin koylar ve berrak su (hava/deniz durumuna göre)",
          "Günün kalanında yüzme ve serbest zaman: tekne üstünde dinlenme ve manzara keyfi",
        ],
        accommodation: "Labuan Bajo butik otel (4⭐)",
      },
      {
        day: 5,
        title: "Serbest Gün",
        activities: [
          "Bugün herkes için serbest gündür; sahile inebilir, alışveriş yapabilir, kafelerde dinlenebilirsiniz.",
          "Dileyen misafirler için ekstra ücretli: yerel köy gezisi (yan taraftaki opsiyonel ekstra aktivite kartından seçilebilir)",
          "Dileyen misafirlerimiz için, rehberlerimiz tarafından alışveriş, kafe, restoran tavsiyesi verilir.",
          "Dileyen misafirlerimiz için diledikleri konuda ücret karşılığında rehber tayin edebiliriz.",
        ],
        accommodation: "Labuan Bajo butik otel (4⭐)",
        optionalExtras: [
          {
            id: "komodo-free-day-village-tour",
            title: "5. Gün | Yerel Köy Gezisi (Opsiyonel)",
            shortDescription:
              "Labuan Bajo çevresinde yerel yaşamı yakından görmek için kısa, kültür odaklı köy gezisi (opsiyonel ve ücretli).",
            estimatedPricePerPerson: 75,
            priceNote:
              "Kişi başı ortalama 60–90 USD; tura dahil değildir ve isteğe bağlı ekstra bir hizmettir.",
            details: [
              "📍 Lokasyon: Labuan Bajo çevresi (rota, hava ve ulaşılabilirliğe göre planlanır)",
              "⏱ Süre: Yaklaşık yarım gün",
              "👥 Kime uygun: Kültür ve yerel yaşam meraklıları, fotoğrafçılar",
              "Yerel köy yaşamı, günlük ritim ve bölgeye özgü anlatımlar",
              "Kısa yürüyüşler ve fotoğraf durakları",
              "Ulaşım ve organizasyon koordinasyonu (müsaitliğe göre)",
            ],
            notes:
              "Bu köy gezisi tur paketine dahil değildir ve opsiyonel bir ek hizmettir. Kesin saat/rota, grup temposu ve güncel koşullara göre planlanır.",
          },
        ],
      },
      {
        day: 6,
        title: "Labuan Bajo Koyu & Gün Batımı",
        activities: [
          "Sabah: şehir içi keşif veya liman/marina gezisi; Labuan Bajo'nun gündüz ritmini yakalama",
          "Kano / su sporları (pakete dahil; hava ve müsaitliğe göre): denizle daha aktif bir gün geçirmek isteyenlere",
          "Öğleden sonra: Seraya Hill veya Bukit Cinta gün batımı noktası; turun en iyi vedalık manzaralarından biri",
          "Fotoğraf & manzara molası: ışık en güzel saatlerdeyken bol bol çekim",
          "Akşam: yerel mutfak deneyimi (isteğe bağlı) – deniz ürünleri ve yerel tatlar için öneriler paylaşılır",
        ],
        accommodation: "Labuan Bajo butik otel (4⭐)",
      },
      {
        day: 7,
        title: "Dönüş",
        activities: [
          "Kahvaltı ve valiz hazırlığı",
          "Bugün misafirlerimizle son günümüz: uygun saatlerde kısa bir kafe buluşması ve vedalaşma",
          "Otel check-out ve transfer organizasyonu",
          "Havalimanında check-in sürecinde destek ve uğurlama",
          "Dönüş uçuşu",
        ],
        accommodation: "-",
      },
    ],
    activities: [
      {
        category: "Yaban Hayatı",
        items: [
          "Komodo ejderlerini doğal habitatında gözlem",
          "Rinca & Komodo rehberli trekking",
          "Vahşi yaşam fotoğrafçılığı",
        ],
      },
      {
        category: "Deniz & Şnorkel",
        items: [
          "Pink Beach'te yüzme & şnorkel",
          "Manta Point şnorkeli (manta ray görme ihtimali)",
          "Kanawa / Taka Makassar şnorkel durakları (rota uygunluğuna göre)",
          "Tüplü dalış (opsiyonel)",
        ],
      },
      {
        category: "Manzara & Fotoğraf",
        items: [
          "Padar Adası panoraması",
          "Seraya Hill / Bukit Cinta gün batımı",
          "Labuan Bajo marina ve sahil kasabası atmosferi",
        ],
      },
    ],
    included: [
      "Tüm paketlerde: Labuan Bajo'da 6 gece konaklama (4★ otel/butik tesis) ve her gün otel kahvaltısı",
      "Tüm paketlerde: havalimanı–otel–otel arası transferler ve 7/24 ulaşılabilir Türkçe koordinasyon",
      "Standart ve Premium paketlerde: Labuan Bajo çıkışlı ada/tekne günleri (programdaki ana duraklar dahilinde)",
      "Standart ve Premium paketlerde: Rinca & Komodo trekking (yerel park rehberi ile)",
      "Standart ve Premium paketlerde: Padar panoraması, Pink Beach ve Manta Point şnorkel rotaları (hava/deniz durumuna göre)",
      "Standart ve Premium paketlerde: tekne turu günlerinde teknede öğle yemeği",
      "Standart ve Premium paketlerde: milli park girişleri ve liman/feribot vergileri (program kapsamına göre)",
      "Tüm paketlerde: 6. gün kano / su sporları deneyimi (hava ve müsaitliğe göre)",
      "Yalnızca Premium pakette: daha kapsamlı rota/tekne planlaması ve üst segment konaklama opsiyonu (müsaitliğe göre)",
    ],
    notIncluded: [
      "Temel paket için: Rinca & Komodo trekking, Padar/Pink Beach/Manta Point tekne günleri ve milli park girişleri bu fiyata dahil değildir; istenirse opsiyonel ekstra olarak planlanır",
      "Tüm paketlerde: uluslararası uçuşlar",
      "Tüm paketlerde: tüplü dalış ve dalış ekipmanları (opsiyonel)",
      "Tüm paketlerde: tekne günleri dışındaki öğle/akşam yemekleri ve otel kapsamı dışındaki yiyecek-içecek harcamaları",
      "Tüm paketlerde: içecekler, bahşiş ve kişisel harcamalar",
      "Tüm paketlerde: 5. gün yerel köy gezisi gibi opsiyonel ekstra aktiviteler (katıldığınız kadar ayrıca ücretlendirilir)",
    ],
    about: {
      nature:
        "Komodo Ulusal Parkı, dramatik tepeler, savanah manzaraları, pembe kumsallar ve berrak turkuaz koylar ile Endonezya'nın en etkileyici doğa sahnelerinden birini sunar.",
      culture:
        "Flores ve çevresindeki adalar; küçük balıkçı kasabaları, yerel pazarlar ve taze deniz ürünleri mutfağıyla otantik bir sahil kültürü sunar.",
      lifestyle:
        "Gündüzleri tekneyle ada keşfi ve şnorkel, akşamları ise Labuan Bajo'da serbest zaman ve gün batımı duraklarıyla macera ve dinlenmeyi dengeler.",
    },
    routes: [
      { name: "Labuan Bajo", description: "Turların başladığı sahil kasabası" },
      { name: "Rinca Adası", description: "Rehberli trekking ve Komodo gözlemi" },
      { name: "Komodo Ulusal Parkı", description: "UNESCO rotaları ve vahşi doğa" },
      { name: "Padar Adası", description: "İkonik panoramik manzara" },
      { name: "Pink Beach", description: "Pembe kumlu plaj ve şnorkel" },
      { name: "Manta Point", description: "Manta ray bölgesi – şnorkel" },
      { name: "Kanawa / Taka Makassar", description: "Şnorkel & dinlenme molaları" },
      { name: "Seraya Hill / Bukit Cinta", description: "Gün batımı ve fotoğraf" },
    ],
    gallery: [
      "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/11896657/pexels-photo-11896657.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  sulawesi: {
    name: "Sulawesi Adası",
    hero:
      "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    summary:
      "Makassar'ın tropik sahil ritminden başlayıp, Manado ve Bunaken'in su altı dünyasına uzanan; finalde Jakarta ile metropol dokunuşu ekleyen, Endonezya içi aktarmalı uçuşlarla ilerleyen uçuş ağırlıklı keşif rotası.",
    suitableFor: [
      "Deniz & Şnorkel",
      "Dalış (isteğe bağlı)",
      "Doğa & Vahşi Yaşam",
      "Fotoğrafçılık",
      "Şehir & Kafe Kültürü",
    ],
    duration: "8 Gece 9 Gün",
    concept: "Deniz • Doğa • Dalış • Tropik Şehir",
    price: "4.199",
    packages: [
      {
        id: "sulawesi-basic",
        level: "temel",
        name: "Sulawesi Keşif Temel",
        badge: "Esnek & ekonomik",
        headline:
          "Konaklama + uçuş omurgasını sabitleyip, tekne/park günlerini tercihinize göre şekillendirmek isteyenlere.",
        priceMultiplier: 0.7,
        highlights: [
          "Makassar (2 gece) + Manado (5 gece) + Jakarta (1 gece) toplam 8 gece konaklama",
          "Makassar → Manado ve Manado → Jakarta iç hat uçuşları",
          "Havalimanı transferleri + 7/24 Türkçe koordinasyon",
          "Serbest gün blokları ve kişisel keşif için esneklik",
        ],
        notes:
          "Temel paket, rotanın uçuş omurgasını ve konaklamayı sabitler. Tekne/park günleri isteğe göre opsiyonel olarak planlanabilir.",
      },
      {
        id: "sulawesi-plus",
        level: "plus",
        name: "Sulawesi Keşif Standart",
        badge: "Dengeli seçenek",
        headline:
          "Makassar ada günü + Bunaken + Tangkoko gibi öne çıkan deneyimleri dengeli tempoda bir araya getiren paket.",
        priceMultiplier: 0.85,
        highlights: [
          "Makassar tropik ada tekne günü",
          "Bunaken Milli Parkı (şnorkel/dalış günü)",
          "Tangkoko yağmur ormanı – vahşi yaşam keşfi",
          "Jakarta'da kısa metropol dokunuşu",
        ],
        notes:
          "Standart paket, bu sayfadaki gün gün akışın ana duraklarını referans alır. Uçuş saatleri ve operasyonel detaylar rezervasyon sonrası yazılı olarak paylaşılır.",
      },
      {
        id: "sulawesi-premium",
        level: "premium",
        name: "Sulawesi Keşif Premium",
        badge: "En kapsamlı",
        headline:
          "Daha net kapsam, daha dolu plan ve daha yüksek konfor hedefleyenler için üst seviye paket.",
        priceMultiplier: 1,
        highlights: [
          "Tomohon volkanik manzaralar + Lake Linow + termal duraklar",
          "Bunaken gününde daha kapsamlı planlama (hava/deniz durumuna göre)",
          "Daha kapsamlı rezervasyon koordinasyonu ve önceliklendirme",
        ],
        notes:
          "Premium paket, programı daha net kapsamla ve daha dolu günlerle planlamayı hedefler. Dalış gibi özel talepler tercihe göre ayrıca planlanır.",
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Makassar – Tropik Dünyaya İlk Adım",
        activities: [
          "Makassar'a varış ve havalimanında karşılama",
          "Otele transfer (yaklaşık 30–40 dk) ve check-in",
          "Kısa dinlenme sonrası sahil hattında yürüyüş: ilk tropik temas ve deniz havası",
          "Gün batımında serbest zaman: kafe/oturup şehri izleme ve dinlenme",
        ],
        accommodation: "Makassar şehir oteli (4⭐)",
      },
      {
        day: 2,
        title: "Makassar – Ada & Deniz Deneyimi (Rehberli Gün)",
        activities: [
          "Sabah buluşma ve tekne iskelesine konforlu transfer: günün ritmini erkenden yakalıyoruz",
          "Makassar açıklarındaki tropikal adalara tekne geçişi (yaklaşık 30–45 dk): rüzgâr, deniz kokusu ve ilk manzaralar",
          "Gün boyu ‘turkuaz su + bembeyaz kum’ hissi: sakin koylarda yüzme molaları ve şnorkel için en güzel noktalar",
          "Şnorkelde mercan dokuları ve renkli balıklarla tanışma: dalış yapmadan da ‘Bunaken öncesi’ harika bir ısınma",
          "Sahil hattında serbest zaman: güneşlenme, kısa yürüyüş, fotoğraf ve dinlenme molaları",
          "İsteyenler için sahil bölgesinde jet ski ve su sporları için uygun zaman aralığı (müsaitlik ve deniz durumuna bağlı)",
          "Akşamüstü tekneyle dönüş: günün en güzel ışığında denizde son kareler",
          "Makassar'a varış sonrası serbest akşam: önerilen kafe/restaurant noktalarıyla günü keyifle kapatma",
        ],
        accommodation: "Makassar şehir oteli (4⭐)",
      },
      {
        day: 3,
        title: "Makassar → Manado – Varış & Serbest Gün (Kalan Zamana Bağlı)",
        activities: [
          "Sabah havalimanına transfer",
          "Makassar → Manado iç hat uçuşu (yaklaşık 1 saat 45 dk)",
          "Varış sonrası otele transfer ve check-in",
          "Günün kalan zamanı: serbest zaman (uçuş saati ve varış saatine bağlı)",
        ],
        accommodation: "Manado şehir oteli (4⭐)",
        optionalExtras: [
          {
            id: "sulawesi-manado-arrival-short-city",
            title: "3. Gün | Manado Kısa Şehir Keşfi (Opsiyonel)",
            shortDescription:
              "Varış gününde, gün içinde kalan zamana bağlı olarak kısa sahil yürüyüşü/şehir keşfi (opsiyonel ve ücretli).",
            estimatedPricePerPerson: 35,
            priceNote:
              "Kişi başı ortalama 25–55 USD; tura dahil değildir (kalan zamana göre planlanır).",
            details: [
              "⏱ Süre: Varış saatine göre 1–2,5 saat",
              "🗺 İçerik: sahil şeridi, kısa fotoğraf durakları, yerel kafe/market molası",
              "📌 Not: Program uçuş saatleri ve trafik durumuna göre şekillenir",
            ],
            notes:
              "Bu aktivite tur fiyatına dahil değildir. Uçuş/varış saatine göre aynı gün yapılabilir; zaman uygun değilse bir sonraki serbest zaman aralığına kaydırılabilir.",
          },
        ],
      },
      {
        day: 4,
        title: "Bunaken Milli Parkı – Okyanusun Altına Yolculuk (Rehberli Gün)",
        activities: [
          "Sabah erken buluşma ve tekneyle Bunaken Milli Parkı'na geçiş (yaklaşık 40–50 dk): denizin rengi açıldıkça değişir",
          "Varışta kısa bilgilendirme: günün akışı, güvenlik ve en iyi şnorkel noktaları (deniz koşullarına göre)",
          "Şnorkel molaları: mercan bahçeleri, tropik balıklar ve su altı ‘akvaryum’ hissi (yüzme bilmeyenler için de kontrollü seçenekler)",
          "Dalış yapmayanlar için ada keyfi: kumsalda dinlenme, fotoğraf noktaları ve sakin bir tropik gün",
          "Sertifikasız misafirler için eğitmen eşliğinde güvenli keşif dalışı (isteğe bağlı; müsaitliğe bağlı)",
          "Sertifikalı dalgıçlar için Bunaken'in ünlü duvar dalış rotaları (isteğe bağlı; koşullara bağlı)",
          "Adada öğle yemeği: deniz günü enerjisini tazeleme ve kısa dinlenme",
          "Gün sonunda tekneyle Manado'ya dönüş ve otele transfer: tuzlu saç, bol fotoğraf ve dolu bir gün",
        ],
        accommodation: "Manado şehir oteli (4⭐)",
      },
      {
        day: 5,
        title: "Manado – Serbest Gün",
        activities: [
          "Kahvaltı sonrası tam gün serbest zaman",
          "İsteyenler için: ekstra dalış, kısa ada turu veya sahil keyfi (isteğe bağlı)",
          "İsteyenler için: spa, dinlenme ve kişisel keşif",
          "Akşam serbest zaman: kafe/restoran önerileri paylaşılır",
          "İsteyene dalış aktivitesi planlanır, isteyene tekne turu planlanır.",
        ],
        accommodation: "Manado şehir oteli (4⭐)",
        optionalExtras: [
          {
            id: "sulawesi-free-day-adrenaline-watersports",
            title: "5. Gün | Jet Ski & Su Sporları Turu (Opsiyonel)",
            shortDescription:
              "Jet ski benzeri su sporları ve adrenalin odaklı kısa aktiviteler (opsiyonel ve ücretli).",
            estimatedPricePerPerson: 90,
            priceNote: "Kişi başı ortalama 60–120 USD; tura dahil değildir.",
            details: [
              "İçerik, bölgedeki operatör ve müsaitliğe göre netleşir",
              "Güvenlik ekipmanları ve kısa bilgilendirme operatör tarafından sağlanır",
            ],
            notes:
              "Bu aktivite tur fiyatına dahil değildir; katılım durumuna göre ayrıca ücretlendirilir.",
          },
        ],
      },
      {
        day: 6,
        title: "Tomohon – Volkanlar, Sisler ve Termal Sular (Rehberli Gün)",
        activities: [
          "Sabah Manado'dan Tomohon bölgesine doğru yola çıkış (yaklaşık 1,5 saat): kıyıdan yüksek rakıma doğru manzara dönüşümü",
          "Volkanik manzara durakları: sis, yeşil yamaçlar ve dramatik siluetlerle ‘kartpostal’ gibi fotoğraf noktaları",
          "Lake Linow: gün ışığına göre ton değiştiren gölde yürüyüş ve manzara molası (en iyi kareler için zaman)",
          "Bölgenin serin havasında kısa serbest zaman: sıcak içecek molası ve çevreyi sindirme",
          "Doğal termal kaynaklarda dinlenme: günün yorgunluğunu atıp bedeni yenileme",
          "Akşam Manado'ya dönüş: gün batımına doğru manzaralarla turu tamamlama",
        ],
        accommodation: "Manado şehir oteli (4⭐)",
      },
      {
        day: 7,
        title: "Tangkoko – Yağmur Ormanlarında Vahşi Doğa (Rehberli Gün)",
        activities: [
          "Sabah erken çıkış ve Tangkoko Milli Parkı'na transfer (yaklaşık 1,5–2 saat): gün doğumu ışığında tropik doğaya giriş",
          "Rehber eşliğinde yağmur ormanı yürüyüşü: kuş sesleri, dev ağaçlar ve gerçek bir ‘vahşi doğa’ atmosferi",
          "Tarsius (dünyanın en küçük primatlarından) ve siyah makakları doğal yaşam alanlarında gözlemleme şansı",
          "Yürüyüş boyunca kısa duraklar: fotoğraf, nefes ve doğayı sindirme molaları (tempo grubun ritmine göre ayarlanır)",
          "Doğa ve fotoğraf odaklı keşif: ‘belgesel sahnesi’ gibi anlar yakalamak için rehber yönlendirmeleri",
          "Akşamüstü Manado'ya dönüş ve serbest akşam: günün etkisini sakin bir akşamla dengeleme",
        ],
        accommodation: "Manado şehir oteli (4⭐)",
      },
      {
        day: 8,
        title: "Manado → Jakarta – Metropole Geçiş",
        activities: [
          "Sabah otelden çıkış ve havalimanına transfer",
          "Manado → Jakarta iç hat uçuşu (yaklaşık 3 saat)",
          "Jakarta'ya varış, otele transfer ve kısa dinlenme",
          "Akşam kısa şehir yürüyüşü: kafe ve serbest zaman",
        ],
        accommodation: "Jakarta şehir oteli (4⭐)",
      },
      {
        day: 9,
        title: "Jakarta → İstanbul – Dönüş",
        activities: [
          "Kahvaltı sonrası serbest zaman",
          "Uçuş saatine göre Jakarta Havalimanı'na transfer (yaklaşık 45–60 dk)",
          "Havalimanında check-in desteği ve uğurlama",
          "Jakarta → İstanbul uçuşu",
        ],
        accommodation: "-",
      },
    ],
    included: [
      "Tüm paketlerde: Makassar (2 gece) + Manado (5 gece) + Jakarta (1 gece) toplam 8 gece konaklama ve her gün otel kahvaltısı",
      "Tüm paketlerde: Makassar → Manado iç hat uçuşu (havayolu/saat detayları rezervasyon sonrası yazılı olarak paylaşılır)",
      "Tüm paketlerde: Manado → Jakarta iç hat uçuşu (havayolu/saat detayları rezervasyon sonrası yazılı olarak paylaşılır)",
      "Tüm paketlerde: havalimanı–otel transferleri ve 7/24 ulaşılabilir Türkçe koordinasyon",
      "Standart ve Premium paketlerde: 2. gün Makassar ada tekne günü (programdaki ana duraklar dahilinde)",
      "Standart ve Premium paketlerde: 4. gün Bunaken Milli Parkı tekne günü (şnorkel rotaları) ve adada öğle yemeği",
      "Standart ve Premium paketlerde: 5. gün Tangkoko yağmur ormanı turu (rehberli)",
      "Yalnızca Premium pakette: 6. gün Tomohon + Lake Linow + termal kaynaklar günü (program kapsamına göre)",
    ],
    notIncluded: [
      "Temel paket için: Makassar ada tekne günü, Bunaken günü ve Tangkoko turu bu fiyata dahil değildir; istenirse opsiyonel ekstra olarak planlanır",
      "Tüm paketlerde: uluslararası uçuşlar (İstanbul → Endonezya gidiş/dönüş)",
      "Tüm paketlerde: tüplü dalış, dalış ekipmanları ve eğitmen ücretleri (isteğe bağlı)",
      "Tüm paketlerde: öğle/akşam yemekleri ve otel kapsamı dışında kalan yiyecek-içecek harcamaları",
      "Tüm paketlerde: kişisel harcamalar, bahşiş ve opsiyonel su sporları",
      "Türkiye'den çıkışta ödenen yurtdışı çıkış harcı katılımcı tarafından ödenir",
    ],
    notes: {
      approach:
        "Bu program, Endonezya içi aktarmalı uçuşlarla ilerleyen uçuş ağırlıklı bir akıştır. Uzun ve yorucu karayolu yolculukları planlanmaz; sadece günlük turlar için gerekli kısa kara transferleri yapılır. Rehberli günlerde (tekne/milli park/orman rotaları) zamanlama, transfer ve operasyon akışı önceden planlanır; siz sadece deneyime odaklanırsınız. Serbest zaman blokları ise bilinçli olarak korunur: dinlenme, sahil/kafe keşfi ve isteğe bağlı ek deneyimler için esneklik sunar. Uçuş saatleri, tekne çıkışları ve operasyonel detaylar rezervasyon sonrası yazılı olarak paylaşılır.",
      freeTime:
        "Serbest gün ve serbest akşam blokları ‘boş bırakılmış gün’ değildir; temponuzu dengelemek ve Sulawesi’yi kendi ritminizde yaşamanız için bilerek korunur. Bu zamanlarda sahil hattında gün batımı, kafe/restoran keşfi, spa/masaj ve kısa yürüyüş rotaları gibi önerilerle destek oluruz. İsterseniz gün içinde kalan zamana ve müsaitliğe bağlı olarak dalış veya tekne turu gibi ek deneyimler de planlanabilir; katılım tamamen tercihinizdir.",
      discipline:
        "Rehberli günlerde uçuş/tekne/milli park girişleri saatli ilerlediği için buluşma saatlerine uyum ve güvenlik talimatlarına dikkat edilmesi önemlidir. Biz akışı mümkün olduğunca akıcı ve stressiz kurarız; sizden beklenen, zamanında hazır olmak ve rehber yönlendirmelerine uymaktır. Grup düzenine saygı ve karşılıklı nezaket, turun konforunu ve deneyim kalitesini doğrudan yükseltir.",
    },
    routes: [
      { name: "Makassar", description: "Tropik sahil şehri, rota başlangıcı" },
      { name: "Makassar Adaları", description: "Tekneyle tropik adalar, yüzme & şnorkel" },
      { name: "Manado", description: "Kuzey Sulawesi'nin kapısı" },
      { name: "Bunaken", description: "Şnorkel ve dalış için dünyaca ünlü milli park" },
      { name: "Tangkoko", description: "Yağmur ormanı ve vahşi yaşam gözlemi" },
      { name: "Tomohon & Lake Linow", description: "Volkanik manzaralar ve termal duraklar" },
      { name: "Jakarta", description: "Metropol atmosferi ve dönüş öncesi kısa mola" },
    ],
    gallery: [
      "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
};

// Liste sayfasındaki tur ID'lerini detay sayfasındaki ana rota ID'lerine eşleştir
// Örn: "bali-klasik" kartına tıklayınca burada "bali" detayını göster.
const TOUR_ID_MAP = {
  "bali-klasik": "bali",
  "bali-java": "java",
  "bali-aile": "bali",
  "bali-komodo": "komodo",
};

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "905550343852";

// Tur sayfası BİREYSEL ve GRUP formları için özel EmailJS yapılandırması
const EMAILJS_TOURS_SERVICE_ID = "service_a4cvjdi";
const EMAILJS_TOURS_TEMPLATE_ID_PLANNED = "template_vrs7wm9";
const EMAILJS_TOURS_TEMPLATE_ID_GROUP = "template_lv114n8";
const EMAILJS_TOURS_PUBLIC_KEY = "ztyFnl3RMNaTFeReI";

export default function TourDetail() {
  const { id } = useParams();
  const effectiveId = id && TOUR_ID_MAP[id] ? TOUR_ID_MAP[id] : id;
  const navigate = useNavigate();
  const tour = effectiveId ? toursData[effectiveId] : null;

  const isBali = effectiveId === "bali";
  const isLombok = effectiveId === "lombok";
  const isJava = effectiveId === "java";
  const isSumatra = effectiveId === "sumatra";
  const isKomodo = effectiveId === "komodo";
  const isSulawesi = effectiveId === "sulawesi";

  const getPremiumDifferences = (tourKey, pkgLevel) => {
    if (pkgLevel === "premium") return [];

    if (tourKey === "bali") {
      return pkgLevel === "temel"
        ? [
            "Ayung Nehri rafting deneyimi bu pakete dahil değildir (isteğe bağlı eklenebilir).",
            "Tam gün tekne turu ve bazı ekstra aktiviteler bu fiyata dahil değildir.",
            "Otel konforu ve dahil öğün sayısı Premium'a göre daha sade tutulur; bütçeyi korumaya odaklıdır.",
          ]
        : [
            "Tam gün tekne turu bu pakete dahil değildir (isterseniz opsiyonel olarak eklenebilir).",
            "Yemekler ve ekstra aktiviteler Premium pakete göre daha sınırlıdır.",
          ];
    }

    if (tourKey === "lombok") {
      return pkgLevel === "temel"
        ? [
            "Gili Adaları tekne turu bu pakete dahil değildir (isteğe bağlı eklenebilir).",
            "Güney plajları & sörf deneyimi bu pakete dahil değildir (isteğe bağlı eklenebilir).",
            "Senaru şelaleleri & Rinjani manzara turu bu pakete dahil değildir.",
          ]
        : [
            "Senaru şelaleleri & Rinjani manzara turu bu pakete dahil değildir (isterseniz opsiyonel olarak eklenebilir).",
            "Pink Beach tekne turu gibi ek deneyimler bu pakete dahil değildir.",
          ];
    }

    if (tourKey === "sumatra") {
      return pkgLevel === "temel"
        ? [
            "Orangutan trekking & tubing deneyimi bu pakete dahil değildir (isteğe bağlı eklenebilir).",
            "Batak kültür & ada turu bu pakete dahil değildir (isteğe bağlı eklenebilir).",
            "Tele Observation Tower / panorama turu gibi ek turlar bu fiyata dahil değildir.",
          ]
        : [
            "Batak kültür & ada turu bu pakete dahil değildir (isterseniz opsiyonel olarak eklenebilir).",
            "Tele Observation Tower / panorama turu gibi ek turlar bu pakete dahil değildir.",
          ];
    }

    return [];
  };

  const [showPlannedForm, setShowPlannedForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  // Bali paket kartlarında fiyattan sonraki detay bloklarını toplu açıp kapamak için
  const [packagesExpanded, setPackagesExpanded] = useState(false);

  // Kaporalı ön rezervasyon alanını açıp kapamak için
  const [showDepositForm, setShowDepositForm] = useState(false);

  // Uçak bileti dahil seçildiyse ödeme öncesi zorunlu onay ekranı
  const [showFlightConfirm, setShowFlightConfirm] = useState(false);
  const [flightConfirmAccepted, setFlightConfirmAccepted] = useState(false);

  // Önemli açıklamalar & uyarılar bloğunu açıp kapamak için
  const [showImportantNotes, setShowImportantNotes] = useState(false);

  // Serbest günlerdeki opsiyonel, ücretli ekstra aktivitelerin kartlarını açıp kapamak için
  const [openOptionalExtraId, setOpenOptionalExtraId] = useState(null);

  // Opsiyonel ekstra kartları boş alana tıklayınca kapansın
  useEffect(() => {
    if (!openOptionalExtraId) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;

      // Opsiyonel ekstra kartlarının içinde tıklama varsa kapanma
      if (target.closest('[data-optional-extra-card]')) return;

      setOpenOptionalExtraId(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openOptionalExtraId]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [pricingOverride, setPricingOverride] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  // Sayfa her açıldığında en üste kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(
      doc(db, "tours", id),
      (snap) => {
        if (snap.exists()) {
          setPricingOverride(snap.data());
        }
      },
      (error) => {
        console.error("Firestore 'tours' detay dinleme hatası:", error);
      },
    );

    return () => unsubscribe();
  }, [id]);

  const basePriceRaw =
    pricingOverride?.price !== undefined && pricingOverride?.price !== null && pricingOverride?.price !== ""
      ? pricingOverride.price
      : tour?.price;
  const normalizedBasePrice =
    typeof basePriceRaw === "string"
      ? basePriceRaw.replace(/[^0-9]/g, "")
      : basePriceRaw;
  const basePrice = normalizedBasePrice ? Number(normalizedBasePrice) : null;
  const discountPercentRaw =
    pricingOverride?.discountPercent !== undefined && pricingOverride?.discountPercent !== null
      ? pricingOverride.discountPercent
      : tour?.discountPercent ?? 0;
  const discountPercent = Number(discountPercentRaw) || 0;
  const hasDiscount = basePrice !== null && discountPercent > 0;
  const discountedPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;
  const promoLabel = pricingOverride?.promoLabel || "";

  const normalizeUsdNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "number" && isFinite(value)) return value;
    if (typeof value === "string") {
      const n = Number(value.replace(/[^0-9.]/g, ""));
      return isFinite(n) && n > 0 ? n : null;
    }
    return null;
  };

  const flightIncludedLimitUsd = normalizeUsdNumber(pricingOverride?.flightIncludedLimitUsd);
  const flightLimitPerPersonUsdRounded = Number.isFinite(flightIncludedLimitUsd)
    ? Math.round(flightIncludedLimitUsd)
    : 0;
  const hasFlightLimit = flightLimitPerPersonUsdRounded > 0;
  const flightInclusionShortNote = flightIncludedLimitUsd
    ? `(uçak bileti kişi başı $${Math.round(flightIncludedLimitUsd)}’a kadar dahildir)`
    : "(uçak bileti pakette belirtilen tutara kadar dahildir)";
  const flightInclusionLongNote = flightIncludedLimitUsd
    ? `Uçak bileti kişi başı $${Math.round(flightIncludedLimitUsd)}’a kadar pakete dahildir; belirtilen tutarı aşan fiyat farkı katılımcı tarafından ayrıca karşılanır.`
    : "Uçak bileti, paket açıklamasında/broşürlerde/teklif formlarında belirtilen tutara kadar pakete dahildir; belirtilen tutarı aşan fiyat farkı katılımcı tarafından ayrıca karşılanır.";

  const normalizePlannedDateRangeLabel = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .replace(/^\s*planlanan\s*tarih\s*:\s*/i, "")
      .replace(/^\s*planlanan\s*tur\s*tarihleri\s*:\s*/i, "")
      .trim();
  };

  const parseDateFlexible = (input) => {
    if (!input) return null;
    let s = input.toString().trim();
    s = s.replace(/\(.*?\)/g, " ");
    s = s.replace(/planlanan\s*tarih\s*:\s*/i, "");
    s = s.replace(/planlanan\s*tur\s*tarihleri\s*:\s*/i, "");
    s = s.replace(/^[^0-9a-zA-ZğüşöçıİĞÜŞÖÇ]+/g, "");
    s = s.replace(/[^0-9a-zA-ZğüşöçıİĞÜŞÖÇ\.\-\/\s]+/g, " ").trim();

    let d = new Date(s);
    if (!isNaN(d)) return d;

    const monthsTR = {
      ocak: "January",
      şubat: "February",
      mart: "March",
      nisan: "April",
      mayıs: "May",
      haziran: "June",
      temmuz: "July",
      ağustos: "August",
      agustos: "August",
      eylül: "September",
      ekim: "October",
      kasım: "November",
      aralık: "December",
    };

    let replaced = s.toLowerCase();
    Object.keys(monthsTR).forEach((tr) => {
      replaced = replaced.replace(new RegExp(tr, "g"), monthsTR[tr]);
    });
    d = new Date(replaced);
    if (!isNaN(d)) return d;

    const m = replaced.match(/(\d{1,2})[\.\-/ ](\d{1,2})[\.\-/ ](\d{2,4})/);
    if (m) {
      const day = Number(m[1]);
      const month = Number(m[2]) - 1;
      let year = Number(m[3]);
      if (year < 100) year += 2000;
      return new Date(year, month, day);
    }

    const m2 = replaced.match(/(\d{1,2})\s+([a-zA-Z]+)\s*(\d{4})?/);
    if (m2) {
      const day = Number(m2[1]);
      const monthName = m2[2];
      const year = m2[3] ? Number(m2[3]) : new Date().getFullYear();
      const tryDate = new Date(`${monthName} ${day}, ${year}`);
      if (!isNaN(tryDate)) return tryDate;
    }

    return null;
  };

  const parseDateRangeText = (text) => {
    if (!text || typeof text !== "string") return null;
    let cleaned = text
      .replace(/\(.*?\)/g, " ")
      .replace(/planlanan\s*tarih\s*:\s*/i, "")
      .replace(/planlanan\s*tur\s*tarihleri\s*:\s*/i, "")
      .trim();

    // "12-19 Mart" veya "12–19 Mart 2026"
    let m = cleaned.match(/(\d{1,2})\s*[-–—]\s*(\d{1,2})\s+([a-zA-ZğüşöçıİĞÜŞÖÇ]+)\s*(\d{4})?/i);
    if (m) {
      const d1 = Number(m[1]);
      const d2 = Number(m[2]);
      const monthName = m[3];
      const year = m[4] ? Number(m[4]) : new Date().getFullYear();
      const start = parseDateFlexible(`${d1} ${monthName} ${year}`);
      const end = parseDateFlexible(`${d2} ${monthName} ${year}`);
      return start && end ? { start, end } : null;
    }

    // "28 Mart - 3 Nisan" / "28 Mart – 3 Nisan 2026"
    m = cleaned.match(
      /(\d{1,2})\s+([a-zA-ZğüşöçıİĞÜŞÖÇ]+)\s*[-–—]\s*(\d{1,2})\s+([a-zA-ZğüşöçıİĞÜŞÖÇ]+)\s*(\d{4})?/i,
    );
    if (m) {
      const d1 = Number(m[1]);
      const month1 = m[2];
      const d2 = Number(m[3]);
      const month2 = m[4];
      const year = m[5] ? Number(m[5]) : new Date().getFullYear();
      const start = parseDateFlexible(`${d1} ${month1} ${year}`);
      const end = parseDateFlexible(`${d2} ${month2} ${year}`);
      return start && end ? { start, end } : null;
    }

    const parts = cleaned
      .split(/\s[-–—]\s|\bto\b/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const start = parseDateFlexible(parts[0]);
      const end = parseDateFlexible(parts[1]);
      return start && end ? { start, end } : null;
    }

    return null;
  };

  const computeDaysNightsFromDates = (start, end) => {
    if (!(start instanceof Date) || !(end instanceof Date) || isNaN(start) || isNaN(end)) return null;
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round((endUtc - startUtc) / msPerDay) + 1;
    if (!Number.isFinite(days) || days <= 0 || days >= 1000) return null;
    const nights = Math.max(0, days - 1);
    return { days, nights };
  };

  const formatDurationFromDaysNights = (days, nights) => {
    const d = Number(days);
    const n = Number(nights);
    if (!Number.isFinite(d) || !Number.isFinite(n) || d <= 0) return "";
    return `${n} Gece ${d} Gün`;
  };

  const configTour = effectiveId ? TOURS_CONFIG.find((t) => t.id === effectiveId) : null;
  const plannedDateRangeTextRaw = pricingOverride?.dateRange || configTour?.dateRange || "";
  const plannedDateRangeText = normalizePlannedDateRangeLabel(plannedDateRangeTextRaw);

  const possibleStart =
    pricingOverride?.startDate ||
    pricingOverride?.start_date ||
    pricingOverride?.dateStart ||
    pricingOverride?.date_start ||
    pricingOverride?.start ||
    pricingOverride?.sDate ||
    pricingOverride?.s_date ||
    pricingOverride?.startAt ||
    pricingOverride?.start_at ||
    (pricingOverride?.dates && (pricingOverride.dates.start || pricingOverride.dates.startDate || pricingOverride.dates.dateStart)) ||
    null;
  const possibleEnd =
    pricingOverride?.endDate ||
    pricingOverride?.end_date ||
    pricingOverride?.dateEnd ||
    pricingOverride?.date_end ||
    pricingOverride?.end ||
    pricingOverride?.eDate ||
    pricingOverride?.e_date ||
    pricingOverride?.endAt ||
    pricingOverride?.end_at ||
    (pricingOverride?.dates && (pricingOverride.dates.end || pricingOverride.dates.endDate || pricingOverride.dates.dateEnd)) ||
    null;

  const startDate = possibleStart
    ? (typeof possibleStart?.toDate === "function" ? possibleStart.toDate() : new Date(possibleStart))
    : null;
  const endDate = possibleEnd
    ? (typeof possibleEnd?.toDate === "function" ? possibleEnd.toDate() : new Date(possibleEnd))
    : null;

  const computedDaysNights = startDate && endDate ? computeDaysNightsFromDates(startDate, endDate) : null;
  const computedDurationFromDates = computedDaysNights
    ? formatDurationFromDaysNights(computedDaysNights.days, computedDaysNights.nights)
    : "";

  const computedDurationFromText = (() => {
    const t = pricingOverride?.dateRange;
    if (!t || typeof t !== "string") return "";
    const m1 = t.match(/(\d+)\s*g[uü]n\s*\/\s*(\d+)\s*gece/i);
    if (m1) return formatDurationFromDaysNights(Number(m1[1]), Number(m1[2]));
    const m2 = t.match(/(\d+)\s*gece\s*\/\s*(\d+)\s*g[uü]n/i);
    if (m2) return formatDurationFromDaysNights(Number(m2[2]), Number(m2[1]));
    const range = parseDateRangeText(t);
    if (range?.start && range?.end) {
      const dn = computeDaysNightsFromDates(range.start, range.end);
      return dn ? formatDurationFromDaysNights(dn.days, dn.nights) : "";
    }
    return "";
  })();

  const effectiveDuration = computedDurationFromDates || computedDurationFromText || tour?.duration || "";

  const routeNames = Array.isArray(tour?.routes)
    ? tour.routes.map((r) => r?.name).filter(Boolean)
    : [];
  const routesShortText = routeNames.length > 0
    ? `${routeNames.slice(0, 4).join(", ")}${routeNames.length > 4 ? "…" : ""}`
    : "";

  const fallbackPackages = [
    {
      id: `${effectiveId || id || "tur"}-basic`,
      level: "temel",
      name: "Temel Paket",
      badge: "Başlangıç",
      headline: "Program akışını koruyan, daha esnek içerikli başlangıç paketi.",
      priceMultiplier: 1,
      highlights: [
        effectiveDuration ? `Süre: ${effectiveDuration}` : "",
        tour?.concept ? `Konsept: ${tour.concept}` : "",
        routesShortText ? `Rota: ${routesShortText}` : "",
      ].filter(Boolean),
      notes:
        "Bu tur için dahil/haric kapsam, seçilen paket seviyesine göre değişebilir. Net kapsam ve operasyon detayları rezervasyon öncesinde yazılı paylaşılır.",
    },
    {
      id: `${effectiveId || id || "tur"}-standard`,
      level: "plus",
      name: "Standart Paket",
      badge: "Dengeli",
      headline: "Daha dolu içerik ve daha az belirsizlik isteyenler için dengeli seçenek.",
      priceMultiplier: 1,
      highlights: [
        effectiveDuration ? `Süre: ${effectiveDuration}` : "",
        tour?.concept ? `Konsept: ${tour.concept}` : "",
        routesShortText ? `Rota: ${routesShortText}` : "",
      ].filter(Boolean),
      notes:
        "Standart paket, programın ana akışını referans alır ve kapsamı netleştirir. Operasyonel detaylar (saat/rota gibi) rezervasyon sonrası yazılı olarak paylaşılır.",
    },
    {
      id: `${effectiveId || id || "tur"}-premium`,
      level: "premium",
      name: "Premium Paket",
      badge: "En kapsamlı",
      headline: "Daha kapsamlı planlama ve daha yüksek konfor beklentisi olanlar için üst seviye paket.",
      priceMultiplier: 1,
      highlights: [
        effectiveDuration ? `Süre: ${effectiveDuration}` : "",
        tour?.concept ? `Konsept: ${tour.concept}` : "",
        routesShortText ? `Rota: ${routesShortText}` : "",
      ].filter(Boolean),
      notes:
        "Premium paket, daha kapsamlı bir planlama hedefler. Operasyonel detaylar (saat/rota gibi) rezervasyon sonrası yazılı olarak paylaşılır.",
    },
  ];

  const rawPackages = Array.isArray(tour?.packages) && (tour?.packages?.length ?? 0) > 0
    ? tour.packages
    : fallbackPackages;

  const hasPackages = Array.isArray(rawPackages) && (rawPackages?.length ?? 0) > 0;
  let packagePrices = [];
  let packages = rawPackages || [];

  if (hasPackages && basePrice) {
    packages = rawPackages.map((pkg) => {
      const multiplier = typeof pkg.priceMultiplier === "number" ? pkg.priceMultiplier : 1;
      const pkgBasePrice = Math.round(basePrice * multiplier);
      const pkgFinalPrice = hasDiscount
        ? Math.round(pkgBasePrice * (1 - discountPercent / 100))
        : pkgBasePrice;
      packagePrices.push(pkgFinalPrice);
      return {
        ...pkg,
        computedBasePrice: pkgBasePrice,
        computedPrice: pkgFinalPrice,
      };
    });
  }

  const nonZeroPackagePrices = packagePrices.filter((p) => typeof p === "number" && p > 0);
  const startingPrice = hasPackages && nonZeroPackagePrices.length > 0
    ? Math.min(...nonZeroPackagePrices)
    : discountedPrice;

  const defaultDepositPackageId = hasPackages
    ? (isJava
        ? (packages.find((p) => p.level === "premium" && typeof p.computedPrice === "number" && p.computedPrice > 0)?.id ||
            packages.find((p) => p.level === "premium")?.id ||
            packages[0]?.id ||
            "")
        : (packages[0]?.id || ""))
    : "";

  // Tur hero görselleri için imageUrls yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem("imageUrls");
      if (saved) {
        setImageUrls(JSON.parse(saved));
      }
    } catch (e) {
      console.error("imageUrls localStorage okuma hatası (TourDetail):", e);
    }

    const fetchImageUrls = async () => {
      try {
        const snap = await getDoc(doc(db, "imageUrls", "imageUrls"));
        if (snap.exists()) {
          const data = snap.data() || {};
          setImageUrls((prev) => {
            const merged = { ...prev, ...data };
            try {
              localStorage.setItem("imageUrls", JSON.stringify(merged));
            } catch (e) {
              console.error("imageUrls localStorage yazma hatası (TourDetail):", e);
            }
            return merged;
          });
        }
      } catch (error) {
        console.error("Firestore imageUrls yüklenirken hata (TourDetail):", error);
      }
    };

    fetchImageUrls();
  }, []);

  const heroKey = id ? `${id}-tour-hero` : "";
  const heroImage = heroKey && imageUrls[heroKey]
    ? imageUrls[heroKey]
    : tour?.hero || tour?.image || "/placeholder.svg";

  const [plannedForm, setPlannedForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    participation: "bireysel",
    tour: tour ? `${tour.name} - ${effectiveDuration}` : "",
    people: "",
    notes: "",
    privacy: false,
  }));

  const [depositForm, setDepositForm] = useState(() => ({
    packageId: defaultDepositPackageId,
    people: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
    extras: {},
    reservationType: "deposit",
    includeFlight: true,
    acceptScope: false,
    acceptExtras: false,
    acceptContract: false,
    acceptKvkk: false,
  }));

  const [groupForm, setGroupForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    groupType: "",
    dates: "",
    people: "",
    routes: tour ? tour.name : "",
    budget: "",
    budgetOther: "",
    notes: "",
    privacy: false,
  });

  const handlePlannedChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPlannedForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGroupChange = (e) => {
    const { name, type, checked, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDepositChange = (e) => {
    const { name, type, checked, value } = e.target;
    setDepositForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const closeFlightConfirm = () => {
    setShowFlightConfirm(false);
    setFlightConfirmAccepted(false);
  };

  const proceedToPayment = () => {
    const reservationType = depositForm.reservationType === "full" ? "full" : "deposit";
    const amountToPayNow = reservationType === "deposit" ? depositAmount : adjustedDepositGrandTotal;

    navigate("/payment", {
      state: {
        tourId: id,
        tourName: tour?.name || "",
        packageId: selectedDepositPackage?.id || "",
        packageName: selectedDepositPackage?.name || "",
        reservationType,
        people: depositPeopleCount,
        includeFlight: hasFlightLimit ? !!depositForm.includeFlight : true,
        flightLimitPerPersonUsd: hasFlightLimit ? flightLimitPerPersonUsdRounded : null,
        flightDeductionTotalUsd: hasFlightLimit && !depositForm.includeFlight ? flightDeductionTotal : 0,
        packageTotalUsd: adjustedDepositPackageTotal,
        extrasSelected: selectedExtrasList.map((extra) => ({
          id: extra.id,
          day: extra.day,
          title: extra.title,
          estimatedPricePerPersonUsd: Number(extra.estimatedPricePerPerson) || 0,
        })),
        extrasTotalUsd: extrasTotal,
        grandTotalUsd: adjustedDepositGrandTotal,
        depositPercent: DEPOSIT_PERCENT,
        amountToPayNowUsd: amountToPayNow,
        contact: {
          name: depositForm.name,
          email: depositForm.email,
          phone: depositForm.phone,
          notes: depositForm.notes,
        },
      },
    });
  };

  const handleDepositExtraToggle = (extraId) => {
    setDepositForm((prev) => ({
      ...prev,
      extras: {
        ...prev.extras,
        [extraId]: !prev.extras?.[extraId],
      },
    }));
  };

  const handlePlannedSubmit = (e) => {
    e.preventDefault();
    console.log("Planned tour pre-registration:", plannedForm);

    const whatsappText = `Toplu tatil organizasyonu ön kayıt talebi\n\n`
      + `Tur: ${tour.name} (${effectiveDuration})\n`
      + `Ad Soyad: ${plannedForm.name}\n`
      + `E-posta: ${plannedForm.email}\n`
      + `Telefon: ${plannedForm.phone}\n`
      + `Katılım tipi: ${plannedForm.participation}\n`
      + `Katılmak istenilen tur: ${plannedForm.tour}\n`
      + `Katılımcı sayısı: ${plannedForm.people}\n`
      + `Ek notlar: ${plannedForm.notes || "-"}`;

    if (WHATSAPP_NUMBER) {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
      openWhatsApp(url);
    } else {
      console.warn("VITE_WHATSAPP_NUMBER tanımlı değil.");
    }

    if (EMAILJS_TOURS_SERVICE_ID && EMAILJS_TOURS_TEMPLATE_ID_PLANNED && EMAILJS_TOURS_PUBLIC_KEY) {
      emailjs
        .send(
          EMAILJS_TOURS_SERVICE_ID,
          EMAILJS_TOURS_TEMPLATE_ID_PLANNED,
          {
            tour_name: tour.name,
            tour_duration: effectiveDuration,
            name: plannedForm.name,
            email: plannedForm.email,
            phone: plannedForm.phone,
            participation: plannedForm.participation,
            tour: plannedForm.tour,
            people: plannedForm.people,
            notes: plannedForm.notes,
          },
          EMAILJS_TOURS_PUBLIC_KEY,
        )
        .then(
          () => {
            console.log("EmailJS planned form başarıyla gönderildi");
          },
          (error) => {
            console.error("EmailJS planned form hata:", error);
          },
        );
    }
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    console.log("Group tour request:", groupForm);

    const resolvedBudget = groupForm.budget === "diger" && groupForm.budgetOther
      ? groupForm.budgetOther
      : groupForm.budget;

    const whatsappText = `Toplu tatil organizasyonu için grup teklif talebi\n\n`
      + `Referans rota / tatil: ${tour.name} (${effectiveDuration})\n`
      + `Ad Soyad: ${groupForm.name}\n`
      + `E-posta: ${groupForm.email}\n`
      + `Telefon: ${groupForm.phone}\n`
      + `Kurum / Grup adı: ${groupForm.organization || "-"}\n`
      + `Grup tipi: ${groupForm.groupType}\n`
      + `Planlanan tarihler: ${groupForm.dates}\n`
      + `Tahmini kişi sayısı: ${groupForm.people}\n`
      + `İlgilenilen bölgeler / rotalar: ${groupForm.routes || "-"}\n`
      + `Kişi başı bütçe: ${resolvedBudget || "-"}\n`
      + `Ek notlar: ${groupForm.notes || "-"}`;

    if (WHATSAPP_NUMBER) {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
      openWhatsApp(url);
    } else {
      console.warn("VITE_WHATSAPP_NUMBER tanımlı değil.");
    }

    if (EMAILJS_TOURS_SERVICE_ID && EMAILJS_TOURS_TEMPLATE_ID_GROUP && EMAILJS_TOURS_PUBLIC_KEY) {
      emailjs
        .send(
          EMAILJS_TOURS_SERVICE_ID,
          EMAILJS_TOURS_TEMPLATE_ID_GROUP,
          {
            tour_name: tour.name,
            tour_duration: effectiveDuration,
            name: groupForm.name,
            email: groupForm.email,
            phone: groupForm.phone,
            organization: groupForm.organization,
            group_type: groupForm.groupType,
            dates: groupForm.dates,
            people: groupForm.people,
            routes: groupForm.routes,
            budget: resolvedBudget,
            notes: groupForm.notes,
          },
          EMAILJS_TOURS_PUBLIC_KEY,
        )
        .then(
          () => {
            console.log("EmailJS group form başarıyla gönderildi");
          },
          (error) => {
            console.error("EmailJS group form hata:", error);
          },
        );
    }
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();

    if (!selectedDepositPackage || !depositPeopleCount || !adjustedDepositGrandTotal || !depositAmount) {
      console.warn("Kaporalı ön rezervasyon için eksik bilgi: paket, kişi sayısı veya tutarlar hesaplanamadı.");
      return;
    }

    // Uçak dahil seçildiyse ödeme öncesi zorunlu onay ekranını aç
    if (hasFlightLimit && depositForm.includeFlight) {
      setShowFlightConfirm(true);
      setFlightConfirmAccepted(false);
      return;
    }

    const reservationType = depositForm.reservationType === "full" ? "full" : "deposit";

    const extrasSummary = selectedExtrasList.length
      ? selectedExtrasList
          .map((extra) => `- ${extra.title || extra.id}`)
          .join("\n")
      : "Seçili opsiyonel ekstra aktivite yok.";

    const whatsappText =
      `Endonezya turu için ${
        reservationType === "full" ? "doğrudan kesin rezervasyon" : "kaporalı ön rezervasyon"
      } talebi\n\n`
      + `Tur: ${tour.name} - ${selectedDepositPackage.name}\n`
      + `Katılımcı sayısı: ${depositPeopleCount}\n`
      + `Tahmini paket toplamı: $${depositPackageTotal}\n`
      + `Seçilen opsiyonel aktiviteler:\n${extrasSummary}\n`
      + `Genel toplam (tahmini): $${adjustedDepositGrandTotal}\n`
      + (reservationType === "deposit"
        ? `Ödenmesi gereken kapora (tahmini): $${depositAmount}\n`
        : "")
      + `Ad Soyad: ${depositForm.name}\n`
      + `E-posta: ${depositForm.email}\n`
      + `Telefon: ${depositForm.phone}\n`
      + `Ek notlar: ${depositForm.notes || "-"}`;

    if (EMAILJS_TOURS_SERVICE_ID && EMAILJS_TOURS_TEMPLATE_ID_PLANNED && EMAILJS_TOURS_PUBLIC_KEY) {
      emailjs
        .send(
          EMAILJS_TOURS_SERVICE_ID,
          EMAILJS_TOURS_TEMPLATE_ID_PLANNED,
          {
            tour_name: tour.name,
            tour_duration: effectiveDuration,
            name: depositForm.name,
            email: depositForm.email,
            phone: depositForm.phone,
            participation:
              reservationType === "full"
                ? "dogrudan-kesin-rezervasyon"
                : "kaporali-on-rezervasyon",
            tour: `${tour.name} - ${selectedDepositPackage.name}`,
            people: String(depositPeopleCount),
            notes:
              (reservationType === "full"
                ? "Doğrudan kesin rezervasyon özeti:\n\n"
                : "Kaporalı ön rezervasyon özeti:\n\n") + whatsappText,
          },
          EMAILJS_TOURS_PUBLIC_KEY,
        )
        .then(
          () => {
            console.log("EmailJS deposit form başarıyla gönderildi");
          },
          (error) => {
            console.error("EmailJS deposit form hata:", error);
          },
        );
    }

      proceedToPayment();
  };

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-sky-50/40">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Tur bulunamadı</h1>
          <p className="text-gray-600 mb-6">Görmek istediğiniz tur paketi mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
          >
            Geri Dön
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Tur detay sayfası galerisi için admin panel override + fallback
  const MAX_GALLERY_IMAGES = 8;
  const galleryOverride = [];

  if (id) {
    for (let i = 0; i < MAX_GALLERY_IMAGES; i += 1) {
      const key = `${id}-tour-gallery-${i}`;
      if (imageUrls[key]) {
        galleryOverride.push(imageUrls[key]);
      }
    }
  }

  const galleryImages = galleryOverride.length > 0
    ? galleryOverride
    : tour.gallery || [];

  // İlgili tur için, serbest günlerdeki opsiyonel ekstra aktiviteleri rezervasyon alanında kullanmak üzere düz listeye çevir
  const baseOptionalExtras = Array.isArray(tour.itinerary)
    ? tour.itinerary.flatMap((day) =>
        Array.isArray(day.optionalExtras)
          ? day.optionalExtras.map((extra) => ({
              ...extra,
              day: day.day,
            }))
          : [],
      )
    : [];

  const selectedDepositPackage = hasPackages
    ? (packages.find((p) => p.id === depositForm.packageId) || packages.find((p) => p.level === "premium") || packages[0])
    : null;

  // Kaporalı rezervasyon hesabı için kişi sayısını sayıya çevir
  const depositPeopleCount = Math.max(0, Number(depositForm.people) || 0);

  // Seçilen paket fiyatını kişi sayısı ile çarparak toplam paket tutarını hesapla
  const depositPackageTotal = selectedDepositPackage?.computedPrice
    ? selectedDepositPackage.computedPrice * depositPeopleCount
    : 0;

  // Uçak bileti hariç seçilirse, tur için belirlenen uçak dahil limiti toplamdan düş
  const flightDeductionTotal = hasFlightLimit && !depositForm.includeFlight
    ? flightLimitPerPersonUsdRounded * depositPeopleCount
    : 0;
  const adjustedDepositPackageTotal = Math.max(0, depositPackageTotal - flightDeductionTotal);

  // Seçilen pakete göre, paket fiyatına dahil olmayan rehberli günleri de opsiyonel ekstra olarak sun
  // Şu an için opsiyonel ekstralar, tur programındaki tanımlı ekstralarla sınırlıdır.
  // (İleride Bali için paket seviyesine göre ekstra günler eklemek istenirse burası genişletilebilir.)
  const optionalExtras = baseOptionalExtras;

  const selectedExtrasList = optionalExtras.filter((extra) => depositForm.extras?.[extra.id]);
  let extrasTotalPerPerson = selectedExtrasList.reduce(
    (sum, extra) => sum + (Number(extra.estimatedPricePerPerson) || 0),
    0,
  );
  if (selectedDepositPackage && selectedDepositPackage.level === "premium") {
    extrasTotalPerPerson *= 0.75;
  }
  const extrasTotal = depositPeopleCount * extrasTotalPerPerson;
  const adjustedDepositGrandTotal = adjustedDepositPackageTotal + extrasTotal;
  const depositAmount = adjustedDepositGrandTotal > 0 ? Math.round((adjustedDepositGrandTotal * DEPOSIT_PERCENT) / 100) : 0;

  return (
    <div className="tour-detail-root min-h-screen bg-gradient-to-b from-white via-slate-50 to-sky-50/40">
      <Navigation />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-end overflow-hidden">
        {promoLabel && (
          <div className="absolute top-10 left-4 sm:left-10 z-20 flex items-center gap-3">
            <div className="flex flex-col gap-1 max-w-xs sm:max-w-sm">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-white/80 drop-shadow-md">
                Kampanya
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]">
                {promoLabel}
              </span>
              <span className="inline-flex w-fit text-[11px] sm:text-xs font-semibold text-white bg-red-600/95 px-3 py-1 rounded-full drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)] mt-1">
	            Erken rezervasyon indirimini kaçırmayın
              </span>
            </div>
            {hasDiscount && (
              <div className="transform -rotate-12">
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-lg sm:text-2xl font-extrabold shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
                    %{discountPercent}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <img
          src={heroImage}
          alt={tour.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{tour.name}</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl">{tour.summary}</p>

          {/* Kısa özet etiketleri: süre, konsept ve premium deneyim vurgusu */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm text-white/90">
            {effectiveDuration && (
              <span className="px-3 py-1 rounded-full bg-black/40 border border-white/20 backdrop-blur-[2px]">
                {effectiveDuration}
              </span>
            )}
            {tour.concept && (
              <span className="px-3 py-1 rounded-full bg-black/35 border border-white/15 backdrop-blur-[2px]">
                {tour.concept}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white border border-emerald-300/70 shadow-sm">
              Deneyim odaklı toplu tatil
            </span>
          </div>

          {/* Bali broşürü indirme bağlantısı – yalnızca Bali sayfasında göster */}
          {effectiveId === "bali" && (
            <div className="mt-6 space-y-1">
              <a
                href="/docs/bali-tatil-brosuru.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 text-sky-900 text-xs sm:text-sm font-semibold px-4 py-2 shadow-md shadow-black/40 hover:bg-white transition-colors"
              >
                <span className="text-base sm:text-lg">📄</span>
                <span>Bali tatil broşürünü aç / PDF olarak indir</span>
              </a>
              <p className="text-[11px] text-white/85 max-w-md">
	        Açılan sayfayı tarayıcınızda "Yazdır &gt; PDF olarak kaydet"
	        adımlarını izleyerek PDF olarak indirebilirsiniz.
              </p>
            </div>
          )}

          {/* Geri dön butonu: hero banner üzerinde sol alt köşe */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 bottom-6 inline-flex items-center gap-1 text-xs md:text-sm text-white bg-transparent px-0 py-0 hover:underline transition-colors"
          >
            <span>←</span>
            <span>Önceki sayfaya dön</span>
          </button>
        </div>
      </section>

      {/* Üst Bilgiler */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-2xl shadow p-5 flex items-start gap-3">
          <div className="mt-1 text-sky-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Süre & Konsept</h3>
            <p className="text-sm text-gray-800">{effectiveDuration}</p>
            {plannedDateRangeText && (
              <p className="mt-1 text-[11px] text-gray-700 font-semibold">
                Planlanan Tur Tarihleri: {plannedDateRangeText}
              </p>
            )}
            {tour.concept && (
              <p className="mt-1 inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                {tour.concept}
              </p>
            )}
            <ul className="mt-2 space-y-0.5 text-[11px] text-gray-700 list-disc list-inside">
              <li>Bu bir gezi turu değil, deneyim odaklı toplu tatil organizasyonudur.</li>
              <li>Odak; saray/tapınak listesi değil, gerçekten yaşanan aktiviteler ve deniz & doğa deneyimidir.</li>
              <li>Programda hem dolu dolu rehberli günler hem de özgürce değerlendirilebilen serbest zamanlar bulunur.</li>
              <li>Program boyunca seçili otellerde konaklama ve 7/24 ulaşılabilir Türkçe destek sağlanır.</li>
              <li>Sürpriz ödemeler yerine; hangi gün, hangi deneyim için ne ödediğiniz baştan yazılıdır.</li>
            </ul>
            <p className="text-[11px] text-gray-500 mt-1">
	      Not: Tüm paketlerde gidiş-dönüş uçak bileti, konaklama ve sabah kahvaltısı sabittir; konaklamalar iki kişilik paylaşımlı odalarda planlanır (çiftler veya aynı odada kalmak isteyen arkadaşlar birlikte yerleştirilir); aktivitelerin kapsamı ve dahil edilen günler seçtiğiniz paket seviyesine göre değişir.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 via-sky-50 to-white rounded-2xl shadow p-5">
  <p className="text-[11px] md:text-xs text-gray-600 mb-1">
    Herkesin huzurlu ve konforlu bir tatil geçirmesi için adrenalin ve eğlence dolu bir organizasyon hazırladık.
    Amacımız, misafirlerimizin "İyi ki bu tura katıldım" diyerek evlerine dönmesidir; bu tatil planında karşılıklı saygı,
    hoşgörü ve nezaket her zaman en ön planda tutulacaktır; herkesin tercihlerine uygun seçeneği seçebilmesi için üç farklı
    tatil seçeneğimiz aşağıdadır.
  </p>
  <p className="text-xs md:text-sm font-semibold text-gray-900 mb-2">Tur Paket Seçenekleri</p>
  <p className="text-xs md:text-sm text-gray-800 leading-relaxed">
    {isJava
      ? "Bu Java tatil turu yalnızca Premium paket olarak planlanmıştır. Temel ve Standart paket fiyatları 0 olarak gösterilir; bu paketler satışta değildir."
      : "Aynı rota için üç farklı seviye hazırladık: bütçe dostu Temel paket, dengeli Plus seçeneği ve bu sayfadaki detaylı programı referans alan Premium paket. Aşağıdaki kartlardan bütçe ve beklentinize en uygun olanı seçebilirsiniz; sayfadaki gün gün program Premium içindir, Temel ve Plus paketler bu programın sadeleştirilmiş hâlleridir. Tüm paketlerde, rota yapısına uygun seçili otel havuzu kullanılır; oda tipi, yemek kapsamı ve dahil edilen aktiviteler paket seviyesine göre değişir."}
  </p>
  </div>
          <div className="bg-gradient-to-br from-sky-600 to-emerald-500 rounded-2xl shadow p-5 text-white flex items-start gap-3">
            <div className="mt-1">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                {hasPackages
                  ? (isJava ? "Başlangıç Fiyatı – Premium Paket" : "Başlangıç Fiyatı – Temel Paket")
                  : "Başlangıç Fiyatı"}
              </h3>
              {startingPrice ? (
                <>
                  {hasDiscount ? (
                    <>
                      <p className="text-base font-semibold line-through text-red-200 mb-0.5">
                        ${hasPackages ? discountedPrice : basePrice}
                      </p>
                      <p className="text-3xl font-bold mb-1">
                        ${startingPrice}
                        <span className="text-xs font-normal ml-1 align-middle">
	                  {flightInclusionShortNote}
                        </span>
                      </p>
                      <p className="text-xs opacity-90">
                        {(() => {
                          const promoText = promoLabel ? promoLabel.trim() : "";
                          if (promoText) {
                            const hasPercentInText = /%\s*\d+/.test(promoText);
                            return hasPercentInText ? promoText : `${promoText} %${discountPercent}`;
                          }
                          return `Kişi başı, rezervasyonunu tamamlayan ilk 5 kişi için %${discountPercent} indirimli özel fiyattır.`;
                        })()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-bold mb-1">
                        ${startingPrice}
                        <span className="text-xs font-normal ml-1 align-middle">
	                  {flightInclusionShortNote}
                        </span>
                      </p>
                      <p className="text-xs opacity-90">
                        {hasPackages
                          ? "Kişi başı, en ekonomik paket başlangıç fiyatıdır."
                          : "Kişi başı, güncel paket fiyatıdır."}
                      </p>
                    </>
                  )}
				  {isSulawesi && (
				    <p className="text-[11px] opacity-90 mt-1">
				      Program kapsamındaki Endonezya iç hatlar uçuşları paket kapsamındadır, fiyata dahildir.
				    </p>
				  )}
                </>
              ) : (
                <p className="text-xs opacity-90">Fiyat bilgisi yakında güncellenecek.</p>
              )}
              <p className="text-[11px] opacity-90 mt-2">
                {isJava
                  ? "Bu sayfadaki gün gün program ve kapsam Premium paket içindir. Bu Java turu yalnızca Premium paket olarak planlanmıştır."
                  : "Bu sayfadaki gün gün program ve kapsam, Premium paket içindir. Temel ve Plus paketler, bu programın sadeleştirilmiş versiyonlarıdır."}
              </p>
              <p className="text-[11px] opacity-90 mt-1">
                Neden bu fiyat? Çünkü biz boş tur paketi değil, gerçek bir tatil deneyimi satıyoruz. Gereksiz bilgilerle doldurulmuş
                ve sadece "burada da fotoğraf çekelim" diye durulan klasik gezi turları mantığında değiliz; tekne turları, su
                aktiviteleri, doğa yürüyüşleri ve konforlu konaklamayı baştan pakete koyuyoruz. Buraya şehir şehir gezip sadece fotoğraf
                çekmek için değil, tatil yapmak için geliyorsanız doğru yerdesiniz; fiyat da tam olarak bu doluluk ve şeffaflık seviyesini
                yansıtır.
              </p>
            </div>
          </div>
        </div>
      </section>


      {hasPackages && (
  <section className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(isJava ? packages.filter((pkg) => pkg.level === "premium") : packages).map((pkg) => (
              <div
                key={pkg.id}
                className={[
                  "relative rounded-2xl border bg-slate-900 shadow-sm p-5 flex flex-col h-full overflow-hidden text-white",
                  pkg.level === "plus" ? "border-emerald-300/70 shadow-md" : "border-slate-700",
                ].join(" ")}
                style={
                  tour.name === "Bali Adası"
                    ? {
                        backgroundImage:
                          pkg.level === "premium"
                            ? "linear-gradient(to bottom right, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.55)), url('/bali-luxury-pool-villa.jpg')"
                            : pkg.level === "plus"
                            ? "linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5)), url('/bali-rice-terraces-green.jpg')"
                            : "linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5)), url('/bali-beach-seminyak-palm-trees.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <h3 className="mt-1 text-base md:text-lg font-semibold text-white mb-1">{pkg.name}</h3>
                {pkg.headline && (
                  <p className="text-xs md:text-sm text-slate-100/90 mb-3">
                    {pkg.headline}
                  </p>
                )}

                {typeof pkg.computedPrice === "number" && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-100/80">
	              {flightInclusionLongNote}
                    </p>
			    {isSulawesi && (
			      <p className="text-xs text-slate-100/90 mt-1">
			        Program kapsamındaki Endonezya iç hatlar uçuşları paket kapsamındadır, fiyata dahildir.
			      </p>
			    )}
                    <p className="text-2xl font-bold text-emerald-200">
                      ${pkg.computedPrice}
                    </p>
                    {hasDiscount && pkg.computedBasePrice && (
                      <p className="text-[11px] text-red-300 line-through">
                        ${pkg.computedBasePrice}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPackagesExpanded((prev) => !prev)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/60 text-[11px] font-medium text-white bg-white/20 hover:bg-white/25 transition-colors mb-2"
                >
                  {packagesExpanded ? "Paket detaylarını gizle" : "Tüm paket detaylarını göster"}
                  <span className="ml-1 text-xs">{packagesExpanded ? "−" : "+"}</span>
                </button>

                {packagesExpanded && (
                  <>
                    {Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
                      <ul className="mt-1 mb-3 space-y-1.5 text-xs md:text-sm text-slate-50">
                        {pkg.highlights.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span>{renderWithInclusionHighlight(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {pkg.level !== "premium" && (
                      <div className="mb-3 border-t border-dashed border-white/25 pt-2">
                        <p className="text-[11px] font-medium text-slate-50 mb-1">
                          Premium paket ile farkları
                        </p>
                        <ul className="space-y-1.5 text-[11px] text-slate-100/90">
                          {getPremiumDifferences(effectiveId, pkg.level).map((item) => (
                            <li key={item}>{renderWithInclusionHighlight(item)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pkg.notes && (
                      <p className="mt-auto text-[11px] text-slate-100/80 border-t border-white/20 pt-2">
                        {renderWithInclusionHighlight(pkg.notes)}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA ve buton altı açılan formlar (sayfanın üst kısmında) */}
      <section className="bg-gradient-to-r from-sky-600 to-emerald-500 py-10 md:py-12 relative overflow-hidden">
        {/* Bali / Lombok / Java / Sumatra / Komodo / Sulawesi sayfalarında, CTA arka planına tam yükseklik görseller bindir */}
        {(isBali || isLombok || isJava || isSumatra || isKomodo || isSulawesi) && (
          <div className="pointer-events-none absolute inset-0 z-0">
            {/* Üstten alta kadar sol tarafta dalış & mercan resifi görseli */}
            <div className="absolute inset-y-0 left-0 w-1/2 md:w-1/3 lg:w-1/4 opacity-95">
              <img
                src={
                  isJava
                    ? tour?.hero || tour?.image || "/placeholder.svg"
                    : isSulawesi
                      ? "/20160724_101830.jpg"
                    : isKomodo
                      ? "/vecteezy_ai-generated-woman-walking-on-the-beach-romantic_37348905.jpg"
                      : isSumatra
                        ? "/sumatra-rainforest-orangutan-lake-toba.jpg"
                    : isLombok
                      ? "/surya-bali-jet-ski-sanur.jpg"
                      : "https://res.cloudinary.com/dj1xg1c56/image/upload/v1767781298/vecteezy_diver-swimming-over-a-coral-reef-ai-generated_33502407_lsciky.jpg"
                }
                alt={
                  isJava
                    ? "Java - tur görseli"
                    : isSulawesi
                      ? "Sulawesi - tur görseli"
                    : isKomodo
                      ? "Komodo - sahil yürüyüşü"
                      : isSumatra
                        ? "Sumatra - yağmur ormanı"
                        : isLombok
                          ? "Lombok - su sporu"
                          : "Bali - dalış ve mercan resifi"
                }
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Üstten alta kadar sağ tarafta tekne / arkadaş grubu görseli */}
            <div className="absolute inset-y-0 right-0 w-1/2 md:w-1/3 lg:w-1/4 opacity-95">
              <img
                src={
                  isJava
                    ? (Array.isArray(tour?.gallery) && tour.gallery[1] ? tour.gallery[1] : tour?.hero || tour?.image || "/placeholder.svg")
                    : isSulawesi
                      ? "/22392be0-3624-49f7-ba42-3405352c5c8d.avif"
                    : isKomodo
                      ? "https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      : isSumatra
                        ? "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    : isLombok
                      ? "/lombok-island-beach-waterfall.jpg"
                      : "/three-happy-cheerful-european-people-having-lunch-board-yacht-drinking-champagne-spending-fantastic-time-together-friends-arranged-surprise-party-boat-b-day-girl.jpg"
                }
                alt={
                  isJava
                    ? "Java - tur görseli"
                    : isSulawesi
                      ? "Sulawesi - uçuş ağırlıklı rota"
                    : isKomodo
                      ? "Labuan Bajo - tekne manzarası"
                      : isSumatra
                        ? "Sumatra - Lake Toba"
                        : "Lombok - teknede kutlama ve arkadaş grubu"
                }
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 text-white relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {tour.name} tatil rezervasyonu
            </h2>
            <p className="text-sm md:text-base mb-6 text-white/90">
              Bu organizasyonu bireysel / ailenizle katılabildiğiniz bir toplu tatil olarak değerlendiriyor ya da kendi grubunuz
              için benzer bir rota talep etmek istiyorsanız, aşağıdaki butonlara tıklayarak formu açabilirsiniz. Formlar
              varsayılan olarak kapalıdır ve yalnızca ihtiyaç duyduğunuzda açılır.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 mb-4">
              <button
                type="button"
                onClick={() => setShowPlannedForm((prev) => !prev)}
                className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-white/80 bg-white/95 text-sky-700 font-medium text-xs md:text-sm hover:bg-white shadow-sm transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Bilgi almak istiyorum
              </button>
              <button
                type="button"
                onClick={() => setShowGroupForm((prev) => !prev)}
		className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-sky-200 bg-sky-600/95 text-white font-medium text-xs md:text-sm hover:bg-sky-700 shadow-sm transition-colors"
              >
                Grubum için bilgi / teklif
              </button>
              {hasPackages && (
                <button
                  type="button"
                  onClick={() => setShowDepositForm((prev) => !prev)}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-amber-200 bg-amber-50/95 text-amber-900 font-medium text-xs md:text-sm hover:bg-amber-100 shadow-sm transition-colors"
                >
                  Rezervasyon ve ödeme seçenekleri
                </button>
              )}
            </div>
          </div>

          {showPlannedForm && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <form
                onSubmit={handlePlannedSubmit}
                className="bg-white/95 text-left text-gray-900 rounded-2xl p-6 md:p-8 shadow space-y-6"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {tour.name} toplu tatil organizasyonu için bireysel / aile ön kayıt
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-4">
                  İletişim ve kontenjan uygunluğu için temel bilgilerinizi bırakın; size WhatsApp veya e-posta ile dönüş yapalım.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={plannedForm.name}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">E-posta *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={plannedForm.email}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Telefon *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={plannedForm.phone}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="+90 5xx xxx xx xx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Katılım Türü *</label>
                    <select
                      name="participation"
                      required
                      value={plannedForm.participation}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                    >
                      <option value="bireysel">Bireysel</option>
                      <option value="aile">Aile</option>
                      <option value="cift">Çift</option>
                      <option value="arkadas">Arkadaş grubu</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Katılmak İstenilen Tur *</label>
                    <input
                      type="text"
                      name="tour"
                      required
                      value={plannedForm.tour}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder={tour ? `${tour.name} - ${effectiveDuration}` : "Örn: Bali - 4 Gece 5 Gün"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Katılımcı Sayısı *</label>
                    <input
                      type="number"
                      name="people"
                      required
                      min="1"
                      value={plannedForm.people}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="Kaç kişi?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Ek Notlar</label>
                    <input
                      type="text"
                      name="notes"
                      value={plannedForm.notes}
                      onChange={handlePlannedChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="Özel talepleriniz, çocuk sayısı vb."
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-gray-700">
                  <input
                    type="checkbox"
                    name="privacy"
                    checked={plannedForm.privacy}
                    onChange={handlePlannedChange}
                    required
                    className="mt-1 h-4 w-4 border-gray-300 rounded"
                  />
                  <p>
                    <span>
                      Gizlilik politikasını okudum, kabul ediyorum ve paylaştığım bilgilerin yalnızca tur ön kayıt ve bilgilendirme
                      amacıyla kullanılmasını onaylıyorum.
                    </span>{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline font-semibold"
                    >
                      Gizlilik Politikası
                    </a>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2.5 rounded-full bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
                >
                  Ön Kayıt Talebimi Gönder
                </button>
              </form>

              <div className="bg-sky-900/40 border border-white/20 rounded-2xl p-5 md:p-6 text-xs md:text-sm leading-relaxed">
                <h3 className="text-base md:text-lg font-semibold mb-3 text-white">
                  Önemli Açıklamalar ve Uyarılar
                </h3>
                <p className="text-white/90 mb-3">
                  Aşağıdaki maddeler, tüm Endonezya tur paketlerimiz için genel bilgilendirme ve katılım kurallarını özetler. Detaylı
                  versiyonunu bu sayfanın devamında da bulabilirsiniz.
                </p>
                <ol className="list-decimal list-inside space-y-1.5 md:space-y-2 text-white text-[11px] md:text-xs">
                  <li>
                    Turlara son kayıt tarihi, tur başlangıç tarihinden <span className="font-semibold">en geç 10 gün öncesidir</span>.
                  </li>
                  <li>
                    Ön kayıttan sonra kesin kayıtlar için sözleşme onayı ve ödeme işleminin eksiksiz tamamlanmış olması gerekmektedir.
                  </li>
                  <li>
                    Tur rota planları ve aktiviteler, operasyonel sebepler ya da hava şartlarına bağlı olarak tarafımızca güncellenebilir.
                  </li>
                  <li>
                    Endonezya&apos;ya gelmeden önce seyahat sağlık sigortası yaptırılmasını <span className="font-semibold">tavsiye ederiz</span>.
                  </li>
                  <li>
                    Önemli bir sağlık sorununuz varsa lütfen başvuru formunu doldururken
                    <span className="font-semibold"> "Ek istekler"</span> bölümünde belirtiniz.
                  </li>
                  <li>
                    Tur programına kesin kayıt yaptıran misafirlerimizin tur kurallarına uyması ve bireysel hareket etmemesi beklenir.
                  </li>
                  <li>
                    Pasaportlarınızın, seyahat dönüş tarihinden sonra en az <span className="font-semibold">6 ay</span> geçerlilik süresi olmasına dikkat ediniz.
                  </li>
                  <li>
                    Endonezya devleti, Türk vatandaşları için vize uygulamasını kaldırmıştır; pasaportunuz, size göndereceğimiz otel rezervasyonunuz
                    ve uçak biletinizi göstermeniz giriş için yeterli olacaktır.
                  </li>
                  <li>
                    Vize ve ülkeye giriş kuralları, resmi makamların uygulamalarına bağlı olarak zaman içinde değişiklik gösterebilir.
                  </li>
                  <li>
                    Seyahatiniz boyunca, sizi havaalanına uğurlayana kadar her türlü istek, talep ve şikayetinizi grup için atanacak
                    rehberiniz vasıtasıyla bize iletebilirsiniz.
                  </li>
                  <li>
                    Seyahatinizin konforlu, güven içinde ve memnuniyet odaklı geçmesi bizim için son derece önemlidir.
                  </li>
                  <li>
                    Tura katılım sözleşmesini imzalayıp kesin kayıtlarını tamamlayan misafirlerimiz, bu sayfadaki tüm açıklama ve uyarıları
                    okumuş ve kabul etmiş sayılır.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {showDepositForm && hasPackages && (
            <form
              onSubmit={handleDepositSubmit}
              className="mt-8 max-w-3xl mx-auto bg-white/95 text-left text-gray-900 rounded-2xl p-6 md:p-8 shadow space-y-5"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Rezervasyon ve Ödeme Seçenekleri</h3>

              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Aşağıdaki alanlar, seçtiğiniz paket ve opsiyonel aktiviteler için <span className="font-semibold">toplam tur
                bedelini</span> gösterir. Sağ taraftaki "Rezervasyon türünü seçiniz" kutusundan, <span className="font-semibold">doğrudan kesin kayıt</span>
                ya da <span className="font-semibold">kaporalı ön rezervasyon</span> seçeneklerinden birini seçebilirsiniz. Seçiminize göre,
                sadece <span className="font-semibold">kapora tutarı</span> veya <span className="font-semibold">toplam tur bedeli</span> esas alınır.
              </p>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Bu ekranda gördüğünüz tutar, seçtiğiniz seçeneklere göre hesaplanan ödeme tutarıdır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Paket Seçimi *</label>
                  <select
                    name="packageId"
                    required
                    value={depositForm.packageId}
                    onChange={handleDepositChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                      {(isJava ? packages.filter((pkg) => pkg.level === "premium") : packages).map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (kişi başı: ${pkg.computedPrice})
                      </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Rezervasyon Türünü Seçiniz *</label>
                  <select
                    name="reservationType"
                    required
                    value={depositForm.reservationType}
                    onChange={handleDepositChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    <option value="full">Doğrudan kesin kayıt (toplam bedel)</option>
                    <option value="deposit">Kaporalı ön rezervasyon (kısmi ödeme)</option>
                  </select>
                </div>
              </div>

              {hasFlightLimit && !isJava && (
                <div className="border border-dashed border-slate-200 rounded-xl p-3 md:p-4 bg-slate-50">
                  <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-800">
                    <input
                      type="checkbox"
                      name="includeFlight"
                      checked={!!depositForm.includeFlight}
                      onChange={handleDepositChange}
                      className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                    />
                    <span>
                      <span className="font-semibold">Uçak bileti dahil</span>
                      <span className="text-gray-600"> (kişi başı ${flightLimitPerPersonUsdRounded}’a kadar)</span>
                    </span>
                  </label>
                  <p className="text-[11px] md:text-xs text-gray-600 mt-1">
                    Uçak bileti hariç bırakılırsa, kişi başı ${flightLimitPerPersonUsdRounded} toplam bedelden düşülür ve ödeme ekranına
                    direkt yönlendirilirsiniz.
                  </p>
                </div>
              )}

              {optionalExtras.length > 0 && (
                <div className="border border-dashed border-amber-200 rounded-xl p-3 md:p-4 bg-amber-50/60">
                  <p className="text-xs md:text-sm font-semibold text-amber-900 mb-2">Opsiyonel Ekstra Aktiviteler</p>
                  <p className="text-[11px] md:text-xs text-amber-900/90 mb-3">
                    Aşağıdaki aktiviteler paket fiyatına <span className="font-semibold">dahil değildir ✕</span>; katılım
                    gösterdiğiniz kadar ekstra ücretlendirilir. Fiyatlar, kişi başı ortalama değerlerdir.
                  </p>
                  <div className="space-y-2">
                    {optionalExtras.map((extra) => {
                      const est = Number(extra.estimatedPricePerPerson) || 0;
                      const checked = !!depositForm.extras?.[extra.id];
                      const isPremiumPackage = selectedDepositPackage && selectedDepositPackage.level === "premium";
                      const discountedEst = est > 0 && isPremiumPackage ? Math.round(est * 0.75) : est;
                      const displayValue = discountedEst;
                      return (
                        <label
                          key={extra.id}
                          className="flex items-start gap-2 text-[11px] md:text-xs text-gray-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleDepositExtraToggle(extra.id)}
                            className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                          />
                          <span>
                            <span className="font-semibold">{extra.title}</span>{" "}
                            <span className="text-gray-600">
                              {est > 0 ? (
                                checked ? (
                                  `(bugüne özel kişi başı ${displayValue} USD)`
                                ) : isPremiumPackage ? (
                                  `(tahmini kişi başı ${displayValue} USD, Premium paket için yaklaşık %25 indirimli)`
                                ) : (
                                  `(tahmini kişi başı ${est} USD)`
                                )
                              ) : (
                                `(tahmini fiyat için lütfen bizimle iletişime geçin)`
                              )}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-xs md:text-sm text-gray-800">
                  <h4 className="font-semibold text-gray-900">Tahmini Tutar Özeti</h4>
                  <p>
                    Paket toplamı (tüm katılımcılar):
                    <span className="font-semibold ml-1">${adjustedDepositPackageTotal || 0}</span>
                  </p>
                  {hasFlightLimit && !depositForm.includeFlight && (
                    <p className="text-[11px] md:text-xs text-emerald-700">
                      Uçak bileti hariç seçildi:
                      <span className="font-semibold ml-1">−${flightDeductionTotal || 0}</span>
                    </p>
                  )}
                  <p>
                    Seçilen opsiyonel aktiviteler (toplam):
                    <span className="font-semibold ml-1">${extrasTotal || 0}</span>
                  </p>
                  <p>
                    Genel toplam:
                    <span className="font-semibold ml-1">${adjustedDepositGrandTotal || 0}</span>
                  </p>
                  {depositForm.reservationType === "deposit" && (
                    <>
                      <p>
                        Kapora oranı:
                        <span className="font-semibold ml-1">%{DEPOSIT_PERCENT}</span>
                      </p>
                      <p>
                        Ödenmesi gereken kapora (tahmini):
                        <span className="font-semibold ml-1">${depositAmount || 0}</span>
                      </p>
                    </>
                  )}
                  {depositForm.reservationType === "full" && (
                    <p>
                      Ödenmesi gereken toplam tur bedeli:
                      <span className="font-semibold ml-1">${adjustedDepositGrandTotal || 0}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 mt-1">
                    Not: Opsiyonel aktiviteler için belirtilen kişi başı tutarlar ortalama değerlerdir.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">Ad Soyad *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={depositForm.name}
                        onChange={handleDepositChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1">E-posta *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={depositForm.email}
                          onChange={handleDepositChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                          placeholder="ornek@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1">Telefon *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={depositForm.phone}
                          onChange={handleDepositChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                          placeholder="+90 5xx xxx xx xx"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">Katılımcı Sayısı *</label>
                      <input
                        type="number"
                        name="people"
                        required
                        min="1"
                        value={depositForm.people}
                        onChange={handleDepositChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                        placeholder="Kaç kişi?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">Ek Notlar</label>
                      <input
                        type="text"
                        name="notes"
                        value={depositForm.notes}
                        onChange={handleDepositChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                        placeholder="Uçuş şehriniz, özel talepleriniz vb."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-[11px] md:text-xs text-gray-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptScope"
                    checked={depositForm.acceptScope}
                    onChange={handleDepositChange}
                    required
                    className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                  />
                  <span>
                    Bu tur için sayfada açıklanan paket kapsamını ve
                    {" "}
                    <a
                      href="#pricing-details"
                      className="text-sky-600 underline font-semibold"
                    >
                      "Fiyata Dahil Olanlar / Olmayanlar" bölümünü
                    </a>
                    {" "}
                    okudum, anladım ve kabul ediyorum.
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptExtras"
                    checked={depositForm.acceptExtras}
                    onChange={handleDepositChange}
                    required
                    className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                  />
                  <span>
                    Seçtiğim opsiyonel aktivitelerin paket fiyatına <span className="font-semibold">dahil olmadığını ✕</span> ve katılım
                    gösterdiğim kadar ayrıca ücretlendirileceğini biliyorum; burada gösterilen tutarların tahmini olduğunu ve tur kuralları ile
                    önemli açıklamaları okuduğumu ve kabul ettiğimi onaylıyorum.
                  </span>
                </label>
      <p className="mt-1 text-[11px] text-gray-600">
        Tur kuralları ve önemli açıklamaları ayrı bir sayfada görmek için
        {" "}
        <a
          href="#tour-rules"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 underline font-semibold"
        >
          buraya tıklayabilirsiniz
        </a>
        .
      </p>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptContract"
                    checked={depositForm.acceptContract}
                    onChange={handleDepositChange}
                    required
                    className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                  />
                  <span>
                    Kaporalı ön rezervasyon talebim kapsamında,
                    {" "}
                    <a
                      href="/docs/bali-tatil-teklifi.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 underline font-semibold"
                    >
                      güncel teklif ve ön bilgilendirme dokümanını (PDF)
                    </a>
                    {" "}
                    ile
                    {" "}
                    <a
                      href="/docs/on-bilgilendirme-formu.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 underline font-semibold"
                    >
                      ön bilgilendirme formunu
                    </a>
                    {" "}
                    ve
                    {" "}
                    <a
                      href="/docs/paket-tur-sozlesmesi.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 underline font-semibold"
                    >
                      paket tur sözleşmesi taslağını (PDF)
                    </a>
                    {" "}
                    inceleyeceğimi, kesin kayıt aşamasında tarafıma iletilecek imzalı nüshaların esas olacağını ve kapora ödemesinin bu
                    sözleşmelerle birlikte geçerlilik kazanacağını kabul ediyorum.
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptKvkk"
                    checked={depositForm.acceptKvkk}
                    onChange={handleDepositChange}
                    required
                    className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                  />
                  <span>
                    Kişisel verilerimin işlenmesine ilişkin
                    {" "}
                    <a
                      href="/docs/kvkk-aydinlatma-metni.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 underline font-semibold"
                    >
                      KVKK Aydınlatma Metni'ni (PDF)
                    </a>
                    {" "}
                    okudum; iletişim ve tekliflendirme amacıyla kullanılmasını onaylıyorum.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 rounded-full bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 transition-colors"
              >
                Rezervasyonu tamamla
              </button>
            </form>
          )}

          {showDepositForm && showFlightConfirm && hasFlightLimit && !isJava && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 md:p-6">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  Uçak bileti dahil kapsam onayı
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Seçtiğiniz pakette, uçak bileti kişi başı <span className="font-semibold">${flightLimitPerPersonUsdRounded}</span>’a kadar
                  fiyatlara dahildir. Bilet kesim tarihinde, uçuş firmasının resmi satış fiyatları esas alınır. Belirtilen tutarın üzerindeki
                  fark katılımcı tarafından ayrıca ödenir.
                </p>

                <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-800 mb-4">
                  <input
                    type="checkbox"
                    checked={flightConfirmAccepted}
                    onChange={(e) => setFlightConfirmAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                  />
                  <span>Okudum, anladım ve onaylıyorum.</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={closeFlightConfirm}
                    className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Geri dön
                  </button>
                  <button
                    type="button"
                    disabled={!flightConfirmAccepted}
                    onClick={() => {
                      closeFlightConfirm();
                      proceedToPayment();
                    }}
                    className="px-5 py-2 rounded-full bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    Ödemeye devam et
                  </button>
                </div>
              </div>
            </div>
          )}

          {showGroupForm && (
            <form
              onSubmit={handleGroupSubmit}
              className="mt-8 max-w-3xl mx-auto bg-white/95 text-left text-gray-900 rounded-2xl p-6 md:p-8 shadow space-y-6"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {tour.name} rotasına benzer özel grup tatili / organizasyonu talebi
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Şirket, okul, dernek veya arkadaş grubunuz için kişi sayısı ve tarih bilgilerini paylaşın; bu rota etrafında size özel
                bir program ve fiyatlandırma hazırlayalım.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={groupForm.name}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">E-posta *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={groupForm.email}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="ornek@kurum.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={groupForm.phone}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Kurum / Grup Adı</label>
                  <input
                    type="text"
                    name="organization"
                    value={groupForm.organization}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Şirket, okul, dernek veya grup adı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Grup Tipi *</label>
                  <select
                    name="groupType"
                    required
                    value={groupForm.groupType}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">Grubunuzu seçiniz</option>
                    <option value="company">Şirket / Kurumsal ekip</option>
                    <option value="school">Okul / Üniversite grubu</option>
                    <option value="association">Dernek / Topluluk</option>
                    <option value="friends">Arkadaş grubu</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Tahmini Kişi Sayısı *</label>
                  <input
                    type="number"
                    name="people"
                    required
                    min="5"
                    value={groupForm.people}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Örn: 15-25 kişi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Planlanan Tarihler *</label>
                  <input
                    type="text"
                    name="dates"
                    required
                    value={groupForm.dates}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Örn: Haziran 2025, 7-10 gün"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">İlgilendiğiniz Bölgeler / Rotalar</label>
                  <input
                    type="text"
                    name="routes"
                    value={groupForm.routes}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Örn: Bali + Nusa, Bali + Lombok, Endonezya adaları"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Kişi Başı Bütçe Aralığı</label>
                  <select
                    name="budget"
                    value={groupForm.budget}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">Bütçe seçiniz</option>
                    <option value="1500-2000$">1500-2000$</option>
                    <option value="2000-2500$">2000-2500$</option>
                    <option value="3000-4500$">3000-4500$</option>
                    <option value="5000+">5000$ ve üzeri</option>
                    <option value="diger">Diğer (elle yazmak istiyorum)</option>
                  </select>
                  {groupForm.budget === "diger" && (
                    <>
                      <label className="block text-xs font-semibold text-gray-800 mb-1 mt-3">Diğer Bütçe (Kişi Başı)</label>
                      <input
                        type="text"
                        name="budgetOther"
                        value={groupForm.budgetOther}
                        onChange={handleGroupChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Örn: 2500-3000$, maksimum 3500$ vb."
                      />
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Ek Notlar</label>
                  <input
                    type="text"
                    name="notes"
                    value={groupForm.notes}
                    onChange={handleGroupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Özel etkinlikler, sunumlar, talepler vb."
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-gray-700">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={groupForm.privacy}
                  onChange={handleGroupChange}
                  required
                  className="mt-1 h-4 w-4 border-gray-300 rounded"
                />
                <span>
                  Gizlilik politikasını kabul ediyorum ve paylaştığım bilgilerin yalnızca grup tur tekliflendirmesi ve iletişim amacıyla
                  kullanılmasını onaylıyorum.
                </span>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Grup Tur Teklif Talebimi Gönder
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Tur Programı – Gün Gün Akış */}
      <section id="tour-rules" className="w-full px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 max-w-6xl mr-auto">
          Tur Programı – Gün Gün Akış
        </h2>
        <div className="space-y-5">
          {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 ? (
            tour.itinerary.map((day) => {
            const maxItineraryDay = Array.isArray(tour.itinerary)
              ? Math.max(...tour.itinerary.map((d) => Number(d?.day) || 0))
              : 0;
            const dayBgKey = id ? `${id}-itinerary-day-${day.day}` : "";
            const dayBgKeyEffective = effectiveId ? `${effectiveId}-itinerary-day-${day.day}` : "";
            const dayBgOverride = (dayBgKey && imageUrls[dayBgKey])
              ? imageUrls[dayBgKey]
              : (dayBgKeyEffective && imageUrls[dayBgKeyEffective])
                ? imageUrls[dayBgKeyEffective]
                : null;
            const dayBgImage = dayBgOverride
              ? dayBgOverride
              : "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1200";

            const normalizedDayTitle = (day.title || "").toLowerCase();
            const isExplicitGuidedDay = normalizedDayTitle.includes("rehberli");
            const isEdgeDay = (Number(day.day) || 0) === 1 || (Number(day.day) || 0) === maxItineraryDay;

            const isFreeDay =
              normalizedDayTitle.includes("serbest gün") ||
              normalizedDayTitle.includes("serbest gun") ||
              normalizedDayTitle.includes("tam gün serbest") ||
              normalizedDayTitle.includes("tam gun serbest") ||
              ((effectiveId === "lombok" && (day.day === 1 || day.day === 7)) || (isEdgeDay && !isExplicitGuidedDay));

            // Serbest günler: sade, açık renk kart
            if (isFreeDay) {
              // Her serbest gün kartını sağa doğru uzat, soluna görsel yerleştir
              const freeDayImages = [
                "/vecteezy_two-men-riding-jet-skis-side-by-side-on-the-water-concept_68431320.jpg",
                "/vecteezy_luxurious-yacht-anchored-in-a-tropical-paradise-under-a-clear_73309259.jpeg",
                "/young-slim-woman-sitting-bikini-bathing-suit-yacht-basking-sun.jpg",
              ];
              const freeImageIndex = day.day % freeDayImages.length;
              const freeImageSrc = dayBgOverride || freeDayImages[freeImageIndex];

              return (
                <div key={day.day} className="relative w-full">
                  {/* Sol tarafta görsel alanı – kartın üst ve alt noktalarıyla hizalı */}
                  <div className="hidden md:block absolute inset-y-0 left-4 md:left-4 w-52 lg:left-8 lg:w-56 rounded-none overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
                    <img
                      src={freeImageSrc}
                      alt={`${day.title} için görsel`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Asıl serbest gün kartı – geniş alan kaplasın diye sağa doğru uzatıldı */}
                  <div className="rounded-lg bg-slate-50 text-slate-900 shadow-sm border border-slate-200 p-4 md:p-5 flex gap-4 md:gap-6 ml-0 md:ml-56 lg:ml-64 mr-0 md:mr-6 lg:mr-10">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center text-xs md:text-sm font-semibold shadow">
                        {day.day}. Gün
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
                        <div className="md:flex-1">
                          <h3 className="font-semibold text-base md:text-lg mb-2 text-slate-900">{day.title}</h3>
                          <ul className="space-y-1.5 mb-1 text-sm text-slate-700">
                            {day.activities.map((activity, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                <span>{renderWithInclusionHighlight(activity)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {Array.isArray(day.optionalExtras) && day.optionalExtras.length > 0 && (
                          <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
                            {day.optionalExtras.map((extra) => {
                              const extraKey = `${day.day}-${extra.id}`;
                              const isOpen = openOptionalExtraId === extraKey;
                              return (
                                <div
                                  key={extra.id}
                                  data-optional-extra-card
                                  className="bg-white rounded-lg border border-slate-200 p-3 text-xs md:text-sm shadow-sm"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenOptionalExtraId((prev) => (prev === extraKey ? null : extraKey))
                                    }
                                    className="w-full text-left flex items-center justify-between gap-2"
                                  >
                                    <div>
                                      <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800 mb-1">
                                        Opsiyonel Ekstra Aktivite (Ücretli)
                                      </p>
                                      <p className="font-semibold leading-snug text-slate-900">
                                        {extra.title}
                                      </p>
                                      {extra.shortDescription && (
                                        <p className="text-[11px] text-slate-600 mt-0.5">
                                          {extra.shortDescription}
                                        </p>
                                      )}
                                      <p className="text-[10px] text-rose-600 mt-1">
                                        {isOpen
                                          ? "Detayları kapatmak için tekrar tıklayabilirsiniz."
                                          : "Detayları görmek için karta tıklayabilirsiniz."}
                                      </p>
                                    </div>
                                    <span className="text-base font-semibold text-emerald-700">
                                      {isOpen ? "−" : "+"}
                                    </span>
                                  </button>

                                  {isOpen && (
                                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                                      {extra.priceNote && (
                                        <p className="text-[11px] font-semibold text-emerald-800">
                                          {renderWithInclusionHighlight(extra.priceNote)}
                                        </p>
                                      )}
                                      {Array.isArray(extra.details) && extra.details.length > 0 && (
                                        <ul className="space-y-1.5 text-[11px] text-slate-700">
                                          {extra.details.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                              <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                                              <span>{renderWithInclusionHighlight(item)}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                      {extra.note && (
                                        <p className="text-[10px] text-slate-600">
                                          {renderWithInclusionHighlight(extra.note)}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Diğer günler: yalnızca program kartı (rehberli gün)
            return (
              <div key={day.day} className="relative w-full">
                {/* Rehberli gün kartı – masaüstünde sağdan sayfa bitişine kadar uzar */}
                <div className="relative overflow-hidden rounded-lg bg-slate-300 text-slate-900 shadow-sm border border-slate-400 p-4 md:p-5 md:pr-[18rem] lg:pr-[22rem] flex gap-4 md:gap-6 ml-0 md:ml-0 lg:ml-0 mr-0 md:mr-[150px]">
                  {/* Sağ tarafta arka plan görseli (rehberli gün kartının üstünde) */}
                  <div className="pointer-events-none hidden md:block absolute inset-y-0 right-0 md:w-[18rem] lg:w-[22rem] z-20">
                    <img
                      src={dayBgImage}
                      alt=""
                      className="w-full h-full object-cover -translate-x-[40px]"
                      loading="lazy"
                    />
                  </div>

                  <div className="relative z-10 w-full flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center text-[13px] md:text-sm font-semibold shadow-lg">
                      {day.day}. Gün
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
                      <div className="md:flex-1">
                        <h3 className="font-semibold text-lg md:text-xl mb-2">{day.title}</h3>
                        <ul className="space-y-1.5 mb-1">
                          {day.activities.map((activity, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                              <span>{renderWithInclusionHighlight(activity)}</span>
                            </li>
                          ))}
                        </ul>
                        </div>
                      </div>

                      {Array.isArray(day.optionalExtras) && day.optionalExtras.length > 0 && (
                        <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
                          {day.optionalExtras.map((extra) => {
                            const extraKey = `${day.day}-${extra.id}`;
                            const isOpen = openOptionalExtraId === extraKey;
                            return (
                              <div
                                key={extra.id}
                                data-optional-extra-card
                                className="bg-white rounded-lg border border-slate-200 p-3 text-xs md:text-sm shadow-sm"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenOptionalExtraId((prev) => (prev === extraKey ? null : extraKey))
                                  }
                                  className="w-full text-left flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800 mb-1">
                                      Opsiyonel Ekstra Aktivite (Ücretli)
                                    </p>
                                    <p className="font-semibold leading-snug text-slate-900">
                                      {extra.title}
                                    </p>
                                    {extra.shortDescription && (
                                      <p className="text-[11px] text-slate-600 mt-0.5">
                                        {extra.shortDescription}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-rose-600 mt-1">
                                      {isOpen
                                        ? "Detayları kapatmak için tekrar tıklayabilirsiniz."
                                        : "Detayları görmek için karta tıklayabilirsiniz."}
                                    </p>
                                  </div>
                                  <span className="text-base font-semibold text-emerald-700">
                                    {isOpen ? "−" : "+"}
                                  </span>
                                </button>

                                {isOpen && (
                                  <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                                    {extra.priceNote && (
                                      <p className="text-[11px] font-semibold text-emerald-800">
                                        {renderWithInclusionHighlight(extra.priceNote)}
                                      </p>
                                    )}
                                    {Array.isArray(extra.details) && extra.details.length > 0 && (
                                      <ul className="space-y-1.5 text-[11px] text-slate-700">
                                        {extra.details.map((item, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                                            <span>{renderWithInclusionHighlight(item)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {extra.note && (
                                      <p className="text-[10px] text-slate-600">
                                        {renderWithInclusionHighlight(extra.note)}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          ) : (
            <p className="text-sm text-gray-600">
              Bu tur için detaylı günlük program henüz eklenmedi.
            </p>
          )}
        </div>
      </section>

      {/* Tur Kapsamı ve Hizmet Yaklaşımı (varsa) */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Tur Kapsamı ve Hizmet Yaklaşımı</h2>
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-sky-500/10 border border-emerald-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-1">
              Bu tur deneyim odaklı bir premium pakettir
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              Bu rota, “sadece yer gösteren” klasik turlardan farklı olarak gün gün akışı netleşmiş bir deneyim planına göre kurgulanır. Rehberli günlerde en güçlü anları (tekne/milli park/orman rotaları gibi) sizin için kilitler, lojistiği biz yönetiriz. Serbest zaman bloklarında ise acele ettirmeden dinlenmenize ve şehri/denizi kendi ritminizde keşfetmenize alan açar; isterseniz kalan zamana göre opsiyonel deneyimler de eklenebilir.
            </p>
          </div>

          {((tour.notes && tour.notes.approach) || (!tour.notes && true)) && (
            <p className="text-sm text-gray-700 mb-4">
              {renderWithInclusionHighlight(
                tour.notes?.approach ||
                  "Bu sayfadaki içerik, seçilen paket seviyesine göre uyarlanabilen bir tur akışını temsil eder. Net kapsam ve operasyon detayları rezervasyon öncesinde yazılı olarak paylaşılır."
              )}
            </p>
          )}

          <div id="pricing-details" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {(Array.isArray(tour.included) ? tour.included.length > 0 : true) && (
              <div className="rounded-2xl shadow-sm border border-emerald-300 p-5 bg-gradient-to-br from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold mb-3 text-white">Fiyata Dahil Olanlar</h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-white/95">
                  {(Array.isArray(tour.included)
                    ? tour.included
                    : [
                        "Tur akışı ve operasyon planlaması",
                        "Programda belirtilen ana rota ve temel koordinasyon",
                        "Rezervasyon sürecinde yazılı olarak netleştirilen hizmet kapsamı",
                      ]
                  ).map((item, idx) => (
                    <li key={idx}>{renderWithInclusionHighlight(item)}</li>
                  ))}
                </ul>
              </div>
            )}
            {(Array.isArray(tour.notIncluded) ? tour.notIncluded.length > 0 : true) && (
              <div className="rounded-2xl shadow-sm border border-rose-300 p-5 bg-gradient-to-br from-rose-600 to-rose-500">
                <h3 className="text-lg font-semibold mb-3 text-white">Fiyata Dahil Olmayanlar</h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-white/95">
                  {(Array.isArray(tour.notIncluded)
                    ? tour.notIncluded
                    : [
                        "Kişisel harcamalar ve bireysel tercihler",
                        "Programda yer alsa bile seçime bağlı opsiyonel deneyimler",
                        "Resmi vergiler/harçlar (varsa) ve yurtdışı çıkış harcı",
                      ]
                  ).map((item, idx) => (
                    <li key={idx}>{renderWithInclusionHighlight(item)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {((tour.notes && (tour.notes.freeTime || tour.notes.discipline)) || !tour.notes) && (
            <div className="space-y-4">
              {(tour.notes?.freeTime || !tour.notes) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Serbest Zaman Yaklaşımımız</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {renderWithInclusionHighlight(
                      tour.notes?.freeTime ||
                        "Serbest zaman dilimleri, katılımcıların kendi ritmi ve tercihleriyle hareket edebilmesi için esnek bırakılır. Dilerseniz bu zamanlara opsiyonel aktiviteler eklenebilir."
                    )}
                  </p>
                </div>
              )}
              {(tour.notes?.discipline || !tour.notes) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Grup Disiplini ve Uyum</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {renderWithInclusionHighlight(
                      tour.notes?.discipline ||
                        "Programın sağlıklı ilerlemesi için zamanlamaya uyum ve grup düzenine saygı esastır. Güvenlik brifingleri ve rehber yönlendirmelerine uyulması beklenir."
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

      {/* Önemli Açıklamalar & Uyarılar (açılır/kapanır) */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <button
          type="button"
          onClick={() => setShowImportantNotes((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-slate-50 transition-colors"
        >
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-0.5">Önemli Açıklamalar ve Uyarılar</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {showImportantNotes
                ? "Tüm önemli açıklamaları aşağıda görebilirsiniz."
                : "Tüm tur paketlerimiz için geçerli genel bilgilendirme ve katılım kurallarının özetini görmek için tıklayın."}
            </p>
          </div>
          <span className="text-lg md:text-xl text-slate-500">
            {showImportantNotes ? "−" : "+"}
          </span>
        </button>

        {showImportantNotes && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              Aşağıdaki maddeler, tüm Endonezya tur paketlerimiz için genel bilgilendirme ve katılım kurallarını özetler.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800 leading-relaxed">
              <li>
                Turlara son kayıt tarihi, tur başlangıç tarihinden <span className="font-semibold text-rose-600">en geç 10 gün öncesidir</span>.
              </li>
              <li>
                Ön kayıttan sonra kesin kayıtlar için sözleşme onayı ve ödeme işleminin eksiksiz tamamlanmış olması gerekmektedir.
              </li>
              <li>
                Tur rota planları ve aktiviteler, operasyonel sebepler ya da hava şartlarına bağlı olarak tarafımızca güncellenebilir.
              </li>
                    <li>
                      Uçak biletleri; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete dahildir;
                      belirtilen tutarı aşan fiyat farkı katılımcı tarafından ayrıca karşılanır.
                    </li>
              <li>
                Endonezya&apos;ya gelmeden önce seyahat sağlık sigortası yaptırılmasını <span className="font-semibold text-rose-600">tavsiye ederiz</span>.
              </li>
              <li>
                Önemli bir sağlık sorununuz varsa lütfen başvuru formunu doldururken <span className="font-semibold">"Ek istekler"</span> bölümünde belirtiniz.
              </li>
              <li>
                Tur programına kesin kayıt yaptıran misafirlerimizin tur kurallarına uyması ve bireysel hareket etmemesi beklenir.
              </li>
              <li>
                Pasaportlarınızın, seyahat dönüş tarihinden sonra en az <span className="font-semibold text-rose-600">6 ay</span> geçerlilik süresi olmasına dikkat ediniz.
              </li>
              <li>
                Endonezya devleti, Türk vatandaşları için vize uygulamasını kaldırmıştır; pasaportunuz, size göndereceğimiz otel rezervasyonunuz
                ve uçak biletinizi göstermeniz giriş için yeterli olacaktır.
              </li>
              <li>
                Vize ve ülkeye giriş kuralları, resmi makamların uygulamalarına bağlı olarak zaman içinde değişiklik gösterebilir.
              </li>
              <li>
                Seyahatiniz boyunca, sizi havaalanına uğurlayana kadar her türlü istek, talep ve şikayetinizi grup için atanacak
                rehberiniz vasıtasıyla bize iletebilirsiniz.
              </li>
              <li>
                Seyahatinizin konforlu, güven içinde ve memnuniyet odaklı geçmesi bizim için son derece önemlidir.
              </li>
              <li>
                Tura katılım sözleşmesini imzalayıp kesin kayıtlarını tamamlayan misafirlerimiz, bu sayfadaki tüm açıklama ve uyarıları
                okumuş ve kabul etmiş sayılır.
              </li>
            </ol>
          </div>
        )}
      </section>

      {/* Güven Bloğu ve Kısa Yorumlar */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 bg-gradient-to-br from-emerald-600/10 to-sky-500/10 border border-emerald-100 rounded-2xl p-5">
            <h2 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Neden Endonezya Kaşifi?</h2>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>Endonezya&apos;da yaşayan ve bölgeyi yakından tanıyan yerel operasyon ekibi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>Sürpriz masraf yerine; fiyata dahil olan ve olmayan hizmetlerin şeffaf şekilde belirtilmesi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>Deneyim odaklı, gün boyu dolu programlar ve bilinçli bırakılan serbest zamanlar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>Küçük grup veya butik yaklaşım ile daha sakin ve kişisel bir tatil deneyimi</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
              <p className="text-sm text-gray-800 mb-3">
                “Program boyunca hem dolu dolu gezdik, hem de serbest zamanlarda kendi ritmimizi yakalayabildik. Önceden şeffaf
                şekilde anlatılan &quot;dahil / hariç&quot; listesi sayesinde tatil sırasında hiçbir sürpriz masraf ile karşılaşmadık.”
              </p>
              <div className="text-xs text-gray-600">
                <p className="font-semibold">Bali Turu Katılımcısı</p>
                <p>Çift olarak katılım · 2024</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
              <p className="text-sm text-gray-800 mb-3">
                “Yerel ekip sayesinde restoran, kahve ve surf spotları konusunda çok nokta atışı öneriler aldık. WhatsApp üzerinden
                hızlıca sorularımıza yanıt alabildiğimiz için kendimizi tur boyunca güvende hissettik.”
              </p>
              <div className="text-xs text-gray-600">
                <p className="font-semibold">Endonezya Kaşifi Misafiri</p>
                <p>Arkadaş grubu · 2023</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ada hakkında */}
      {tour.about && (
        <section className="bg-white/80 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">Ada Hakkında</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-sky-700">Doğa</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{tour.about.nature}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-sky-700">Kültür</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{tour.about.culture}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-sky-700">Yaşam Tarzı</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{tour.about.lifestyle}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rotalar & Ziyaret Noktaları */}
      <section className="py-16 bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">Rotalar & Ziyaret Noktaları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.isArray(tour.routes) && tour.routes.length > 0 ? (
              tour.routes.map((route) => (
                <div
                  key={route.name}
                  className="bg-white rounded-2xl shadow p-4 flex items-start gap-3"
                >
                  <div className="mt-1 text-sky-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{route.name}</h3>
                    <p className="text-xs md:text-sm text-gray-700">{route.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 col-span-full">
                Bu tur için rota bilgisi henüz eklenmedi.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Galeri */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">Turdan Kareler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="relative h-56 rounded-2xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${tour.name} ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sayfa altı fiyat özeti */}
      {startingPrice && (
        <section className="max-w-6xl mx-auto px-4 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
	        Fiyat Özeti
              </p>
              <p className="text-sm text-gray-700">
                Bu sayfadaki program, Premium paket referans alınarak hazırlanmıştır; aşağıdaki tutar, en ekonomik paket için
                kişi başı başlayan fiyatı gösterir.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Kişi başı başlayan fiyatlarla</p>
              <p className="text-xl font-bold text-slate-900">
                ${startingPrice}
                <span className="ml-1 text-[11px] font-normal align-middle text-slate-600">
	          (uçak bileti pakette belirtilen tutara kadar dahildir)
                </span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Alt CTA kutusu */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-500 text-white px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-lg md:text-xl font-bold mb-1">Bu tur size uygunsa sonraki adım çok basit.</h2>
            <p className="text-xs md:text-sm text-white/90">
              Ön kayıt bırakarak güncel fiyat ve kontenjan bilgisi alabilir ya da aklınızdaki soruları WhatsApp üzerinden
              ekibimize iletebilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowPlannedForm(true)}
              className="px-4 py-2 rounded-full bg-white text-sky-700 text-xs md:text-sm font-semibold shadow hover:bg-slate-100 transition-colors"
            >
              Bu tura ön kayıt bırak
            </button>
            <button
              type="button"
              onClick={() => {
                const text = `${tour.name} turu hakkında bilgi almak istiyorum.`;
                const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
                openWhatsApp(url);
              }}
              className="px-4 py-2 rounded-full border border-white/80 text-white text-xs md:text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Sorumu WhatsApp&apos;tan sor
            </button>
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <ImageLightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* CTA ve buton altı açılan formlar */}

      {/* Geri Dön Linki */}
      <section className="max-w-6xl mx-auto px-4 py-10 flex justify-between items-center text-sm text-gray-600">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900"
        >
          <span>←</span>
          <span>Geri dön</span>
        </button>
        <button
          onClick={() => navigate("/tours")}
          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900"
        >
          <span>Tüm turlara dön</span>
          <span>→</span>
        </button>
      </section>

      <Footer />
    </div>
  );
}
