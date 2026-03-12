// obj-notifs.js — Notifications locales automatiques pour les objectifs quotidiens
// Se planifie a chaque ouverture de l'app via scheduleObjNotifs()

var OBJ_NOTIF_DEFS = [
  // Matin
  { id: 'modeh',      h: 6,  m: 30, title: 'Mode Ani',          body: 'Reveille-toi avec gratitude ! Dis Mode Ani' },
  { id: 'brakhot',    h: 6,  m: 45, title: 'Brakhot du matin',  body: "N'oublie pas tes Brakhot du matin" },
  { id: 'tsedaka_am', h: 7,  m: 0,  title: 'Tsedaka',           body: 'Un petit geste de Tsedaka avant la priere' },
  { id: 'tefila',     h: 7,  m: 15, title: "Cha'harit",         body: "C'est l'heure de Cha'harit !" },
  { id: 'tehilim',    h: 8,  m: 30, title: 'Tehilim du jour',   body: 'As-tu recite tes Tehilim aujourd\'hui ?' },
  { id: 'etude_am',   h: 9,  m: 0,  title: 'Etude de Torah',    body: 'Prends un moment pour etudier la Torah' },
  // Apres-midi
  { id: 'casher',     h: 12, m: 0,  title: 'Manger Casher',     body: 'Bon appetit ! Verifie la cacherout' },
  { id: 'tsedaka_pm', h: 13, m: 30, title: 'Tsedaka',           body: 'As-tu donne la Tsedaka aujourd\'hui ?' },
  { id: 'minha',      dynamic: 'sunset', offset: -30, title: "Min'ha", body: "C'est bientot Min'ha !" },
  // Soir
  { id: 'arvit',      dynamic: 'sunset', offset: 20,  title: 'Arvit',             body: "C'est l'heure d'Arvit" },
  { id: 'etude_pm',   h: 21, m: 0,  title: 'Etude de Torah',    body: "Un peu d'etude avant de dormir" },
  { id: 'famille',    h: 20, m: 0,  title: 'Temps en famille',  body: "Profite d'un moment en famille" },
  { id: 'transmission', h: 21, m: 30, title: "Dougma 'Haya",    body: 'Sois un exemple vivant de Torah' }
];

var _objNotifTimers = [];
var _OBJ_NOTIF_STORAGE_KEY = 'koulam_obj_notifs_enabled';

// ─── Lire/ecrire les preferences ──────────────────────
function getObjNotifPrefs() {
  try { return JSON.parse(localStorage.getItem(_OBJ_NOTIF_STORAGE_KEY) || '{}'); } catch(e) { return {}; }
}

function saveObjNotifPrefs(prefs) {
  localStorage.setItem(_OBJ_NOTIF_STORAGE_KEY, JSON.stringify(prefs));
}

function isObjNotifEnabled(id) {
  var prefs = getObjNotifPrefs();
  // Par defaut tout est active
  return prefs[id] !== false;
}

function toggleObjNotif(id) {
  var prefs = getObjNotifPrefs();
  prefs[id] = prefs[id] === false ? true : false;
  saveObjNotifPrefs(prefs);
  // Re-planifier
  scheduleObjNotifs();
}

function setAllObjNotifs(enabled) {
  var prefs = getObjNotifPrefs();
  OBJ_NOTIF_DEFS.forEach(function(def) { prefs[def.id] = enabled; });
  saveObjNotifPrefs(prefs);
  scheduleObjNotifs();
}

// ─── Detection Shabbat ────────────────────────────────
function _isCurrentlyShabbat() {
  var now = new Date();
  var day = now.getDay(); // 0=dim, 6=sam

  // Verifier via le cache Shabbat
  var cacheKey = 'tehilim_shabbat_v2_' + now.toISOString().slice(0, 10);
  try {
    var cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && cached.candles && cached.havdalah) {
      // Trouver les dates exactes dans le cache hebcal
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('tehilim_shabbat_v2_') === 0) {
          var d = JSON.parse(localStorage.getItem(keys[i]));
          if (d && d._raw && d._raw.items) {
            var candleDate = null, havdalahDate = null;
            d._raw.items.forEach(function(it) {
              if (it.category === 'candles' && it.date) candleDate = new Date(it.date);
              if (it.category === 'havdalah' && it.date) havdalahDate = new Date(it.date);
            });
            if (candleDate && havdalahDate && now >= candleDate && now <= havdalahDate) return true;
          }
        }
      }
    }
  } catch(e) {}

  // Fallback simple : vendredi apres 18h ou samedi avant 21h
  if (day === 5 && now.getHours() >= 18) return true;
  if (day === 6 && now.getHours() < 21) return true;
  return false;
}

// ─── Obtenir l'heure du coucher de soleil ─────────────
function _getSunsetMinutes() {
  // Chercher dans le cache zmanim
  try {
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('zmanim_') === 0 && keys[i].indexOf(todayStr()) !== -1) {
        var data = JSON.parse(localStorage.getItem(keys[i]));
        if (data && data.times && data.times.sunset) {
          var t = new Date(data.times.sunset);
          return t.getHours() * 60 + t.getMinutes();
        }
      }
    }
  } catch(e) {}
  // Fallback : ~19h en France
  return 19 * 60;
}

