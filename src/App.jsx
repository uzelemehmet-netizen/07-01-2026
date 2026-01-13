import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AnalyticsTracker from './components/AnalyticsTracker';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import Corporate from './pages/Corporate';
import Contact from './pages/Contact';
import Travel from './pages/Travel';
import Tours from './pages/Tours';
import GroupTours from './pages/GroupTours';
import TourDetail from './pages/TourDetail';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Panel from './pages/Panel';
import Wedding from './pages/Wedding';
import YouTube from './pages/YouTube';
import Privacy from './pages/Privacy';
import Kesfet from './pages/Kesfet';
import KesfetIsland from './pages/KesfetIsland';
import { DestinationDetailPage as KesfetDestination } from './pages/KesfetDestination';
import Gallery from './pages/Gallery';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import RequireAuth from './auth/RequireAuth';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
}

function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const base = 'Endonezya Kaşifi | PT MoonStar Global Indonesia';

    const path = location.pathname || '/';
    let pageTitle = base;
    let description =
      "Endonezya Kaşifi (PT MoonStar Global Indonesia), Endonezya'da tur organizasyonu, balayı ve kişiye özel seyahat planlama ile evlilik rehberliği hizmeti sunar.";

    if (path === '/') {
      pageTitle = base;
    } else if (path === '/about') {
      pageTitle = `Hakkımızda | ${base}`;
    } else if (path === '/kurumsal') {
      pageTitle = `Kurumsal | ${base}`;
    } else if (path === '/contact') {
      pageTitle = `İletişim | ${base}`;
    } else if (path.startsWith('/tours')) {
      pageTitle = `Tur Paketleri | ${base}`;
      description =
        "Planlı Endonezya tur paketleri ve grup turları: Bali, Lombok, Komodo ve daha fazlası için sahada organize edilen programlar.";
    } else if (path.startsWith('/travel')) {
      pageTitle = `Seyahat | ${base}`;
    } else if (path.startsWith('/wedding')) {
      pageTitle = `Evlilik Rehberliği | ${base}`;
      description =
        "Endonezya'da evlilik süreciniz için rehberlik: otel, ulaşım, tercümanlık ve resmi evrak işlemlerinde uçtan uca destek.";
    } else if (path.startsWith('/kesfet')) {
      pageTitle = `Keşfet | ${base}`;
    } else if (path.startsWith('/youtube')) {
      pageTitle = `YouTube | ${base}`;
    } else if (path.startsWith('/gallery')) {
      pageTitle = `Galeri | ${base}`;
    } else if (path === '/privacy') {
      pageTitle = `Gizlilik Politikası | ${base}`;
    }

    document.title = pageTitle;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', description);
    }
  }, [location.pathname]);

  return null;
}

function App() {
  console.log('App component loaded');
  return (
    <Router>
      <ScrollToTop />
      <TitleManager />
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/kurumsal" element={<Corporate />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/groups" element={<GroupTours />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/panel"
          element={
            <RequireAuth>
              <Panel />
            </RequireAuth>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/kesfet" element={<Kesfet />} />
        <Route path="/kesfet/:island" element={<KesfetIsland />} />
        <Route path="/kesfet/:island/:destination" element={<KesfetDestination />} />
        <Route path="/wedding" element={<Wedding />} />
        <Route path="/youtube" element={<YouTube />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
