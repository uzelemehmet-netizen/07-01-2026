import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { openWhatsApp } from "../utils/whatsapp";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

// Admin paneli tarafından da kullanılan temel tur listesi
// Next.js projesindeki "ada" bazlı turları referans alır
export const TOURS_CONFIG = [
	{
		id: "bali",
		name: "Bali Adası",
		description:
			"Tropik cennet Bali, muhteşem plajları, mistik tapınakları, yeşil pirinç terasları ve misafirperver halkıyla sizi büyüleyecek. Bu rota; body rafting, tam gün tekne turu gibi özenle seçilmiş deneyimlerin dahil olduğu, sürpriz maliyetleri en aza indiren, premium bir tatil paketi olarak tasarlandı.",
		duration: "6 Gece 7 Gün",
		concept:
			"Uçak biletleri; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder.",
		suitableFor: [
			"Balayı",
			"Lüks & Dinlenme",
			"Deniz & Plaj Tatili",
			"Yoga & Wellness",
			"Adrenalin",
			"Macera",
			"Doğa",
		],
		includes: [
			"İstanbul çıkışlı gidiş-dönüş uçak bileti",
			"Ubud ve sahil bölgesinde 6 gece konaklama",
			"Her gün otelde sabah kahvaltısı",
			"Programdaki seçili rehberli günler ve transferler",
		],
		dateRange: "Planlanan tarih: 28 Mart - 3 Nisan (7 gün / 6 gece)",
		price: 3699,
		discountPercent: 25,
		image: "/bali-island-tropical-beach-temple.jpg",
	},
	{
		id: "lombok",
		name: "Lombok Adası",
		description:
			"Bali'nin sakin kız kardeşi Lombok, el değmemiş plajları ve Rinjani Yanardağı ile macera severleri bekliyor.",
		duration: "6 Gece 7 Gün",
		concept: "Doğa & Plaj",
		suitableFor: ["Doğa & Macera", "Deniz & Plaj Tatili", "Sörf", "Adrenalin", "Su Sporları", "Lüks & Dinlenme"],
		includes: [
			"İstanbul çıkışlı gidiş-dönüş uçak bileti",
			"Gili ve sahil bölgesinde 6 gece konaklama",
			"Her gün otelde sabah kahvaltısı",
			"Programdaki seçili rehberli günler ve transferler",
		],
		dateRange: "Sezonluk dönemlerde",
		price: 3299,
		image: "/lombok-island-beach-waterfall.jpg",
	},
	{
		id: "java",
		name: "Java Adası",
		description:
			"Java'yı klasik bir şehir turu gibi değil; Jakarta'dan başlayıp Bandung'un yaylalarına, Pangandaran'ın nehir & doğa rotalarına ve Yogyakarta'nın UNESCO tapınaklarına uzanan konforlu bir road trip olarak yaşayın.",
		duration: "10 Gece 11 Gün",
		concept: "Road Trip & Şehirler (Premium)",
		suitableFor: ["Road Trip", "Kültürel Keşif", "Doğa & Macera", "Fotoğrafçılık", "Şehir Turu"],
		includes: [
			"Jakarta, Bandung, Pangandaran ve Yogyakarta konaklamaları",
			"Rota içi transferler (tren/araç) ve operasyon koordinasyonu",
			"Programdaki rehberli günler ve transferler",
			"Planlama ve rezervasyon öncesi yazılı bilgilendirme",
		],
		dateRange: "Belirli dönemlerde sınırlı kontenjanla",
		price: 3199,
		packages: [
			{
				id: "java-premium",
				level: "premium",
				name: "Premium Paket",
				priceMultiplier: 1,
			},
		],
		image: "/java-borobudur-temple-volcano-sunrise.jpg",
	},
	{
		id: "sumatra",
		name: "Sumatra Adası",
		description:
			"Vahşi Sumatra, yağmur ormanları, orangutanlar ve etkileyici Toba Gölü ile eşsiz bir doğa deneyimi sunuyor.",
		duration: "8 Gece 9 Gün",
		concept: "Doğa & Macera",
		suitableFor: ["Doğa & Macera", "Kültürel Keşif", "Yaban Hayatı"],
		includes: [
			"Medan, Bukit Lawang ve Samosir (Lake Toba) konaklamaları",
			"Rota içi özel araç transferleri + feribot geçişleri",
			"Her gün otelde sabah kahvaltısı",
			"Programdaki rehberli günler ve seçili aktiviteler",
		],
		dateRange: "Belirli dönemlerde sınırlı kontenjanla",
		price: 3499,
		image: "/sumatra-rainforest-orangutan-lake-toba.jpg",
		},
		{
		id: "komodo",
		name: "Komodo Adası",
		description:
			"UNESCO Dünya Mirası Komodo Ulusal Parkı, Komodo ejderleri, pembe kumsallar ve turkuaz koylarıyla vahşi doğa ve tekne turu deneyimini bir arada sunar.",
		duration: "6 Gece 7 Gün",
		concept: "Doğa & Plaj",
			suitableFor: ["Tekne Turu", "Doğa & Macera", "Şnorkel", "Fotoğrafçılık", "Deniz & Plaj Tatili", "Adrenalin"],
		includes: [
			"İstanbul çıkışlı gidiş-dönüş uçak bileti",
				"Labuan Bajo konaklamaları + her gün otelde sabah kahvaltısı",
				"Programdaki tekne günleri ve rehberli trekking rotaları (pakete göre)",
				"Rota içi transferler (havalimanı/otel/liman) ve operasyon koordinasyonu",
		],
		dateRange: "Belirli sezonlarda, sınırlı tekne kontenjanı ile",
		price: 3899,
			packages: [
				{
					id: "komodo-premium",
					level: "premium",
					name: "Premium Paket",
					priceMultiplier: 1,
				},
			],
		image:
			"https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=1200",
	},
	{
		id: "sulawesi",
		name: "Sulawesi Adası",
		description:
			"Makassar'ın tropik sahil ritminden başlayıp Manado ve Bunaken'in su altı dünyasına uzanan; Tangkoko yağmur ormanı ve Tomohon'un volkanik manzaralarıyla güçlenen, finalde Jakarta ile metropol dokunuşu ekleyen uçuş ağırlıklı keşif rotası.",
		duration: "8 Gece 9 Gün",
		concept: "Deniz • Doğa • Dalış • Tropik Şehir",
		suitableFor: [
			"Deniz & Şnorkel",
			"Dalış (isteğe bağlı)",
			"Doğa & Vahşi Yaşam",
			"Fotoğrafçılık",
			"Şehir & Kafe Kültürü",
			"Macera",
		],
		includes: [
			"Makassar (2 gece) + Manado (5 gece) + Jakarta (1 gece) toplam 8 gece konaklama",
			"Makassar → Manado ve Manado → Jakarta iç hat uçuşları (pakete dahildir)",
			"Havalimanı transferleri + rota içi operasyon koordinasyonu",
			"7/24 Türkçe destek ve yerel ekip (rehberli günler pakete göre)",
		],
		dateRange: "Özel tarihler ve resmi tatillere göre planlanır",
		price: 4199,
		packages: [
			{
				id: "sulawesi-premium",
				level: "premium",
				name: "Premium Paket",
				priceMultiplier: 1,
			},
		],
		image: "/20160724_101830.jpg",
	},
];

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "905550343852";
// Tur sayfası BİREYSEL (planned) formlar için özel EmailJS yapılandırması
const EMAILJS_TOURS_SERVICE_ID = "service_a4cvjdi";
const EMAILJS_TOURS_TEMPLATE_ID_PLANNED = "template_vrs7wm9";
const EMAILJS_TOURS_PUBLIC_KEY = "ztyFnl3RMNaTFeReI";

