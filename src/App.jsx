import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AnalyticsTracker from './components/AnalyticsTracker';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Travel from './pages/Travel';
import Tours from './pages/Tours';
import GroupTours from './pages/GroupTours';
import TourDetail from './pages/TourDetail';
import Payment from './pages/Payment';
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

function App() {
  console.log('App component loaded');
  return (
    <Router>
      <ScrollToTop />
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/groups" element={<GroupTours />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/payment" element={<Payment />} />
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
