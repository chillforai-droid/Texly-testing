import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, User, Trash2, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

interface CommentSectionProps {
  targetId: string; // toolId or blogId
  targetType: 'tool' | 'blog';
  theme: any;
}

const CommentSection: React.FC<CommentSectionProps> = ({ targetId, targetType, theme }) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('comments')
        .select('*')
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        if (supabaseError.message === 'Failed to fetch') {
          console.warn('Supabase network error (Comments): Failed to fetch.');
          setError('Network error: Could not connect to comments database. Please check your connection.');
          return;
        }
        throw supabaseError;
      }

      if (data) {
        setComments(data.map(c => ({
          id: c.id,
          author: c.author,
          text: c.text,
          date: c.created_at,
          likes: c.likes || 0
        })));
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    if (!supabase) {
      setError('Comments are currently unavailable.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('comments')
        .insert([{
          target_id: targetId,
          target_type: targetType,
          author: authorName.trim(),
          text: newComment.trim(),
          likes: 0
        }]);
      
      if (supabaseError) throw supabaseError;

      setNewComment('');
      setAuthorName('');
      setShowSuccess(true);
      fetchComments();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!supabase) return;

    // Optimistic UI update
    const updatedComments = comments.map(c => {
      if (c.id === id) {
        return { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked };
      }
      return c;
    });
    setComments(updatedComments);

    try {
      const comment = comments.find(c => c.id === id);
      if (comment) {
        const { error: supabaseError } = await supabase
          .from('comments')
          .update({ likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 })
          .eq('id', id);
        
        if (supabaseError) throw supabaseError;
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      // Revert optimistic update on error
      fetchComments();
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;

    try {
      const { error: supabaseError } = await supabase.from('comments').delete().eq('id', id);
      if (supabaseError) throw supabaseError;
      
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown date';
    }
  };

  if (!supabase) {
    return (
      <div className={`mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center`}>
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Comments Unavailable</h2>
        <p className="text-sm text-slate-500 font-medium italic">Supabase is not configured. Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <div className={`mt-12 p-4 sm:p-8 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-${theme.border || 'slate-200'} dark:border-slate-800 shadow-sm`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
        <div className={`p-3 sm:p-4 bg-${theme.bg || 'slate-50'} dark:bg-slate-800 rounded-2xl border border-${theme.border || 'slate-200'} dark:border-slate-700`}>
          <MessageSquare size={24} className={`text-${theme.primary || 'blue-600'} sm:size-28`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.comments.title}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">{t.comments.privacyNote}</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder={t.comments.namePlaceholder}
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={`w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-${theme.primary || 'blue-600'}/10 focus:border-${theme.primary || 'blue-600'} outline-none transition-all`}
            />
          </div>
        </div>
        
        <div className="relative">
          <textarea
            placeholder={t.comments.messagePlaceholder}
            required
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-${theme.primary || 'blue-600'}/10 focus:border-${theme.primary || 'blue-600'} outline-none transition-all resize-none`}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <AnimatePresence>
            {showSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {t.comments.postedSuccess}
              </motion.span>
            )}
          </AnimatePresence>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto sm:ml-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-${theme.primary || 'blue-600'} text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:shadow-xl hover:shadow-${theme.primary || 'blue-600'}/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t.comments.posting}
              </>
            ) : (
              <>
                {t.comments.submit}
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={40} className={`text-${theme.primary || 'blue-600'} animate-spin mb-4`} />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t.comments.loading}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-xl font-black text-${theme.primary || 'blue-600'} shadow-sm`}>
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{comment.author}</h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{formatDate(comment.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
                  {comment.text}
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${comment.isLiked ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'transparent'} />
                    {comment.likes}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && comments.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-500 font-bold text-sm italic">{t.comments.noComments}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
