import { mergeTranslations } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import { raSupabaseEnglishMessages } from 'ra-supabase-language-english';

export const defaultI18nProvider = polyglotI18nProvider(() => {
    return mergeTranslations(englishMessages, raSupabaseEnglishMessages);
}, 'en');
