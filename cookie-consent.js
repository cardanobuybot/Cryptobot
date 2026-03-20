(function () {
  var STORAGE_KEY = 'cb_cookie_consent_v1';
  var GA_ID = 'G-DMXZNZDY3X';

  var EEA_COUNTRIES = new Set([
    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO'
  ]);

  function getRegionCode() {
    try {
      var locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
      var m = locale.match(/-([A-Z]{2})$/i);
      if (m) return m[1].toUpperCase();
    } catch (e) {}
    return null;
  }

  function isLikelyEEA() {
    var region = getRegionCode();
    if (region && EEA_COUNTRIES.has(region)) return true;
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (/Europe\//.test(tz)) return true;
    } catch (e) {}
    return false;
  }

  function loadGA() {
    if (window.__cbGaLoaded) return;
    window.__cbGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function save(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    document.cookie =
      STORAGE_KEY + '=' + choice +
      '; path=/; max-age=' + (60 * 60 * 24 * 180) +
      '; SameSite=Lax; Secure';
  }

  function makeBanner() {
    var b = document.createElement('div');
    b.className = 'cookie-banner';
    b.innerHTML = '' +
      '<p>We use analytics cookies to improve the website experience. You can accept or reject optional analytics cookies. <a href="/cookie-policy.html">Cookie Policy</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="cookie-btn cookie-btn-accept">Accept</button>' +
      '<button type="button" class="cookie-btn cookie-btn-reject">Reject</button>' +
      '</div>';

    document.body.appendChild(b);

    b.querySelector('.cookie-btn-accept').addEventListener('click', function () {
      save('accepted');
      loadGA();
      b.remove();
    });

    b.querySelector('.cookie-btn-reject').addEventListener('click', function () {
      save('rejected');
      b.remove();
    });
  }

  function run() {
    var choice = localStorage.getItem(STORAGE_KEY);
    var eea = isLikelyEEA();

    if (!eea) {
      loadGA();
      return;
    }

    if (choice === 'accepted') {
      loadGA();
      return;
    }

    if (choice === 'rejected') {
      return;
    }

    makeBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
