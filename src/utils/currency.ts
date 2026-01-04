/**
 * Get currency symbol based on currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "$",
    INR: "₹",
  };

  return symbols[currencyCode] || currencyCode;
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  showDecimals: boolean = true
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = showDecimals
    ? amount.toFixed(2)
    : Math.round(amount).toString();

  // Format with thousand separators
  const parts = formattedAmount.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${symbol}${parts.join(".")}`;
}

/**
 * Format currency for compact display (e.g., 4.2K, 1.5M)
 */
export function formatCompactCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  const symbol = getCurrencySymbol(currencyCode);

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }

  return `${symbol}${amount.toFixed(0)}`;
}

