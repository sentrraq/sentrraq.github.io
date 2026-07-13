/**
 * Supabase client — loaded as ESM module (type="module").
 * Sets window._sb so regular scripts can access the client.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

var SUPABASE_URL      = 'https://zaspvvbacffehxmnopmw.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_FeO54UxpIN4gxRux_pUrsw_xhzAR5ax';

window._sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function dispatchAuth(user) {
  window._authUser = user || null;
  window.dispatchEvent(new CustomEvent('sentraq:authchange', { detail: { user: window._authUser } }));
}

// Fire on every auth state change (login, logout, token refresh)
window._sb.auth.onAuthStateChange(function(event, session) {
  dispatchAuth(session ? session.user : null);
});

// Initialize from existing session on page load
window._sb.auth.getSession().then(function(res) {
  dispatchAuth(res.data && res.data.session ? res.data.session.user : null);
});