// ─── Planifier les notifications ──────────────────────
function scheduleObjNotifs() {
  // Annuler les anciens timers
  _objNotifTimers.forEach(function(t) { clearTimeout(t); });
  _objNotifTimers = [];

  // Verifier permission
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Pas de notifs pendant Shabbat
  if (_isCurrentlyShabbat()) return;

  var now = new Date();
  var nowMinutes = now.getHours() * 60 + now.getMinutes();
  var state = getObjState();
  var sunsetMin = _getSunsetMinutes();

  OBJ_NOTIF_DEFS.forEach(function(def) {
    // Verifier si active
    if (!isObjNotifEnabled(def.id)) return;

    // Verifier si deja fait
    if (state[def.id]) return;

    // Calculer l'heure cible en minutes
    var targetMin;
    if (def.dynamic === 'sunset') {
      targetMin = sunsetMin + (def.offset || 0);
    } else {
      targetMin = def.h * 60 + def.m;
    }

    // Ne planifier que les notifs futures
    if (targetMin <= nowMinutes) return;

    var delayMs = (targetMin - nowMinutes) * 60 * 1000;
    var timer = setTimeout(function() {
      _fireObjNotif(def);
    }, delayMs);
    _objNotifTimers.push(timer);
  });
}

function _fireObjNotif(def) {
  // Re-verifier avant d'envoyer
  if (_isCurrentlyShabbat()) return;
  var state = getObjState();
  if (state[def.id]) return;
  if (!isObjNotifEnabled(def.id)) return;

  // Notification locale
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(function(reg) {
      reg.showNotification(def.title, {
        body: def.body,
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-192.png',
        vibrate: [100, 50, 100],
        tag: 'koulam-obj-' + def.id,
        renotify: true,
        data: { url: self.location ? self.location.origin : '/' }
      });
    });
  } else if ('Notification' in window) {
    new Notification(def.title, {
      body: def.body,
      icon: 'icons/icon-192.png'
    });
  }
}

// ─── UI Reglages dans le panel objectifs ──────────────
function renderObjNotifSettings() {
  var html = '';
  html += '<div class="obj-notif-settings">';
  html += '<div class="obj-notif-header">';
  html += '<span class="obj-notif-title">Rappels automatiques</span>';
  var allEnabled = OBJ_NOTIF_DEFS.every(function(d) { return isObjNotifEnabled(d.id); });
  html += '<button class="obj-notif-toggle-all" onclick="setAllObjNotifs(' + (allEnabled ? 'false' : 'true') + ');renderObjNotifSettings()">' + (allEnabled ? 'Tout desactiver' : 'Tout activer') + '</button>';
  html += '</div>';

  // Permission check
  if (!('Notification' in window)) {
    html += '<div class="obj-notif-perm">Les notifications ne sont pas supportees par ce navigateur.</div>';
    html += '</div>';
    var c = document.getElementById('obj-notif-container');
    if (c) c.innerHTML = html;
    return;
  }
  if (Notification.permission === 'default') {
    html += '<div class="obj-notif-perm">';
    html += '<button class="obj-notif-perm-btn" onclick="_objNotifRequestPerm()">Activer les notifications</button>';
    html += '</div>';
    html += '</div>';
    var c = document.getElementById('obj-notif-container');
    if (c) c.innerHTML = html;
    return;
  }
  if (Notification.permission === 'denied') {
    html += '<div class="obj-notif-perm">Notifications bloquees. Active-les dans les reglages de ton navigateur.</div>';
    html += '</div>';
    var c = document.getElementById('obj-notif-container');
    if (c) c.innerHTML = html;
    return;
  }

  html += '<div class="obj-notif-list">';
  OBJ_NOTIF_DEFS.forEach(function(def) {
    var enabled = isObjNotifEnabled(def.id);
    var timeStr = '';
    if (def.dynamic === 'sunset') {
      var sm = _getSunsetMinutes() + (def.offset || 0);
      var hh = Math.floor(sm / 60);
      var mm = sm % 60;
      timeStr = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
    } else {
      timeStr = (def.h < 10 ? '0' : '') + def.h + ':' + (def.m < 10 ? '0' : '') + def.m;
    }
    html += '<div class="obj-notif-row" onclick="toggleObjNotif(\'' + def.id + '\');renderObjNotifSettings()">';
    html += '<div class="obj-notif-info">';
    html += '<span class="obj-notif-name">' + def.title + '</span>';
    html += '<span class="obj-notif-time">' + timeStr + '</span>';
    html += '</div>';
    html += '<div class="obj-notif-switch' + (enabled ? ' on' : '') + '"><div class="obj-notif-switch-dot"></div></div>';
    html += '</div>';
  });
  html += '</div>';
  html += '</div>';

  var c = document.getElementById('obj-notif-container');
  if (c) c.innerHTML = html;
}

function _objNotifRequestPerm() {
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      scheduleObjNotifs();
      // Aussi obtenir le token FCM si possible
      if (typeof pushRequestPermission === 'function') pushRequestPermission();
    }
    renderObjNotifSettings();
  });
}
