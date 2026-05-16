import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-gray-900 text-white py-20 text-center">
        <h1 className="text-4xl font-bold">{t('home.title')}</h1>
        <p className="mt-4 text-lg">{t('home.subtitle')}</p>
      </section>
      <main className="flex-grow">
        {/* Original home content goes here */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;