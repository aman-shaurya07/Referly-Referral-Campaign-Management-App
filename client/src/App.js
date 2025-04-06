import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CampaignCreation from './pages/CampaignCreation';
import ValidateReward from './pages/ValidateReward';
import UploadCRM from './pages/UploadCRM';
import Analytics from "./pages/Analytics";


import Dashboard from './pages/Dashboard';
import CampaignsPage from './pages/CampaignsPage';
import MyReferrals from './pages/MyReferrals';
import ReferralSubmissionPage from './pages/ReferralSubmissionPage';
import CustomersPage from './pages/CustomersPage';
import PromoterPage from './pages/PromoterPage';
import ReferralSignupPage from './pages/ReferralSignupPage';






function App() {  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/validate-reward" element={<ValidateReward />} />
          <Route path="/upload-crm" element={<UploadCRM />} />
          <Route path="/analytics" element={<Analytics />} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/create-campaign" element={<CampaignCreation />} />
          <Route path="/my-referrals" element={<MyReferrals />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/ref/:campaignId/:referrerEmail" element={<ReferralSubmissionPage />} />
          <Route path="/promote/:campaignId/:promoterEmail" element={<PromoterPage />} />
          <Route path="/referral/:campaignId/:promoterEmail" element={<ReferralSignupPage />} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
