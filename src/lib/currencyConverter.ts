import CC from 'currency-converter-lt';

let converter: any = null;

export const initializeCurrencyConverter = async () => {
  if (!converter) {
    converter = new CC();
    await converter.from('USD').to('INR').fetch();
  }
  return converter;
};

export const convertUSDtoINR = async (amount: number): Promise<number> => {
  try {
    const conv = await initializeCurrencyConverter();
    const inrAmount = await conv.amount(amount).convert();
    return Math.round(inrAmount);
  } catch (error) {
    console.error('Error converting currency:', error);
    // Fallback to a fixed rate if API fails
    return Math.round(amount * 75);
  }
}; 