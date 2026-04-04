/**
 * Supabase client — loaded as ESM module (type="module").
 * Sets window._sb so regular scripts can access the client
 * after DOMContentLoaded (which fires AFTER deferred/module scripts).
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

var SUPABASE_URL     = 'https://sytaqvoegmbaorcuvpqx.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_2BUtNoHrQEaMjxUwolHbqg_uvqsIG9U';

window._sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
