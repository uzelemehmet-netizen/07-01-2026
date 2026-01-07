import React, { useState, useEffect } from 'react';
import { auth, storage, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, Upload } from 'lucide-react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { TOURS_CONFIG } from './Tours';

// Tüm ada ve destinasyonlar
const ISLANDS_DATA = {
  bali: {
    name: 'Bali',
    heroId: 'bali-hero',
    destinations: [
      { id: 'ubud', name: 'Ubud' },
      { id: 'seminyak', name: 'Seminyak' },
      { id: 'uluwatu', name: 'Uluwatu' },
      { id: 'nusa-dua', name: 'Nusa Dua' },
      { id: 'canggu', name: 'Canggu' },
      { id: 'sanur', name: 'Sanur' },
      { id: 'munduk', name: 'Munduk' },
      { id: 'amed', name: 'Amed' },
    ]
  },
  java: {
    name: 'Java',
    heroId: 'java-hero',
    destinations: [
      { id: 'yogyakarta', name: 'Yogyakarta' },
      { id: 'pangandaran', name: 'Pangandaran' },
      { id: 'banyuwangi', name: 'Banyuwangi' },
      { id: 'bandung', name: 'Bandung' },
      { id: 'malang', name: 'Malang' },
    ]
  },
  lombok: {
    name: 'Lombok',
    heroId: 'lombok-hero',
    destinations: [
      { id: 'gili-trawangan', name: 'Gili Trawangan' },
      { id: 'mount-rinjani', name: 'Mount Rinjani' },
      { id: 'senggigi', name: 'Senggigi' },
      { id: 'kuta', name: 'Kuta' },
      { id: 'benang-stokel', name: 'Benang Stokel' },
    ]
  },
  komodo: {
    name: 'Komodo',
    heroId: 'komodo-hero',
    destinations: [
      { id: 'komodo-island', name: 'Komodo Island' },
      { id: 'labuan-bajo', name: 'Labuan Bajo' },
    ]
  },
  sulawesi: {
    name: 'Sulawesi',
    heroId: 'sulawesi-hero',
    destinations: [
      { id: 'bunaken', name: 'Bunaken' },
      { id: 'makassar', name: 'Makassar' },
      { id: 'wakatobi', name: 'Wakatobi' },
      { id: 'togean', name: 'Togean' },
    ]
  },
  sumatra: {
    name: 'Sumatra',
    heroId: 'sumatra-hero',
    destinations: [
      { id: 'lake-toba', name: 'Lake Toba' },
      { id: 'bukit-lawang', name: 'Bukit Lawang' },
      { id: 'mentawai', name: 'Mentawai' },
      { id: 'bukittinggi', name: 'Bukittinggi' },
      { id: 'kerinci', name: 'Kerinci' },
      { id: 'nias', name: 'Nias' },
    ]
  }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('islands');
  const [selectedIsland, setSelectedIsland] = useState('bali');
  const [editingId, setEditingId] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [toursSettings, setToursSettings] = useState([]);
  const [toursLoading, setToursLoading] = useState(false);
  const [toursSaving, setToursSaving] = useState(false);
  const [toursMessage, setToursMessage] = useState('');
  const navigate = useNavigate();

  // localStorage'dan resim URL'lerini yükle
  useEffect(() => {
    const saved = localStorage.getItem('imageUrls');
    if (saved) {
      setImageUrls(JSON.parse(saved));
    }
  }, []);

  // Firestore'dan imageUrls konfigurasyonunu yükle
  useEffect(() => {
    const fetchImageUrls = async () => {
      try {
        const snap = await getDoc(doc(db, 'imageUrls', 'imageUrls'));
        if (snap.exists()) {
          const data = snap.data() || {};
          setImageUrls((prev) => {
            const merged = { ...prev, ...data };
            try {
              localStorage.setItem('imageUrls', JSON.stringify(merged));
            } catch (e) {
              console.error('imageUrls localStorage yazma hatası:', e);
            }
            return merged;
          });
        }
      } catch (error) {
        console.error('Firestore imageUrls yüklenirken hata:', error);
      }
    };

    fetchImageUrls();
  }, []);

  // Firestore'dan tur tarih ve fiyatlarını yükle
  useEffect(() => {
    const fetchTours = async () => {
      setToursLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'tours'));
        const existing = {};
        snapshot.forEach((docSnap) => {
          existing[docSnap.id] = docSnap.data();
        });

        const merged = TOURS_CONFIG.map((tour) => ({
          id: tour.id,
          name: tour.name,
          dateRange: existing[tour.id]?.dateRange || tour.dateRange || '',
          price:
            existing[tour.id]?.price !== undefined && existing[tour.id]?.price !== null
              ? existing[tour.id].price
              : tour.price || '',
          discountPercent:
            existing[tour.id]?.discountPercent !== undefined && existing[tour.id]?.discountPercent !== null
              ? existing[tour.id].discountPercent
              : '',
          promoLabel: existing[tour.id]?.promoLabel || '',
        }));

        setToursSettings(merged);
      } catch (error) {
        console.error('Tur ayarları yüklenirken hata:', error);
        const fallback = TOURS_CONFIG.map((tour) => ({
          id: tour.id,
          name: tour.name,
          dateRange: tour.dateRange || '',
          price: tour.price || '',
          discountPercent: '',
          promoLabel: '',
        }));
        setToursSettings(fallback);
      } finally {
        setToursLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Dosya yükleme ve URL kaydetme
  const handleFileUpload = async (e, imageId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [imageId]: 'Yükleniyor...' }));

    try {
      const storageRef = ref(storage, `images/${imageId}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setImageUrls(prev => ({
        ...prev,
        [imageId]: downloadURL
      }));

      setUploadProgress(prev => ({ ...prev, [imageId]: 'Başarılı' }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [imageId]: null }));
      }, 2000);
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setUploadProgress(prev => ({ ...prev, [imageId]: 'Hata!' }));
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (id, url) => {
    setImageUrls(prev => ({
      ...prev,
      [id]: url
    }));
  };

  const handleSave = async () => {
    try {
      localStorage.setItem('imageUrls', JSON.stringify(imageUrls));
    } catch (e) {
      console.error('imageUrls localStorage kaydetme hatası:', e);
    }

    try {
      await setDoc(doc(db, 'imageUrls', 'imageUrls'), imageUrls || {}, { merge: true });
      alert('Tüm resim URL\'leri kaydedildi!');
    } catch (error) {
      console.error('Firestore imageUrls kaydetme hatası:', error);
      alert('Resim URL\'leri kaydedilirken bir hata oluştu. Detay için konsolu kontrol edin.');
    }
  };

  const handleTourFieldChange = (id, field, value) => {
    setToursSettings((prev) =>
      prev.map((tour) => (tour.id === id ? { ...tour, [field]: value } : tour))
    );
  };

  const handleSaveTours = async () => {
    if (!toursSettings.length) return;
    setToursSaving(true);
    setToursMessage('');
    try {
      await Promise.all(
        toursSettings.map((tour) => {
          const discount = tour.discountPercent === '' ? 0 : Number(tour.discountPercent) || 0;
          return setDoc(
            doc(db, 'tours', tour.id),
            {
              dateRange: tour.dateRange || '',
              price: tour.price || '',
              discountPercent: discount,
              promoLabel: tour.promoLabel || '',
            },
            { merge: true }
          );
        })
      );
      setToursMessage('Tur tarih ve fiyatları kaydedildi.');
    } catch (error) {
      console.error('Tur ayarları kaydedilirken hata:', error);
      setToursMessage('Kaydetme sırasında bir hata oluştu. Detay için konsolu kontrol edin.');
    } finally {
      setToursSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const renderContent = () => {
    if (activeTab === 'islands') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(ISLANDS_DATA).map(([key, island]) => (
            <ImageCard
              key={island.heroId}
              imageId={island.heroId}
              name={island.name}
              category="Ada Hero"
              imageUrls={imageUrls}
              editingId={editingId}
              setEditingId={setEditingId}
              handleImageUrlChange={handleImageUrlChange}
              handleFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'tourHero') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOURS_CONFIG.map((tour) => (
            <ImageCard
              key={`${tour.id}-tour-hero`}
              imageId={`${tour.id}-tour-hero`}
              name={tour.name}
              category="Tur kartı & detay hero"
              imageUrls={imageUrls}
              editingId={editingId}
              setEditingId={setEditingId}
              handleImageUrlChange={handleImageUrlChange}
              handleFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'destHero') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(ISLANDS_DATA).map(([key, island]) => (
            <ImageCard
              key={`${island.heroId}-dest-hero`}
              imageId={`${island.heroId}-dest-hero`}
              name={island.name}
              category="Ada detay sayfası hero banner"
              imageUrls={imageUrls}
              editingId={editingId}
              setEditingId={setEditingId}
              handleImageUrlChange={handleImageUrlChange}
              handleFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'destinations') {
      const island = ISLANDS_DATA[selectedIsland];
      return (
        <div>
          <div className="mb-6 flex gap-2 flex-wrap">
            {Object.entries(ISLANDS_DATA).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedIsland(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedIsland === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {data.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {island.destinations.map(dest => (
              <ImageCard
                key={`${selectedIsland}-${dest.id}-hero`}
                imageId={`${selectedIsland}-${dest.id}-hero`}
                name={`${dest.name}`}
                category="Destinasyon Hero"
                imageUrls={imageUrls}
                editingId={editingId}
                setEditingId={setEditingId}
                handleImageUrlChange={handleImageUrlChange}
                handleFileUpload={handleFileUpload}
                uploadProgress={uploadProgress}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'gallery') {
      const island = ISLANDS_DATA[selectedIsland];
      return (
        <div>
          <div className="mb-6 flex gap-2 flex-wrap">
            {Object.entries(ISLANDS_DATA).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedIsland(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedIsland === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {data.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8">
            {island.destinations.map(dest => (
              <div key={`${selectedIsland}-${dest.id}-gallery`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  {dest.name} Galerisi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map(index => (
                    <ImageCard
                      key={`${selectedIsland}-${dest.id}-img${index}`}
                      imageId={`${selectedIsland}-${dest.id}-img${index}`}
                      name={`Resim ${index + 1}`}
                      category="Galeri"
                      imageUrls={imageUrls}
                      editingId={editingId}
                      setEditingId={setEditingId}
                      handleImageUrlChange={handleImageUrlChange}
                      handleFileUpload={handleFileUpload}
                      uploadProgress={uploadProgress}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'tourHero') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOURS_CONFIG.map((tour) => (
            <ImageCard
              key={`${tour.id}-tour-hero`}
              imageId={`${tour.id}-tour-hero`}
              name={tour.name}
              category="Tur kartı & detay hero"
              imageUrls={imageUrls}
              editingId={editingId}
              setEditingId={setEditingId}
              handleImageUrlChange={handleImageUrlChange}
              handleFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'tourItinerary') {
      const DAYS = [1, 2, 3, 4, 5, 6, 7];
      return (
        <div className="space-y-6">
          {TOURS_CONFIG.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow p-4 space-y-3 border border-gray-100"
            >
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                {tour.name} - Günlük Program Arka Planları
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DAYS.map((day) => (
                  <ImageCard
                    key={`${tour.id}-itinerary-day-${day}`}
                    imageId={`${tour.id}-itinerary-day-${day}`}
                    name={`${tour.name} - Gün ${day}`}
                    category="Günlük program arka planı"
                    imageUrls={imageUrls}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    handleImageUrlChange={handleImageUrlChange}
                    handleFileUpload={handleFileUpload}
                    uploadProgress={uploadProgress}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'tourGallery') {
      const GALLERY_INDEXES = [0, 1, 2, 3, 4, 5];
      return (
        <div className="space-y-6">
          {TOURS_CONFIG.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow p-4 space-y-3 border border-gray-100"
            >
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                {tour.name} - Turdan Kareler Galerisi
              </h3>
              <p className="text-xs text-gray-500">
                Buradan tur detay sayfasındaki "Turdan Kareler" bölümünde görünen görselleri yönetebilirsiniz.
                Bu tur için hiç resim eklemezseniz, varsayılan galeri görselleri kullanılmaya devam eder.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {GALLERY_INDEXES.map((index) => (
                  <ImageCard
                    key={`${tour.id}-tour-gallery-${index}`}
                    imageId={`${tour.id}-tour-gallery-${index}`}
                    name={`Galeri Resmi ${index + 1}`}
                    category="Turdan Kareler galerisi"
                    imageUrls={imageUrls}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    handleImageUrlChange={handleImageUrlChange}
                    handleFileUpload={handleFileUpload}
                    uploadProgress={uploadProgress}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'tabGallery') {
      const island = ISLANDS_DATA[selectedIsland];
      const TAB_CONFIG = [
        { id: 'gezilecek', label: 'Gezilecek Yerler' },
        { id: 'aktiviteler', label: 'Aktiviteler' },
        { id: 'yiyecek', label: 'Yiyecek & İçecek' },
        { id: 'konaklama', label: 'Konaklama' },
        { id: 'alisveris', label: 'Alışveriş' },
      ];

      return (
        <div>
          <div className="mb-6 flex gap-2 flex-wrap">
            {Object.entries(ISLANDS_DATA).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedIsland(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedIsland === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {data.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-10">
            {island.destinations.map((dest) => (
              <div key={`${selectedIsland}-${dest.id}-tabs`} className="border rounded-xl p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  {dest.name} - Sekme Görselleri
                </h3>

                <div className="space-y-6">
                  {TAB_CONFIG.map((tab) => (
                    <div key={tab.id}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                        <span>{tab.label}</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[0, 1, 2].map((index) => {
                          const imageId = `${selectedIsland}-${dest.id}-${tab.id}-img${index}`;
                          return (
                            <ImageCard
                              key={imageId}
                              imageId={imageId}
                              name={`${tab.label} - Resim ${index + 1}`}
                              category={`Sekme: ${tab.label}`}
                              imageUrls={imageUrls}
                              editingId={editingId}
                              setEditingId={setEditingId}
                              handleImageUrlChange={handleImageUrlChange}
                              handleFileUpload={handleFileUpload}
                              uploadProgress={uploadProgress}
                              compact={true}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'tours') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Buradan tur kartlarında görünen <span className="font-semibold">tur tarih aralıklarını</span>,
            <span className="font-semibold"> kişi başı normal fiyatları</span> ve isteğe bağlı
            <span className="font-semibold"> kampanya / indirim ayarlarını</span> güncelleyebilirsiniz.
            Değişiklikler kaydedildikten sonra ziyaretçi tarafındaki tur paketleri sayfasına yansır.
          </p>

          {toursLoading ? (
            <p className="text-sm text-gray-500">Tur ayarları yükleniyor...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toursSettings.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-xl shadow p-4 space-y-3 border border-gray-100"
                >
                  <h3 className="text-base font-semibold text-gray-800 mb-1">{tour.name}</h3>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tur Tarih Aralığı
                    </label>
                    <input
                      type="text"
                      value={tour.dateRange}
                      onChange={(e) => handleTourFieldChange(tour.id, 'dateRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
	                  placeholder="Örn: 28 Mart - 3 Nisan 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Kişi Başı Normal Fiyat (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tour.price}
                      onChange={(e) => handleTourFieldChange(tour.id, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Örn: 3200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        İndirim Oranı (%) - Opsiyonel
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={tour.discountPercent}
                        onChange={(e) => handleTourFieldChange(tour.id, 'discountPercent', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Örn: 20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Kampanya Etiketi (Görsel Üstü) - Opsiyonel
                      </label>
                      <input
                        type="text"
                        value={tour.promoLabel}
                        onChange={(e) => handleTourFieldChange(tour.id, 'promoLabel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Örn: Babalar Günü'ne Özel %20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveTours}
              disabled={toursSaving}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {toursSaving ? 'Kaydediliyor...' : 'Tur Ayarlarını Kaydet'}
            </button>
            {toursMessage && (
              <p className="text-xs text-gray-600">{toursMessage}</p>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel - Resim Yönetimi</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('islands')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'islands'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Ada Hero Görselleri
          </button>
          <button
            onClick={() => setActiveTab('destHero')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'destHero'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Destinasyon Hero Banner
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'destinations'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Destinasyon Görselleri
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Galeri Görselleri
          </button>
          <button
            onClick={() => setActiveTab('tourHero')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'tourHero'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tur Hero Görselleri
          </button>
          <button
            onClick={() => setActiveTab('tourItinerary')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'tourItinerary'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Günlük Program Arka Planları
          </button>
          <button
            onClick={() => setActiveTab('tourGallery')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'tourGallery'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tur Detay Galerileri
          </button>
          <button
            onClick={() => setActiveTab('tourHero')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'tourHero'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tur Hero Görselleri
          </button>
          <button

            onClick={() => setActiveTab('tabGallery')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'tabGallery'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sekme Görselleri
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'tours'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tur Paketleri
          </button>
        </div>
        {/* Content */}
        {renderContent()}

        {/* Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-8">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Tüm Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 max-w-7xl mx-auto mb-8">
        <p className="text-sm text-blue-800">
          <strong>Dosya Yükleme:</strong> Resim dosyasını seç veya URL gir. Yüklenen resimler Firebase Storage'da saklanır.
        </p>
      </div>
    </div>
  );
}

// Image Card Component
function ImageCard({
  imageId,
  name,
  category,
  imageUrls,
  editingId,
  setEditingId,
  handleImageUrlChange,
  handleFileUpload,
  uploadProgress,
  compact = false
}) {
  const isEditing = editingId === imageId;
  const progress = uploadProgress[imageId];

  const cardClass = compact 
    ? 'bg-white rounded-lg shadow p-3' 
    : 'bg-white rounded-lg shadow-md p-6';

  const titleClass = compact 
    ? 'text-base font-semibold text-gray-800' 
    : 'text-lg font-semibold text-gray-800';

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={titleClass}>{name}</h3>
          <p className="text-xs text-gray-500">{category}</p>
        </div>
        <button
          onClick={() => setEditingId(isEditing ? null : imageId)}
          className="text-indigo-600 hover:text-indigo-700"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {imageUrls[imageId] && (
        <div className={`mb-3 overflow-hidden rounded-lg ${compact ? 'h-20' : 'h-40'}`}>
          <img
            src={imageUrls[imageId]}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {isEditing && (
        <div className="border-t pt-3 space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Dosya Yükle
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, imageId)}
                className="text-xs flex-1"
              />
            </div>
            {progress && (
              <span className={`text-xs font-semibold inline-block mt-1 ${
                progress === 'Başarılı' ? 'text-green-600' :
                progress === 'Hata!' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {progress}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              veya URL Gir
            </label>
            <input
              type="url"
              value={imageUrls[imageId] || ''}
              onChange={(e) => handleImageUrlChange(imageId, e.target.value)}
              placeholder="https://..."
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
