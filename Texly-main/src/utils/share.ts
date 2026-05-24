export const shareOnTwitter = (title: string, url: string) => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'noopener,noreferrer');
};

export const shareOnFacebook = (url: string) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'noopener,noreferrer');
};

export const shareOnLinkedin = (title: string, url: string) => {
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
};

export const shareByEmail = (subject: string, body: string) => {
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
};

export const shareOnWhatsApp = (text: string, url: string) => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
