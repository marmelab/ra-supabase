// Loads the built packages in Node, as ES modules and as CommonJS, to catch
// imports that only bundlers resolve. Run it after `make build`.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// These calls reach CommonJS-only dependencies (ra-data-postgrest,
// ra-i18n-polyglot, ra-language-english) whose default import needs interop
const checkDataProvider = ({ supabaseDataProvider }) =>
    assert.equal(
        typeof supabaseDataProvider({
            instanceUrl: 'http://localhost',
            apiKey: 'key',
        }).getList,
        'function'
    );
const checkI18nProvider = ({ defaultI18nProvider }) =>
    assert.equal(defaultI18nProvider.translate('ra.action.save'), 'Save');

checkDataProvider(await import('ra-supabase-core'));
await import('ra-supabase-language-english');
await import('ra-supabase-language-french');
// Under Node ESM, ra-supabase and ra-supabase-ui-materialui need Material UI
// v7, and the demo uses v5: load the i18n provider module directly.
checkI18nProvider(
    await import('./packages/ra-supabase/dist/defaultI18nProvider.js')
);

checkDataProvider(require('ra-supabase-core'));
require('ra-supabase-language-english');
require('ra-supabase-language-french');
require('ra-supabase-ui-materialui');
checkI18nProvider(require('ra-supabase'));

console.log('The built packages load as ES modules and as CommonJS.');
