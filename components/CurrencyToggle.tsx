'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';

export const CurrencyToggle = ({ className }: { className?: string }) => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-white/10 bg-input/40 p-1 text-xs font-semibold select-none',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setCurrency('usd')}
        className={cn(
          'flex items-center gap-1 rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer',
          currency === 'usd'
            ? 'bg-purple-600/90 text-white shadow-sm'
            : 'text-purple-100/60 hover:text-white hover:bg-white/5'
        )}
      >
        <span>USD</span>
        <span className="text-[10px] opacity-75">$</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrency('inr')}
        className={cn(
          'flex items-center gap-1 rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer',
          currency === 'inr'
            ? 'bg-purple-600/90 text-white shadow-sm'
            : 'text-purple-100/60 hover:text-white hover:bg-white/5'
        )}
      >
        <span>INR</span>
        <span className="text-[10px] opacity-75">₹</span>
      </button>
    </div>
  );
};
