import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, User, Trash2, Heart, Loader2 } from 'lucide-react';
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
  targetId: string;
  targetType: 'tool' | 'blog';
  theme: any;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = (id: string, type: string) => `texly_comments_${type}_${id}`;

function loadLocalComments(targetId: string, targetType: string): Comment[] {
  try {
    const raw = localStorage.getItem(LS_KEY(targetId, targetType));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalComments(targetId: string, targetType: string, comments: Comment[]) {
  try {
    localStorage.setItem(LS_KEY(targetId, targetType), JSON.stringify(comments));
  } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────
const CommentSection: React.FC<CommentSectionProps> = ({ targetId, targetType, theme }) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useLocal = !supabase;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (useLocal) {
      setComments(loadLocalComments(targetId, targetType));
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase!
        .from('comments')
        .select('*')
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .order('created_at', { ascending: false });

      if (err) {
        // Network error → fall back to localStorage
        setComments(loadLocalComments(targetId, targetType));
      } else if (data) {
        const mapped = data.map((c: any) => ({
          id: c.id, author: c.author, text: c.text,
          date: c.created_at, likes: c.likes || 0
        }));
        setComments(mapped);
      }
    } catch {
      setComments(loadLocalComments(targetId, targetType));
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType, useLocal]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const newEntry: Comment = {
      id: Date.now().toString(),
      author: authorName.trim(),
      text: newComment.trim(),
      date: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    if (useLocal) {
      const updated = [newEntry, ...comments];
      saveLocalComments(targetId, targetType, updated);
      setComments(updated);
      setNewComment('');
      setAuthorName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: err } = await supabase!.from('comments').insert([{
        target_id: targetId, target_type: targetType,
        author: newEntry.author, text: newEntry.text, likes: 0
      }]);

      if (err) {
        // Save locally on DB error
        const updated = [newEntry, ...comments];
        saveLocalComments(targetId, targetType, updated);
        setComments(updated);
      } else {
        fetchComments();
      }

      setNewComment('');
      setAuthorName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Like ───────────────────────────────────────────────────────────────────
  const handleLike = async (id: string) => {
    const updated = comments.map(c =>
      c.id === id ? { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked } : c
    );
    setComments(updated);
    if (useLocal) { saveLocalComments(targetId, targetType, updated); return; }

    try {
      const c = comments.find(c => c.id === id);
      if (c) await supabase!.from('comments').update({ likes: c.isLiked ? c.likes - 1 : c.likes + 1 }).eq('id', id);
    } catch { fetchComments(); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    if (useLocal) { saveLocalComments(targetId, targetType, updated); return; }
    try { await supabase!.from('comments').delete().eq('id', id); } catch {}
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return 'Unknown date'; }
  };

  const accent = theme?.primaryText || 'text-blue-600';
  const borderCls = theme?.border ? `border-${theme.border}` : 'border-slate-200';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`mt-12 p-4 sm:p-8 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border ${borderCls} dark:border-slate-800 shadow-sm`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
        <div className={`p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700`}>
          <MessageSquare size={24} className={accent} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {t.comments.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">
            {t.comments.privacyNote}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-12 space-y-6">
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <User size={18} />
          </div>
          <input
            type="text"
            placeholder={t.comments.namePlaceholder}
            required
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <textarea
            placeholder={t.comments.messagePlaceholder}
            required
            rows={4}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {showSuccess && (
            <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t.comments.postedSuccess}
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:ml-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:shadow-xl hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" />{t.comments.posting}</>
            ) : (
              <>{t.comments.submit}<Send size={18} /></>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t.comments.loading}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-xl font-black text-blue-600 shadow-sm">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{comment.author}</h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{formatDate(comment.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(comment.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">{comment.text}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${comment.isLiked ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'transparent'} />
                    {comment.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
