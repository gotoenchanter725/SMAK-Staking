export const isValidTezosAddress = (value: string) => {
  if (!value) return false;

  if (value.endsWith('.tez') && value.length > 4) return true;
  
  if (value.startsWith('tz1') && value.length === 36) return true;

  return false;
}