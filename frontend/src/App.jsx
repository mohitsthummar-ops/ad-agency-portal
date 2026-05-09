import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useCrossTabLogout from './hooks/useCrossTabLogout';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Terms from './pages/public/Terms';
import CampaignTemplates from './pages/public/CampaignTemplates';
import AdDetails from './pages/client/AdDetails';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import ProfileSettings from './pages/client/ProfileSettings';
import RequestAd from './pages/client/RequestAd';
import MyRequests from './pages/client/MyRequests';
import MySubscription from './pages/client/MySubscription';
import PaymentHistory from './pages/client/PaymentHistory';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AdsManagement from './pages/admin/AdsManagement';
import CategoryPlatformManagement from './pages/admin/CategoryPlatformManagement';
import Analytics from './pages/admin/Analytics';
import WebsiteSettings from './pages/admin/WebsiteSettings';
import AdminAdRequests from './pages/admin/AdRequests';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (isAuthenticated) return <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />;
  return children;
};

function App() {
  useCrossTabLogout();
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1117',
            color: '#e2e8f0',
            border: '1px solid rgba(99,102,241,0.3)',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/campaign-templates" element={<CampaignTemplates />} />
          <Route path="/ads/:id" element={<AdDetails />} />
        </Route>

        {/* Auth Routes (guest only) */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        {/* Client (User) Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
          <Route index element={<ClientDashboard />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="request-ad" element={<RequestAd />} />
          <Route path="my-requests" element={<MyRequests />} />
          <Route path="subscription" element={<MySubscription />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="campaign-templates" element={<CampaignTemplates />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="ads" element={<AdsManagement />} />
          <Route path="ad-requests" element={<AdminAdRequests />} />
          <Route path="subscription-plans" element={<SubscriptionPlans />} />
          <Route path="categories-platforms" element={<CategoryPlatformManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<WebsiteSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
