import { mergeTranslations } from 'react-admin';
import polyglotI18nProviderImport from 'ra-i18n-polyglot';
import englishMessagesImport from 'ra-language-english';
import { raSupabaseEnglishMessages } from 'ra-supabase-language-english';

// Before react-admin 5.13, these packages are CommonJS only: under Node ESM,
// their default import is the whole module.exports object.
const interopDefault = <T>(imported: T): T =>
    (imported as unknown as { default?: T }).default ?? imported;
const polyglotI18nProvider = interopDefault(polyglotI18nProviderImport);
const englishMessages = interopDefault(englishMessagesImport);

export const defaultI18nProvider = polyglotI18nProvider(() => {
    return mergeTranslations(englishMessages, raSupabaseEnglishMessages);
}, 'en');
