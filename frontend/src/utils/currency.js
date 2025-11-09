// Centralized currency formatting utility
export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Not specified';
  
  // Remove any existing currency symbols to avoid duplication
  const cleanAmount = amount.toString().replace(/[₹$€£¥]/g, '');
  
  // Convert to number and format with Indian grouping (12,34,567)
  const numericAmount = parseFloat(cleanAmount);
  
  if (isNaN(numericAmount)) return 'Not specified';
  
  return `${new Intl.NumberFormat('en-IN').format(numericAmount)}`;
};

export default formatCurrency;
