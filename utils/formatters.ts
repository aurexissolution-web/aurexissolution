export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  // The date from input type="date" is YYYY-MM-DD.
  // We need to create a date object that isn't affected by timezone.
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString; // Fallback for other formats
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString('en-GB'); // en-GB gives DD/MM/YYYY
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(amount);
};