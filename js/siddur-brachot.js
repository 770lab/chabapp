// Textes complets Birkhot HaShachar — Tehilat Hashem
// Asher Yatzar et Elohai Neshama sont separes car ils viennent
// entre Netilat Yadayim et les 15 brachot dans l'ordre du siddour.

// Helper pour les explications repliables
var _det = 'style="direction:ltr;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#888;margin:2px 0 6px 0;white-space:normal;"';
var _sum = 'style="cursor:pointer;font-size:13px;color:#aaa;outline:none;"';
function _expl(txt) { return '<details ' + _det + '><summary ' + _sum + '>Explications</summary>' + txt + '</details>'; }

// Helper Kaddish repliable — "A reciter si minyan"
var _kdStyle = 'style="margin:16px 0;padding:10px 14px;background:#f9f9f5;border-radius:8px;border:1px solid #e8e4d8;"';
var _kdSum = 'style="cursor:pointer;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;color:#999;outline:none;"';

// Kaddish Derabbanane — texte hebreu
var _kaddishDRHe =
  _expl('Les endeuill\u00e9s r\u00e9citent le Kaddich suivant. Si aucun endeuill\u00e9 n\u2019est pr\u00e9sent il est d\u2019usage que l\u2019officiant r\u00e9cite ce Kaddich.') + '\n' +
  '\u05d9\u05b4\u05ea\u05b0\u05d2\u05b7\u05bc\u05d3\u05b7\u05bc\u05dc \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05e7\u05b7\u05d3\u05b7\u05bc\u05e9\u05c1 \u05e9\u05b0\u05c1\u05de\u05b5\u05d4\u05bc \u05e8\u05b7\u05d1\u05b8\u05bc\u05d0, (\u05d0\u05b8\u05de\u05b5\u05df) \u05d1\u05b0\u05bc\u05e2\u05b8\u05dc\u05b0\u05de\u05b8\u05d0 \u05d3\u05b4\u05bc\u05d9 \u05d1\u05b0\u05e8\u05b8\u05d0 \u05db\u05b4\u05e8\u05b0\u05e2\u05d5\u05bc\u05ea\u05b5\u05d4\u05bc \u05d5\u05b0\u05d9\u05b7\u05de\u05b0\u05dc\u05b4\u05d9\u05da\u05b0 \u05de\u05b7\u05dc\u05b0\u05db\u05d5\u05bc\u05ea\u05b5\u05d4\u05bc, \u05d5\u05b0\u05d9\u05b7\u05e6\u05b0\u05de\u05b7\u05d7 \u05e4\u05bc\u05d5\u05bc\u05e8\u05b0\u05e7\u05b8\u05e0\u05b5\u05d4\u05bc \u05d5\u05b4\u05d9\u05e7\u05b8\u05e8\u05b5\u05d1 \u05de\u05b0\u05e9\u05c1\u05b4\u05d9\u05d7\u05b5\u05d4\u05bc. (\u05d0\u05b8\u05de\u05b5\u05df) \u05d1\u05b0\u05bc\u05d7\u05b7\u05d9\u05b5\u05bc\u05d9\u05db\u05d5\u05b9\u05df \u05d5\u05bc\u05d1\u05b0\u05d9\u05d5\u05b9\u05de\u05b5\u05d9\u05db\u05d5\u05b9\u05df \u05d5\u05bc\u05d1\u05b0\u05d7\u05b7\u05d9\u05b5\u05bc\u05d9 \u05d3\u05b0\u05db\u05c7\u05dc \u05d1\u05b5\u05bc\u05d9\u05ea \u05d9\u05b4\u05e9\u05b0\u05c2\u05e8\u05b8\u05d0\u05b5\u05dc, \u05d1\u05b7\u05bc\u05e2\u05b2\u05d2\u05b8\u05dc\u05b8\u05d0 \u05d5\u05bc\u05d1\u05b4\u05d6\u05b0\u05de\u05b7\u05df \u05e7\u05b8\u05e8\u05b4\u05d9\u05d1 \u05d5\u05b0\u05d0\u05b4\u05de\u05b0\u05e8\u05d5\u05bc \u05d0\u05b8\u05de\u05b5\u05df:\n\n' +
  '\u05d0\u05b8\u05de\u05b5\u05df \u05d9\u05b0\u05d4\u05b5\u05d0 \u05e9\u05b0\u05c1\u05de\u05b5\u05d4\u05bc \u05e8\u05b7\u05d1\u05b8\u05bc\u05d0 \u05de\u05b0\u05d1\u05b8\u05e8\u05b7\u05da\u05b0 \u05dc\u05b0\u05e2\u05b8\u05dc\u05b7\u05dd \u05d5\u05bc\u05dc\u05b0\u05e2\u05b8\u05dc\u05b0\u05de\u05b5\u05d9 \u05e2\u05b8\u05dc\u05b0\u05de\u05b7\u05d9\u05b8\u05bc\u05d0, \u05d9\u05b4\u05ea\u05b0\u05d1\u05b8\u05bc\u05e8\u05b7\u05da\u05b0.\n\n' +
  '\u05d9\u05b0\u05d4\u05b5\u05d0 \u05e9\u05b0\u05c1\u05de\u05b5\u05d4\u05bc \u05e8\u05b7\u05d1\u05b8\u05bc\u05d0 \u05de\u05b0\u05d1\u05b8\u05e8\u05b7\u05da\u05b0 \u05dc\u05b0\u05e2\u05b8\u05dc\u05b7\u05dd \u05d5\u05bc\u05dc\u05b0\u05e2\u05b8\u05dc\u05b0\u05de\u05b5\u05d9 \u05e2\u05b8\u05dc\u05b0\u05de\u05b7\u05d9\u05b8\u05bc\u05d0. \u05d9\u05b4\u05ea\u05b0\u05d1\u05b8\u05bc\u05e8\u05b7\u05da\u05b0, \u05d5\u05b0\u05d9\u05b4\u05e9\u05b0\u05c1\u05ea\u05b7\u05bc\u05d1\u05b7\u05bc\u05d7, \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05e4\u05b8\u05bc\u05d0\u05b7\u05e8, \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05e8\u05d5\u05b9\u05de\u05b7\u05dd, \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05e0\u05b7\u05e9\u05b5\u05bc\u05c2\u05d0, \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05d4\u05b7\u05d3\u05b8\u05bc\u05e8, \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05e2\u05b7\u05dc\u05b6\u05bc\u05d4, \u05d5\u05b0\u05d9\u05b4\u05ea\u05b0\u05d4\u05b7\u05dc\u05b8\u05bc\u05dc, \u05e9\u05b0\u05c1\u05de\u05b5\u05d4\u05bc \u05d3\u05b0\u05bc\u05e7\u05bb\u05d3\u05b0\u05e9\u05b8\u05c1\u05d0 \u05d1\u05b0\u05bc\u05e8\u05b4\u05d9\u05da\u05b0 \u05d4\u05d5\u05bc\u05d0. (\u05d0\u05b8\u05de\u05b5\u05df) \u05dc\u05b0\u05e2\u05b5\u05dc\u05b8\u05bc\u05d0 \u05de\u05b4\u05df \u05db\u05c7\u05bc\u05dc \u05d1\u05b4\u05bc\u05e8\u05b0\u05db\u05b8\u05ea\u05b8\u05d0 \u05d5\u05b0\u05e9\u05b4\u05c1\u05d9\u05e8\u05b8\u05ea\u05b8\u05d0, \u05ea\u05bc\u05bb\u05e9\u05b0\u05c1\u05d1\u05b0\u05bc\u05d7\u05b8\u05ea\u05b8\u05d0 \u05d5\u05b0\u05e0\u05b6\u05d7\u05b1\u05de\u05b8\u05ea\u05b8\u05d0, \u05d3\u05b7\u05bc\u05d0\u05b2\u05de\u05b4\u05d9\u05e8\u05b8\u05df \u05d1\u05b0\u05bc\u05e2\u05b8\u05dc\u05b0\u05de\u05b8\u05d0, \u05d5\u05b0\u05d0\u05b4\u05de\u05b0\u05e8\u05d5\u05bc \u05d0\u05b8\u05de\u05b5\u05df: (\u05d0\u05b8\u05de\u05b5\u05df)\n\n' +
  '\u05e2\u05b7\u05dc \u05d9\u05b4\u05e9\u05b0\u05c2\u05e8\u05b8\u05d0\u05b5\u05dc \u05d5\u05b0\u05e2\u05b7\u05dc \u05e8\u05b7\u05d1\u05b8\u05bc\u05e0\u05b8\u05df, \u05d5\u05b0\u05e2\u05b7\u05dc \u05ea\u05b7\u05bc\u05dc\u05b0\u05de\u05b4\u05d9\u05d3\u05b5\u05d9\u05d4\u05d5\u05b9\u05df, \u05d5\u05b0\u05e2\u05b7\u05dc \u05db\u05c7\u05bc\u05dc \u05ea\u05b7\u05bc\u05dc\u05b0\u05de\u05b4\u05d9\u05d3\u05b5\u05d9 \u05ea\u05b7\u05dc\u05b0\u05de\u05b4\u05d9\u05d3\u05b5\u05d9\u05d4\u05d5\u05b9\u05df, \u05d5\u05b0\u05e2\u05b7\u05dc \u05db\u05c7\u05bc\u05dc \u05de\u05b8\u05d0\u05df \u05d3\u05b0\u05bc\u05e2\u05b8\u05e1\u05b0\u05e7\u05b4\u05d9\u05df \u05d1\u05b0\u05bc\u05d0\u05d5\u05b9\u05e8\u05b8\u05d9\u05b0\u05ea\u05b8\u05d0, \u05d3\u05b4\u05bc\u05d9 \u05d1\u05b0\u05d0\u05b7\u05ea\u05b0\u05e8\u05b8\u05d0 \u05d4\u05b8\u05d3\u05b5\u05d9\u05df \u05d5\u05b0\u05d3\u05b4\u05d9 \u05d1\u05b0\u05db\u05c7\u05dc \u05d0\u05b2\u05ea\u05b7\u05e8 \u05d5\u05b7\u05d0\u05b2\u05ea\u05b7\u05e8, \u05d9\u05b0\u05d4\u05b5\u05d0 \u05dc\u05b0\u05d4\u05d5\u05b9\u05df \u05d5\u05bc\u05dc\u05b0\u05db\u05d5\u05b9\u05df \u05e9\u05b0\u05c1\u05dc\u05b8\u05de\u05b8\u05d0 \u05e8\u05b7\u05d1\u05b8\u05bc\u05d0 \u05d7\u05b4\u05e0\u05b8\u05bc\u05d0 \u05d5\u05b0\u05d7\u05b4\u05e1\u05b0\u05d3\u05b8\u05bc\u05d0 \u05d5\u05b0\u05e8\u05b7\u05d7\u05b2\u05de\u05b4\u05d9\u05df \u05d5\u05b0\u05d7\u05b7\u05d9\u05b4\u05bc\u05d9\u05df \u05d0\u05b2\u05e8\u05b4\u05d9\u05db\u05b4\u05d9\u05df \u05d5\u05bc\u05de\u05b0\u05d6\u05d5\u05b9\u05e0\u05b8\u05d0 \u05e8\u05b0\u05d5\u05b4\u05d9\u05d7\u05b8\u05d0 \u05d5\u05bc\u05e4\u05bb\u05e8\u05b0\u05e7\u05b8\u05e0\u05b8\u05d0 \u05de\u05b4\u05df \u05e7\u05b3\u05d3\u05b8\u05dd \u05d0\u05b2\u05d1\u05d5\u05bc\u05d4\u05d5\u05b9\u05df \u05d3\u05b0\u05bc\u05d1\u05b4\u05e9\u05b0\u05c1\u05de\u05b7\u05d9\u05b8\u05bc\u05d0 \u05d5\u05b0\u05d0\u05b4\u05de\u05b0\u05e8\u05d5\u05bc \u05d0\u05b8\u05de\u05b5\u05df: (\u05d0\u05b8\u05de\u05b5\u05df)\n\n' +
  '\u05d9\u05b0\u05d4\u05b5\u05d0 \u05e9\u05b0\u05c1\u05dc\u05b8\u05de\u05b8\u05d0 \u05e8\u05b7\u05d1\u05b8\u05bc\u05d0 \u05de\u05b4\u05df \u05e9\u05b0\u05c1\u05de\u05b7\u05d9\u05b8\u05bc\u05d0 \u05d5\u05b0\u05d7\u05b7\u05d9\u05b4\u05bc\u05d9\u05dd \u05d8\u05d5\u05b9\u05d1\u05b4\u05d9\u05dd \u05e2\u05b8\u05dc\u05b5\u05d9\u05e0\u05d5\u05bc \u05d5\u05b0\u05e2\u05b7\u05dc \u05db\u05c7\u05bc\u05dc \u05d9\u05b4\u05e9\u05b0\u05c2\u05e8\u05b8\u05d0\u05b5\u05dc \u05d5\u05b0\u05d0\u05b4\u05de\u05b0\u05e8\u05d5\u05bc \u05d0\u05b8\u05de\u05b5\u05df: (\u05d0\u05b8\u05de\u05b5\u05df)\n\n' +
  _expl('On fait trois pas en arri\u00e8re. Depuis Roch Hachanah jusqu\u2019\u00e0 Yom Kippour, on dit \u05e2\u05b9\u05e9\u05b6\u05c2\u05d4 \u05d4\u05b7\u05e9\u05b8\u05bc\u05c1\u05dc\u05d5\u05b9\u05dd au lieu de \u05e2\u05b9\u05e9\u05b6\u05c2\u05d4 \u05e9\u05b8\u05c1\u05dc\u05d5\u05b9\u05dd.') + '\n' +
  '\u05e2\u05b9\u05e9\u05b6\u05c2\u05d4 \u05e9\u05b8\u05c1\u05dc\u05d5\u05b9\u05dd (\u05d4\u05b7\u05e9\u05b8\u05bc\u05c1\u05dc\u05d5\u05b9\u05dd) \u05d1\u05b4\u05bc\u05de\u05b0\u05e8\u05d5\u05b9\u05de\u05b8\u05d9\u05d5, \u05d4\u05d5\u05bc\u05d0 \u05d9\u05b7\u05e2\u05b2\u05e9\u05b6\u05c2\u05d4 \u05e9\u05b8\u05c1\u05dc\u05d5\u05b9\u05dd \u05e2\u05b8\u05dc\u05b5\u05d9\u05e0\u05d5\u05bc \u05d5\u05b0\u05e2\u05b7\u05dc \u05db\u05c7\u05bc\u05dc \u05d9\u05b4\u05e9\u05b0\u05c2\u05e8\u05b8\u05d0\u05b5\u05dc, \u05d5\u05b0\u05d0\u05b4\u05de\u05b0\u05e8\u05d5\u05bc \u05d0\u05b8\u05de\u05b5\u05df: (\u05d0\u05b8\u05de\u05b5\u05df)';

