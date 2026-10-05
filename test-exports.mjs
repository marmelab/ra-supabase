// Loads the built packages the way Node does, as ES modules and as CommonJS,
// to catch imports that only bundlers resolve. Run it after `make build`.
// Plain JavaScript on purpose: a TypeScript loader would change how Node
// resolves and loads the packages.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = { instanceUrl: 'http://localhost', apiKey: 'key' };

const checkDataProvider = ({ supabaseDataProvider }) =>
    assert.equal(typeof supabaseDataProvider(config).getList, 'function');
// The second key checks that the ra-supabase messages are merged in
const checkI18nProvider = ({ defaultI18nProvider }) => {
    assert.equal(defaultI18nProvider.translate('ra.action.save'), 'Save');
    assert.equal(
        defaultI18nProvider.translate('ra-supabase.auth.confirm_password'),
        'Confirm password'
    );
};
const checkMessages = messages => assert.equal(Object.keys(messages).length, 1);

checkDataProvider(await import('ra-supabase-core'));
checkMessages(await import('ra-supabase-language-english'));
checkMessages(await import('ra-supabase-language-french'));
// Under Node ESM, ra-supabase and ra-supabase-ui-materialui need Material UI
// v7, and the demo uses v5: load the i18n provider module directly.
checkI18nProvider(
    await import('./packages/ra-supabase/dist/defaultI18nProvider.js')
);

checkDataProvider(require('ra-supabase-core'));
checkMessages(require('ra-supabase-language-english'));
checkMessages(require('ra-supabase-language-french'));
assert.equal(typeof require('ra-supabase-ui-materialui').LoginPage, 'function');
checkDataProvider(require('ra-supabase'));
checkI18nProvider(require('ra-supabase'));

console.log('The built packages load as ES modules and as CommonJS.');