export default function Tours() {
	const [tours, setTours] = useState(TOURS_CONFIG);
	const [tourOverrides, setTourOverrides] = useState({});
	const [imageUrls, setImageUrls] = useState({});
	const [openPreRegId, setOpenPreRegId] = useState(null);
	const activeTour = openPreRegId ? tours.find((t) => t.id === openPreRegId) : null;

	// Firestore'dan tur tarih/fiyat/promo override'larını yükle
	useEffect(() => {
		const fetchTours = async () => {
			try {
				const snapshot = await getDocs(collection(db, "tours"));
				const overrides = {};
				snapshot.forEach((docSnap) => {
					overrides[docSnap.id] = docSnap.data();
				});
				setTourOverrides(overrides);

				const formatDurationFromDaysNights = (days, nights) => {
					const d = Number(days);
					const n = Number(nights);
					if (!Number.isFinite(d) || !Number.isFinite(n) || d <= 0) return "";
					return `${n} Gece ${d} Gün`;
				};

				const extractDaysNightsFromText = (text) => {
					if (!text || typeof text !== "string") return null;
					// ör: "(7 gün / 6 gece)" veya "(6 gece / 7 gün)"
					const m1 = text.match(/(\d+)\s*g[uü]n\s*\/\s*(\d+)\s*gece/i);
					if (m1) return { days: Number(m1[1]), nights: Number(m1[2]) };
					const m2 = text.match(/(\d+)\s*gece\s*\/\s*(\d+)\s*g[uü]n/i);
					if (m2) return { nights: Number(m2[1]), days: Number(m2[2]) };
					return null;
				};

				const parseDateFlexible = (input) => {
					if (!input) return null;
					let s = input.toString().trim();
					// "Planlanan tarih:" gibi prefix'leri, parantez içlerini ve gereksiz karakterleri temizle
					s = s.replace(/\(.*?\)/g, " ");
					s = s.replace(/planlanan\s*tarih\s*:\s*/i, "");
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

					// Yaygın format: "12-19 Mart" veya "12–19 Mart 2026"
					let m = cleaned.match(
						/(\d{1,2})\s*[-–—]\s*(\d{1,2})\s+([a-zA-ZğüşöçıİĞÜŞÖÇ]+)\s*(\d{4})?/i,
					);
					if (m) {
						const d1 = Number(m[1]);
						const d2 = Number(m[2]);
						const monthName = m[3];
						const year = m[4] ? Number(m[4]) : new Date().getFullYear();
						const start = parseDateFlexible(`${d1} ${monthName} ${year}`);
						const end = parseDateFlexible(`${d2} ${monthName} ${year}`);
						return start && end ? { start, end } : null;
					}

					// Format: "28 Mart - 3 Nisan" / "28 Mart – 3 Nisan 2026"
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

					// Fallback: "to" / "–" / "—" / " - " ayracıyla iki parçaya böl
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

				const isReasonableDate = (d) => {
					return d instanceof Date && !isNaN(d) && d.getFullYear && d.getFullYear() >= 2000 && d.getFullYear() <= 2100;
				};

				// Tarih bilgisini de temel listeye yansıt
				setTours((prev) =>
					prev.map((tour) => {
						const o = overrides[tour.id] || {};
						// Eğer admin panelinden startDate / endDate geliyorsa, okunabilir dateRange hazırla
						let dateRange = o.dateRange || tour.dateRange || "";
						let computedDuration = "";
						// Desteklenen farklı admin alan adları için esnek start/end okuma
						const possibleStart =
							o.startDate ||
							o.start_date ||
							o.dateStart ||
							o.date_start ||
							o.start ||
							o.sDate ||
							o.s_date ||
							o.startAt ||
							o.start_at ||
							(o.dates && (o.dates.start || o.dates.startDate || o.dates.dateStart)) ||
							null;
						const possibleEnd =
							o.endDate ||
							o.end_date ||
							o.dateEnd ||
							o.date_end ||
							o.end ||
							o.eDate ||
							o.e_date ||
							o.endAt ||
							o.end_at ||
							(o.dates && (o.dates.end || o.dates.endDate || o.dates.dateEnd)) ||
							null;
						if (possibleStart && possibleEnd) {
							try {
								const sRaw = possibleStart;
								const eRaw = possibleEnd;
								const s = typeof sRaw?.toDate === "function" ? sRaw.toDate() : new Date(sRaw);
								const e = typeof eRaw?.toDate === "function" ? eRaw.toDate() : new Date(eRaw);
								if (!isNaN(s) && !isNaN(e)) {
									const msPerDay = 1000 * 60 * 60 * 24;
									const days = Math.round((e - s) / msPerDay) + 1;
									const nights = Math.max(0, days - 1);
									// dateRange metni admin tarafından verilmişse (ör. bayram dönemi notu), onu koru.
									// Yoksa sadece okunabilir tarih aralığı üret.
									if (!o.dateRange) {
										const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
										const startFmt = fmt.format(s);
										const endFmt = fmt.format(e);
										dateRange = `${startFmt} - ${endFmt}`;
									}
									computedDuration = formatDurationFromDaysNights(days, nights);
								}
							} catch (err) {
								// parsing hatası olursa mevcut dateRange bırakılır
							}
						} else if (o.dateRange && typeof o.dateRange === "string") {
							// Admin dateRange string'i içinden önce (x gün / y gece) yakala; yoksa start-end tarihlerini parse et
							const extracted = extractDaysNightsFromText(o.dateRange);
							if (extracted?.days && extracted?.nights >= 0) {
								computedDuration = formatDurationFromDaysNights(extracted.days, extracted.nights);
							} else {
								try {
									const range = parseDateRangeText(o.dateRange);
									if (range?.start && range?.end && isReasonableDate(range.start) && isReasonableDate(range.end)) {
										const s = range.start;
										const e = range.end;
										const msPerDay = 1000 * 60 * 60 * 24;
										const days = Math.round((e - s) / msPerDay) + 1;
										if (days > 0 && days < 1000) {
											const nights = Math.max(0, days - 1);
											computedDuration = formatDurationFromDaysNights(days, nights);
										}
									}
								} catch (err) {
									// ignore
								}
							}
						}
						return {
							...tour,
							dateRange,
							duration: computedDuration || tour.duration,
						};
					}),
				);
			} catch (error) {
				console.error("Tur ayarları yüklenirken hata:", error);
			}
		};

		fetchTours();
	}, []);

	const normalizePlannedDateRangeLabel = (text) => {
		if (!text || typeof text !== "string") return "";
		return text
			.replace(/^\s*planlanan\s*tarih\s*:\s*/i, "")
			.replace(/^\s*planlanan\s*tur\s*tarihleri\s*:\s*/i, "")
			.trim();
	};

	// Firestore + localStorage'dan görsel URL'lerini yükle
	useEffect(() => {
		try {
			const saved = localStorage.getItem("imageUrls");
			if (saved) {
				setImageUrls(JSON.parse(saved));
			}
		} catch (e) {
			console.error("imageUrls localStorage okuma hatası:", e);
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
							console.error("imageUrls localStorage yazma hatası:", e);
						}
						return merged;
					});
				}
			} catch (error) {
				console.error("Firestore imageUrls yüklenirken hata:", error);
			}
		};

		fetchImageUrls();
	}, []);

	const handleInlinePreRegSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData.entries());

		const tourId = e.target.getAttribute("data-tour-id");
		const tour = tours.find((t) => t.id === tourId);

		const whatsappText =
			`Toplu tur ön kayıt talebi (liste sayfası)\n\n` +
			`Tur: ${tour ? `${tour.name} (${tour.duration})` : data.tour}\n` +
			`Ad Soyad: ${data.name}\n` +
			`E-posta: ${data.email}\n` +
			`Telefon: ${data.phone}\n` +
			`Katılım türü: ${data.participation || "-"}\n` +
			`Katılmak istenilen tur: ${data.tour || "-"}\n` +
			`Katılımcı sayısı: ${data.people || "-"}\n` +
			`Ek notlar: ${data.notes || "-"}`;

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
						tour_name: tour ? tour.name : data.tour,
						tour_duration: tour ? tour.duration : "",
						name: data.name,
						email: data.email,
						phone: data.phone,
						participation: data.participation || "liste-sayfasi",
						tour: data.tour,
						people: data.people,
						notes: data.notes,
					},
					EMAILJS_TOURS_PUBLIC_KEY,
				)
				.then(
					() => {
						console.log("EmailJS inline planned form başarıyla gönderildi");
					},
					(error) => {
						console.error("EmailJS inline planned form hata:", error);
					},
				);
		} else {
		}

		e.target.reset();
		setOpenPreRegId(null);
	};

	// Basit sayfa başlığı ve açıklama güncellemesi (SEO)
	useEffect(() => {
		if (typeof document !== "undefined") {
			document.title =
				"Endonezya Tur Paketleri | Bali, Lombok, Komodo Toplu Turlar";
			const metaDesc = document.querySelector("meta[name='description']");
			if (metaDesc) {
				metaDesc.setAttribute(
					"content",
					"Endonezya Kaşifi’nin planlı Endonezya tur paketlerini keşfedin. Bali, Lombok, Komodo ve Sulawesi için toplu tur organizasyonları, uçak bileti, konaklama ve rehberlik dahil.",
				);
			}
		}
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-sky-50/40 overflow-x-hidden">
			<Navigation />

			{/* Hero + sekmeler */}
			<section className="pt-24 pb-8 px-4 text-center max-w-5xl mx-auto">
				<h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
					Endonezya Toplu Tur Paketleri
				</h1>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
					<div className="relative w-full sm:w-auto">
						<span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-[10px] font-semibold text-gray-900 shadow-sm">
							Tıkla
						</span>
						<button
							type="button"
							className="w-full sm:w-auto px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold bg-sky-600 text-white shadow-md hover:bg-sky-700 transition-colors cursor-pointer"
						>
							Kişisel / Aile Olarak Katılacağım Turlar
						</button>
					</div>
					<div className="relative w-full sm:w-auto">
						<span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-[10px] font-semibold text-gray-900 shadow-sm">
							Tıkla
						</span>
						<Link
							to="/tours/groups"
							className="w-full sm:w-auto px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold border border-sky-500 text-sky-700 bg-white shadow-sm hover:bg-sky-50 hover:border-sky-600 transition-colors cursor-pointer inline-flex items-center justify-center"
						>
							Gruplar İçin Tur Organizasyonu
						</Link>
					</div>
				</div>

				<p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto">
					Bu sayfadaki turlar; belirli dönemlerde, sınırlı kontenjanla planlanan toplu Endonezya turlarımızdır.
					Bireysel, çift veya ailenizle bu turlara ön kayıt bırakabilir, ayrıntılı program ve güncel fiyat
					bilgisini size özel olarak iletmemizi isteyebilirsiniz.
				</p>
			</section>

			{/* Tur kartları */}
			<section className="pb-16 px-4 max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{tours.map((tour) => {
						const formatUSD = (value) => {
							if (typeof value !== "number" || !isFinite(value)) return "";
							return `$${Math.round(value)}`;
						};

						const normalizeUsdNumber = (value) => {
							if (value === undefined || value === null || value === "") return null;
							if (typeof value === "number" && isFinite(value)) return value;
							if (typeof value === "string") {
								const n = Number(value.replace(/[^0-9.]/g, ""));
								return isFinite(n) && n > 0 ? n : null;
							}
							return null;
						};

						const override = tourOverrides[tour.id] || {};
						const flightIncludedLimitUsd = normalizeUsdNumber(override.flightIncludedLimitUsd);
						const flightNoteShort = flightIncludedLimitUsd
							? `uçak bileti kişi başı ${formatUSD(flightIncludedLimitUsd)}’a kadar dahildir; aşan fark katılımcı öder`
							: "uçak bileti pakette belirtilen tutara kadar dahildir";

						const basePriceRaw =
							override.price !== undefined && override.price !== null && override.price !== ""
								? override.price
								: tour.price;
						const normalizedBasePrice =
							typeof basePriceRaw === "string"
								? basePriceRaw.replace(/[^0-9]/g, "")
								: basePriceRaw;
						const basePrice = normalizedBasePrice ? Number(normalizedBasePrice) : null;
						const discountPercentRaw =
							override.discountPercent !== undefined && override.discountPercent !== null
								? override.discountPercent
								: tour.discountPercent ?? 0;
						const discountPercent = Number(discountPercentRaw) || 0;
						// Fiyat kutusunda her zaman temel/en ucuz paket baz alınsın.
						const sourcePackages =
							override.packages && Array.isArray(override.packages) && override.packages.length > 0
								? override.packages
								: tour.packages && Array.isArray(tour.packages) && tour.packages.length > 0
								? tour.packages
								: null;

						let cheapestMultiplier = tour.id === "java" || tour.id === "komodo" || tour.id === "sulawesi" ? 1 : 0.7; // Premium kart: Java/Komodo/Sulawesi
						if (sourcePackages) {
							if (tour.id === "java" || tour.id === "komodo" || tour.id === "sulawesi") {
								const premiumPkg = sourcePackages.find((p) => {
									const level = (p?.level || "").toString().toLowerCase();
									const pid = (p?.id || "").toString().toLowerCase();
									return level === "premium" || pid.includes("premium");
								});
								const premiumMultiplier = premiumPkg && typeof premiumPkg.priceMultiplier === "number" ? premiumPkg.priceMultiplier : 1;
								cheapestMultiplier = premiumMultiplier > 0 ? premiumMultiplier : 1;
							} else {
								const multipliers = sourcePackages
									.map((p) => (typeof p?.priceMultiplier === "number" ? p.priceMultiplier : null))
									.filter((n) => typeof n === "number" && n > 0);
								if (multipliers.length > 0) {
									cheapestMultiplier = Math.min(...multipliers);
								}
							}
						}

						const pkgBasePrice = basePrice !== null ? Math.round(basePrice * cheapestMultiplier) : null;
						const hasDiscount = pkgBasePrice !== null && discountPercent > 0;
						const displayPrice = hasDiscount
							? Math.round(pkgBasePrice * (1 - discountPercent / 100))
							: pkgBasePrice;
						const promoLabel = override.promoLabel || "";
						const discountNote = hasDiscount
							? (() => {
								const promoText = promoLabel ? promoLabel.trim() : "";
								if (promoText) {
									const hasPercentInText = /%\s*\d+/.test(promoText);
									return hasPercentInText ? promoText : `${promoText} %${discountPercent}`;
								}
								return `Kişi başı, rezervasyonunu tamamlayan ilk 5 kişi için %${discountPercent} indirimli özel fiyat`;
							})()
							: "Kişi başı güncel fiyat";

						const heroKey = `${tour.id}-tour-hero`;
						const heroImage =
							imageUrls[heroKey] || tour.image || "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg";

						return (
							<article
								key={tour.id}
								className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 h-full"
							>
								<Link
									to={`/tours/${tour.id}`}
									className="relative h-64 overflow-hidden block group"
								>
									<img
										src={heroImage}
										alt={tour.name}
										className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />

									{(promoLabel || hasDiscount) && (
										<div className="absolute top-4 left-4 z-10 flex items-center gap-3">
											{promoLabel && (
												<div className="flex flex-col gap-1 max-w-xs">
													<span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/80 drop-shadow-md">
														Kampanya
													</span>
													<span className="text-sm sm:text-base font-semibold leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
														{promoLabel}
													</span>
													<span className="inline-flex w-fit text-[11px] font-semibold text-white bg-red-600/95 px-3 py-1 rounded-full drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)] mt-1">
														Bu fırsatı kaçırmayın
													</span>
												</div>
											)}
											{hasDiscount && (
												<div className="transform -rotate-12">
													<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-extrabold shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
														%{discountPercent}
													</div>
												</div>
											)}
										</div>
									)}

									<div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end gap-3 text-left">
										<div>
											<h2 className="text-2xl font-bold text-white mb-1">{tour.name}</h2>
																	<p className="text-xs text-white/90 line-clamp-2 md:line-clamp-3">{tour.description}</p>
										</div>
									</div>
								</Link>

								<div className="p-5 space-y-4 flex-1 flex flex-col">
									<div className="flex flex-wrap gap-2">
										{tour.suitableFor.map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100"
											>
												{tag}
											</span>
										))}
									</div>

									{/* Süre + ek avantajlar + fiyat bloğu */}
									<div className="mt-2 flex items-start justify-between text-xs text-gray-700">
										<div className="mr-2">
											<p>{tour.duration}</p>
											<div className="text-[11px] text-gray-600 mt-0.5 space-y-0.5">
												{(tour.id === "bali" || tour.id === "lombok") ? (
													<>
														<p>4–5 yıldızlı otel konaklaması</p>
														<p>2 kişilik oda paylaşımı (çift veya arkadaş)</p>
														<p>Otellerde sabah kahvaltısı</p>
														<p>Havalimanı–otel–aktivite alanları arası ulaşım</p>
														<p>7/24 ulaşılabilir Türkçe destek ve yerel ekip</p>
													</>
												) : tour.id === "sumatra" ? (
													<>
														<p>Road trip konsepti: az konaklama noktası, farklı atmosferler</p>
														<p>3–4 yıldızlı otel ve bölgesel butik konaklama</p>
														<p>2 kişilik oda paylaşımı (çift veya arkadaş)</p>
														<p>Otellerde sabah kahvaltısı</p>
														<p>Medan ↔ Bukit Lawang ↔ Samosir rota transferleri</p>
														<p>7/24 ulaşılabilir Türkçe destek ve yerel ekip</p>
													</>
												) : tour.id === "java" ? (
													<>
														<p>Road trip konsepti: az konaklama noktası, farklı atmosferler</p>
														<p>Tren + kara yolu geçişleri (Bandung dahil)</p>
														<p>Rehberli günler + serbest zaman dengesi</p>
														<p>Rota içi transferler ve operasyon koordinasyonu</p>
														<p>7/24 Türkçe destek ve yerel ekip</p>
													</>
												) : tour.id === "komodo" ? (
													<>
														<p>Tekne odaklı ada keşfi: az konaklama noktası, maksimum deniz günü</p>
														<p>Rehberli tekne günleri + serbest zaman dengesi</p>
														<p>Milli park girişleri, tekne operasyonu ve güvenlik koordinasyonu</p>
														<p>Rota içi transferler ve operasyon koordinasyonu</p>
														<p>7/24 Türkçe destek ve yerel ekip</p>
													</>
												) : tour.id === "sulawesi" ? (
													<>
														<p>Uçuş ağırlıklı rota: uzun kara yolu yok, tempolu ama konforlu akış</p>
														<p>Makassar → Manado → Jakarta iç hat uçuşları (aktarmalı olabilir)</p>
														<p>Rehberli günler + serbest zaman dengesi (Bunaken/Tangkoko/Tomohon)</p>
														<p>Rota içi transferler ve operasyon koordinasyonu</p>
														<p>7/24 Türkçe destek ve yerel ekip</p>
													</>
												) : (
													<>
														<p>3-4 yıldızlı oteller</p>
														<p>Özel otobüs turları</p>
														<p>7/24 yerel rehber hizmeti</p>
													</>
												)}
											</div>
										</div>
										<div className="flex flex-col items-end w-full sm:w-[220px]">
											<div className="inline-block rounded-2xl bg-gradient-to-l from-emerald-600/90 to-emerald-500/80 px-3 py-2 text-right shadow-sm w-full min-h-[112px] flex flex-col justify-center">
												{pkgBasePrice ? (
													<>
														<div className="flex flex-col items-end">
															<p className={`text-sm font-semibold mb-0.5 ${hasDiscount ? "text-white line-through decoration-red-500 decoration-1" : "text-white/90"}`}>
																		{hasDiscount ? formatUSD(pkgBasePrice) : (tour.id === "java" || tour.id === "komodo" || tour.id === "sulawesi" ? "Premium" : "Toplam")}
															</p>
														</div>
														<p className="text-xl font-bold text-white whitespace-nowrap leading-none">
															<span className="block">
																{hasDiscount ? (
																	<span className="inline-flex items-baseline gap-1">
																		<span className="text-[10px] font-semibold text-white/90 whitespace-nowrap">İndirimli fiyat</span>
																		<span>{formatUSD(displayPrice)}</span>
																	</span>
																) : (
																formatUSD(displayPrice)
															)}
														</span>
														<span className="block text-[10px] font-normal text-white/90 leading-none">
																{flightNoteShort}
														</span>
													</p>
																<p className="text-sm text-white/90 mt-0.5">
																	{tour.id === "java" || tour.id === "komodo" || tour.id === "sulawesi" ? "Premium paket fiyatı" : "Başlayan fiyatlarla"}
																</p>
													<p className="text-[11px] text-white/90">
														{discountNote}
													</p>
												</>
											) : (
												<p className="text-[11px] text-white/90">Fiyat bilgisi yakında</p>
											)}
										</div>

									</div>
									</div>

									{/* Alt bilgi ve CTA bloğunu kartın altına sabitle */}
									<div className="mt-auto pt-3 space-y-3">
										{tour.dateRange && (
											<p className="text-xs text-gray-700 font-semibold">
												Planlanan Tur Tarihleri: {normalizePlannedDateRangeLabel(tour.dateRange)}
											</p>
										)}

										{Array.isArray(tour.includes) && tour.includes.length > 0 && (
											<div className="text-xs text-gray-700">
												<p className="font-semibold mb-1">Pakete dahil bazı hizmetler:</p>
												<ul className="space-y-0.5">
													{tour.includes.map((item) => (
														<li key={item} className="flex items-center gap-1.5">
															<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
															<span>{item}</span>
														</li>
													))}
												</ul>
												{tour.id === "bali" && (
													<p className="mt-1 text-[11px] text-gray-600">
														Program kapsamındaki otel konaklamaları ve her gün sabah kahvaltısı fiyata dahildir; 2. ve 4. gün rehberli programlarda grup halinde öğle yemeği dahildir. Diğer öğünler ve otel dışındaki yiyecek-içecek harcamaları tura dahil değildir.
													</p>
												)}
												{tour.id === "lombok" && (
													<p className="mt-1 text-[11px] text-gray-600">
														Lombok rotasında konaklamalar Gili ve sahil bölgelerinde planlanır; kahvaltılar fiyata dahil olup bölgesel transferler ve seçili doğa turları programa dahildir. Özel su sporu aktiviteleri ve bazı rehberli deneyimler paket kapsamında olmayabilir ve opsiyonel ek hizmet olarak sunulur.
													</p>
												)}
																{tour.id === "java" && (
																	<p className="mt-1 text-[11px] text-gray-600">
																		Java turu road trip konseptindedir ve yalnızca Premium paket olarak planlanır. Rota içi transferler ve rehberli gün akışı paket kapsamında organize edilir; uçak bileti hariçtir ve net kapsam/tarih rezervasyon öncesinde yazılı paylaşılır.
																	</p>
																)}
																{tour.id === "komodo" && (
																	<p className="mt-1 text-[11px] text-gray-600">
																		Komodo turu tekne odaklı bir ada keşfi konseptindedir. Tekne günleri, milli park operasyonu ve rehberli trekking akışı paket kapsamında organize edilir; net kapsam ve operasyon detayları rezervasyon öncesinde yazılı olarak paylaşılır.
																	</p>
																)}
																{tour.id === "sulawesi" && (
																	<p className="mt-1 text-[11px] text-gray-600">
																		Sulawesi turu uçuş ağırlıklı bir akıştır; uzun ve yorucu kara yolu günleri planlanmaz. İç hat uçuşları ve rehberli gün akışı paket kapsamında organize edilir; uçuş saatleri ve operasyonel detaylar rezervasyon öncesinde yazılı olarak paylaşılır.
																	</p>
																)}
																{tour.id === "sumatra" && (
																	<p className="mt-1 text-[11px] text-gray-600">
																		Sumatra turu doğa & macera odaklı, road trip mantığında planlanır. Medan → Bukit Lawang → Samosir (Lake Toba) rotasında transferler ve rehberli gün akışı paket kapsamında organize edilir; uçak bileti kapsamı ve net tarih/kapsam rezervasyon öncesinde yazılı olarak paylaşılır.
																	</p>
																)}
											</div>
										)}

										<div>
											<button
												type="button"
												onClick={() => setOpenPreRegId(tour.id)}
												className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
											>
												Bu tur için ön kayıt bırak
											</button>
											<Link
												to={`/tours/${tour.id}`}
												className="ml-3 text-xs md:text-sm font-semibold text-sky-700 hover:text-sky-800 underline-offset-2 hover:underline"
											>
												Detayları gör
											</Link>
										</div>
									</div>

								</div>

							</article>
						);
					})}
				</div>
			</section>

			{/* Önemli Açıklamalar & Uyarılar (Liste sayfası için özet) */}
			<section className="max-w-6xl mx-auto px-4 mb-16 text-sm text-gray-800">
				<h2 className="text-lg md:text-xl font-bold mb-3 text-gray-900">
					Önemli Açıklamalar ve Uyarılar
				</h2>
				<p className="text-xs md:text-sm text-gray-700 mb-3">
					Bu sayfadaki tüm turlar için geçerli genel bilgilendirme ve katılım kurallarının kısa özetidir. Detaylı hali tur
						detay sayfalarında yer almaktadır.
				</p>
				<ol className="list-decimal list-inside space-y-1.5 text-xs md:text-sm">
					<li>
						Turlara son kayıt tarihi, tur başlangıç tarihinden <span className="font-semibold">en geç 10 gün öncesidir</span>.
					</li>
					<li>
						Ön kayıttan sonra kesin kayıtlar için sözleşme onayı ve ödeme işleminin eksiksiz tamamlanmış olması gerekmektedir.
					</li>
					<li>
						Tur rota planları ve aktiviteler, operasyonel sebepler ya da hava şartlarına bağlı olarak tarafımızca
							güncellenebilir.
					</li>
					<li>
						Uçak biletleri; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete
						dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder.
					</li>
					<li>
						Endonezya&apos;ya gelmeden önce seyahat sağlık sigortası yaptırılması <span className="font-semibold">zorunludur</span>.
					</li>
					<li>
						Önemli bir sağlık sorununuz varsa lütfen başvuru formunu doldururken <span className="font-semibold">"Ek
							istekler"</span> bölümünde belirtiniz.
					</li>
					<li>
						Tur programına kesin kayıt yaptıran misafirlerimizin tur kurallarına uyması ve bireysel hareket etmemesi beklenir.
					</li>
					<li>
						Pasaportlarınızın, seyahat dönüş tarihinden sonra en az <span className="font-semibold">6 ay</span>
							geçerlilik süresi olmasına dikkat ediniz.
					</li>
					<li>
						Endonezya devleti, Türk vatandaşları için vize uygulamasını kaldırmıştır; pasaportunuz, size göndereceğimiz otel
							rezervasyonunuz ve uçak biletinizi göstermeniz giriş için yeterli olacaktır.
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
						Tura katılım sözleşmesini imzalayıp kesin kayıtlarını tamamlayan misafirlerimiz, bu açıklama ve uyarıları okumuş ve
							kabul etmiş sayılır.
					</li>
				</ol>
			</section>

			<section className="pb-20 px-4 max-w-5xl mx-auto text-center text-sm text-gray-700">
				<h2 className="text-base md:text-lg font-semibold mb-2">
					Kendi grubunuz için özel Endonezya turu mu planlıyorsunuz?
				</h2>
				<p className="max-w-3xl mx-auto mb-4">
					Eğer şirket, okul, dernek veya arkadaş grubunuz için kişi sayısını ve tarihleri sizin belirleyeceğiniz özel bir tur
						istiyorsanız, Grup Turları sayfasından detaylı teklif formunu doldurabilirsiniz.
				</p>
				<Link
					to="../group-tours"
					className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
				>
					Grup Turları Sayfasına Git
				</Link>
			</section>

			{activeTour && (
				<div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/80 px-4 pt-16 md:pt-20">
					<div className="relative bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-5 md:p-6 text-sm text-gray-800">
						<button
							type="button"
							onClick={() => setOpenPreRegId(null)}
							className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900/70 text-white text-[10px] md:text-xs font-normal shadow-sm hover:bg-gray-900/90"
						>
							<span className="text-xs md:text-sm leading-none">×</span>
							<span>Kapat</span>
						</button>

						<h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">
							{activeTour.name} toplu turu için bireysel / aile ön kayıt
						</h2>
						<p className="text-[11px] md:text-xs text-gray-700 mb-4">
							İletişim ve kontenjan uygunluğu için temel bilgilerinizi bırakın; size WhatsApp veya e-posta ile dönüş yapalım.
						</p>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
							<form
								data-tour-id={activeTour.id}
								onSubmit={handleInlinePreRegSubmit}
								className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 md:p-5 space-y-4 text-sm text-gray-800"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="block text-xs font-semibold mb-1">Ad Soyad *</label>
										<input
											name="name"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
											placeholder="Adınız ve soyadınız"
										/>
									</div>
									<div>
										<label className="block text-xs font-semibold mb-1">E-posta *</label>
										<input
											type="email"
											name="email"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
											placeholder="ornek@email.com"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="block text-xs font-semibold mb-1">Telefon *</label>
										<input
											name="phone"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
											placeholder="+90 5xx xxx xx xx"
										/>
									</div>
									<div>
										<label className="block text-xs font-semibold mb-1">Katılım Türü *</label>
										<select
											name="participation"
											defaultValue="bireysel"
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
										>
											<option value="bireysel">Bireysel</option>
											<option value="aile">Aile</option>
											<option value="cift">Çift</option>
											<option value="arkadas">Arkadaş grubu</option>
											<option value="diger">Diğer</option>
										</select>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="block text-xs font-semibold mb-1">Katılmak İstenilen Tur *</label>
										<input
											name="tour"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
											placeholder={`${activeTour.name} - ${activeTour.duration}`}
										/>
									</div>
									<div>
										<label className="block text-xs font-semibold mb-1">Katılımcı Sayısı *</label>
										<input
											type="number"
											name="people"
											min="1"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
											placeholder="Kaç kişi?"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-semibold mb-1">Ek Notlar</label>
									<input
										name="notes"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
										placeholder="Özel talepleriniz, çocuk sayısı vb."
									/>
								</div>

								<div className="flex items-start gap-2 text-[11px] text-gray-700">
									<input
										type="checkbox"
										name="privacy"
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
									className="w-full md:w-auto px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
								>
									Ön Kayıt Talebimi Gönder
								</button>
							</form>

							<div className="bg-emerald-900/5 border border-emerald-100 rounded-2xl p-4 md:p-5 text-[11px] md:text-xs leading-relaxed text-gray-800">
								<h3 className="text-sm font-semibold mb-2 text-emerald-800">Önemli Açıklamalar ve Uyarılar</h3>
								<p className="mb-2">
									Aşağıdaki maddeler, tüm Endonezya tur paketlerimiz için genel bilgilendirme ve katılım kurallarını özetler. Detaylı
										versiyonunu tur detay sayfalarında da bulabilirsiniz.
								</p>
								<ol className="list-decimal list-inside space-y-1.5">
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
											Uçak biletleri; web sitesi paket açıklamalarında, broşürlerde ve teklif formlarında belirtilen tutara kadar pakete
											dahildir; belirtilen tutarı aşan fiyat farkını katılımcı öder.
										</li>
									<li>
										Endonezya'ya gelmeden önce seyahat sağlık sigortası yaptırılması <span className="font-semibold">zorunludur</span>.
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
					</div>
				</div>
			)}

			<Footer />
		</div>
		);
	}
