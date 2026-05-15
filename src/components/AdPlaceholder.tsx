import React, { useEffect, useRef } from 'react';

interface AdPlaceholderProps {
  className?: string;
  slot?: string;
  adSlotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AD_SLOTS: Record<string, string> = {
  'Home Top':        '1234567890',  // <-- Apna real ad slot ID daalein
  'Home Bottom':     '1234567891',  // <-- Apna real ad slot ID daalein
  'Top of Tool':     '1234567892',  // <-- Apna real ad slot ID daalein
  'Bottom of Tool':  '1234567893',  // <-- Apna real ad slot ID daalein
  'General':         '1234567890',  // <-- Apna real ad slot ID daalein
};

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  className = '',
  slot = 'General',
  adSlotId,
  format = 'auto',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const resolvedSlotId = adSlotId || AD_SLOTS[slot] || AD_SLOTS['General'];

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (e) {
      // silently ignore
    }
  }, []);

  return (
    <div className={`overflow-hidden text-center ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5997708513500271"
        data-ad-slot={resolvedSlotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdPlaceholder;
