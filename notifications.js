// notifications.js — Chab'app Notification Manager
// Gère : rappels études, horaires Chabbat, objectifs du jour, notifications personnalisées

const ChabNotifications = (() => {
  'use strict';

  const STORAGE_KEY = 'chabapp_notif_settings';
  let swRegistration = null;

  // ─── Paramètres par défaut ───
  const defaultSettings = {
    enabled: false,
    etudes: { enabled: true, hour: 8, minute: 0 },         // 08:00 — Hayom Yom, Tanya, Rambam
    chabbat: { enabled: true, minutesBefore: 30 },          // 30 min avant Chabbat
    objectifs: { enabled: true, hour: 9, minute: 0 },       // 09:00 — Rappel objectifs
    custom: []                                               // Notifications personnalisées
  };

  // ─── Charger / Sauvegarder les paramètres ───
  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
    } catch { return { ...defaultSettings }; }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // ─── Demander la permission ───
  async function requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications non supportées');
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') {
      showToast('Notifications bloquées. Activez-les dans les paramètres du navigateur.');
      return false;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  // ─── Enregistrer le Service Worker ───
  async function registerSW() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers non supportés');
      return null;
    }
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Notif] SW enregistré, scope:', swRegistration.scope);
      return swRegistration;
    } catch (err) {
      console.error('[Notif] Erreur SW:', err);
      return null;
    }
  }

  // ─── Programmer une notification locale ───
  function scheduleNotification({ title, body, delayMs, tag, url, type }) {
    if (!swRegistration || !swRegistration.active) {
      console.warn('[Notif] SW non actif');
      return;
    }
    swRegistration.active.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      payload: { title, body, delay: delayMs, tag, url: url || '/index.html', type: type || 'scheduled' }
    });
  }

  // ─── Calculer le délai jusqu'à la prochaine heure cible ───
  function msUntilTime(hour, minute) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  }

  // ─── Programmer les rappels quotidiens ───
  function scheduleDailyReminders() {
    const settings = loadSettings();
    if (!settings.enabled) return;

    // 1. Rappel études quotidiennes
    if (settings.etudes.enabled) {
      const delay = msUntilTime(settings.etudes.hour, settings.etudes.minute);
      scheduleNotification({
        title: "📖 Études du jour",
        body: "C'est l'heure d'étudier le Hayom Yom, le Tanya et le Rambam !",
        delayMs: delay,
        tag: 'etudes-quotidiennes',
        url: '/index.html#hayom-yom',
        type: 'etudes'
      });
    }

    // 2. Rappel objectifs du jour
    if (settings.objectifs.enabled) {
      const delay = msUntilTime(settings.objectifs.hour, settings.objectifs.minute);
      scheduleNotification({
        title: "🎯 Objectifs du jour",
        body: "N'oubliez pas de consulter et valider vos objectifs quotidiens !",
        delayMs: delay,
        tag: 'objectifs-jour',
        url: '/index.html#objectifs',
        type: 'objectifs'
      });
    }

    // 3. Horaires Chabbat (vendredi)
    if (settings.chabbat.enabled) {
      scheduleChabbatReminder(settings.chabbat.minutesBefore);
    }

    console.log('[Notif] Rappels quotidiens programmés');
  }

  // ─── Programmer le rappel Chabbat ───
  function scheduleChabbatReminder(minutesBefore) {
    // Récupère l'heure d'allumage depuis le DOM ou le localStorage
    const candleLightStr = localStorage.getItem('chabapp_candle_time');
    if (!candleLightStr) {
      console.log('[Notif] Pas d\'heure d\'allumage Chabbat trouvée');
      return;
    }

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=dim, 5=ven

    // Calcul du prochain vendredi
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && now.getHours() >= 20) daysUntilFriday = 7;

    const friday = new Date(now);
    friday.setDate(now.getDate() + daysUntilFriday);

    // Parse heure d'allumage (format "HH:MM")
    const [h, m] = candleLightStr.split(':').map(Number);
    friday.setHours(h, m, 0, 0);

    // Soustraire les minutes d'avance
    const notifTime = new Date(friday.getTime() - minutesBefore * 60 * 1000);
    const delay = notifTime - now;

    if (delay > 0) {
      scheduleNotification({
        title: "🕯️ Chabbat approche !",
        body: `Allumage des bougies dans ${minutesBefore} minutes (${candleLightStr})`,
        delayMs: delay,
        tag: 'chabbat-reminder',
        url: '/index.html#chabbat',
        type: 'chabbat'
      });
      console.log(`[Notif] Rappel Chabbat programmé pour ${notifTime.toLocaleString()}`);
    }
  }

  // ─── Envoyer une notification personnalisée immédiate ───
  function sendCustomNotification(title, body) {
    if (!swRegistration) return;
    swRegistration.showNotification(title, {
      body: body,
      icon: '/assets/apple-touch-icon.png',
      badge: '/assets/favicon.png',
      vibrate: [200, 100, 200],
      tag: 'custom-' + Date.now(),
      data: { url: '/index.html', type: 'custom' }
    });
  }

  // ─── Petit toast visuel ───
  function showToast(msg) {
    const existing = document.getElementById('notif-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'notif-toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '12px 24px',
      borderRadius: '12px', fontSize: '14px', zIndex: '99999',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: '90vw', textAlign: 'center'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ─── Créer le panneau de paramètres notifications ───
  function createSettingsPanel() {
    const settings = loadSettings();

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'notif-settings-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', zIndex: '99998', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
      boxSizing: 'border-box'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#1e1e2f', borderRadius: '20px', padding: '28px',
      width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto',
      color: '#fff', fontFamily: "'EB Garamond', serif"
    });

    const permStatus = Notification.permission;
    const permLabel = permStatus === 'granted' ? '✅ Autorisées' :
                      permStatus === 'denied' ? '❌ Bloquées' : '⏳ Non demandées';

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="margin:0;font-size:22px;color:#e6c068;">🔔 Notifications</h2>
        <button id="notif-close-btn" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;">✕</button>
      </div>

      <div style="margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:16px;">Permission : ${permLabel}</span>
          ${permStatus !== 'granted' ? '<button id="notif-perm-btn" style="background:#e6c068;color:#1a1a2e;border:none;border-radius:8px;padding:6px 14px;font-size:14px;cursor:pointer;">Autoriser</button>' : ''}
        </div>
      </div>

      <div style="margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;">
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span style="font-size:16px;">Notifications activées</span>
          <input type="checkbox" id="notif-enabled" ${settings.enabled ? 'checked' : ''} style="width:20px;height:20px;accent-color:#e6c068;">
        </label>
      </div>

      <div id="notif-details" style="display:${settings.enabled ? 'block' : 'none'};">

        <!-- Études quotidiennes -->
        <div style="margin-bottom:14px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;">
          <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;margin-bottom:8px;">
            <span>📖 Études quotidiennes</span>
            <input type="checkbox" id="notif-etudes" ${settings.etudes.enabled ? 'checked' : ''} style="width:18px;height:18px;accent-color:#e6c068;">
          </label>
          <div style="display:flex;align-items:center;gap:8px;margin-left:24px;">
            <span style="font-size:13px;opacity:0.7;">Heure :</span>
            <input type="time" id="notif-etudes-time" value="${String(settings.etudes.hour).padStart(2,'0')}:${String(settings.etudes.minute).padStart(2,'0')}"
                   style="background:#2a2a3e;border:1px solid #444;color:#fff;border-radius:8px;padding:4px 8px;font-size:14px;">
          </div>
        </div>

        <!-- Horaires Chabbat -->
        <div style="margin-bottom:14px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;">
          <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;margin-bottom:8px;">
            <span>🕯️ Rappel Chabbat (vendredi)</span>
            <input type="checkbox" id="notif-chabbat" ${settings.chabbat.enabled ? 'checked' : ''} style="width:18px;height:18px;accent-color:#e6c068;">
          </label>
          <div style="display:flex;align-items:center;gap:8px;margin-left:24px;">
            <span style="font-size:13px;opacity:0.7;">Minutes avant :</span>
            <input type="number" id="notif-chabbat-mins" value="${settings.chabbat.minutesBefore}" min="5" max="120"
                   style="background:#2a2a3e;border:1px solid #444;color:#fff;border-radius:8px;padding:4px 8px;font-size:14px;width:60px;">
          </div>
        </div>

        <!-- Objectifs du jour -->
        <div style="margin-bottom:14px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;">
          <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;margin-bottom:8px;">
            <span>🎯 Objectifs du jour</span>
            <input type="checkbox" id="notif-objectifs" ${settings.objectifs.enabled ? 'checked' : ''} style="width:18px;height:18px;accent-color:#e6c068;">
          </label>
          <div style="display:flex;align-items:center;gap:8px;margin-left:24px;">
            <span style="font-size:13px;opacity:0.7;">Heure :</span>
            <input type="time" id="notif-objectifs-time" value="${String(settings.objectifs.hour).padStart(2,'0')}:${String(settings.objectifs.minute).padStart(2,'0')}"
                   style="background:#2a2a3e;border:1px solid #444;color:#fff;border-radius:8px;padding:4px 8px;font-size:14px;">
          </div>
        </div>

      </div>

      <div style="display:flex;gap:10px;margin-top:18px;">
        <button id="notif-save-btn" style="flex:1;background:#e6c068;color:#1a1a2e;border:none;border-radius:12px;padding:12px;font-size:16px;font-weight:bold;cursor:pointer;">
          Enregistrer
        </button>
        <button id="notif-test-btn" style="flex:1;background:rgba(255,255,255,0.1);color:#fff;border:1px solid #e6c068;border-radius:12px;padding:12px;font-size:16px;cursor:pointer;">
          🔔 Tester
        </button>
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // ─── Event Listeners ───
    document.getElementById('notif-close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    const permBtn = document.getElementById('notif-perm-btn');
    if (permBtn) {
      permBtn.addEventListener('click', async () => {
        const granted = await requestPermission();
        overlay.remove();
        if (granted) {
          showToast('✅ Notifications autorisées !');
          createSettingsPanel(); // Ré-ouvrir le panneau
        }
      });
    }

    document.getElementById('notif-enabled').addEventListener('change', function() {
      document.getElementById('notif-details').style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('notif-save-btn').addEventListener('click', () => {
      const [eH, eM] = document.getElementById('notif-etudes-time').value.split(':').map(Number);
      const [oH, oM] = document.getElementById('notif-objectifs-time').value.split(':').map(Number);

      const newSettings = {
        enabled: document.getElementById('notif-enabled').checked,
        etudes: { enabled: document.getElementById('notif-etudes').checked, hour: eH, minute: eM },
        chabbat: { enabled: document.getElementById('notif-chabbat').checked, minutesBefore: parseInt(document.getElementById('notif-chabbat-mins').value) || 30 },
        objectifs: { enabled: document.getElementById('notif-objectifs').checked, hour: oH, minute: oM },
        custom: []
      };

      saveSettings(newSettings);
      scheduleDailyReminders();
      showToast('✅ Paramètres enregistrés');
      overlay.remove();
    });

    document.getElementById('notif-test-btn').addEventListener('click', async () => {
      const granted = await requestPermission();
      if (granted) {
        sendCustomNotification("🔔 Test Chab'app", "Les notifications fonctionnent correctement !");
        showToast('Notification envoyée !');
      }
    });
  }

  // ─── Ajouter le bouton 🔔 dans le header ───
  function addNotificationButton() {
    const header = document.querySelector('.home-header-top') || document.querySelector('.home-header');
    if (!header) return;

    // Vérifie si le bouton existe déjà
    if (document.getElementById('notif-bell-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'notif-bell-btn';
    btn.innerHTML = '🔔';
    btn.title = 'Paramètres notifications';
    Object.assign(btn.style, {
      background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer',
      padding: '4px 8px', lineHeight: '1', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))'
    });
    btn.addEventListener('click', createSettingsPanel);
    header.appendChild(btn);
  }

  // ─── Ajout du bouton install PWA ───
  let deferredPrompt = null;

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallButton();
    });
  }

  function showInstallButton() {
    if (document.getElementById('pwa-install-btn')) return;

    const header = document.querySelector('.home-header-top') || document.querySelector('.home-header');
    if (!header) return;

    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.innerHTML = '📲';
    btn.title = "Installer Chab'app";
    Object.assign(btn.style, {
      background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer',
      padding: '4px 8px', lineHeight: '1', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))'
    });
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast("✅ Chab'app installée !");
        btn.remove();
      }
      deferredPrompt = null;
    });
    header.appendChild(btn);
  }

  // ─── INIT ───
  async function init() {
    await registerSW();
    addNotificationButton();
    setupInstallPrompt();

    const settings = loadSettings();
    if (settings.enabled && Notification.permission === 'granted') {
      scheduleDailyReminders();
    }

    // Re-schedule chaque jour à minuit
    const msUntilMidnight = msUntilTime(0, 1);
    setTimeout(() => {
      scheduleDailyReminders();
      setInterval(scheduleDailyReminders, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    console.log("[Chab'app] Notifications initialisées");
  }

  return {
    init,
    requestPermission,
    sendCustomNotification,
    scheduleChabbatReminder,
    scheduleDailyReminders,
    openSettings: createSettingsPanel,
    showToast
  };

})();

// Auto-init au chargement
document.addEventListener('DOMContentLoaded', () => ChabNotifications.init());
