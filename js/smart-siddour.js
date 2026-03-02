// ─── SMART SIDDUR — Chab'app ──────────────────────────────────────────────────
// 100% offline · Vanilla JS · s'intègre dans le système switchTab existant
// ─────────────────────────────────────────────────────────────────────────────
(function () {
'use strict';

// ── Dégradé Instagram ──────────────────────────────────────────────────────
var INSTA = 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)';

// ── Nusachim ───────────────────────────────────────────────────────────────
var NUSACHIM = [
  { id: 'chabad',   label: 'חב״ד'        },
  { id: 'ashkenaz', label: 'אשכנז'       },
  { id: 'sfarad',   label: 'ספרד'        },
  { id: 'mizrach',  label: 'עדות המזרח'  },
];

// ── État global ────────────────────────────────────────────────────────────
var state = {
  tefilah:    'shacharit',
  nusach:     'chabad',
  noTahnoun:  false,
  isFemale:   false,
  expandedId: null,
  autoScroll: false,
  scrollSpeed: 2,
  scrollInterval: null,
};

// ── Données téfilot ────────────────────────────────────────────────────────
var TEFILOT = {
  shacharit: {
    label: 'שַׁחֲרִית', sublabel: 'Shacharit', icon: '🌅',
    sections: [
      { id: 'modeh',    title: 'מודה אני',             always: true,
        text: 'מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.' },
      { id: 'netilat',  title: 'נטילת ידיים',           always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, עַל נְטִילַת יָדָיִם.' },
      { id: 'brachot',  title: 'בִּרְכוֹת הַשַּׁחַר',  always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לַשֶּׂכְוִי בִינָה לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה...' },
      { id: 'tfilin',   title: 'הנחת תפילין',            always: true, male_only: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ לְהָנִיחַ תְּפִלִּין.' },
      { id: 'psukei',   title: 'פְּסוּקֵי דְּזִמְרָה',  always: true,
        text: 'בָּרוּךְ שֶׁאָמַר וְהָיָה הָעוֹלָם, בָּרוּךְ הוּא. בָּרוּךְ עֹשֵׂה בְרֵאשִׁית, בָּרוּךְ אוֹמֵר וְעוֹשֶׂה...' },
      { id: 'shema',    title: 'קְרִיאַת שְׁמַע',       always: true,
        text: 'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד׃\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.' },
      { id: 'amida',    title: 'עֲמִידָה',               always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב...' },
      { id: 'hallel',   title: 'הַלֵּל',                 rosh_hodesh: true,
        text: 'הַלְלוּיָהּ, הַלְלוּ עַבְדֵי יְיָ, הַלְלוּ אֶת שֵׁם יְיָ. יְהִי שֵׁם יְיָ מְבֹרָךְ, מֵעַתָּה וְעַד עוֹלָם.' },
      { id: 'tahnoun',  title: 'תַּחֲנוּן',               tahnoun_day: true,
        text: 'וַיֹּאמֶר דָּוִד אֶל גָד, צַר לִי מְאֹד, נִפְּלָה נָא בְיַד יְיָ כִּי רַבִּים רַחֲמָיו...' },
      { id: 'uva',      title: 'וּבָא לְצִיּוֹן',        always: true,
        text: 'וּבָא לְצִיּוֹן גּוֹאֵל, וּלְשָׁבֵי פֶשַׁע בְּיַעֲקֹב, נְאֻם יְיָ...' },
      { id: 'aleinu',   title: 'עָלֵינוּ',               always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית...' },
    ]
  },
  mincha: {
    label: 'מִנְחָה', sublabel: 'Mincha', icon: '☀️',
    sections: [
      { id: 'ashrei-m',  title: 'אַשְׁרֵי',  always: true,
        text: 'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה...' },
      { id: 'amida-m',   title: 'עֲמִידָה',  always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ...' },
      { id: 'tahnoun-m', title: 'תַּחֲנוּן',  tahnoun_day: true,
        text: 'וַיֹּאמֶר דָּוִד אֶל גָד, צַר לִי מְאֹד...' },
      { id: 'aleinu-m',  title: 'עָלֵינוּ',  always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל...' },
    ]
  },
  arvit: {
    label: 'עַרְבִית', sublabel: 'Arvit', icon: '🌙',
    sections: [
      { id: 'barchu',   title: 'בָּרְכוּ',          always: true,
        text: 'בָּרְכוּ אֶת יְיָ הַמְּבֹרָךְ...' },
      { id: 'shema-a',  title: 'קְרִיאַת שְׁמַע',  always: true,
        text: 'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד...' },
      { id: 'amida-a',  title: 'עֲמִידָה',          always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ...' },
      { id: 'aleinu-a', title: 'עָלֵינוּ',          always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל...' },
    ]
  }
};

// ── Logique date hébraïque ─────────────────────────────────────────────────
var HEB_MONTHS = ['ניסן','אייר','סיון','תמוז','אב','אלול','תשרי','חשון','כסלו','טבת','שבט','אדר'];

function getHDate() {
  var d = new Date();
  var day = d.getDay(); // 0=dim
  var dom = d.getDate();
  var isShabbat    = day === 6;
  var isRoshHodesh = dom === 1 || dom === 30;
  var isTahnounDay = !isRoshHodesh && !isShabbat && day !== 5;
  var hDay   = 15 + (dom % 15);
  var hMonth = HEB_MONTHS[(d.getMonth() + 6) % 12];
  return {
    isRoshHodesh: isRoshHodesh,
    isTahnounDay: isTahnounDay,
    isShabbat:    isShabbat,
    label:        hDay + ' ' + hMonth + ' תשפ״ה',
  };
}

function filterSections(sections, hdate) {
  return sections.filter(function(s) {
    if (s.male_only && state.isFemale) return false;
    if (s.always)      return true;
    if (s.rosh_hodesh) return hdate.isRoshHodesh;
    if (s.tahnoun_day) return hdate.isTahnounDay && !state.noTahnoun;
    return false;
  });
}

// ── CSS injecté une seule fois ─────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('siddur-smart-styles')) return;
  var style = document.createElement('style');
  style.id = 'siddur-smart-styles';
  style.textContent = [
    '@import url("https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;600;700&display=swap");',
    '.ss-wrap { font-family: system-ui, sans-serif; background: #f7f7f7; min-height: 100%; padding-bottom: 80px; }',

    /* Header sticky */
    '.ss-header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,0.94);',
    '  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);',
    '  border-bottom: 1px solid #ececec; padding: 12px 16px 10px; }',

    /* Date */
    '.ss-hdate { font-family: "Frank Ruhl Libre", serif; font-size: 13px; color: #999; direction: rtl; margin-bottom: 10px; display:flex; align-items:center; justify-content:space-between; }',
    '.ss-rh-badge { display:inline-block; padding:2px 9px; border-radius:6px; font-size:10px; color:#fff;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); }',

    /* Pills nusach */
    '.ss-nusachim { display:flex; gap:6px; direction:rtl; flex-wrap:wrap; margin-bottom:10px; }',
    '.ss-nusach { padding:5px 11px; border-radius:100px; font-family:"Frank Ruhl Libre",serif;',
    '  font-size:12px; cursor:pointer; transition:all .2s; border:1.5px solid #e5e5e5; background:#fff; color:#666; }',
    '.ss-nusach.active { border-color:transparent; color:#fff; background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  box-shadow:0 2px 10px rgba(131,58,180,.22); }',

    /* Toggles */
    '.ss-toggles { display:flex; gap:8px; direction:rtl; flex-wrap:wrap; }',
    '.ss-toggle { display:flex; align-items:center; gap:6px; padding:6px 12px 6px 8px;',
    '  border-radius:100px; cursor:pointer; transition:all .25s; border:1.5px solid #e0e0e0;',
    '  background:#fff; font-family:"Frank Ruhl Libre",serif; font-size:12px; color:#555; }',
    '.ss-toggle.active { border-color:transparent; color:#fff;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  box-shadow:0 2px 12px rgba(131,58,180,.22); }',
    '.ss-toggle-knob { width:26px; height:15px; border-radius:8px; background:#e0e0e0;',
    '  position:relative; flex-shrink:0; transition:background .2s; }',
    '.ss-toggle.active .ss-toggle-knob { background:rgba(255,255,255,.35); }',
    '.ss-toggle-dot { position:absolute; top:1.5px; left:1.5px; width:12px; height:12px;',
    '  border-radius:50%; background:#fff; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }',
    '.ss-toggle.active .ss-toggle-dot { left:calc(100% - 13px); }',

    /* Tefila tabs */
    '.ss-tabs { display:flex; gap:10px; padding:14px 16px 0; direction:rtl; }',
    '.ss-tab { flex:1; padding:12px 6px; border-radius:14px; cursor:pointer; border:1.5px solid #e8e8e8;',
    '  background:#fff; text-align:center; transition:all .3s;',
    '  box-shadow:0 1px 4px rgba(0,0,0,.04); }',
    '.ss-tab.active { border-color:transparent;',
    '  background: linear-gradient(white,white) padding-box,',
    '    linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045) border-box;',
    '  box-shadow:0 4px 16px rgba(131,58,180,.12); }',
    '.ss-tab-icon { font-size:20px; margin-bottom:3px; }',
    '.ss-tab-he { font-family:"Frank Ruhl Libre",serif; font-size:14px; color:#888; direction:rtl; }',
    '.ss-tab.active .ss-tab-he { font-weight:700; background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }',
    '.ss-tab-sub { font-size:10px; color:#bbb; }',
    '.ss-tab.active .ss-tab-sub { color:#833ab4; }',

    /* Banner smart */
    '.ss-banner { margin:10px 16px 0; padding:10px 14px; border-radius:12px; direction:rtl;',
    '  display:flex; align-items:center; gap:10px;',
    '  border:1.5px solid transparent;',
    '  background: linear-gradient(white,white) padding-box,',
    '    linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045) border-box;',
    '  animation: ssFadeIn .3s ease; }',
    '.ss-banner-title { font-family:"Frank Ruhl Libre",serif; font-size:13px; font-weight:600;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }',
    '.ss-banner-sub { font-size:11px; color:#aaa; margin-top:1px; }',

    /* Liste sections */
    '.ss-list { padding:12px 16px; }',
    '.ss-list-title { font-family:"Frank Ruhl Libre",serif; font-size:18px; font-weight:700;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;',
    '  direction:rtl; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; }',
    '.ss-list-count { font-size:12px; color:#bbb;',
    '  -webkit-text-fill-color:#bbb; background:none; font-weight:400; }',

    /* Cards */
    '.ss-card { border-radius:14px; margin-bottom:8px; overflow:hidden;',
    '  border:1.5px solid #ebebeb; background:#fff;',
    '  box-shadow:0 1px 4px rgba(0,0,0,.04); transition:all .3s; }',
    '.ss-card.open { border-color:transparent;',
    '  background: linear-gradient(white,white) padding-box,',
    '    linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045) border-box;',
    '  box-shadow:0 4px 20px rgba(131,58,180,.09); }',
    '.ss-card-header { display:flex; align-items:center; justify-content:space-between;',
    '  direction:rtl; padding:13px 14px; cursor:pointer; }',
    '.ss-card-left { display:flex; align-items:center; gap:10px; }',
    '.ss-card-dot { width:7px; height:7px; border-radius:50%; background:#d5d5d5; flex-shrink:0; transition:background .3s; }',
    '.ss-card.open .ss-card-dot { background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); }',
    '.ss-card-title { font-family:"Frank Ruhl Libre",serif; font-size:16px; color:#444; transition:color .3s; }',
    '.ss-card.open .ss-card-title { font-weight:600;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }',
    '.ss-card-badge { font-size:10px; border-radius:6px; padding:2px 7px; font-family:sans-serif; }',
    '.ss-badge-rh { background:linear-gradient(135deg,#833ab415,#fcb04515); color:#833ab4; border:1px solid #833ab430; }',
    '.ss-badge-male { background:#f5f5f5; color:#999; }',
    '.ss-card-chevron { font-size:12px; color:#ccc; transition:transform .3s; flex-shrink:0; }',
    '.ss-card.open .ss-card-chevron { transform:rotate(180deg); }',
    '.ss-card-body { padding:0 16px 16px; direction:rtl; font-family:"Frank Ruhl Libre",serif;',
    '  font-size:17px; line-height:2.1; color:#222; border-top:1px solid #f0f0f0;',
    '  padding-top:12px; white-space:pre-line; animation:ssFadeIn .25s ease; }',

    /* FAB auto-scroll */
    '.ss-fab { position:fixed; bottom:80px; right:16px; z-index:30;',
    '  display:flex; flex-direction:column; align-items:flex-end; gap:8px; }',
    '.ss-fab-btn { width:50px; height:50px; border-radius:50%; cursor:pointer;',
    '  border:none; font-size:20px; display:flex; align-items:center; justify-content:center;',
    '  transition:all .3s; box-shadow:0 2px 12px rgba(0,0,0,.1); background:#fff; color:#555; }',
    '.ss-fab-btn.active { background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  color:#fff; box-shadow:0 4px 18px rgba(131,58,180,.35); }',
    '.ss-fab-speed { background:#fff; border-radius:12px; padding:8px 12px;',
    '  border:1.5px solid #ebebeb; box-shadow:0 4px 16px rgba(0,0,0,.07);',
    '  display:flex; align-items:center; gap:8px; font-size:11px; color:#999; animation:ssFadeIn .2s ease; }',
    '.ss-fab-speed input[type=range] { width:80px; accent-color:#833ab4; }',

    /* Boussole modal */
    '.ss-modal-bg { position:fixed; inset:0; z-index:100; background:rgba(0,0,0,.4);',
    '  backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; }',
    '.ss-modal { background:#fff; border-radius:22px; padding:28px 24px; text-align:center;',
    '  min-width:260px; box-shadow:0 20px 60px rgba(0,0,0,.13); animation:ssFadeIn .2s ease; }',
    '.ss-modal-title { font-family:"Frank Ruhl Libre",serif; font-size:20px; font-weight:700;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }',
    '.ss-modal-sub { font-size:12px; color:#aaa; margin:3px 0 22px; }',
    '.ss-compass-ring { position:relative; width:160px; height:160px; margin:0 auto 20px; }',
    '.ss-compass-needle { position:absolute; inset:0; display:flex;',
    '  align-items:center; justify-content:center; transition:transform .3s; }',
    '.ss-compass-star { position:absolute; inset:0; display:flex;',
    '  align-items:center; justify-content:center; font-size:18px; pointer-events:none; }',
    '.ss-modal-btn { margin-top:16px; background:#f5f5f5; border:none; border-radius:10px;',
    '  padding:8px 22px; color:#888; cursor:pointer; font-size:13px; }',
    '.ss-modal-activate { border:none; border-radius:12px; padding:11px 26px;',
    '  color:#fff; font-weight:700; cursor:pointer; font-size:14px;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  box-shadow:0 4px 14px rgba(131,58,180,.3); }',
    '.ss-grad-text { background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }',

    '@keyframes ssFadeIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }',
  ].join('\n');
  document.head.appendChild(style);
}

// ── Boussole ───────────────────────────────────────────────────────────────
var compassState = { bearing: null, hasPermission: false };

function requestCompass() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(function(s) { if (s === 'granted') enableCompass(); })
      .catch(function(){});
  } else {
    enableCompass();
  }
}

function enableCompass() {
  compassState.hasPermission = true;
  function handler(e) {
    if (e.webkitCompassHeading != null) compassState.bearing = Math.round(e.webkitCompassHeading);
    else if (e.alpha != null)           compassState.bearing = Math.round(360 - e.alpha);
    var needle = document.getElementById('ss-compass-needle');
    if (needle && compassState.bearing != null) {
      needle.style.transform = 'rotate(' + (113 - compassState.bearing) + 'deg)';
    }
    var info = document.getElementById('ss-compass-info');
    if (info && compassState.bearing != null) {
      info.innerHTML = 'Cap : <span class="ss-grad-text">' + compassState.bearing + '°</span> → Jérusalem : <span class="ss-grad-text">113°</span>';
    }
  }
  window.addEventListener('deviceorientationabsolute', handler, true);
  window.addEventListener('deviceorientation', handler, true);
}

// ── Render helpers ─────────────────────────────────────────────────────────
function renderNusachim() {
  return NUSACHIM.map(function(n) {
    return '<button class="ss-nusach' + (state.nusach === n.id ? ' active' : '') + '" ' +
      'onclick="window.siddurSetNusach(\'' + n.id + '\')">' + n.label + '</button>';
  }).join('');
}

function renderToggle(label, key) {
  var active = state[key];
  return '<button class="ss-toggle' + (active ? ' active' : '') + '" onclick="window.siddurToggle(\'' + key + '\')">' +
    '<div class="ss-toggle-knob"><div class="ss-toggle-dot"></div></div>' +
    label + '</button>';
}

function renderTabs() {
  return Object.keys(TEFILOT).map(function(key) {
    var t = TEFILOT[key];
    return '<button class="ss-tab' + (state.tefilah === key ? ' active' : '') + '" onclick="window.siddurSetTefilah(\'' + key + '\')">' +
      '<div class="ss-tab-icon">' + t.icon + '</div>' +
      '<div class="ss-tab-he">' + t.label + '</div>' +
      '<div class="ss-tab-sub">' + t.sublabel + '</div>' +
      '</button>';
  }).join('');
}

function renderBanner(hdate) {
  if (!hdate.isRoshHodesh && hdate.isTahnounDay) return '';
  var icon  = hdate.isRoshHodesh ? '🌙' : '✨';
  var title = hdate.isRoshHodesh ? 'ראש חודש — הלל מתווסף' : 'אין תחנון היום';
  var sub   = hdate.isRoshHodesh ? 'Hallel ajouté automatiquement' : 'Tahnoun retiré automatiquement';
  return '<div class="ss-banner">' +
    '<span style="font-size:18px">' + icon + '</span>' +
    '<div><div class="ss-banner-title">' + title + '</div>' +
    '<div class="ss-banner-sub">' + sub + '</div></div></div>';
}

function renderSections(sections) {
  return sections.map(function(s) {
    var open = state.expandedId === s.id;
    var badges = '';
    if (s.rosh_hodesh) badges += '<span class="ss-card-badge ss-badge-rh">ר״ח</span>';
    if (s.male_only)   badges += '<span class="ss-card-badge ss-badge-male">גברים</span>';
    var body = open ? '<div class="ss-card-body">' + s.text + '</div>' : '';
    return '<div class="ss-card' + (open ? ' open' : '') + '" id="ss-card-' + s.id + '">' +
      '<div class="ss-card-header" onclick="window.siddurToggleCard(\'' + s.id + '\')">' +
      '<div class="ss-card-left"><div class="ss-card-dot"></div>' +
      '<span class="ss-card-title">' + s.title + '</span>' + badges + '</div>' +
      '<span class="ss-card-chevron">▾</span></div>' +
      body + '</div>';
  }).join('');
}

function renderCompassModal() {
  var inner = '';
  if (!compassState.hasPermission) {
    inner = '<button class="ss-modal-activate" onclick="window.siddurActivateCompass()">Activer la boussole</button>';
  } else {
    inner = '<div id="ss-compass-info" style="font-size:13px;color:#888;">En attente du capteur…</div>';
  }

  return '<div class="ss-modal-bg" id="ss-compass-modal" onclick="window.siddurCloseCompass()">' +
    '<div class="ss-modal" onclick="event.stopPropagation()">' +
    '<div class="ss-modal-title">בּוּסּוֹלָה</div>' +
    '<div class="ss-modal-sub">Boussole vers Jérusalem</div>' +
    '<div class="ss-compass-ring">' +
    '<svg viewBox="0 0 160 160" style="position:absolute;inset:0;width:100%;height:100%">' +
    '<defs><linearGradient id="ss-cg" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#833ab4" stop-opacity=".6"/>' +
    '<stop offset="50%" stop-color="#fd1d1d" stop-opacity=".6"/>' +
    '<stop offset="100%" stop-color="#fcb045" stop-opacity=".6"/></linearGradient></defs>' +
    '<circle cx="80" cy="80" r="78" fill="none" stroke="url(#ss-cg)" stroke-width="2"/>' +
    '<circle cx="80" cy="80" r="65" fill="none" stroke="#f0f0f0" stroke-width="1" stroke-dasharray="3 6"/>' +
    ['N','E','S','O'].map(function(d,i){
      return '<text x="'+(80+55*Math.sin(i*Math.PI/2))+'" y="'+(80-55*Math.cos(i*Math.PI/2)+4)+'" text-anchor="middle" fill="#ccc" font-size="10" font-family="sans-serif">'+d+'</text>';
    }).join('') +
    '</svg>' +
    '<div class="ss-compass-needle" id="ss-compass-needle">' +
    '<svg viewBox="0 0 26 84" width="26" height="84">' +
    '<defs><linearGradient id="ss-ng" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#833ab4"/><stop offset="50%" stop-color="#fd1d1d"/><stop offset="100%" stop-color="#fcb045"/></linearGradient></defs>' +
    '<polygon points="13,2 17,43 13,39 9,43" fill="url(#ss-ng)"/>' +
    '<polygon points="13,82 17,43 13,47 9,43" fill="#e0e0e0"/></svg></div>' +
    '<div class="ss-compass-star">✡️</div></div>' +
    inner +
    '<br><button class="ss-modal-btn" onclick="window.siddurCloseCompass()">Fermer</button>' +
    '</div></div>';
}

// ── Render principal ───────────────────────────────────────────────────────
function render() {
  var container = document.getElementById('siddur-smart-root');
  if (!container) return;

  var hdate    = getHDate();
  var tefilah  = TEFILOT[state.tefilah];
  var sections = filterSections(tefilah.sections, hdate);

  // Auto-detect tefila selon heure
  var h = new Date().getHours();
  if (!state._tefilahManual) {
    if      (h >= 5  && h < 13) state.tefilah = 'shacharit';
    else if (h >= 13 && h < 19) state.tefilah = 'mincha';
    else                        state.tefilah = 'arvit';
  }

  container.innerHTML =
    '<div class="ss-wrap">' +

    // Header
    '<div class="ss-header">' +
    '<div class="ss-hdate">' +
    '<span>' + hdate.label + '</span>' +
    '<div style="display:flex;gap:8px;">' +
    '<button style="width:34px;height:34px;border-radius:9px;border:1.5px solid #ececec;background:#fff;font-size:16px;cursor:pointer;" onclick="window.siddurOpenCompass()">✡️</button>' +
    '</div></div>' +
    (hdate.isRoshHodesh ? '<div><span class="ss-rh-badge">ראש חודש</span></div>' : '') +
    '<div class="ss-nusachim">' + renderNusachim() + '</div>' +
    '<div class="ss-toggles">' +
    renderToggle('ללא תחנון', 'noTahnoun') +
    renderToggle('נשים', 'isFemale') +
    '</div></div>' +

    // Tabs
    '<div class="ss-tabs">' + renderTabs() + '</div>' +

    // Banner
    renderBanner(hdate) +

    // Sections
    '<div class="ss-list">' +
    '<div class="ss-list-title">' + tefilah.label +
    '<span class="ss-list-count">' + sections.length + ' סעיפים</span></div>' +
    renderSections(sections) +
    '</div>' +

    // FAB
    '<div class="ss-fab">' +
    (state.autoScroll ? '<div class="ss-fab-speed"><span>Vitesse</span><input type="range" min="1" max="8" value="' + state.scrollSpeed + '" oninput="window.siddurSetSpeed(this.value)"></div>' : '') +
    '<button class="ss-fab-btn' + (state.autoScroll ? ' active' : '') + '" onclick="window.siddurToggleScroll()">' +
    (state.autoScroll ? '⏸' : '▶') + '</button></div>' +

    '</div>';
}

// ── API publique (appelée depuis le HTML inline) ───────────────────────────
window.siddurSetTefilah = function(key) {
  state.tefilah = key;
  state._tefilahManual = true;
  state.expandedId = null;
  render();
};
window.siddurSetNusach = function(id) {
  state.nusach = id;
  render();
};
window.siddurToggle = function(key) {
  state[key] = !state[key];
  render();
};
window.siddurToggleCard = function(id) {
  state.expandedId = state.expandedId === id ? null : id;
  // Re-render uniquement les cards pour éviter le scroll jump
  var hdate    = getHDate();
  var tefilah  = TEFILOT[state.tefilah];
  var sections = filterSections(tefilah.sections, hdate);
  var list = document.querySelector('.ss-list');
  if (list) {
    list.innerHTML =
      '<div class="ss-list-title">' + tefilah.label +
      '<span class="ss-list-count">' + sections.length + ' סעיפים</span></div>' +
      renderSections(sections);
  }
};
window.siddurToggleScroll = function() {
  state.autoScroll = !state.autoScroll;
  if (state.scrollInterval) { clearInterval(state.scrollInterval); state.scrollInterval = null; }
  if (state.autoScroll) {
    var el = document.getElementById('siddur-smart-root');
    state.scrollInterval = setInterval(function() {
      if (el) el.scrollTop += state.scrollSpeed;
      else window.scrollBy(0, state.scrollSpeed);
    }, 40);
  }
  render();
};
window.siddurSetSpeed = function(v) {
  state.scrollSpeed = +v;
};
window.siddurOpenCompass = function() {
  var existing = document.getElementById('ss-compass-modal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', renderCompassModal());
  if (compassState.hasPermission) enableCompass();
};
window.siddurCloseCompass = function() {
  var m = document.getElementById('ss-compass-modal');
  if (m) m.remove();
};
window.siddurActivateCompass = function() {
  requestCompass();
  var btn = document.querySelector('.ss-modal-activate');
  if (btn) { btn.textContent = 'Activation…'; btn.disabled = true; }
  setTimeout(function() {
    var m = document.getElementById('ss-compass-modal');
    if (m) {
      m.remove();
      window.siddurOpenCompass();
    }
  }, 800);
};

// ── Init : s'accroche à switchTab ──────────────────────────────────────────
function init() {
  injectStyles();

  var _interval = setInterval(function() {
    if (window.switchTab && !window._siddurHooked) {
      window._siddurHooked = true;
      var _orig = window.switchTab;

      window.switchTab = function(tab) {
        _orig(tab);
        if (tab === 'sub-tefila-siddur') {
          // Laisser le DOM se mettre en place
          setTimeout(function() {
            var root = document.getElementById('siddur-smart-root');
            if (root) render();
          }, 50);
        }
      };

      clearInterval(_interval);
    }
  }, 200);
}

init();

})();
