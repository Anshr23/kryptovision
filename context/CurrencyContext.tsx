'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';

export type Currency = 'usd' | 'inr';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  usdToInrRate: number;
  formatPrice: (amountInUsd: number | null | undefined, digits?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Updated fallback rate to match current market exchange rate (~94.47 INR per USD)
const FALLBACK_USD_TO_INR_RATE = 94.47;

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('usd');
  const [usdToInrRate, setUsdToInrRate] = useState<number>(FALLBACK_USD_TO_INR_RATE);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('kryptovision_currency') as Currency;
    if (savedCurrency === 'usd' || savedCurrency === 'inr') {
      setCurrencyState(savedCurrency);
    }

    // Fetch real-time live USD to INR exchange rate
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates && typeof data.rates.INR === 'number') {
          setUsdToInrRate(data.rates.INR);
        }
      })
      .catch(() => {
        setUsdToInrRate(FALLBACK_USD_TO_INR_RATE);
      });
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('kryptovision_currency', newCurrency);
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'usd' ? 'inr' : 'usd');
  };

  const formatPrice = (amountInUsd: number | null | undefined, digits?: number): string => {
    if (amountInUsd === null || amountInUsd === undefined || isNaN(amountInUsd)) {
      return currency === 'inr' ? '₹0.00' : '$0.00';
    }

    const value = currency === 'inr' ? amountInUsd * usdToInrRate : amountInUsd;
    return formatCurrencyUtil(value, digits, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        usdToInrRate,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