// Kaddish Derabbanane — phonetique
var _kaddishDRPh =
  _expl('Les endeuill\u00e9s r\u00e9citent le Kaddich suivant. Si aucun endeuill\u00e9 n\u2019est pr\u00e9sent il est d\u2019usage que l\u2019officiant r\u00e9cite ce Kaddich.') + '\n' +
  'Yit-gadal veyit-kadach chem\u00e9h raba; (Amen)\nbe-alema di vera \'hirout\u00e9h, ve-yamli\'h mal\'hout\u00e9h, ve-yatsma\'h pourkane\u00e9h, vikar\u00e8v mechi\'h\u00e9h; (Amen)\nbe-\'hay\u00e9\'hone, ou-ve-yom\u00e9\'hone ou-ve-\'hay\u00e9 de-\'hol beit Yisrael, ba-agala ou-vizmane kariv ve-imerou Amen.\n\n' +
  'Amen. Yeh\u00e9 chem\u00e9h raba mevara\'h le-alam oule-aleme\u00ef alemaya, yitbare\'h.\n\n' +
  'Yeh\u00e9 chem\u00e9h raba mevara\'h le-alam oule-aleme\u00ef alemaya. Yitbare\'h, ve-yichtaba\'h, ve-yitpa-\u00e8re, ve-yitromam, ve-yitnass\u00e9, ve-yit-hadar, ve-yit-al\u00e9, ve-yit-halal, chem\u00e9h de-koudecha beri\'h hou; (Amen)\nle-\u00e9la mine kol bire-\'hata ve-chirata, touch-be\'hata, ve-n\u00e9\'h\u00e9mata, da-amirane be-alema, ve-imerou Amen. (Amen)\n\n' +
  'Al Israel, ve-al rabbanane, ve-al talmid\u00e9one, ve-al kol talmid\u00e9 talmid\u00e9one, ve-al kol mane de-askine be-ora\u00efta, di ve-atra had\u00e8ne, ve-di ve\'hol atar va-atar, yeh\u00e9 le-hone ou-le-\'hone, chelama raba, \'hina, ve-\'hisda, ve-ra\'hamine, ve-\'hayine ari\'hine, ou-mezona revi\'ha, ou-fourkana mine kodame avouhone de-vichemaya ve-imerou Amen. (Amen)\n\n' +
  'Yeh\u00e9 chelama raba mine chemaya, ve-\'hayim tovim aleinou ve-al kol Yisrael, ve-imerou Amen. (Amen)\n\n' +
  _expl('On fait trois pas en arri\u00e8re. Depuis Roch Hachanah jusqu\u2019\u00e0 Yom Kippour, on dit Oss\u00e9 hachalom au lieu de Oss\u00e9 chalom.') + '\n' +
  'Oss\u00e9 chalom (hachalom) bi-meromav, hou ya-ass\u00e9 chalom aleinou ve-al kol Yisrael, ve-imerou Amen. (Amen)';

