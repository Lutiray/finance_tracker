/**
 * Supported currencies in the system
 * @enum
 */
export enum Currency {
    /** Russian Ruble */
    RUB = 'RUB',
    /** US Dollar */
    USD = 'USD',
    /** Euro */
    EUR = 'EUR',
    /** Chinese Yuan */
    CNY = 'CNY',
    /** Czech Koruna */
    CZK = 'CZK'
}

/**
 * Array of all currency values for validation
 */
export const CurrencyValues = Object.values(Currency).filter(
    (v): v is Currency => typeof v === 'string'
);

/**
 * Currency utilities namespace
 */
export namespace CurrencyUtils {
    /**
     * Currency symbol mapping
     */
    const SYMBOLS: Readonly<Record<Currency, string>> = {
        [Currency.RUB]: '₽',
        [Currency.USD]: '$',
        [Currency.EUR]: '€',
        [Currency.CNY]: '¥',
        [Currency.CZK]: 'Kč'
    };

    /**
     * Gets currency symbol for display
     * @param currency - Currency code
     * @returns Currency symbol
     * @throws Error if currency not supported
     */
    export function getSymbol(currency: Currency): string {
        const symbol = SYMBOLS[currency];
        if (!symbol) {
            throw new Error(`Unsupported currency: ${currency}`);
        }
        return symbol;
    }

    /**
     * Formats amount with currency symbol
     * @param amount - Numeric amount
     * @param currency - Currency code
     * @param locale - Optional locale (default: 'en-US')
     * @returns Formatted string
     */
    export function formatAmount(amount: number, currency: Currency, locale = 'en-US'): string {
        const symbol = getSymbol(currency);
        const formatted = amount.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${symbol}${formatted}`;
    }
}