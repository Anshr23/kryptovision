'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface FormattedPriceProps {
  amount: number | null | undefined;
  digits?: number;
  className?: string;
}

export const FormattedPrice = ({ amount, digits, className }: FormattedPriceProps) => {
  const { formatPrice } = useCurrency();

  return <span className={className}>{formatPrice(amount, digits)}</span>;
};

export default FormattedPrice;