// Kaddish Derabbanane — traduction francaise
var _kaddishDRFr =
  'Grandi et sanctifi\u00e9 soit Son grand Nom (Amen) dans l\u2019univers qu\u2019Il a cr\u00e9\u00e9 selon Son d\u00e9sir, et puisse-t-Il \u00e9tablir Son royaume, faire \u00e9clore Sa r\u00e9demption et h\u00e2ter la venue de Son Messie (Amen) durant votre vie et durant vos jours et durant la vie de toute la Maison d\u2019Isra\u00ebl, en un moment et un temps proches, et r\u00e9pondez Amen.\n\n' +
  '(Amen. Que Son grand Nom soit b\u00e9ni \u00e0 jamais et pour l\u2019\u00e9ternit\u00e9. B\u00e9ni soit-Il.)\n\n' +
  'Que Son grand Nom soit b\u00e9ni \u00e0 jamais et pour l\u2019\u00e9ternit\u00e9. Que soit b\u00e9ni, couvert d\u2019\u00e9loges, vant\u00e9, glorifi\u00e9, sublim\u00e9, magnifi\u00e9, exalt\u00e9 et lou\u00e9 le Nom du Saint b\u00e9ni soit-Il (Amen) au-del\u00e0 de toute b\u00e9n\u00e9diction, cantique, louange et consolation exprim\u00e9s dans le monde, et r\u00e9pondez Amen. (Amen)\n\n' +
  'Puissent Isra\u00ebl, nos Ma\u00eetres, leurs \u00e9l\u00e8ves et les \u00e9l\u00e8ves de leurs \u00e9l\u00e8ves, ainsi que tous ceux qui se consacrent \u00e0 l\u2019\u00e9tude de la Torah, en cet endroit et en tout autre endroit, b\u00e9n\u00e9ficier d\u2019une paix durable, de gr\u00e2ce, de bienveillance, de mis\u00e9ricorde, d\u2019une longue vie, d\u2019une abondante subsistance et d\u2019une r\u00e9demption issues de leur P\u00e8re qui est aux cieux, et r\u00e9pondez Amen. (Amen)\n\n' +
  'Puisse-t-il \u00eatre accord\u00e9 une paix durable, issue des cieux, ainsi qu\u2019une vie agr\u00e9able, \u00e0 nous et \u00e0 tout Isra\u00ebl, et r\u00e9pondez Amen. (Amen)\n\n' +
  'Celui qui fait la paix dans Ses hauteurs, puisse-t-Il faire la paix pour nous et pour tout Isra\u00ebl, et r\u00e9pondez Amen. (Amen)';

