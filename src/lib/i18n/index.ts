import { es, type Translations } from "./dictionaries/es";

// Simple i18n - returns the Spanish dictionary
// For future multilingual support, switch based on locale here
export function getTranslations(): Translations {
  return es;
}

// Re-export for convenience
export type { Translations } from "./dictionaries/es";
export { es } from "./dictionaries/es";