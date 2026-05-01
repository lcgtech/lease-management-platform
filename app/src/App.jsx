import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PortfolioOverview from './pages/PortfolioOverview';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import RentRoll from './pages/RentRoll';
import LeaseCalendar from './pages/LeaseCalendar';
import AiInsights from './pages/AiInsights';
import ExportReports from './pages/ExportReports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Routes>
            <Route path="/"               element={<PortfolioOverview />} />
            <Route path="/properties"     element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/rent-roll"      element={<RentRoll />} />
            <Route path="/calendar"       element={<LeaseCalendar />} />
            <Route path="/ai-insights"    element={<AiInsights />} />
            <Route path="/export"         element={<ExportReports />} />
            <Route path="/settings"       element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
