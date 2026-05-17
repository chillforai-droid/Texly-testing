import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DynamicIcon from './LucideIcon';
import { useLanguage } from '../context/LanguageContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    icon: string;
    description: string;
  } | null;
  tools: any[];
  theme: {
    primary: string;
    bg: string;
    iconBg: string;
    border: string;
  };
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, tools, theme }) => {
  const { t } = useLanguage();

  const getToolPath = (tool: any) => {
    if (tool.category === 'ai' || tool.category === 'generator') {
      return `/tools/${tool.slug}`;
    }
    return `/tool/${tool.slug}`;
  };

  return (
    <AnimatePresence>
      {isOpen && category && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className={`p-8 ${theme.bg} border-b ${theme.border}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${theme.iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <DynamicIcon name={category.icon} className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {t.categories[category.id as keyof typeof t.categories] || category.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      {tools.length} {t.directory.toolsAvailable}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={getToolPath(tool)}
                    onClick={onClose}
                    className="group p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center text-${theme.primary}`}>
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.shortDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;
