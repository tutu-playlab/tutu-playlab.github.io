(() => {
  const MEASUREMENT_ID = "G-8NS4WMKZR6";
  const CONSENT_STORAGE_KEY = "two-more-games.analytics-consent.v1";
  const CONSENT_GRANTED = "granted";
  const CONSENT_DENIED = "denied";
  const componentScript = document.currentScript;
  const componentUrl = componentScript ? new URL(componentScript.src) : null;
  const stylesheetUrl = componentUrl
    ? new URL(`analytics-consent.css${componentUrl.search}`, componentUrl).href
    : "/components/analytics-consent.css";

  let currentConsent = readStoredConsent();
  let analyticsLoaded = false;
  let dialog = null;
  let previousFocus = null;

  function readStoredConsent() {
    try {
      const storedConsent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      return [CONSENT_GRANTED, CONSENT_DENIED].includes(storedConsent) ? storedConsent : null;
    } catch (error) {
      return null;
    }
  }

  function storeConsent(consent) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
    } catch (error) {
      // 無法使用 localStorage 時，選擇仍會套用在目前頁面，但不會跨頁保存。
    }
  }

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  function updateGoogleConsent(analyticsStorage) {
    ensureDataLayer();
    window.gtag("consent", "update", {
      analytics_storage: analyticsStorage,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function analyticsConfig() {
    return {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    };
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window[`ga-disable-${MEASUREMENT_ID}`] = false;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset.googleAnalytics = "";
    document.head.append(script);

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, analyticsConfig());
  }

  function deleteAnalyticsCookies() {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));
    const domains = [window.location.hostname, `.${window.location.hostname}`, ".twomoregames.space"];

    cookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
      });
    });
  }

  function applyConsent(consent) {
    const previousConsent = currentConsent;
    currentConsent = consent;
    storeConsent(consent);

    if (consent === CONSENT_GRANTED) {
      window[`ga-disable-${MEASUREMENT_ID}`] = false;
      updateGoogleConsent("granted");
      if (analyticsLoaded && previousConsent !== CONSENT_GRANTED) {
        window.gtag("config", MEASUREMENT_ID, analyticsConfig());
      } else {
        loadAnalytics();
      }
      return;
    }

    window[`ga-disable-${MEASUREMENT_ID}`] = true;
    updateGoogleConsent("denied");
    deleteAnalyticsCookies();
  }

  function track(eventName, parameters = {}) {
    if (currentConsent !== CONSENT_GRANTED || window[`ga-disable-${MEASUREMENT_ID}`]) return;
    ensureDataLayer();
    window.gtag("event", eventName, parameters);
  }

  function addStylesheet() {
    if (document.querySelector("link[data-analytics-consent-styles]")) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = stylesheetUrl;
    stylesheet.dataset.analyticsConsentStyles = "";
    document.head.append(stylesheet);
  }

  function consentStatusText() {
    if (currentConsent === CONSENT_GRANTED) return "目前設定：已同意分析 Cookie";
    if (currentConsent === CONSENT_DENIED) return "目前設定：已拒絕分析 Cookie";
    return "請選擇是否允許分析 Cookie。拒絕不會影響遊戲功能。";
  }

  function updateDialogState() {
    if (!dialog) return;
    dialog.querySelector("[data-consent-status]").textContent = consentStatusText();
  }

  function closeDialog() {
    if (!dialog) return;
    dialog.hidden = true;
    document.body.classList.remove("analytics-consent-open");
    document.querySelector("main")?.removeAttribute("inert");
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function openDialog() {
    if (!dialog) createDialog();
    previousFocus = document.activeElement;
    updateDialogState();
    dialog.hidden = false;
    document.body.classList.add("analytics-consent-open");
    document.querySelector("main")?.setAttribute("inert", "");
    dialog.querySelector("[data-consent-heading]").focus({ preventScroll: true });
  }

  function chooseConsent(consent) {
    applyConsent(consent);
    updateDialogState();
    closeDialog();
  }

  function createDialog() {
    dialog = document.createElement("div");
    dialog.className = "analytics-consent-layer";
    dialog.hidden = true;
    dialog.innerHTML = `
      <section class="analytics-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="analyticsConsentTitle" aria-describedby="analyticsConsentDescription">
        <button class="analytics-consent-close" type="button" data-consent-close aria-label="關閉 Cookie 設定">×</button>
        <p class="analytics-consent-eyebrow">Privacy settings</p>
        <h2 id="analyticsConsentTitle" data-consent-heading tabindex="-1">協助我們改善遊戲？</h2>
        <p id="analyticsConsentDescription">
          同意後，我們會使用 Google Analytics 4 統計頁面瀏覽與遊戲操作，例如禮物選擇和結局。事件不包含姓名、Email 或自由輸入內容。
        </p>
        <p class="analytics-consent-status" data-consent-status></p>
        <p class="analytics-consent-privacy-link"><a href="/privacy/">查看隱私權政策</a></p>
        <div class="analytics-consent-actions">
          <button class="analytics-consent-button analytics-consent-button-secondary" type="button" data-consent-deny>拒絕</button>
          <button class="analytics-consent-button analytics-consent-button-primary" type="button" data-consent-grant>同意分析</button>
        </div>
      </section>
    `;

    dialog.querySelector("[data-consent-grant]").addEventListener("click", () => chooseConsent(CONSENT_GRANTED));
    dialog.querySelector("[data-consent-deny]").addEventListener("click", () => chooseConsent(CONSENT_DENIED));
    dialog.querySelector("[data-consent-close]").addEventListener("click", closeDialog);
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDialog();
    });
    document.body.append(dialog);
  }

  function initialize() {
    addStylesheet();
    ensureDataLayer();
    window.gtag("consent", "default", {
      analytics_storage: currentConsent === CONSENT_GRANTED ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });

    window.TwoMoreGamesAnalytics = Object.freeze({
      getConsent: () => currentConsent,
      openSettings: openDialog,
      track
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-analytics-settings]")) openDialog();
    });

    createDialog();
    if (currentConsent === CONSENT_GRANTED) loadAnalytics();
    if (currentConsent === null) openDialog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
