export const formatCurrency = (value: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};
export default formatCurrency;
