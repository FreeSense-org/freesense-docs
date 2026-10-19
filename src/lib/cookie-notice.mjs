// The cookie and storage notice for the documentation, as one inline script for the page head.
// The docs have no analytics and set one cookie, this notice's own choice (`fs-cookie-consent`, shared across
// freesense.org, one year). The theme choice (Starlight's `starlight-theme`) stays in the browser's localStorage. After Decline, the theme
// is kept in sessionStorage, which the browser clears when the tab closes.
// It runs before Starlight's theme script, so that script reads the right store.
export const cookieNoticeScript = `(function () {
  var KEY = 'fs-cookie-consent', THEME = 'starlight-theme', PRIVACY = 'https://freesense.org/privacy/';
  var ls, ss;
  try { ls = window.localStorage; ss = window.sessionStorage; } catch (e) { return; }
  var P = Storage.prototype, get = P.getItem, set = P.setItem, rm = P.removeItem;
  // The choice is one cookie shared by every freesense.org site, so it is asked once; localStorage mirrors it for other hosts.
  var SHARED = /(^|\\.)freesense\\.org$/.test(location.hostname);
  function read() {
    var m = document.cookie.match(/(?:^|; )fs-cookie-consent=(accepted|declined)/);
    if (m) return m[1];
    try { return get.call(ls, KEY); } catch (e) { return null; }
  }
  function declined() { return read() === 'declined'; }

  // After Decline, Starlight's theme value is read and written in sessionStorage instead of localStorage.
  P.getItem = function (k) { return (this === ls && k === THEME && declined()) ? get.call(ss, k) : get.call(this, k); };
  P.setItem = function (k, v) { return (this === ls && k === THEME && declined()) ? set.call(ss, k, v) : set.call(this, k, v); };
  P.removeItem = function (k) { return (this === ls && k === THEME && declined()) ? rm.call(ss, k) : rm.call(this, k); };

  function moveTheme(toSession) {
    try {
      var from = toSession ? ls : ss, to = toSession ? ss : ls;
      var t = get.call(from, THEME);
      // Starlight stores the automatic theme as an empty string, so test for null, not for truthiness.
      if (t !== null) { set.call(to, THEME, t); rm.call(from, THEME); }
    } catch (e) {}
  }

  // A choice made on another freesense.org site applies here too: an older persisted theme moves to this visit only.
  if (declined()) moveTheme(true);

  function build() {
    var bar = document.createElement('div');
    bar.id = 'cookie-bar';
    bar.className = 'fs-cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-labelledby', 'cookie-title');
    bar.setAttribute('aria-describedby', 'cookie-text');
    bar.hidden = true;
    bar.innerHTML =
      '<p class="fs-cb-text" id="cookie-text"><strong id="cookie-title">Cookies and storage.</strong> ' +
      'These docs have no tracking, analytics or ads. They keep only your colour-theme choice and this choice, which is saved for a year in one cookie shared by all freesense.org sites, so you are asked once. ' +
      '<em>Decline</em> keeps your theme for this visit only. <a href="' + PRIVACY + '">Privacy policy</a></p>' +
      '<div class="fs-cb-actions"><button type="button" id="cb-decline" class="fs-cb-btn">Decline</button>' +
      '<button type="button" id="cb-accept" class="fs-cb-btn fs-cb-primary">Accept</button></div>';
    document.body.appendChild(bar);
    return bar;
  }

  function init() {
    var bar = build();
    var accept = document.getElementById('cb-accept'), decline = document.getElementById('cb-decline');
    function choose(v) {
      try { set.call(ls, KEY, v); } catch (e) {}
      if (SHARED) document.cookie = KEY + '=' + v + '; Domain=.freesense.org; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
      moveTheme(v === 'declined');
      bar.hidden = true;
      window.fsConsent = v;
      window.dispatchEvent(new CustomEvent('fs-consent', { detail: v }));
    }
    function open() {
      bar.hidden = false;
      accept.setAttribute('aria-pressed', String(read() === 'accepted'));
      decline.setAttribute('aria-pressed', String(read() === 'declined'));
      accept.focus({ preventScroll: true });
    }
    window.fsConsent = read();
    window.fsCookieSettings = open;
    if (!read()) bar.hidden = false;
    accept.addEventListener('click', function () { choose('accepted'); });
    decline.addEventListener('click', function () { choose('declined'); });
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); open(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !bar.hidden && read()) bar.hidden = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();`;
