import React from 'react';
import { Twitter, Facebook, MessageCircle, Mail, Share2 } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, className = '' }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-[#1DA1F2]'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2]'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-[#25D366]'
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'bg-slate-600'
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Viral Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-xl ${link.color} text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/10`}
          title={`Share on ${link.name}`}
        >
          <link.icon size={18} />
        </a>
      ))}
      <button
        onClick={handleNativeShare}
        className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-500/20"
        title="More sharing options"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
};

export default SocialShare;
