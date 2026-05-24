import React, { useEffect } from 'react';
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
    primary?: string;
    bg?: string;
    iconBg: string;
    border: string;
    gradient?: string;
  };
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, tools, theme }) => {
  const { t } = useLanguage();

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Prevent body scroll when modal open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;

  const getToolPath = (tool: any) => {
    if (tool.category === 'ai' || tool.category === 'generator') return `/tools/${tool.slug}`;
    return `/tool/${tool.slug}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop — plain div, no motion */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal panel — CSS transition only, no framer-motion */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-none">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${theme.iconBg} rounded-2xl flex items-center justify-center shadow-sm shrink-0`}>
                <DynamicIcon name={category.icon} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t.categories[category.id as keyof typeof t.categories] || category.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {tools.length} {t.directory.toolsAvailable}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
              style={{ minHeight: 'unset', minWidth: 'unset' }}
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          {category.description && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Tools list */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={getToolPath(tool)}
                onClick={onClose}
                className="group flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0`}>
                  <DynamicIcon name={tool.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
