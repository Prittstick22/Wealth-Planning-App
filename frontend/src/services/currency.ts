import { EXCHANGE_RATES, CURRENCY_SYMBOLS, Currency } from "../context/CurrencyContext";

/**
 * Convert a USD amount to another currency
 */
export const convertCurrency = (
  amountUSD: number,
  toCurrency: Currency
): number => {
  const rate = EXCHANGE_RATES[toCurrency];
  return amountUSD * rate;
};

/**
 * Format a number as currency in the specified format
 */
export const formatCurrency = (
  amount: number,
  currency: Currency
): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const isJPY = currency === "JPY";
  const decimals = isJPY ? 0 : 2;

  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
};

/**
 * Convert a USD amount to another currency and format it
 */
export const convertAndFormatCurrency = (
  amountUSD: number,
  currency: Currency
): string => {
  const converted = convertCurrency(amountUSD, currency);
  return formatCurrency(converted, currency);
};
