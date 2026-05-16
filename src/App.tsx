import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import ToolDetail from './pages/ToolDetail';
import AITools from './pages/AITools';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import NotFound from './pages/NotFound';
import { AboutUs } from './legal/AboutUs';
import { ContactUs } from './legal/ContactUs';
import { PrivacyPolicy } from './legal/PrivacyPolicy';
import { TermsAndConditions } from './legal/TermsAndConditions';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-white text-gray-900">
            <ErrorBoundary>
              <Navbar />
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tools/:toolId" element={<ToolDetail />} />
                  <Route path="/ai-tools" element={<AITools />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <CookieBanner />
            </ErrorBoundary>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;