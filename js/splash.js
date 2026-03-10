// ====== SPLASH SCREEN ======

// Citations affichees sur le splash et l'accueil
const QUOTES = [
  { text: "Celui qui récite les Tehilim chaque jour, c'est comme s'il avait accompli toute la Torah.", source: "Midrash Chocher Tov" },
  { text: "Les Tehilim brisent toutes les barrières et s'élèvent de niveau en niveau sans obstacle.", source: "Rabbi Na'hman de Breslev" },
  { text: "Le Livre des Tehilim est le remède pour toutes les souffrances.", source: "Le Baal Chem Tov" },
  { text: "David, roi d'Israël, a composé les Tehilim en incluant en eux les prières de chaque juif, en tout temps et en tout lieu.", source: "Le Sfat Emet" },
  { text: "Celui qui dit des Tehilim repousse les forces du mal et fait descendre la bénédiction sur le monde.", source: "Le Zohar HaKadoch" },
  { text: "Si les gens connaissaient la puissance des Tehilim, ils les réciteraient à chaque instant.", source: "Rabbi Yéhouda HéH'assid" },
  { text: "Les portes des larmes ne sont jamais fermées, et les Tehilim sont la clé de toutes les autres portes.", source: "Le Rabbi de Loubavitch" },
  { text: "Chaque mot des Tehilim possède le pouvoir d'éveiller la miséricorde divine.", source: "Le 'Hafets 'Haïm" },
  { text: "Heureux celui qui dit des Tehilim avec ferveur, car Hachem compte chacun de ses mots comme des pierres précieuses.", source: "Midrach Rabba" },
  { text: "La récitation des Tehilim a le pouvoir de transformer un décret sévère en miséricorde.", source: "Le Ben Ich 'Haï" },
  { text: "Quand un homme ne sait pas quoi dire à Hachem, qu'il ouvre le livre des Tehilim.", source: "Rabbi Yéhiel Mikhal de Zlotchov" },
  { text: "Les Tehilim sont l'échelle par laquelle on s'élève vers le Créateur.", source: "Le Maguid de Mézéritch" },
  { text: "Dix formes de louanges ont été utilisées pour composer les Tehilim, et la plus grande de toutes est Halelou-ya.", source: "Talmud Pessa'him 117a" },
  { text: "La lecture des Tehilim est agréable à Hachem à toute heure du jour et de la nuit.", source: "Le Chla HaKadoch" },
  { text: "Celui qui récite le livre entier des Tehilim chaque mois mérite de recevoir la face de la Chékhina.", source: "Séfer Hassidim" },
  { text: "Les Tehilim sont le bouclier d'Israël : ils protègent aussi bien l'individu que la communauté.", source: "Le Rav Ovadia Yossef" },
  { text: "Quiconque dit des Tehilim est considéré comme s'il avait accompli toutes les supplications du monde.", source: "Yalkout Chimoni" },
  { text: "Le roi David a demandé à Hachem que la récitation des Tehilim soit considérée comme l'étude de Néguayim et Ohalot.", source: "Talmud Ménah'ot 4a" },
  { text: "Avec les Tehilim, on peut obtenir tout ce dont on a besoin, que ce soit sur le plan matériel ou spirituel.", source: "Rabbi Israël de Rouzhin" },
  { text: "Les Tehilim ont été composés avec Roua'h HaKodech pour toutes les générations et toutes les situations.", source: "Le Rambam" },
];

// Duree d'affichage des citations (vitesse de lecture ~2.5 mots/sec)
function getQuoteDuration(q) {
  const totalWords = q.text.split(/\s+/).length + q.source.split(/\s+/).length;
  return Math.round(1000 + (totalWords / 2.5) * 1000);
}

// Aligne le "am" de Instagram avec le "am" de Koulam
(function alignSplashAm() {
  function doAlign() {
    var igAm = document.querySelector('.sp-ig-text .sp-am-part');
    var koulAm = document.querySelector('.sp-koulam-text .sp-am-part');
    var igText = document.querySelector('.sp-ig-text');
    if (!igAm || !koulAm || !igText) return;
    var offset = igAm.getBoundingClientRect().left - koulAm.getBoundingClientRect().left;
    igText.style.left = (-offset) + 'px';
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(doAlign);
  } else {
    window.addEventListener('load', doAlign);
  }
})();

function skipSplash() {
  if (window._splashTimer) { clearTimeout(window._splashTimer); window._splashTimer = null; }
  document.getElementById("splash").classList.add("hidden");
  showHome();
}

// ====== QUOTES ======
function updateQuote() {
  const q = QUOTES[quoteIndex];
  var sq = document.getElementById("splash-quote"); if (sq) sq.textContent = "\u00ab " + q.text + " \u00bb";
  var ss = document.getElementById("splash-source"); if (ss) ss.textContent = "\u2014 " + q.source;
  var hq = document.getElementById("home-quote"); if (hq) hq.textContent = "\u00ab " + q.text + " \u00bb";
  var hs = document.getElementById("home-source"); if (hs) hs.textContent = "\u2014 " + q.source;
  renderDots();
}

function renderDots() {
  ["splash-dots", "home-dots"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let html = "";
    QUOTES.forEach((_, i) => {
      const w = i === quoteIndex ? 14 : 4;
      const bg = i === quoteIndex ? "var(--black)" : "var(--gray-5)";
      html += '<div class="' + (id === "splash-dots" ? "splash-dot" : "quote-dot") + '" data-qi="' + i + '" style="width:' + w + 'px;background:' + bg + '"></div>';
    });
    el.innerHTML = html;
    el.onclick = function(e) {
      var dot = e.target.closest('[data-qi]');
      var idx = dot ? parseInt(dot.getAttribute('data-qi')) : -1;
      if (idx >= 0 && idx !== quoteIndex) {
        jumpToQuote(idx);
      } else {
        jumpToQuote((quoteIndex + 1) % QUOTES.length);
      }
    };
  });
}

function jumpToQuote(idx) {
  if (quoteTimer) clearTimeout(quoteTimer);
  ["splash-quote", "splash-source", "home-quote", "home-source"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; }
  });
  setTimeout(() => {
    quoteIndex = idx;
    updateQuote();
    ["splash-quote", "splash-source", "home-quote", "home-source"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; }
    });
    scheduleNextQuote();
  }, 400);
}

function scheduleNextQuote() {
  if (quoteTimer) clearTimeout(quoteTimer);
  const duration = getQuoteDuration(QUOTES[quoteIndex]);
  quoteTimer = setTimeout(cycleQuote, duration);
}

function cycleQuote() {
  quoteFade = false;
  ["splash-quote", "splash-source", "home-quote", "home-source"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; }
  });
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    updateQuote();
    ["splash-quote", "splash-source", "home-quote", "home-source"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; }
    });
    quoteFade = true;
    scheduleNextQuote();
  }, 600);
}
