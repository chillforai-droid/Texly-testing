import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface RatingSystemProps {
  toolId: string;
  theme: any;
}

const RatingSystem: React.FC<RatingSystemProps> = ({ toolId, theme }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRatings();
    const userRated = localStorage.getItem(`has_rated_${toolId}`);
    if (userRated) setHasRated(true);
  }, [toolId]);

  const fetchRatings = async () => {
    if (!supabase) {
      // Fallback to localStorage if Supabase is not configured
      const storedRatings = JSON.parse(localStorage.getItem(`ratings_${toolId}`) || '[5, 5, 5, 4, 5]');
      const sum = storedRatings.reduce((a: number, b: number) => a + b, 0);
      setAverageRating(parseFloat((sum / storedRatings.length).toFixed(1)));
      setTotalRatings(storedRatings.length);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tool_ratings')
        .select('rating')
        .eq('tool_id', toolId);

      if (error) {
        if (error.message === 'Failed to fetch') {
          console.warn('Supabase network error (Ratings): Failed to fetch. Falling back to local data.');
          const storedRatings = JSON.parse(localStorage.getItem(`ratings_${toolId}`) || '[5, 5, 5, 4, 5]');
          const sum = storedRatings.reduce((a: number, b: number) => a + b, 0);
          setAverageRating(parseFloat((sum / storedRatings.length).toFixed(1)));
          setTotalRatings(storedRatings.length);
          return;
        }
        throw error;
      }

      if (data) {
        if (data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(parseFloat((sum / data.length).toFixed(1)));
          setTotalRatings(data.length);
        } else {
          // Default for new tools
          setAverageRating(5.0);
          setTotalRatings(12);
        }
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (value: number) => {
    if (hasRated) return;

    try {
      if (supabase) {
        const { error } = await supabase
          .from('tool_ratings')
          .insert([{ tool_id: toolId, rating: value }]);
        
        if (error) throw error;
      } else {
        const storedRatings = JSON.parse(localStorage.getItem(`ratings_${toolId}`) || '[5, 5, 5, 4, 5]');
        localStorage.setItem(`ratings_${toolId}`, JSON.stringify([...storedRatings, value]));
      }

      localStorage.setItem(`has_rated_${toolId}`, 'true');
      setRating(value);
      setHasRated(true);
      setShowThankYou(true);
      fetchRatings(); // Refresh stats

      setTimeout(() => setShowThankYou(false), 3000);
    } catch (err) {
      console.error('Error saving rating:', err);
    }
  };

  return (
    <div className={`p-6 bg-white rounded-3xl border border-${theme.border} shadow-sm mb-8`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Rate this Tool</h3>
          <p className="text-sm text-slate-500 font-medium">Help us improve by sharing your feedback</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => !hasRated && setHoverRating(star)}
                onMouseLeave={() => !hasRated && setHoverRating(0)}
                onClick={() => handleRate(star)}
                disabled={hasRated}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                className={`transition-all duration-200 ${hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
              >
                <Star
                  size={32}
                  fill={(hoverRating || rating || averageRating) >= star ? '#eab308' : 'transparent'}
                  className={(hoverRating || rating || averageRating) >= star ? 'text-yellow-500' : 'text-slate-300'}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span className="text-xl text-slate-900">{averageRating}</span>
            <span className="text-slate-300">/</span>
            <span>5.0</span>
            <span className="ml-2 text-xs text-slate-400 font-medium">({totalRatings} ratings)</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-center rounded-xl text-sm font-bold border border-emerald-100"
          >
            Thank you for your rating!
          </motion.div>
        )}
      </AnimatePresence>
      
      {hasRated && !showThankYou && (
        <p className="mt-4 text-center text-xs text-slate-400 font-medium italic">
          You have already rated this tool. Thank you!
        </p>
      )}
    </div>
  );
};

export default RatingSystem;
