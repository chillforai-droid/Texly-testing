import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ToolDetail from './pages/ToolDetail';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import AITools from './pages/AITools';
import NotFound from './pages/NotFound';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tools/:id" element={<ToolDetail />} />
                <Route path="/ai-tools" element={<AITools />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <CookieBanner />
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;