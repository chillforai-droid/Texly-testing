import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Props {
  name: string;
  description: string;
}

const AIToolPlaceholder = ({ name, description }: Props) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <Helmet>
        <title>{name} - Texly AI</title>
      </Helmet>
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-[3rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center mx-auto mb-8">
            <Wrench className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-black mb-4">{name}</h1>
          <p className="text-slate-400 mb-10 leading-relaxed">
            {description} This tool is currently under development and will be available very soon.
          </p>
          <Link 
            to="/ai-tools"
            className="inline-flex items-center gap-2 text-blue-400 font-bold hover:gap-4 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to AI Hub
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AIToolPlaceholder;
