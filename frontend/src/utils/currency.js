// Centralized currency formatting utility
export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Not specified';
  
  // Remove any existing currency symbols to avoid duplication
  const cleanAmount = amount.toString().replace(/[₹$€£¥]/g, '');
  
  // Convert to number and format with commas
  const numericAmount = parseFloat(cleanAmount);
  
  if (isNaN(numericAmount)) return 'Not specified';
  
  return `${numericAmount.toLocaleString()}`;
};

export default formatCurrency;
