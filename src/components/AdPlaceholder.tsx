/**
 * AdPlaceholder — DISABLED until AdSense approval
 * Real slot IDs configure होने पर यह file replace करें
 */
import React from 'react';

interface AdPlaceholderProps {
  className?: string;
  slot?: string;
  adSlotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

// AdSense approval मिलने तक completely disabled — nothing renders
const AdPlaceholder: React.FC<AdPlaceholderProps> = () => null;

export default AdPlaceholder;
