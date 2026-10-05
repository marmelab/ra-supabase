// Loads the built packages the way Node does, as ES modules and as CommonJS,
// to catch imports that only bundlers resolve. Run it after `make build`.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = { instanceUrl: 'http://localhost', apiKey: 'key' };

const esmCore = await import('ra-supabase-core');
assert.equal(typeof esmCore.supabaseDataProvider(config).getList, 'function');
const cjsCore = require('ra-supabase-core');
assert.equal(typeof cjsCore.supabaseDataProvider(config).getList, 'function');

// Under Node ESM, ra-supabase and ra-supabase-ui-materialui need Material UI
// v7, and the demo uses v5: load the i18n provider module directly.
const esmI18n = await import(
    './packages/ra-supabase/dist/defaultI18nProvider.js'
);
assert.equal(esmI18n.defaultI18nProvider.translate('ra.action.save'), 'Save');
const cjsI18n = require('./packages/ra-supabase/dist/defaultI18nProvider.cjs');
assert.equal(cjsI18n.defaultI18nProvider.translate('ra.action.save'), 'Save');

console.log('The built packages load as ES modules and as CommonJS.');