// Fonction reutilisable pour inserer le Kaddish Derabbanane
function _kaddishDerabbanane(isPhonetic) {
  var content = isPhonetic ? _kaddishDRPh : _kaddishDRHe;
  var trad = '<details ' + _det + '><summary ' + _sum + '>Traduction</summary>' + _kaddishDRFr + '</details>';
  return '<details class="kaddish-minyan" ' + _kdStyle + '>' +
    '<summary ' + _kdSum + '>Kaddich Derabbanane \u2014 A r\u00e9citer si minyan</summary>' +
    content + '\n' + trad + '</details>';
}

// ── Asher Yatzar ────────────────────────────────────────────────────────────
window.SIDDUR_ASHER_YATZAR = {
  text:
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת הָאָדָם בְּחׇכְמָה, וּבָרָא בוֹ נְקָבִים נְקָבִים, חֲלוּלִים חֲלוּלִים. גָּלוּי וְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ, שֶׁאִם יִסָּתֵם אֶחָד מֵהֶם אוֹ אִם יִפָּתֵחַ אֶחָד מֵהֶם, אִי אֶפְשָׁר לְהִתְקַיֵּם אֲפִלּוּ שָׁעָה אֶחָת. בָּרוּךְ אַתָּה יְיָ, רוֹפֵא כׇל בָּשָׂר וּמַפְלִיא לַעֲשׂוֹת.',
  phonetic:
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ach\u00e8re yatsar \u00e8te haadam b\u00e9\'hokhma, ouvara vo n\u00e9kavim n\u00e9kavim, \'haloulim \'haloulim. Galoui v\u00e9yadoua lifn\u00e9 kiss\u00e9 kh\u00e9vod\u00e8kha, ch\u00e9im yissat\u00e8m \u00e9\'had m\u00e9h\u00e8m o im yipat\u00e9a\'h \u00e9\'had m\u00e9h\u00e8m, i efchar l\u00e9hitka\u00ef\u00e8m afilou chaa a\'hat. Baroukh ata Ado-na\u00ef, rof\u00e9 khol bassar oumafl\u00ee laassot.'
};

// ── Elohai Neshama ──────────────────────────────────────────────────────────
window.SIDDUR_ELOHAI_NESHAMA = {
  text:
    'אֱלֹהַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּהּ בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי, וּלְהַחֲזִירָהּ בִּי לֶעָתִיד לָבוֹא. כׇּל זְמַן שֶׁהַנְּשָׁמָה בְקִרְבִּי, מוֹדֶה אֲנִי לְפָנֶיךָ יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, רִבּוֹן כׇּל הַמַּעֲשִׂים, אֲדוֹן כׇּל הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר נְשָׁמוֹת לִפְגָרִים מֵתִים.',
  phonetic:
    'Elo-ha\u00ef, n\u00e9chama ch\u00e9natata bi t\u00e9hora hi. Ata v\u00e9ratah, ata y\u00e9tsartah, ata n\u00e9fa\'htah bi, v\u00e9ata m\u00e9cham\u00e9rah b\u00e9kirbi, v\u00e9ata atid lit\u00e9lah mim\u00e8ni, oul\u00e9ha\'hazirah bi l\u00e9atid lavo. Kol z\u00e9mane ch\u00e9han\u00e9chama b\u00e9kirbi, mod\u00e8 ani l\u00e9fan\u00e8kha Ado-na\u00ef Elo-ha\u00ef v\u00e9Elo-h\u00e9 avota\u00ef, Ribone kol hamaassim, Adone kol han\u00e9chamot. Baroukh ata Ado-na\u00ef, hama\'hazir n\u00e9chamot lifgarim m\u00e9tim.'
};

