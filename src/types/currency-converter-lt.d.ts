declare module 'currency-converter-lt' {
  class CurrencyConverter {
    constructor();
    from(currency: string): this;
    to(currency: string): this;
    amount(value: number): this;
    convert(): Promise<number>;
    fetch(): Promise<void>;
  }

  export = CurrencyConverter;
} 