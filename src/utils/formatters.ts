// Utilities for formatting strings, dates, etc.
export const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  
  export const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };
  