// ── Birkhot HaShachar complet ───────────────────────────────────────────────
// Comprend : 15 brachot + Yehi Ratson (x2) + Birkhot HaTorah
//            + Yevarechecha + Eilu devarim + Leolam yehe adam
window.SIDDUR_BRACHOT = {
  text:
    // ── Note avant les 15 brachot ──
    _expl('Il convient de r\u00e9citer les b\u00e9n\u00e9dictions suivantes, qu\u2019elles s\u2019appliquent ou non \u00e0 soi ; dans le cas, par exemple, o\u00f9 l\u2019on est demeur\u00e9 \u00e9veill\u00e9 toute la nuit et o\u00f9 l\u2019on ne s\u2019est ni d\u00e9v\u00eatu ni chang\u00e9. Cependant, si l\u2019on est rest\u00e9 \u00e9veill\u00e9 toute la nuit, il faut les r\u00e9citer apr\u00e8s le lever du jour. Si l\u2019on a dormi pendant la nuit, on peut les r\u00e9citer au r\u00e9veil, mais seulement pass\u00e9 la mi-nuit. Si l\u2019on est rest\u00e9 \u00e9veill\u00e9 toute la nuit et que l\u2019on a entendu le chant du coq apr\u00e8s minuit, on peut r\u00e9citer la b\u00e9n\u00e9diction : \u05d4\u05b7\u05e0\u05bc\u05d5\u05b9\u05ea\u05b5\u05df \u05dc\u05b7\u05e9\u05bc\u05c2\u05b6\u05db\u05b0\u05d5\u05b4\u05d9. Mais si on l\u2019a entendu avant le milieu de la nuit, on doit attendre le lever du jour pour r\u00e9citer cette b\u00e9n\u00e9diction.') + '\n' +
    // ── Les 15 brachot (ordre Tehilat Hashem) ──
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לַשֶּׂכְוִי בִינָה לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה.\n\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, פּוֹקֵחַ עִוְרִים.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, מַתִּיר אֲסוּרִים.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, זוֹקֵף כְּפוּפִים.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, מַלְבִּישׁ עֲרֻמִּים.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַנּוֹתֵן לַיָּעֵף כֹּחַ.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, רוֹקַע הָאָרֶץ עַל הַמָּיִם.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמֵּכִין מִצְעֲדֵי גָבֶר.\n' +
    // ── Note Tichea BeAv / Yom Kippour ──
    _expl('Les jours de Tich\u2019a B\u00e9Av et de Yom Kippour, on ne r\u00e9cite pas la b\u00e9n\u00e9diction suivante :') + '\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִּי כׇּל צׇרְכִּי.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אוֹזֵר יִשְׂרָאֵל בִּגְבוּרָה.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, עוֹטֵר יִשְׂרָאֵל בְּתִפְאָרָה.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי גּוֹי.\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי עָבֶד.\n' +
    // ── Note hommes ──
    _expl('Les hommes r\u00e9citent la b\u00e9n\u00e9diction suivante :') + '\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי אִשָּׁה.\n\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּעֲבִיר שֵׁנָה מֵעֵינָי וּתְנוּמָה מֵעַפְעַפָּי.\n\n' +
    // ── Note pas de Amen ──
    _expl('Il ne faut pas r\u00e9pondre Amen ici, car la pr\u00e9c\u00e9dente b\u00e9n\u00e9diction et la suivante constituent une seule et m\u00eame \u00ab longue b\u00e9n\u00e9diction \u00bb qui commence par \u05d1\u05b8\u05bc\u05e8\u05d5\u05bc\u05da\u05b0 et se conclut par \u05d1\u05b8\u05bc\u05e8\u05d5\u05bc\u05da\u05b0.') + '\n' +
    // ── Yehi Ratson (continuation de HaMaavir) ──
    'וִיהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ, וְתַדְבִּיקֵנוּ בְּמִצְוֹתֶיךָ, וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא, וְלֹא לִידֵי עֲבֵרָה וְעָוֹן, וְלֹא לִידֵי נִסָּיוֹן, וְלֹא לִידֵי בִזָּיוֹן, וְאַל יִשְׁלוֹט בָּנוּ יֵצֶר הָרָע, וְהַרְחִיקֵנוּ מֵאָדָם רָע, וּמֵחָבֵר רָע, וְדַבְּקֵנוּ בְּיֵצֶר הַטּוֹב וּבְמַעֲשִׂים טוֹבִים, וְכֹף אֶת יִצְרֵנוּ לְהִשְׁתַּעְבֶּד לָךְ, וּתְנֵנוּ הַיּוֹם וּבְכׇל יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כׇל רוֹאֵינוּ, וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים. בָּרוּךְ אַתָּה יְיָ, הַגּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל.\n\n' +
    // ── Yehi Ratson (2e — shetatsileini) ──
    'יְהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, שֶׁתַּצִּילֵנִי הַיּוֹם וּבְכׇל יוֹם מֵעַזֵּי פָנִים וּמֵעַזּוּת פָּנִים, מֵאָדָם רָע, וּמֵחָבֵר רָע, וּמִשָּׁכֵן רָע, וּמִפֶּגַע רָע, מֵעַיִן הָרָע, מִלָּשׁוֹן הָרָע, מִפַּלְשִׁינוּת, מֵעֵדוּת שֶׁקֶר, מִשִּׂנְאַת הַבְּרִיּוֹת, מֵעֲלִילָה, מִמִּיתָה מְשֻׁנָּה, מֵחֳלָאִים רָעִים, וּמִמִּקְרִים רָעִים, וּמִשָּׂטָן הַמַּשְׁחִית, מִדִּין קָשֶׁה, וּמִבַּעַל דִּין קָשֶׁה, בֵּין שֶׁהוּא בֶן בְּרִית, וּבֵין שֶׁאֵינוֹ בֶן בְּרִית, וּמִדִּינָה שֶׁל גֵּיהִנָּם.\n\n' +
    // ── Note Birkhot HaTorah ──
    _expl('Il convient d\u2019\u00eatre tr\u00e8s m\u00e9ticuleux pour la r\u00e9citation des b\u00e9n\u00e9dictions de la Torah. Il est interdit d\u2019exprimer la moindre parole de Torah avant de les r\u00e9citer. Celui qui a dormi la nuit doit les r\u00e9citer en se levant, s\u2019il est plus de minuit. Si l\u2019on est rest\u00e9 \u00e9veill\u00e9 toute la nuit, on doit les r\u00e9citer au point du jour, comme toutes les b\u00e9n\u00e9dictions du matin.') + '\n' +
    // ── Birkhot HaTorah ──
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל דִּבְרֵי תוֹרָה.\n\n' +
    'וְהַעֲרֶב נָא יְיָ אֱלֹהֵינוּ אֶת דִּבְרֵי תוֹרָתְךָ בְּפִינוּ, וּבְפִי כׇל עַמְּךָ בֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ, וְצֶאֱצָאֵי כׇל עַמְּךָ בֵּית יִשְׂרָאֵל, כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ וְלוֹמְדֵי תוֹרָתְךָ לִשְׁמָהּ. בָּרוּךְ אַתָּה יְיָ, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל.\n\n' +
    'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכׇּל הָעַמִּים וְנָתַן לָנוּ אֶת תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְיָ, נוֹתֵן הַתּוֹרָה.\n\n' +
    // ── Yevarechecha (Birkat Kohanim) ──
    'וַיְדַבֵּר יְיָ אֶל מֹשֶׁה לֵּאמֹר: דַּבֵּר אֶל אַהֲרֹן וְאֶל בָּנָיו לֵאמֹר כֹּה תְבָרְכוּ אֶת בְּנֵי יִשְׂרָאֵל אָמוֹר לָהֶם:\n\n' +
    'יְבָרֶכְךָ יְיָ וְיִשְׁמְרֶךָ.\nיָאֵר יְיָ פָּנָיו אֵלֶיךָ וִיחֻנֶּךָּ.\nיִשָּׂא יְיָ פָּנָיו אֵלֶיךָ, וְיָשֵׂם לְךָ שָׁלוֹם.\n\n' +
    'וְשָׂמוּ אֶת שְׁמִי עַל בְּנֵי יִשְׂרָאֵל וַאֲנִי אֲבָרְכֵם.\n\n' +
    // ── Eilu devarim (Peah 1:1) ──
    'אֵלּוּ דְבָרִים שֶׁאֵין לָהֶם שִׁעוּר: הַפֵּאָה, וְהַבִּכּוּרִים, וְהָרֵאָיוֹן, וּגְמִילוּת חֲסָדִים, וְתַלְמוּד תּוֹרָה.\n\n' +
    // ── Eilu devarim (Chabbat 127a) ──
    'אֵלּוּ דְבָרִים שֶׁאָדָם אוֹכֵל פֵּרוֹתֵיהֶם בָּעוֹלָם הַזֶּה, וְהַקֶּרֶן קַיֶּמֶת לוֹ לָעוֹלָם הַבָּא, וְאֵלּוּ הֵן: כִּבּוּד אָב וָאֵם, וּגְמִילוּת חֲסָדִים, וְהַשְׁכָּמַת בֵּית הַמִּדְרָשׁ שַׁחֲרִית וְעַרְבִית, וְהַכְנָסַת אוֹרְחִים, וּבִקּוּר חוֹלִים, וְהַכְנָסַת כַּלָּה, וְהַלְוָיַת הַמֵּת, וְעִיּוּן תְּפִלָּה, וַהֲבָאַת שָׁלוֹם שֶׁבֵּין אָדָם לַחֲבֵרוֹ, וּבֵין אִישׁ לְאִשְׁתּוֹ, וְתַלְמוּד תּוֹרָה כְּנֶגֶד כֻּלָּם.\n\n' +
    // ── Leolam yehe adam ──
    'לְעוֹלָם יְהֵא אָדָם יְרֵא שָׁמַיִם בַּסֵּתֶר וּבַגָּלוּי, וּמוֹדֶה עַל הָאֱמֶת, וְדוֹבֵר אֱמֶת בִּלְבָבוֹ, וְיַשְׁכֵּם וְיֹאמַר:\n\n' +
    'רִבּוֹן כׇּל הָעוֹלָמִים, לֹא עַל צִדְקוֹתֵינוּ אֲנַחְנוּ מַפִּילִים תַּחֲנוּנֵינוּ לְפָנֶיךָ, כִּי עַל רַחֲמֶיךָ הָרַבִּים. מָה אָנוּ, מֶה חַיֵּינוּ, מֶה חַסְדֵּנוּ, מַה צִּדְקוֹתֵינוּ, מַה יְּשׁוּעָתֵנוּ, מַה כֹּחֵנוּ, מַה גְּבוּרָתֵנוּ. מַה נֹּאמַר לְפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, הֲלֹא כׇּל הַגִּבּוֹרִים כְּאַיִן לְפָנֶיךָ, וְאַנְשֵׁי הַשֵּׁם כְּלֹא הָיוּ, וַחֲכָמִים כִּבְלִי מַדָּע, וּנְבוֹנִים כִּבְלִי הַשְׂכֵּל, כִּי רֹב מַעֲשֵׂיהֶם תֹּהוּ, וִימֵי חַיֵּיהֶם הֶבֶל לְפָנֶיךָ, וּמוֹתַר הָאָדָם מִן הַבְּהֵמָה אָיִן, כִּי הַכֹּל הָבֶל.\n\n' +
    'אֲבָל אֲנַחְנוּ עַמְּךָ בְּנֵי בְרִיתֶךָ, בְּנֵי אַבְרָהָם אֹהַבְךָ שֶׁנִּשְׁבַּעְתָּ לוֹ בְּהַר הַמּוֹרִיָּה, זֶרַע יִצְחָק יְחִידוֹ שֶׁנֶּעֱקַד עַל גַּבֵּי הַמִּזְבֵּחַ, עֲדַת יַעֲקֹב בִּנְךָ בְּכוֹרֶךָ, שֶׁמֵּאַהֲבָתְךָ שֶׁאָהַבְתָּ אוֹתוֹ וּמִשִּׂמְחָתְךָ שֶׁשָּׂמַחְתָּ בּוֹ, קָרָאתָ אֶת שְׁמוֹ יִשְׂרָאֵל וִישֻׁרוּן.\n\n' +
    'לְפִיכָךְ אֲנַחְנוּ חַיָּבִים לְהוֹדוֹת לְךָ וּלְשַׁבֵּחֲךָ וּלְפָאֶרְךָ, וּלְבָרֵךְ וּלְקַדֵּשׁ וְלָתֵת שֶׁבַח וְהוֹדָאָה לִשְׁמֶךָ. אַשְׁרֵינוּ, מַה טּוֹב חֶלְקֵנוּ, וּמַה נָּעִים גּוֹרָלֵנוּ, וּמַה יָּפָה יְרֻשָּׁתֵנוּ. אַשְׁרֵינוּ שֶׁאָנוּ מַשְׁכִּימִים וּמַעֲרִיבִים, עֶרֶב וָבֹקֶר, וְאוֹמְרִים פַּעֲמַיִם בְּכׇל יוֹם:\n\n' +
    'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד.\n\n' +
    'אַתָּה הוּא עַד שֶׁלֹּא נִבְרָא הָעוֹלָם, אַתָּה הוּא מִשֶּׁנִּבְרָא הָעוֹלָם, אַתָּה הוּא בָּעוֹלָם הַזֶּה, וְאַתָּה הוּא לָעוֹלָם הַבָּא. קַדֵּשׁ אֶת שִׁמְךָ עַל מַקְדִּישֵׁי שְׁמֶךָ, וְקַדֵּשׁ אֶת שִׁמְךָ בְּעוֹלָמֶךָ, וּבִישׁוּעָתְךָ תָּרִים וְתַגְבִּיהַּ קַרְנֵנוּ. בָּרוּךְ אַתָּה יְיָ, הַמְקַדֵּשׁ אֶת שִׁמְךָ בָּרַבִּים.\n\n' +
    _kaddishDerabbanane(false),

  phonetic:
    // ── Note avant les 15 brachot ──
    _expl('Il convient de r\u00e9citer les b\u00e9n\u00e9dictions suivantes, qu\u2019elles s\u2019appliquent ou non \u00e0 soi ; dans le cas, par exemple, o\u00f9 l\u2019on est demeur\u00e9 \u00e9veill\u00e9 toute la nuit et o\u00f9 l\u2019on ne s\u2019est ni d\u00e9v\u00eatu ni chang\u00e9. Cependant, si l\u2019on est rest\u00e9 \u00e9veill\u00e9 toute la nuit, il faut les r\u00e9citer apr\u00e8s le lever du jour. Si l\u2019on a dormi pendant la nuit, on peut les r\u00e9citer au r\u00e9veil, mais seulement pass\u00e9 la mi-nuit. Si l\u2019on est rest\u00e9 \u00e9veill\u00e9 toute la nuit et que l\u2019on a entendu le chant du coq apr\u00e8s minuit, on peut r\u00e9citer la b\u00e9n\u00e9diction : \u05d4\u05b7\u05e0\u05bc\u05d5\u05b9\u05ea\u05b5\u05df \u05dc\u05b7\u05e9\u05bc\u05c2\u05b6\u05db\u05b0\u05d5\u05b4\u05d9. Mais si on l\u2019a entendu avant le milieu de la nuit, on doit attendre le lever du jour pour r\u00e9citer cette b\u00e9n\u00e9diction.') + '\n' +
    // ── Les 15 brachot (ordre Tehilat Hashem) ──
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ach\u00e8re natane lass\u00e9khvi bina l\u00e9hav\'hine b\u00e8ne yom ouv\u00e8ne la\u00efla.\n\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, pok\u00e9\'ah ivrim.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, matir assourim.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, zok\u00e8f k\u00e9foufim.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, malbich aroumim.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, hanot\u00e8ne laya\u00e8f koa\'h.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, roka haar\u00e8ts al hama\u00efm.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ham\u00e9khine mits\'ad\u00e9 gav\u00e8r.\n' +
    // ── Note Tichea BeAv / Yom Kippour ──
    _expl('Les jours de Tich\u2019a B\u00e9Av et de Yom Kippour, on ne r\u00e9cite pas la b\u00e9n\u00e9diction suivante :') + '\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ch\u00e9assa li kol tsorki.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, oz\u00e8r Isra\u00ebl bigvoura.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ot\u00e8r Isra\u00ebl b\u00e9tif\'ara.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ch\u00e9lo assani go\u00ef.\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ch\u00e9lo assani av\u00e8d.\n' +
    // ── Note hommes ──
    _expl('Les hommes r\u00e9citent la b\u00e9n\u00e9diction suivante :') + '\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ch\u00e9lo assani icha.\n\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, hamaavir ch\u00e9na m\u00e9\u00e8\u00efna\u00ef out\u00e9nouma m\u00e9af\'apa\u00ef.\n\n' +
    // ── Note pas de Amen ──
    _expl('Il ne faut pas r\u00e9pondre Amen ici, car la pr\u00e9c\u00e9dente b\u00e9n\u00e9diction et la suivante constituent une seule et m\u00eame \u00ab longue b\u00e9n\u00e9diction \u00bb qui commence par \u05d1\u05b8\u05bc\u05e8\u05d5\u05bc\u05da\u05b0 et se conclut par \u05d1\u05b8\u05bc\u05e8\u05d5\u05bc\u05da\u05b0.') + '\n' +
    // ── Yehi Ratson ──
    'Vihi ratsone milefan\u00e8kha Ado-na\u00ef Elo-h\u00e9nou v\u00e9Elo-h\u00e9 avot\u00e9inou, ch\u00e9targuil\u00e9nou b\u00e9Torat\u00e8kha, v\u00e9tadbik\u00e9nou b\u00e9mitsvot\u00e8kha, v\u00e9al t\u00e9vi\u00e9nou lo lid\u00e9 \'h\u00e8t, v\u00e9lo lid\u00e9 av\u00e9ra v\u00e9avone, v\u00e9lo lid\u00e9 nissayone, v\u00e9lo lid\u00e9 vizayone, v\u00e9al yichlot banou y\u00e9ts\u00e8r hara, v\u00e9har\'hik\u00e9nou m\u00e9adam ra oum\u00e9\'hav\u00e8r ra, v\u00e9dab\u00e9k\u00e9nou b\u00e9y\u00e9ts\u00e8r hatov ouv\u00e9maassim tovim, v\u00e9khof \u00e8te yitsr\u00e9nou l\u00e9hichtab\u00e8d lakh, out\u00e9n\u00e9nou hayom ouv\u00e9khol yom l\u00e9\'h\u00e8ne oul\u00e9\'h\u00e8ss\u00e8d oul\u00e9ra\'hamim b\u00e9\u00e8n\u00e8kha ouv\u00e9\u00e8n\u00e9 khol ro\u00e9nou, v\u00e9tigm\u00e9l\u00e9nou \'hassadim tovim. Baroukh ata Ado-na\u00ef, hagom\u00e8l \'hassadim tovim l\u00e9amo Isra\u00ebl.\n\n' +
    // ── Yehi Ratson (2e) ──
    'Y\u00e9hi ratsone milefan\u00e8kha Ado-na\u00ef Elo-ha\u00ef v\u00e9Elo-h\u00e9 avota\u00ef, ch\u00e9tatsiléni hayom ouv\u00e9khol yom m\u00e9az\u00e9 fanim oum\u00e9azout panim, m\u00e9adam ra, oum\u00e9\'hav\u00e8r ra, oumichakh\u00e8ne ra, oumiféga ra, m\u00e9a\u00efne hara, milachone hara, mifalchinout, m\u00e9\u00e9dout ch\u00e9k\u00e8r, missin\u00e9at habriryot, m\u00e9alila, mimimita m\u00e9chouna, m\u00e9\'hola\u00efm ra\u00efm, oumimikrim ra\u00efm, oumissatane hamach\u00e9\'hit, midine kach\u00e9, oumibaale dine kach\u00e9, b\u00e8ine ch\u00e9hou b\u00e8ne b\u00e9rit, ouv\u00e8ine ch\u00e9\u00e9no b\u00e8ne b\u00e9rit, oumidina ch\u00e8l gu\u00e9hinom.\n\n' +
    // ── Note Birkhot HaTorah ──
    _expl('Il convient d\u2019\u00eatre tr\u00e8s m\u00e9ticuleux pour la r\u00e9citation des b\u00e9n\u00e9dictions de la Torah. Il est interdit d\u2019exprimer la moindre parole de Torah avant de les r\u00e9citer. Celui qui a dormi la nuit doit les r\u00e9citer en se levant, s\u2019il est plus de minuit. Si l\u2019on est rest\u00e9 \u00e9veill\u00e9 toute la nuit, on doit les r\u00e9citer au point du jour, comme toutes les b\u00e9n\u00e9dictions du matin.') + '\n' +
    // ── Birkhot HaTorah ──
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ach\u00e8re kid\u00e9chanou b\u00e9mitsvotav, v\u00e9tsivanou al divr\u00e9 Tora.\n\n' +
    'V\u00e9haar\u00e8v na Ado-na\u00ef Elo-h\u00e9nou \u00e8te divr\u00e9 Torat\u00e8kha b\u00e9finou ouv\u00e9fi khol am\u00e9kha b\u00e8t Isra\u00ebl, v\u00e9nihy\u00e9 ana\'hnou v\u00e9ts\u00e9\u00e9tsa\u00e9inou v\u00e9ts\u00e9\u00e9tsa\u00e9 khol am\u00e9kha b\u00e8t Isra\u00ebl, koulanou yod\u00e9\u00e8 ch\u00e9m\u00e8kha v\u00e9lomd\u00e9 Torat\u00e8kha lichmah. Baroukh ata Ado-na\u00ef, hamlam\u00e8d Tora l\u00e9amo Isra\u00ebl.\n\n' +
    'Baroukh ata Ado-na\u00ef Elo-h\u00e9nou M\u00e9lekh haolam, ach\u00e8re ba\'har banou mikol haamim v\u00e9natane lanou \u00e8te Torato. Baroukh ata Ado-na\u00ef, not\u00e8ne haTora.\n\n' +
    // ── Yevarechecha (Birkat Kohanim) ──
    'Vayedab\u00e8r Ado-na\u00ef \u00e8l Moch\u00e9 l\u00e9mor: Dab\u00e8r \u00e8l Aharon v\u00e9\u00e8l banav l\u00e9mor ko t\u00e9var\u00e9khou \u00e8te b\u00e9n\u00e9 Isra\u00ebl amor lah\u00e8m:\n\n' +
    'Y\u00e9var\u00e8kh\u00e9kha Ado-na\u00ef v\u00e9yichm\u00e9r\u00e8kha.\n' +
    'Ya\u00e8r Ado-na\u00ef panav \u00e9l\u00e8kha vi\'houn\u00e9ka.\n' +
    'Yissa Ado-na\u00ef panav \u00e9l\u00e8kha, v\u00e9yass\u00e8m l\u00e9kha chalom.\n\n' +
    'V\u00e9samou \u00e8te ch\u00e9mi al b\u00e9n\u00e9 Isra\u00ebl vaani avar\u00e9kh\u00e8m.\n\n' +
    // ── Eilu devarim (Peah 1:1) ──
    'Elou d\u00e9varim ch\u00e9\u00e8ne lah\u00e8m chiour : hap\u00e9a, v\u00e9habikourim, v\u00e9har\u00e9ayone, ouguemilout \'hassadim, v\u00e9talmoud Tora.\n\n' +
    // ── Eilu devarim (Chabbat 127a) ──
    'Elou d\u00e9varim ch\u00e9adam okh\u00e8l p\u00e9rot\u00e9h\u00e8m baolam haz\u00e8, v\u00e9hak\u00e8r\u00e8ne kay\u00e8m\u00e8te lo laolam haba, v\u00e9\u00e9lou h\u00e8ne : kiboud av va\u00e8m, ouguemilout \'hassadim, v\u00e9hachkamat b\u00e8t hamidrach cha\'harit v\u00e9arvit, v\u00e9hakhnassat or\'him, ouvikour \'holim, v\u00e9hakhnassat kala, v\u00e9halvayat ham\u00e8t, v\u00e9iyoune t\u00e9fila, vahavaat chalom ch\u00e9b\u00e8ne adam la\'hav\u00e9ro, ouv\u00e8ne ich l\u00e9ichto, v\u00e9talmoud Tora k\u00e9n\u00e9gu\u00e8d koulam.\n\n' +
    // ── Leolam yehe adam ──
    'L\u00e9olam y\u00e9h\u00e9 adam y\u00e9r\u00e9 chama\u00efm bass\u00e8t\u00e8r ouvagaloui, oumod\u00e8 al ha\u00e9m\u00e8t, v\u00e9dov\u00e8r \u00e9m\u00e8t bilvavo, v\u00e9yachk\u00e8m v\u00e9yomar :\n\n' +
    'Ribone kol haolamim, lo al tsidkot\u00e9inou ana\'hnou mapilim ta\'hanoun\u00e9inou l\u00e9fan\u00e8kha, ki al ra\'ham\u00e8kha harabim. Ma anou, m\u00e8 \'hay\u00e9inou, m\u00e8 \'hasd\u00e9nou, ma tsidkot\u00e9inou, ma y\u00e9chouat\u00e9nou, ma ko\'h\u00e9nou, ma gu\u00e9vourat\u00e9nou. Ma nomar l\u00e9fan\u00e8kha Ado-na\u00ef Elo-h\u00e9nou v\u00e9Elo-h\u00e9 avot\u00e9inou, halo kol haguiborim k\u00e9a\u00efne l\u00e9fan\u00e8kha, v\u00e9anch\u00e9 hach\u00e8m k\u00e9lo hayou, va\'hakhamim kiv\u00e9li mada, oun\u00e9vonim kiv\u00e9li hask\u00e8l, ki rov maass\u00e9h\u00e8m tohou, vim\u00e9 \'hay\u00e9h\u00e8m h\u00e9v\u00e8l l\u00e9fan\u00e8kha, oumotar haadam mine hab\u00e9h\u00e9ma a\u00efne, ki hakol hav\u00e8l.\n\n' +
    'Aval ana\'hnou am\u00e9kha b\u00e9n\u00e9 v\u00e9rit\u00e8kha, b\u00e9n\u00e9 Avraham ohavkha ch\u00e9nichbata lo b\u00e9har hamoriya, z\u00e9ra Yits\'hak y\u00e9\'hido ch\u00e9n\u00e9\u00e9kad al gab\u00e9 hamizb\u00e9a\'h, adat Yaakov binkha b\u00e9khor\u00e8kha, ch\u00e9m\u00e9ahavatkha ch\u00e9ahavta oto oumissim\'hatkha ch\u00e9ssama\'hta bo, karata \u00e8te ch\u00e9mo Isra\u00ebl viChouroune.\n\n' +
    'L\u00e9fikhakh ana\'hnou \'hayavim l\u00e9hodot l\u00e9kha oul\u00e9chab\u00e9\'hakha oul\u00e9fa\u00e8r\u00e9kha, oul\u00e9var\u00e8kh oul\u00e9kad\u00e8ch v\u00e9lat\u00e8t ch\u00e9va\'h v\u00e9hodaa lich\u00e9m\u00e8kha. Achr\u00e9inou, ma tov \'helk\u00e9nou, ouma naim goral\u00e9nou, ouma yafa y\u00e9rouchat\u00e9nou. Achr\u00e9inou ch\u00e9anou machkimim oumaarivim, \u00e8r\u00e8v vavok\u00e8r, v\u00e9omrim paama\u00efm b\u00e9khol yom :\n\n' +
    'Ch\u00e9ma Isra\u00ebl, Ado-na\u00ef Elo-h\u00e9nou, Ado-na\u00ef E\'had.\n\n' +
    'Ata hou ad ch\u00e9lo nivra haolam, ata hou mich\u00e9nivra haolam, ata hou baolam haz\u00e8, v\u00e9ata hou laolam haba. Kad\u00e8ch \u00e8te chimkha al makdich\u00e9 ch\u00e9m\u00e8kha, v\u00e9kad\u00e8ch \u00e8te chimkha b\u00e9olam\u00e8kha, ouvichouatkha tarim v\u00e9tagbia karn\u00e9nou. Baroukh ata Ado-na\u00ef, hamkad\u00e8ch \u00e8te chimkha barabim.\n\n' +
    _kaddishDerabbanane(true),
};
