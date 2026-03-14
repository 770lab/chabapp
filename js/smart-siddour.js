// ─── SMART SIDDUR — KOULAM ────────────────────────────────────────────────────
// 100% offline · Vanilla JS · s'intègre dans le système switchTab existant
// ─────────────────────────────────────────────────────────────────────────────
(function () {
'use strict';

// ── Dégradé Instagram ──────────────────────────────────────────────────────
var INSTA = 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)';

// ── Nusachim ───────────────────────────────────────────────────────────────
var NUSACHIM = [
  { id: 'chabad',  label: 'תהילת השם',  labelPhonetic: 'Tehilat Hachem',  labelFr: 'Tehilat Hachem'  },
  { id: 'mizrach', label: 'פתח אליהו', labelPhonetic: "Pata'h Eliyahou", labelFr: "Pata'h Eliyahou" },
];

// ── État global ────────────────────────────────────────────────────────────
var state = {
  tefilah:    'shacharit',
  nusach:     'chabad',
  isFemale:   false,
  lang:       'hebrew',   // 'hebrew' | 'phonetic' | 'french'
  autoScroll: false,
  scrollSpeed: 2,
  scrollInterval: null,
  tabsExpanded: false,
};

// ── Données téfilot ────────────────────────────────────────────────────────
var TEFILOT = {
  shacharit: {
    label: 'שַׁחֲרִית', labelPhonetic: 'Cha\'harit', labelFr: 'Priere du matin', sublabel: 'Shacharit', icon: '🌅', image: 'assets/Avraham.webp', imagePosition: 'center 30%',
    sections: [
      { id: 'modeh', title: 'מודה אני', titlePhonetic: 'Modé Ani', titleFemale: 'מודָה אני', titlePhoneticFemale: 'Moda Ani', always: true,
        text: 'מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.',
        phonetic: 'Mod\u00e9 ani l\u00e9fan\u00e9kha, M\u00e9lekh \'ha\u00ef v\u00e9kayam, ch\u00e9h\u00e9\'h\u00e9zarta bi nichmati b\u00e9\'hemla, raba \u00e9mounat\u00e9kha.' },

      { id: 'netilat', title: 'נטילת ידיים', titlePhonetic: 'Nétilat Yadaïm', always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָיִם.',
        phonetic: 'Baroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav, vétsivanou al nétilat yadaïm.' },

      { id: 'asher-yatzar', title: 'אֲשֶׁר יָצַר', titlePhonetic: 'Achère Yatsar', always: true,
        text: (window.SIDDUR_ASHER_YATZAR || {}).text || '',
        phonetic: (window.SIDDUR_ASHER_YATZAR || {}).phonetic || '' },

      { id: 'elohai-neshama', title: 'אֱלֹהַי נְשָׁמָה', titlePhonetic: 'Elo-haï Néchama', always: true,
        text: (window.SIDDUR_ELOHAI_NESHAMA || {}).text || '',
        phonetic: (window.SIDDUR_ELOHAI_NESHAMA || {}).phonetic || '' },

      { id: 'brachot', title: 'בִּרְכוֹת הַשַּׁחַר', titlePhonetic: 'Birkhot Hacha\'har', always: true,
        text: (window.SIDDUR_BRACHOT || {}).text || '',
        phonetic: (window.SIDDUR_BRACHOT || {}).phonetic || '' },

      { id: 'tfilin', title: 'הנחת תפילין', titlePhonetic: 'Hana\'hat Téfiline', always: true, male_only: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לְהָנִיחַ תְּפִלִּין.\n\nתְּפִלִּין שֶׁל רֹאשׁ:\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל מִצְוַת תְּפִלִּין.\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.',
        phonetic: 'Baroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav, vétsivanou léhania\'h téfiline.\n\nTéfiline chel roch :\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav, vétsivanou al mitsvat téfiline.\nBaroukh chem kevod malkhouto léolam vaèd.' },

      { id: 'psukei', title: 'פְּסוּקֵי דְּזִמְרָה', titlePhonetic: 'Pessouké déZimra', always: true,
        text: (window.SIDDUR_PSUKEI || {}).text || '',
        phonetic: (window.SIDDUR_PSUKEI || {}).phonetic || '' },

      { id: 'birkot-shema', title: 'בִּרְכוֹת קְרִיאַת שְׁמַע', titlePhonetic: 'Birkot Kriat Chéma', always: true,
        text: '— בָּרְכוּ —\n\nבָּרְכוּ אֶת יְיָ הַמְבֹרָךְ.\nבָּרוּךְ יְיָ הַמְבֹרָךְ לְעוֹלָם וָעֶד.\n\n— יוֹצֵר אוֹר —\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, יוֹצֵר אוֹר וּבוֹרֵא חֹשֶׁךְ, עֹשֶׂה שָׁלוֹם וּבוֹרֵא אֶת הַכֹּל.\n\nהַכֹּל יוֹדוּךָ וְהַכֹּל יְשַׁבְּחוּךָ, וְהַכֹּל יֹאמְרוּ אֵין קָדוֹשׁ כַּיְיָ. הַכֹּל יְרוֹמְמוּךָ סֶּלָה, יוֹצֵר הַכֹּל. הָאֵל הַפּוֹתֵחַ בְּכׇל יוֹם דַּלְתוֹת שַׁעֲרֵי מִזְרָח, וּבוֹקֵעַ חַלּוֹנֵי רָקִיעַ, מוֹצִיא חַמָּה מִמְּקוֹמָהּ וּלְבָנָה מִמְּכוֹן שִׁבְתָּהּ, וּמֵאִיר לָעוֹלָם כֻּלּוֹ וּלְיוֹשְׁבָיו.\n\nקָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ.\n\nתִּתְבָּרַךְ יְיָ אֱלֹהֵינוּ עַל שֶׁבַח מַעֲשֵׂה יָדֶיךָ, וְעַל מְאוֹרֵי אוֹר שֶׁעָשִׂיתָ, יְפָאֲרוּךָ סֶּלָה.\n\nבָּרוּךְ אַתָּה יְיָ, יוֹצֵר הַמְּאוֹרוֹת.\n\n— אַהֲבָה רַבָּה —\n\nאַהֲבָה רַבָּה אֲהַבְתָּנוּ יְיָ אֱלֹהֵינוּ, חֶמְלָה גְדוֹלָה וִיתֵרָה חָמַלְתָּ עָלֵינוּ. אָבִינוּ מַלְכֵּנוּ, בַּעֲבוּר אֲבוֹתֵינוּ שֶׁבָּטְחוּ בְךָ, וַתְּלַמְּדֵם חֻקֵּי חַיִּים, כֵּן תְּחׇנֵּנוּ וּתְלַמְּדֵנוּ. אָבִינוּ הָאָב הָרַחֲמָן, הַמְרַחֵם, רַחֵם עָלֵינוּ, וְתֵן בְּלִבֵּנוּ לְהָבִין וּלְהַשְׂכִּיל, לִשְׁמֹעַ, לִלְמֹד וּלְלַמֵּד, לִשְׁמֹר וְלַעֲשׂוֹת וּלְקַיֵּם אֶת כׇּל דִּבְרֵי תַלְמוּד תּוֹרָתֶךָ בְּאַהֲבָה.\n\nוְהָאֵר עֵינֵינוּ בְּתוֹרָתֶךָ, וְדַבֵּק לִבֵּנוּ בְּמִצְוֹתֶיךָ, וְיַחֵד לְבָבֵנוּ לְאַהֲבָה וּלְיִרְאָה אֶת שְׁמֶךָ, וְלֹא נֵבוֹשׁ לְעוֹלָם וָעֶד. כִּי בְשֵׁם קׇדְשְׁךָ הַגָּדוֹל וְהַנּוֹרָא בָּטָחְנוּ, נָגִילָה וְנִשְׂמְחָה בִּישׁוּעָתֶךָ. בָּרוּךְ אַתָּה יְיָ, הַבּוֹחֵר בְּעַמּוֹ יִשְׂרָאֵל בְּאַהֲבָה.',
        phonetic: '— Barékhou —\n\nBarékhou ète Ado-naï hamévorakh.\nBaroukh Ado-naï hamévorakh léolam vaèd.\n\n— Yotsèr Or —\n\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, yotsèr or ouvoré \'hochèkh, ossé chalom ouvoré ète hakol.\n\nHakol yodoukha véhakol yéchabé\'houkha, véhakol yomrou ène kadoch kAdo-naï. Hakol yéromé moukha séla, yotsèr hakol. HaEl hapoté\'ah békhol yom daltot chaaré mizra\'h, ouvoké\'a \'haloné rakia, motsi \'hama mimékomah oulévana mimékhone chivtah, ouméir laolam koulo ouléyochvav.\n\nKadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo.\n\nTitbarakh Ado-naï Elo-hénou al chéva\'h maassé yadékha, véal méoré or chéassita, yéfaaroukha séla.\n\nBaroukh ata Ado-naï, yotsèr haméorot.\n\n— Ahava Raba —\n\nAhava raba ahavtanou Ado-naï Elo-hénou, \'hemla guédola vitéra \'hamalta alénou. Avinou Malkénou, baavour avotéinou chébat\'hou békha, vatélamédèm \'houké \'hayim, kène té\'honénou outélamédénou. Avinou haAv hara\'hamane, haméra\'hèm, ra\'hèm alénou, vétène béli bénou léhavine ouléhaskil, lichmo\'a, lilmod oulélamèd, lichmor vélaassot oulékayèm ète kol divré talmoud Toratékha béahava.\n\nVéhaèr ènénou béToratékha, védabèk libénou bémitsvotékha, véya\'hèd lévavénou léahava oulyira ète chémékha, vélo névoch léolam vaèd. Ki véchèm kodchékha hagadol véhanora bata\'hnou, naguila vénismé\'ha bichououatékha. Baroukh ata Ado-naï, habo\'hèr béamo Israël béahava.' },

      { id: 'shema', title: 'קְרִיאַת שְׁמַע', titlePhonetic: 'Kriat Chéma', always: true,
        text: 'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד׃\n\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.\n\nוְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ בְּכׇל לְבָבְךָ וּבְכׇל נַפְשְׁךָ וּבְכׇל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ, וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשׇׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ, וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.\n\nוְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ אֶל מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם, לְאַהֲבָה אֶת יְיָ אֱלֹהֵיכֶם וּלְעׇבְדוֹ בְּכׇל לְבַבְכֶם וּבְכׇל נַפְשְׁכֶם. וְנָתַתִּי מְטַר אַרְצְכֶם בְּעִתּוֹ, יוֹרֶה וּמַלְקוֹשׁ, וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ, וְאָכַלְתָּ וְשָׂבָעְתָּ. הִשָּׁמְרוּ לָכֶם פֶּן יִפְתֶּה לְבַבְכֶם, וְסַרְתֶּם וַעֲבַדְתֶּם אֱלֹהִים אֲחֵרִים וְהִשְׁתַּחֲוִיתֶם לָהֶם. וְחָרָה אַף יְיָ בָּכֶם, וְעָצַר אֶת הַשָּׁמַיִם וְלֹא יִהְיֶה מָטָר, וְהָאֲדָמָה לֹא תִתֵּן אֶת יְבוּלָהּ, וַאֲבַדְתֶּם מְהֵרָה מֵעַל הָאָרֶץ הַטֹּבָה אֲשֶׁר יְיָ נֹתֵן לָכֶם. וְשַׂמְתֶּם אֶת דְּבָרַי אֵלֶּה עַל לְבַבְכֶם וְעַל נַפְשְׁכֶם, וּקְשַׁרְתֶּם אֹתָם לְאוֹת עַל יֶדְכֶם, וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֵיכֶם. וְלִמַּדְתֶּם אֹתָם אֶת בְּנֵיכֶם לְדַבֵּר בָּם, בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשׇׁכְבְּךָ וּבְקוּמֶךָ. וּכְתַבְתָּם עַל מְזוּזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ. לְמַעַן יִרְבּוּ יְמֵיכֶם וִימֵי בְנֵיכֶם עַל הָאֲדָמָה אֲשֶׁר נִשְׁבַּע יְיָ לַאֲבֹתֵיכֶם לָתֵת לָהֶם, כִּימֵי הַשָּׁמַיִם עַל הָאָרֶץ.\n\nוַיֹּאמֶר יְיָ אֶל מֹשֶׁה לֵּאמֹר. דַּבֵּר אֶל בְּנֵי יִשְׂרָאֵל וְאָמַרְתָּ אֲלֵהֶם, וְעָשׂוּ לָהֶם צִיצִת עַל כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם, וְנָתְנוּ עַל צִיצִת הַכָּנָף פְּתִיל תְּכֵלֶת. וְהָיָה לָכֶם לְצִיצִת, וּרְאִיתֶם אֹתוֹ וּזְכַרְתֶּם אֶת כׇּל מִצְוֹת יְיָ וַעֲשִׂיתֶם אֹתָם, וְלֹא תָתוּרוּ אַחֲרֵי לְבַבְכֶם וְאַחֲרֵי עֵינֵיכֶם אֲשֶׁר אַתֶּם זֹנִים אַחֲרֵיהֶם. לְמַעַן תִּזְכְּרוּ וַעֲשִׂיתֶם אֶת כׇּל מִצְוֹתָי, וִהְיִיתֶם קְדֹשִׁים לֵאלֹהֵיכֶם. אֲנִי יְיָ אֱלֹהֵיכֶם אֲשֶׁר הוֹצֵאתִי אֶתְכֶם מֵאֶרֶץ מִצְרַיִם לִהְיוֹת לָכֶם לֵאלֹהִים, אֲנִי יְיָ אֱלֹהֵיכֶם. אֱמֶת.',
        phonetic: 'Chéma Israël, Ado-naï Elo-hénou, Ado-naï É\'had.\n\nBaroukh chem kevod malkhouto léolam vaèd.\n\nVéahavta ète Ado-naï Elohékha békhol lévavékha ouvékhol nafchékha ouvékhol méodékha. Véhayou hadévarim haélé achère anokhi métsavékha hayom al lévavékha. Véchinantam lé vanékha, védibarta bam béchivtékha bévétékha ouvlékhté kha vadérèkh ouvchokh békha ouvkoumékha. Oukchartam léot al yadékha, véhayou létotafot bèn ènékha. Oukhtavtam al mézouzot bètékha ouvichaérékha.\n\nVéhaya im chamoa tichméou el mitsvotaï achère anokhi métsavé etkhèm hayom, léahava ète Ado-naï Elohékhèm ouléovdo békhol lévavkhèm ouvékhol nafchékhèm. Vénatati métar artsékhèm béito, yoré oumalcoche, véassafta dégagnékha vétirocjékha véyitsharékha. Vénatati èssèv béssadékha livhémtékha, véakhalta véssavata. Hichamérou lakhèm pène yifté lévavkhèm, véssartèm vaavadtèm élohim a\'hérim véhichtahaavitèm lahèm. Vé\'hara af Ado-naï bakhèm, véatsar ète hachamaïm vélo yihyé matar, véhaadama lo titèn ète yévoulah, vaavadtèm méhéra méal haarèts hatova achère Ado-naï notèn lakhèm. Véssamtèm ète dévaraï élé al lévavkhèm véal nafchékhèm, oukchartèm otam léot al yédkhèm, véhayou létotafot bèn ènékhèm. Vélimadtèm otam ète bénékhèm lédabèr bam, béchivtékha bévétékha ouvlékhté kha vadérèkh ouvchokh békha ouvkoumékha. Oukhtavtam al mézouzot bètékha ouvichaérékha. Lémaan yirbou yémékhèm vimé vénékhèm al haadama achère nichba Ado-naï laavotékhèm latèt lahèm, kimé hachamaïm al haarèts.\n\nVayomèr Ado-naï el Moché lémor. Dabèr el bné Israël véamarta aléhèm, véassou lahèm tsitsit al kanfé vigdéhèm lédorotam, vénaténou al tsitsit hakanaf pétil tékhélèt. Véhaya lakhèm létsitsit, ouritèm oto ouzkhartem ète kol mitsvot Ado-naï vaassitèm otam, vélo tatourou a\'haré lévavkhèm véa\'haré ènékhèm achère atèm zonim a\'haréhèm. Lémaan tizkérou vaassitèm ète kol mitsvotaï, vihyitèm kédochim lElo-hékhèm. Ani Ado-naï Elo-hékhèm achère hotsèti etkhèm méérèts Mitsraïm lihyot lakhèm lElohim, ani Ado-naï Elo-hékhèm. Émèt.' },

      { id: 'amida', title: 'עֲמִידָה', titlePhonetic: 'Amida', always: true,
        text: '— 1. אָבוֹת —\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת, וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם, לְמַעַן שְׁמוֹ בְּאַהֲבָה. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְיָ, מָגֵן אַבְרָהָם.\n\n— 2. גְּבוּרוֹת —\n\nאַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ. מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוֹךָ בַּעַל גְּבוּרוֹת, וּמִי דּוֹמֶה לָּךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה. וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים. בָּרוּךְ אַתָּה יְיָ, מְחַיֵּה הַמֵּתִים.\n\n— 3. קְדֻשָּׁה (בְּמִנְיָן) —\n\nנְקַדֵּשׁ אֶת שִׁמְךָ בָּעוֹלָם, כְּשֵׁם שֶׁמַּקְדִּישִׁים אוֹתוֹ בִּשְׁמֵי מָרוֹם. כַּכָּתוּב עַל יַד נְבִיאֶךָ: וְקָרָא זֶה אֶל זֶה וְאָמַר. קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ. לְעֻמָּתָם בָּרוּךְ יֹאמֵרוּ. בָּרוּךְ כְּבוֹד יְיָ מִמְּקוֹמוֹ. וּבְדִבְרֵי קׇדְשְׁךָ כָּתוּב לֵאמֹר. יִמְלֹךְ יְיָ לְעוֹלָם, אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר, הַלְלוּיָהּ.\n\n(בְּיָחִיד: אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכׇל יוֹם יְהַלְלוּךָ סֶּלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.)\n\n— 4. אַתָּה חוֹנֵן (דַּעַת) —\n\nאַתָּה חוֹנֵן לְאָדָם דַּעַת, וּמְלַמֵּד לֶאֱנוֹשׁ בִּינָה. חׇנֵּנוּ מֵאִתְּךָ דֵּעָה בִּינָה וְהַשְׂכֵּל. בָּרוּךְ אַתָּה יְיָ, חוֹנֵן הַדָּעַת.\n\n— 5. הֲשִׁיבֵנוּ (תְּשׁוּבָה) —\n\nהֲשִׁיבֵנוּ אָבִינוּ לְתוֹרָתֶךָ, וְקָרְבֵנוּ מַלְכֵּנוּ לַעֲבוֹדָתֶךָ, וְהַחֲזִירֵנוּ בִּתְשׁוּבָה שְׁלֵמָה לְפָנֶיךָ. בָּרוּךְ אַתָּה יְיָ, הָרוֹצֶה בִּתְשׁוּבָה.\n\n— 6. סְלַח לָנוּ (סְלִיחָה) —\n\nסְלַח לָנוּ אָבִינוּ כִּי חָטָאנוּ, מְחַל לָנוּ מַלְכֵּנוּ כִּי פָשָׁעְנוּ, כִּי מוֹחֵל וְסוֹלֵחַ אָתָּה. בָּרוּךְ אַתָּה יְיָ, חַנּוּן הַמַּרְבֶּה לִסְלֹחַ.\n\n— 7. רְאֵה (גְּאֻלָּה) —\n\nרְאֵה נָא בְעׇנְיֵנוּ, וְרִיבָה רִיבֵנוּ, וּגְאָלֵנוּ מְהֵרָה לְמַעַן שְׁמֶךָ, כִּי גּוֹאֵל חָזָק אָתָּה. בָּרוּךְ אַתָּה יְיָ, גּוֹאֵל יִשְׂרָאֵל.\n\n— 8. רְפָאֵנוּ (רְפוּאָה) —\n\nרְפָאֵנוּ יְיָ וְנֵרָפֵא, הוֹשִׁיעֵנוּ וְנִוָּשֵׁעָה, כִּי תְהִלָּתֵנוּ אָתָּה, וְהַעֲלֵה רְפוּאָה שְׁלֵמָה לְכׇל מַכּוֹתֵינוּ, כִּי אֵל מֶלֶךְ רוֹפֵא נֶאֱמָן וְרַחֲמָן אָתָּה. בָּרוּךְ אַתָּה יְיָ, רוֹפֵא חוֹלֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 9. בָּרֵךְ עָלֵינוּ (שָׁנִים) —\n\nבָּרֵךְ עָלֵינוּ יְיָ אֱלֹהֵינוּ אֶת הַשָּׁנָה הַזֹּאת וְאֶת כׇּל מִינֵי תְבוּאָתָהּ לְטוֹבָה, וְתֵן בְּרָכָה עַל פְּנֵי הָאֲדָמָה, וְשַׂבְּעֵנוּ מִטּוּבָהּ, וּבָרֵךְ שְׁנָתֵנוּ כַּשָּׁנִים הַטּוֹבוֹת. בָּרוּךְ אַתָּה יְיָ, מְבָרֵךְ הַשָּׁנִים.\n\n— 10. תְּקַע בְּשׁוֹפָר (קִבּוּץ גָּלֻיּוֹת) —\n\nתְּקַע בְּשׁוֹפָר גָּדוֹל לְחֵרוּתֵנוּ, וְשָׂא נֵס לְקַבֵּץ גָּלֻיּוֹתֵינוּ, וְקַבְּצֵנוּ יַחַד מֵאַרְבַּע כַּנְפוֹת הָאָרֶץ. בָּרוּךְ אַתָּה יְיָ, מְקַבֵּץ נִדְחֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 11. הָשִׁיבָה שׁוֹפְטֵינוּ (מִשְׁפָּט) —\n\nהָשִׁיבָה שׁוֹפְטֵינוּ כְּבָרִאשׁוֹנָה, וְיוֹעֲצֵינוּ כְּבַתְּחִלָּה, וְהָסֵר מִמֶּנּוּ יָגוֹן וַאֲנָחָה, וּמְלֹךְ עָלֵינוּ אַתָּה יְיָ לְבַדְּךָ בְּחֶסֶד וּבְרַחֲמִים, וְצַדְּקֵנוּ בַּמִּשְׁפָּט. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ אוֹהֵב צְדָקָה וּמִשְׁפָּט.\n\n— 12. וְלַמַּלְשִׁינִים (מִינִים) —\n\nוְלַמַּלְשִׁינִים אַל תְּהִי תִקְוָה, וְכׇל הָרִשְׁעָה כְּרֶגַע תֹּאבֵד, וְכׇל אוֹיְבֶיךָ מְהֵרָה יִכָּרֵתוּ, וְהַזֵּדִים מְהֵרָה תְעַקֵּר וּתְשַׁבֵּר וּתְמַגֵּר וְתַכְנִיעַ בִּמְהֵרָה בְיָמֵינוּ. בָּרוּךְ אַתָּה יְיָ, שׁוֹבֵר אוֹיְבִים וּמַכְנִיעַ זֵדִים.\n\n— 13. עַל הַצַּדִּיקִים (צַדִּיקִים) —\n\nעַל הַצַּדִּיקִים וְעַל הַחֲסִידִים, וְעַל זִקְנֵי עַמְּךָ בֵּית יִשְׂרָאֵל, וְעַל פְּלֵיטַת סוֹפְרֵיהֶם, וְעַל גֵּרֵי הַצֶּדֶק וְעָלֵינוּ, יֶהֱמוּ נָא רַחֲמֶיךָ יְיָ אֱלֹהֵינוּ, וְתֵן שָׂכָר טוֹב לְכׇל הַבּוֹטְחִים בְּשִׁמְךָ בֶּאֱמֶת, וְשִׂים חֶלְקֵנוּ עִמָּהֶם לְעוֹלָם וְלֹא נֵבוֹשׁ כִּי בְךָ בָטָחְנוּ. בָּרוּךְ אַתָּה יְיָ, מִשְׁעָן וּמִבְטָח לַצַּדִּיקִים.\n\n— 14. וְלִירוּשָׁלַיִם (יְרוּשָׁלַיִם) —\n\nוְלִירוּשָׁלַיִם עִירְךָ בְּרַחֲמִים תָּשׁוּב, וְתִשְׁכּוֹן בְּתוֹכָהּ כַּאֲשֶׁר דִּבַּרְתָּ, וּבְנֵה אוֹתָהּ בְּקָרוֹב בְּיָמֵינוּ בִּנְיַן עוֹלָם, וְכִסֵּא דָוִד מְהֵרָה לְתוֹכָהּ תָּכִין. בָּרוּךְ אַתָּה יְיָ, בּוֹנֵה יְרוּשָׁלָיִם.\n\n— 15. אֶת צֶמַח דָּוִד (דָּוִד) —\n\nאֶת צֶמַח דָּוִד עַבְדְּךָ מְהֵרָה תַצְמִיחַ, וְקַרְנוֹ תָּרוּם בִּישׁוּעָתֶךָ, כִּי לִישׁוּעָתְךָ קִוִּינוּ כׇּל הַיּוֹם. בָּרוּךְ אַתָּה יְיָ, מַצְמִיחַ קֶרֶן יְשׁוּעָה.\n\n— 16. שְׁמַע קוֹלֵנוּ —\n\nשְׁמַע קוֹלֵנוּ יְיָ אֱלֹהֵינוּ, חוּס וְרַחֵם עָלֵינוּ, וְקַבֵּל בְּרַחֲמִים וּבְרָצוֹן אֶת תְּפִלָּתֵנוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלּוֹת וְתַחֲנוּנִים אָתָּה, וּמִלְּפָנֶיךָ מַלְכֵּנוּ רֵיקָם אַל תְּשִׁיבֵנוּ, כִּי אַתָּה שׁוֹמֵעַ תְּפִלַּת כׇּל פֶּה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.\n\n— 17. רְצֵה (עֲבוֹדָה) —\n\nרְצֵה יְיָ אֱלֹהֵינוּ בְּעַמְּךָ יִשְׂרָאֵל וּבִתְפִלָּתָם, וְהָשֵׁב אֶת הָעֲבוֹדָה לִדְבִיר בֵּיתֶךָ, וְאִשֵּׁי יִשְׂרָאֵל וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן, וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ. וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר שְׁכִינָתוֹ לְצִיּוֹן.\n\n— 18. מוֹדִים —\n\nמוֹדִים אֲנַחְנוּ לָךְ, שָׁאַתָּה הוּא יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ לְעוֹלָם וָעֶד. צוּר חַיֵּינוּ, מָגֵן יִשְׁעֵנוּ, אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְּךָ וּנְסַפֵּר תְּהִלָּתֶךָ, עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ, וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ, וְעַל נִסֶּיךָ שֶׁבְּכׇל יוֹם עִמָּנוּ, וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכׇל עֵת, עֶרֶב וָבֹקֶר וְצׇהֳרָיִם. הַטּוֹב, כִּי לֹא כָלוּ רַחֲמֶיךָ, וְהַמְרַחֵם, כִּי לֹא תַמּוּ חֲסָדֶיךָ, מֵעוֹלָם קִוִּינוּ לָךְ.\n\nוְעַל כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד. וְכׇל הַחַיִּים יוֹדוּךָ סֶּלָה, וִיהַלְלוּ אֶת שִׁמְךָ בֶּאֱמֶת, הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. בָּרוּךְ אַתָּה יְיָ, הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת.\n\n— 19. שִׂים שָׁלוֹם —\n\nשִׂים שָׁלוֹם טוֹבָה וּבְרָכָה, חֵן וָחֶסֶד וְרַחֲמִים, עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ אָבִינוּ כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ, כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ יְיָ אֱלֹהֵינוּ תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד, וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם. וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת עַמְּךָ יִשְׂרָאֵל בְּכׇל עֵת וּבְכׇל שָׁעָה בִּשְׁלוֹמֶךָ. בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם.\n\n— —\n\nאֱלֹהַי, נְצוֹר לְשׁוֹנִי מֵרָע, וּשְׂפָתַי מִדַּבֵּר מִרְמָה, וְלִמְקַלְלַי נַפְשִׁי תִדֹּם, וְנַפְשִׁי כֶּעָפָר לַכֹּל תִּהְיֶה. פְּתַח לִבִּי בְּתוֹרָתֶךָ, וּבְמִצְוֹתֶיךָ תִּרְדּוֹף נַפְשִׁי. וְכׇל הַחוֹשְׁבִים עָלַי רָעָה, מְהֵרָה הָפֵר עֲצָתָם וְקַלְקֵל מַחֲשַׁבְתָּם. עֲשֵׂה לְמַעַן שְׁמֶךָ, עֲשֵׂה לְמַעַן יְמִינֶךָ, עֲשֵׂה לְמַעַן קְדֻשָּׁתֶךָ, עֲשֵׂה לְמַעַן תּוֹרָתֶךָ. לְמַעַן יֵחָלְצוּן יְדִידֶיךָ, הוֹשִׁיעָה יְמִינְךָ וַעֲנֵנִי. יִהְיוּ לְרָצוֹן אִמְרֵי פִי וְהֶגְיוֹן לִבִּי לְפָנֶיךָ, יְיָ צוּרִי וְגוֹאֲלִי.',
        phonetic: '— 1. Avot —\n\nBaroukh ata Ado-naï Elo-hénou vElo-hé avotéinou, Elo-hé Avraham, Elo-hé Its\'hak, vElo-hé Yaakov, haEl hagadol haguibor véhanora, El èlyione, gomèl \'hassadim tovim, vékoné hakol, vézokhèr \'hasdé avot, oumévi goèl livné vnéhèm, lémaan chémo béahava. Mélekh ozèr oumochia oumagèn. Baroukh ata Ado-naï, magèn Avraham.\n\n— 2. Guévourot —\n\nAta guibor léolam Ado-naï, mé\'hayé métim ata, rav léhochia. Mékhalkel \'hayim bé\'hessèd, mé\'hayé métim béra\'hamim rabim, somèkh noflim, vérofé \'holim, oumatir assourim, oumékayèm émounato lichnèï afar. Mi khamokha baal guévourot, oumi domé lakh, Mélekh mémit oumé\'hayé oumatsmi\'ah yéchoua. Vénééman ata léha\'hayot métim. Baroukh ata Ado-naï, mé\'hayé hamétim.\n\n— 3. Kédoucha (béminiane) —\n\nNékadèch ète chimékha baolam, kéchèm chémakdichim oto bichmé marom. Kakatouv al yad néviékha : véka ra zé el zé véamar. Kadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo. Lé\'oumatam baroukh yomérou. Baroukh kévod Ado-naï miméko mo. Ouvédivrè kodchékha katouv lémor. Yimlokh Ado-naï léolam, Elohayikh Tsione lédor vador, Halélouya.\n\n(Béya\'hid : Ata kadoch véchimékha kadoch, oukédochim békhol yom yéhaléloukha séla. Baroukh ata Ado-naï, haEl hakadoch.)\n\n— 4. Ata \'honène (Daat) —\n\nAta \'honène léadam daat, oumélamèd léénocj bina. \'Honénou méitékha déa bina véhaskèl. Baroukh ata Ado-naï, \'honène hadaat.\n\n— 5. Hachivénou (Téchouva) —\n\nHachivénou Avinou léToratékha, vékarvénou Malkénou laavoda tékha, véha\'hazirénou bitchouva chéléma léfanékha. Baroukh ata Ado-naï, harotsé bitchouva.\n\n— 6. Séla\'h lanou (Séli\'ha) —\n\nSéla\'h lanou Avinou ki \'hatanou, mé\'hal lanou Malkénou ki fachanou, ki mo\'hèl vésolé\'ah ata. Baroukh ata Ado-naï, \'hanoun hamarbé lislo\'ah.\n\n— 7. Réé (Guéoula) —\n\nRéé na véonyénou, vériva rivénou, ougalénou méhéra lémaan chémékha, ki goèl \'hazak ata. Baroukh ata Ado-naï, goèl Israël.\n\n— 8. Réfaénou (Réfoua) —\n\nRéfaénou Ado-naï vénérafé, hochi\'énou vénivachéa, ki téhilaténou ata, véhaalé réfoua chéléma lékhol makotéinou, ki El Mélekh rofé nééman véra\'hamane ata. Baroukh ata Ado-naï, rofé \'holé amo Israël.\n\n— 9. Barèkh alénou (Chanim) —\n\nBarèkh alénou Ado-naï Elo-hénou ète hachana hazot véète kol miné tévouatah létova, vétène brakha al péné haadama, véssabénou mitouvah, ouvarèkh chnaténou kachanim hatovot. Baroukh ata Ado-naï, mévare\'kh hachanim.\n\n— 10. Téka béChofar (Kibouts galiouyot) —\n\nTéka béchofar gadol lé\'hérou ténou, véssa nèss lékabèts galiouyotéinou, vékabétsénou ya\'had méarba kanfot haarèts. Baroukh ata Ado-naï, mékabèts nid\'hé amo Israël.\n\n— 11. Hachiva choftéinou (Michpat) —\n\nHachiva choftéinou kévarichona, véyoatséinou kévat\'hila, véhassèr miménou yagone vaana\'ha, oumlokh alénou ata Ado-naï lévadékha bé\'hèssèd ouvéra\'hamim, vétsadékénou bamichpat. Baroukh ata Ado-naï, Mélekh ohèv tsédaka oumichpat.\n\n— 12. Vélamalachiniim (Minim) —\n\nVélamalachiniim al téhi tikva, vékhol haricha kéréga tovèd, vékhol oyvékha méhéra yikarétou, véhazédim méhéra tékakèr outé chabèr outémagèr vétakhnia biméhéra véyaménou. Baroukh ata Ado-naï, chovèr oyvim oumakhnia zédim.\n\n— 13. Al hatsadikim (Tsadikim) —\n\nAl hatsadikim véal ha\'hassidim, véal zikné amékha bèt Israël, véal plétat soféréhèm, véal guéré hatséddek véalénou, yéhémou na ra\'hamékha Ado-naï Elo-hénou, vétène sakhar tov lékhol habotéhim béchimékha béémèt, véssim \'helkénou imahèm léolam vélo névoch ki békha bata\'hnou. Baroukh ata Ado-naï, mich\'ane oumivta\'h latsadikim.\n\n— 14. VéliYérouchalaïm (Yérouchalaïm) —\n\nVéliYérouchalaïm irékha béra\'hamim tachouv, vétichkone bétokha kaachère dibarta, ouvné otah békarov béyaménou binyane olam, vékissé David méhéra létokha takhiné. Baroukh ata Ado-naï, boné Yérouchalaïm.\n\n— 15. Ète tséma\'h David (David) —\n\nÈte tséma\'h David avdékha méhéra tatsmi\'ah, vékarna taroum bichououatékha, ki lichououatkha kivinou kol hayom. Baroukh ata Ado-naï, matsmi\'ah kérène yéchoua.\n\n— 16. Chéma kolénou —\n\nChéma kolénou Ado-naï Elo-hénou, \'houss véra\'hèm alénou, vékabèl béra\'hamim ouvératson ète téfilaténou, ki El choméa téfilot véta\'hanounim ata, oumiléfanékha Malkénou réikam al téchivénou, ki ata choméa téfilat kol pé. Baroukh ata Ado-naï, choméa téfila.\n\n— 17. Rétsé (Avoda) —\n\nRétsé Ado-naï Elo-hénou béamékha Israël ouvitéfilatam, véhachèv ète haavoda lidvir bétékha, véiché Israël outéfilatam béahava tékabèl béra tsone, outéhi léra tsone tamid avodat Israël amékha. Véte\'hézéna ènénou béchouvékha léTsione béra\'hamim. Baroukh ata Ado-naï, hama\'hazir chékhinato léTsione.\n\n— 18. Modim —\n\nModim ana\'hnou lakh, chaata hou Ado-naï Elo-hénou vElo-hé avotéinou léolam vaèd. Tsour \'hayénou, magèn yich\'énou, ata hou lédor vador. Nodé lékha ouné sapèr téhilatékha, al \'hayénou haméssourim béyadékha, véal nichmotéinou hapékoudot lakh, véal nissékha chébékhol yom imanou, véal niflèotékha vétovotékha chébékhol èt, érèv vavoker vétsohoraïm. Hatov, ki lo khalou ra\'hamékha, véhaméra\'hèm, ki lo tamou \'hassadékha, méolam kivinou lakh.\n\nVéal koulam yitbarakh véyitromam chimékha Malkénou tamid léolam vaèd. Vékhol ha\'hayim yodoukha séla, vihalélo u ète chimékha béémèt, haEl yéchouaténou véèzraténou séla. Baroukh ata Ado-naï, hatov chimékha oulékha naé léhodot.\n\n— 19. Sim Chalom —\n\nSim chalom tova ouvrakha, \'hène va\'hèssèd véra\'hamim, alénou véal kol Israël amékha. Barkhénou Avinou koullanou kéé\'had béor panékha, ki véor panékha natata lanou Ado-naï Elo-hénou Torat \'hayim véahavat \'hèssèd, outsdaka ouvrakha véra\'hamim vé\'hayim véchalom. Vétov béènékha lévarèkh ète amékha Israël békhol èt ouvékhol chaah bichlo mékha. Baroukh ata Ado-naï, hamévare\'kh ète amo Israël bachalom.\n\n— —\n\nElo-haï, nétsor léchoni méra, ousfataï midabèr mirma, vélimkalélaï nafchi tidom, vénafchi kéafar lakol tihyé. Péta\'h libi béToratékha, ouvémitsvotékha tirdof nafchi. Vékhol ha\'hochvim alaï raa, méhéra hafèr atsatam vékalkèl ma\'hachavtam. Assé lémaan chémékha, assé lémaan yéminékha, assé lémaan kédouchatékha, assé lémaan Toratékha. Lémaan yé\'halétsoun yédidékha, hochia yéminékha vaanéni. Yihyou lératson imré fi véhéguione libi léfanékha, Ado-naï tsouri végoali.' },

      { id: 'hallel', title: 'הַלֵּל', titlePhonetic: 'Hallel', rosh_hodesh: true,
        text: (window.SIDDUR_HALLEL || {}).text || '',
        phonetic: (window.SIDDUR_HALLEL || {}).phonetic || '' },

      { id: 'tahnoun', title: 'תַּחֲנוּן', titlePhonetic: 'Ta\'hanoun', tahnoun_day: true,
        text: 'וַיֹּאמֶר דָּוִד אֶל גָד, צַר לִי מְאֹד, נִפְּלָה נָא בְיַד יְיָ כִּי רַבִּים רַחֲמָיו, וּבְיַד אָדָם אַל אֶפֹּלָה.\n\nרַחוּם וְחַנּוּן, חָטָאתִי לְפָנֶיךָ, יְיָ מָלֵא רַחֲמִים, רַחֵם עָלַי וְקַבֵּל תַּחֲנוּנָי.\n\nיְיָ אַל בְּאַפְּךָ תוֹכִיחֵנִי, וְאַל בַּחֲמָתְךָ תְיַסְּרֵנִי. חׇנֵּנִי יְיָ כִּי אֻמְלַל אָנִי, רְפָאֵנִי יְיָ כִּי נִבְהֲלוּ עֲצָמָי. וְנַפְשִׁי נִבְהֲלָה מְאֹד, וְאַתָּה יְיָ עַד מָתָי. שׁוּבָה יְיָ חַלְּצָה נַפְשִׁי, הוֹשִׁיעֵנִי לְמַעַן חַסְדֶּךָ.',
        phonetic: 'Vayomère David el Gad, tsar li méod, nipéla na béyad Ado-naï ki rabim ra\'hamav, ouvéyad adam al épola.\n\nRa\'houm vé\'hanoun, \'hatati léfanékha, Ado-naï malé ra\'hamim, ra\'hèm alaï vékabèl ta\'hanounaï.\n\nAdo-naï al béapékha tokhi\'héni, véal ba\'hamatékha téyasséréni. \'Honéni Ado-naï ki oumlal ani, réfaéni Ado-naï ki nivhalou atsamaï. Vénafchi nivhala méod, véata Ado-naï ad mataï. Chouva Ado-naï \'haltsa nafchi, hochi\'éni lémaan \'hasdékha.' },

      { id: 'kaddish-half', title: 'חֲצִי קַדִּישׁ', titlePhonetic: '\'Hatsi Kaddich', always: true,
        text: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכׇל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.\n\nיִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא בְּרִיךְ הוּא. לְעֵלָּא מִן כׇּל בִּרְכָתָא וְשִׁירָתָא, תֻּשְׁבְּחָתָא וְנֶחֱמָתָא, דַּאֲמִירָן בְּעָלְמָא. וְאִמְרוּ אָמֵן.',
        phonetic: 'Yitgadal véyitkadach chéméh raba. Béalma di véra khiréoutéh, véyamlikh malkoutéh bé\'hayékhone ouvyomékhone ouv\'hayé dékhol bèt Israël, baagala ouvizmane kariv. Véimrou amène.\n\nYéhé chéméh raba mévarakh léalam oulalmé almaya.\n\nYitbarakh véyichtaba\'h véyitpaar véyitromam véyitnassé véyithadar véyitalé véyithalal chéméh dékoudcha bérikh hou. Léèla mine kol birkhata véchirata, touchbé\'hata véné\'hèmata, daamirane béalma. Véimrou amène.' },

      { id: 'ashrei-2', title: 'אַשְׁרֵי (ב)', titlePhonetic: 'Achré (2e)', always: true,
        text: 'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה.\nאַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ, אַשְׁרֵי הָעָם שֶׁיְיָ אֱלֹהָיו.\nתְּהִלָּה לְדָוִד: אֲרוֹמִמְךָ אֱלוֹהַי הַמֶּלֶךְ, וַאֲבָרְכָה שִׁמְךָ לְעוֹלָם וָעֶד.\nבְּכׇל יוֹם אֲבָרְכֶךָּ, וַאֲהַלְלָה שִׁמְךָ לְעוֹלָם וָעֶד.\nגָּדוֹל יְיָ וּמְהֻלָּל מְאֹד, וְלִגְדֻלָּתוֹ אֵין חֵקֶר.\nדּוֹר לְדוֹר יְשַׁבַּח מַעֲשֶׂיךָ, וּגְבוּרֹתֶיךָ יַגִּידוּ.\nהֲדַר כְּבוֹד הוֹדֶךָ, וְדִבְרֵי נִפְלְאוֹתֶיךָ אָשִׂיחָה.\nוֶעֱזוּז נוֹרְאוֹתֶיךָ יֹאמֵרוּ, וּגְדֻלָּתְךָ אֲסַפְּרֶנָּה.\nזֵכֶר רַב טוּבְךָ יַבִּיעוּ, וְצִדְקָתְךָ יְרַנֵּנוּ.\nחַנּוּן וְרַחוּם יְיָ, אֶרֶךְ אַפַּיִם וּגְדׇל חָסֶד.\nטוֹב יְיָ לַכֹּל, וְרַחֲמָיו עַל כׇּל מַעֲשָׂיו.\nיוֹדוּךָ יְיָ כׇּל מַעֲשֶׂיךָ, וַחֲסִידֶיךָ יְבָרְכוּכָה.\nכְּבוֹד מַלְכוּתְךָ יֹאמֵרוּ, וּגְבוּרָתְךָ יְדַבֵּרוּ.\nלְהוֹדִיעַ לִבְנֵי הָאָדָם גְּבוּרֹתָיו, וּכְבוֹד הֲדַר מַלְכוּתוֹ.\nמַלְכוּתְךָ מַלְכוּת כׇּל עוֹלָמִים, וּמֶמְשַׁלְתְּךָ בְּכׇל דּוֹר וָדוֹר.\nסוֹמֵךְ יְיָ לְכׇל הַנֹּפְלִים, וְזוֹקֵף לְכׇל הַכְּפוּפִים.\nעֵינֵי כֹל אֵלֶיךָ יְשַׂבֵּרוּ, וְאַתָּה נוֹתֵן לָהֶם אֶת אׇכְלָם בְּעִתּוֹ.\nפּוֹתֵחַ אֶת יָדֶךָ, וּמַשְׂבִּיעַ לְכׇל חַי רָצוֹן.\nצַדִּיק יְיָ בְּכׇל דְּרָכָיו, וְחָסִיד בְּכׇל מַעֲשָׂיו.\nקָרוֹב יְיָ לְכׇל קֹרְאָיו, לְכֹל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת.\nרְצוֹן יְרֵאָיו יַעֲשֶׂה, וְאֶת שַׁוְעָתָם יִשְׁמַע וְיוֹשִׁיעֵם.\nשׁוֹמֵר יְיָ אֶת כׇּל אֹהֲבָיו, וְאֵת כׇּל הָרְשָׁעִים יַשְׁמִיד.\nתְּהִלַּת יְיָ יְדַבֶּר פִּי, וִיבָרֵךְ כׇּל בָּשָׂר שֵׁם קׇדְשׁוֹ לְעוֹלָם וָעֶד.\nוַאֲנַחְנוּ נְבָרֵךְ יָהּ, מֵעַתָּה וְעַד עוֹלָם, הַלְלוּיָהּ.',
        phonetic: 'Achré yochvé vétékha, od yéhaléloukha séla.\nAchré haam chékakha lo, achré haam chéAdo-naï Elohav.\nTéhila léDavid : Aromimékha Elohaï haMélekh, vaavarkha chimékha léolam vaèd.\nBékhol yom avarkékha, vaahallela chimékha léolam vaèd.\nGadol Ado-naï ouméhoulal méod, véligdoulato eine \'hékèr.\nDor lédor yéchabba\'h maassékha, ouguévourotékha yaguidou.\nHadar kévod hodékha, védivrè niflèotékha assi\'ha.\nVeèzouz norèotékha yomérou, ouguédoulatékha assapérèna.\nZékhèr rav touvékha yabi\'ou, vétsidkatékha yéranénou.\n\'Hanoun véra\'houm Ado-naï, érèkh apaïm ougdol \'hassèd.\nTov Ado-naï lakol, véra\'hamav al kol maassav.\nYodoukha Ado-naï kol maassékha, va\'hassidékha yévarékhoukha.\nKévod malkhoutkha yomérou, ouguévouratkha yédabérou.\nLéhodia livné haadam guévourotav, oukhvod hadar malkhouto.\nMalkhoutkha malkhout kol olamim, oumémshaltkha békhol dor vador.\nSomèkh Ado-naï lékhol hanoflim, vézokèf lékhol hakéfoufim.\nÈné khol élékha yéssabérou, véata notène lahèm ète okhlam béito.\nPoté\'ah ète yadékha, oumassbiya lékhol \'haï ratson.\nTsadik Ado-naï békhol drakhav, vé\'hassid békhol maassav.\nKarov Ado-naï lékhol korav, lékhol achère yikraouhou véémet.\nRétson yéréav yaassé, véète chav\'atam yichma véyochi\'èm.\nChomèr Ado-naï ète kol ohavav, véèt kol harécha\'im yachmid.\nTéhilat Ado-naï yédabèr pi, vivarèkh kol bassar chèm kodsho léolam vaèd.\nVaana\'hnou névarèkh Ya, méata véad olam, Halélouya.' },

      { id: 'uva', title: 'וּבָא לְצִיּוֹן', titlePhonetic: 'Ouva léTsione', always: true,
        text: 'וּבָא לְצִיּוֹן גּוֹאֵל, וּלְשָׁבֵי פֶשַׁע בְּיַעֲקֹב, נְאֻם יְיָ. וַאֲנִי, זֹאת בְּרִיתִי אוֹתָם אָמַר יְיָ, רוּחִי אֲשֶׁר עָלֶיךָ וּדְבָרַי אֲשֶׁר שַׂמְתִּי בְּפִיךָ, לֹא יָמוּשׁוּ מִפִּיךָ וּמִפִּי זַרְעֲךָ וּמִפִּי זֶרַע זַרְעֲךָ, אָמַר יְיָ, מֵעַתָּה וְעַד עוֹלָם.\n\nוְאַתָּה קָדוֹשׁ, יוֹשֵׁב תְּהִלּוֹת יִשְׂרָאֵל.\n\nקָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ.\nבָּרוּךְ כְּבוֹד יְיָ מִמְּקוֹמוֹ.\nיִמְלֹךְ יְיָ לְעוֹלָם, אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר, הַלְלוּיָהּ.',
        phonetic: 'Ouva léTsione goèl, oulchavé pécha béYaakov, néoum Ado-naï. Vaani, zot briti otam amar Ado-naï, rou\'hi achère alékha oudvaraï achère samti béfikha, lo yamouchou mifikha oumipi zar\'akha oumipi zéra zar\'akha, amar Ado-naï, méata véad olam.\n\nVéata kadoch, yochèv téhilot Israël.\n\nKadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo.\nBaroukh kévod Ado-naï miméko mo.\nYimlokh Ado-naï léolam, Elohayikh Tsione lédor vador, Halélouya.' },

      { id: 'aleinu', title: 'עָלֵינוּ', titlePhonetic: 'Alénou', always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכׇל הֲמוֹנָם.\n\nוַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא. שֶׁהוּא נוֹטֶה שָׁמַיִם וְיֹסֵד אָרֶץ, וּמוֹשַׁב יְקָרוֹ בַּשָּׁמַיִם מִמַּעַל, וּשְׁכִינַת עֻזּוֹ בְּגׇבְהֵי מְרוֹמִים. הוּא אֱלֹהֵינוּ אֵין עוֹד, אֱמֶת מַלְכֵּנוּ אֶפֶס זוּלָתוֹ, כַּכָּתוּב בְּתוֹרָתוֹ: וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ, כִּי יְיָ הוּא הָאֱלֹהִים בַּשָּׁמַיִם מִמַּעַל וְעַל הָאָרֶץ מִתָּחַת, אֵין עוֹד.\n\nעַל כֵּן נְקַוֶּה לְּךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזֶּךָ, לְהַעֲבִיר גִּלּוּלִים מִן הָאָרֶץ, וְהָאֱלִילִים כָּרוֹת יִכָּרֵתוּן, לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי. וְכׇל בְּנֵי בָשָׂר יִקְרְאוּ בִשְׁמֶךָ, לְהַפְנוֹת אֵלֶיךָ כׇּל רִשְׁעֵי אָרֶץ. יַכִּירוּ וְיֵדְעוּ כׇּל יוֹשְׁבֵי תֵבֵל, כִּי לְךָ תִּכְרַע כׇּל בֶּרֶךְ, תִּשָּׁבַע כׇּל לָשׁוֹן. לְפָנֶיךָ יְיָ אֱלֹהֵינוּ יִכְרְעוּ וְיִפֹּלוּ, וְלִכְבוֹד שִׁמְךָ יְקָר יִתֵּנוּ. וִיקַבְּלוּ כֻלָּם אֶת עֹל מַלְכוּתֶךָ, וְתִמְלֹךְ עֲלֵיהֶם מְהֵרָה לְעוֹלָם וָעֶד. כִּי הַמַּלְכוּת שֶׁלְּךָ הִיא, וּלְעוֹלְמֵי עַד תִּמְלוֹךְ בְּכָבוֹד. כַּכָּתוּב בְּתוֹרָתֶךָ: יְיָ יִמְלֹךְ לְעֹלָם וָעֶד. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כׇּל הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד וּשְׁמוֹ אֶחָד.',
        phonetic: 'Alénou léchabéa\'h laAdone hakol, latèt guédoula léyotsèr béréchit, chélo assanou kégoïé haaratsot, vélo samanou kémichpé\'hot haadama, chélo sam \'hélkénou kahèm, végoralénou kékhol hamonam.\n\nVaana\'hnou kor\'im oumichistaahavim oumodim lifné Mélekh malkhé hamélakhim, haKadoch Baroukh hou. Chéhou noté chamaïm véyossèd arèts, oumochav yékaro bachamaïm mimaal, ouchkhinat ouzo bégov\'hé méromim. Hou Elo-hénou ène od, émèt Malkénou éfèss zoulato, kakatouv béTorato : véyadaata hayom vahachèvota el lévavékha, ki Ado-naï hou haElohim bachamaïm mimaal véal haarèts mita\'hat, ène od.\n\nAl kène nékavé lékha Ado-naï Elo-hénou, lirot méhéra bétifèrèt ouzékha, léhaavir guiloulim mine haarèts, véhaélilim karot yikarétoun, létakène olam bémalkout Chadaï. Vékhol bné vassar yikréou vichémékha, léhafnot élékha kol rich\'é arèts. Yakirou véyédé\'ou kol yochvé tével, ki lékha tikra kol bérèkh, tichava kol lachone. Léfanékha Ado-naï Elo-hénou yikhréou véyipolou, vélikhvod chimékha yékar yiténou. Vikablou khoulam ète ol malkhouté kha, vétimlokh aléhèm méhéra léolam vaèd. Ki hamalkout chélékha hi, ouléolmé ad timlokh békhavod. Kakatouv béToratékha : Ado-naï yimlokh léolam vaèd. Vénéémar : véhaya Ado-naï léMélekh al kol haarèts, bayom hahou yihyé Ado-naï é\'had ouchmo é\'had.' },

      { id: 'shir-yom', title: 'שִׁיר שֶׁל יוֹם', titlePhonetic: 'Chir Chel Yom', always: true,
        text: '(dynamique)',
        phonetic: '(dynamic)' },

      { id: 'kaddish-yatom', title: 'קַדִּישׁ יָתוֹם', titlePhonetic: 'Kaddich Yatom', always: true,
        text: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכׇל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.\n\nיִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא בְּרִיךְ הוּא. לְעֵלָּא מִן כׇּל בִּרְכָתָא וְשִׁירָתָא, תֻּשְׁבְּחָתָא וְנֶחֱמָתָא, דַּאֲמִירָן בְּעָלְמָא. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא, וְחַיִּים עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל. וְאִמְרוּ אָמֵן.\n\nעֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו, הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל. וְאִמְרוּ אָמֵן.',
        phonetic: 'Yitgadal véyitkadach chéméh raba. Béalma di véra khiréoutéh, véyamlikh malkoutéh bé\'hayékhone ouvyomékhone ouv\'hayé dékhol bèt Israël, baagala ouvizmane kariv. Véimrou amène.\n\nYéhé chéméh raba mévarakh léalam oulalmé almaya.\n\nYitbarakh véyichtaba\'h véyitpaar véyitromam véyitnassé véyithadar véyitalé véyithalal chéméh dékoudcha bérikh hou. Léèla mine kol birkhata véchirata, touchbé\'hata véné\'hèmata, daamirane béalma. Véimrou amène.\n\nYéhé chlama raba mine chémaya, vé\'hayim alénou véal kol Israël. Véimrou amène.\n\nOssé chalom bimromav, hou yaassé chalom alénou véal kol Israël. Véimrou amène.' }
    ]
  },
  mincha: {
    label: 'מִנְחָה', labelPhonetic: 'Min\'ha', labelFr: 'Priere de l\'apres-midi', sublabel: 'Mincha', icon: '☀️', image: 'assets/Itshak.webp', imagePosition: 'center 15%',
    sections: [
      { id: 'patakh-eliyahou-m', title: 'פָּתַח אֵלִיָּהוּ', titlePhonetic: "Pata'h Eliyahou", always: true, nusach_only: 'mizrach',
        text: (window.SIDDUR_PATAKH_ELIYAHOU || {}).text || '',
        phonetic: (window.SIDDUR_PATAKH_ELIYAHOU || {}).phonetic || '' },

      { id: 'ashrei-m', title: 'אַשְׁרֵי', titlePhonetic: 'Achré', always: true,
        text: 'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה.\nאַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ, אַשְׁרֵי הָעָם שֶׁיְיָ אֱלֹהָיו.\nתְּהִלָּה לְדָוִד: אֲרוֹמִמְךָ אֱלוֹהַי הַמֶּלֶךְ, וַאֲבָרְכָה שִׁמְךָ לְעוֹלָם וָעֶד.\nבְּכׇל יוֹם אֲבָרְכֶךָּ, וַאֲהַלְלָה שִׁמְךָ לְעוֹלָם וָעֶד.\nגָּדוֹל יְיָ וּמְהֻלָּל מְאֹד, וְלִגְדֻלָּתוֹ אֵין חֵקֶר.\nדּוֹר לְדוֹר יְשַׁבַּח מַעֲשֶׂיךָ, וּגְבוּרֹתֶיךָ יַגִּידוּ.\nהֲדַר כְּבוֹד הוֹדֶךָ, וְדִבְרֵי נִפְלְאוֹתֶיךָ אָשִׂיחָה.\nוֶעֱזוּז נוֹרְאוֹתֶיךָ יֹאמֵרוּ, וּגְדֻלָּתְךָ אֲסַפְּרֶנָּה.\nזֵכֶר רַב טוּבְךָ יַבִּיעוּ, וְצִדְקָתְךָ יְרַנֵּנוּ.\nחַנּוּן וְרַחוּם יְיָ, אֶרֶךְ אַפַּיִם וּגְדׇל חָסֶד.\nטוֹב יְיָ לַכֹּל, וְרַחֲמָיו עַל כׇּל מַעֲשָׂיו.\nיוֹדוּךָ יְיָ כׇּל מַעֲשֶׂיךָ, וַחֲסִידֶיךָ יְבָרְכוּכָה.\nכְּבוֹד מַלְכוּתְךָ יֹאמֵרוּ, וּגְבוּרָתְךָ יְדַבֵּרוּ.\nלְהוֹדִיעַ לִבְנֵי הָאָדָם גְּבוּרֹתָיו, וּכְבוֹד הֲדַר מַלְכוּתוֹ.\nמַלְכוּתְךָ מַלְכוּת כׇּל עוֹלָמִים, וּמֶמְשַׁלְתְּךָ בְּכׇל דּוֹר וָדוֹר.\nסוֹמֵךְ יְיָ לְכׇל הַנֹּפְלִים, וְזוֹקֵף לְכׇל הַכְּפוּפִים.\nעֵינֵי כֹל אֵלֶיךָ יְשַׂבֵּרוּ, וְאַתָּה נוֹתֵן לָהֶם אֶת אׇכְלָם בְּעִתּוֹ.\nפּוֹתֵחַ אֶת יָדֶךָ, וּמַשְׂבִּיעַ לְכׇל חַי רָצוֹן.\nצַדִּיק יְיָ בְּכׇל דְּרָכָיו, וְחָסִיד בְּכׇל מַעֲשָׂיו.\nקָרוֹב יְיָ לְכׇל קֹרְאָיו, לְכֹל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת.\nרְצוֹן יְרֵאָיו יַעֲשֶׂה, וְאֶת שַׁוְעָתָם יִשְׁמַע וְיוֹשִׁיעֵם.\nשׁוֹמֵר יְיָ אֶת כׇּל אֹהֲבָיו, וְאֵת כׇּל הָרְשָׁעִים יַשְׁמִיד.\nתְּהִלַּת יְיָ יְדַבֶּר פִּי, וִיבָרֵךְ כׇּל בָּשָׂר שֵׁם קׇדְשׁוֹ לְעוֹלָם וָעֶד.\nוַאֲנַחְנוּ נְבָרֵךְ יָהּ, מֵעַתָּה וְעַד עוֹלָם, הַלְלוּיָהּ.',
        phonetic: 'Achré yochvé vétékha, od yéhaléloukha séla.\nAchré haam chékakha lo, achré haam chéAdo-naï Elohav.\nTéhila léDavid : Aromimékha Elohaï haMélekh, vaavarkha chimékha léolam vaèd.\nBékhol yom avarkékha, vaahallela chimékha léolam vaèd.\nGadol Ado-naï ouméhoulal méod, véligdoulato eine \'hékèr.\nDor lédor yéchabba\'h maassékha, ouguévourotékha yaguidou.\nHadar kévod hodékha, védivrè niflèotékha assi\'ha.\nVeèzouz norèotékha yomérou, ouguédoulatékha assapérèna.\nZékhèr rav touvékha yabi\'ou, vétsidkatékha yéranénou.\n\'Hanoun véra\'houm Ado-naï, érèkh apaïm ougdol \'hassèd.\nTov Ado-naï lakol, véra\'hamav al kol maassav.\nYodoukha Ado-naï kol maassékha, va\'hassidékha yévarékhoukha.\nKévod malkhoutkha yomérou, ouguévouratkha yédabérou.\nLéhodia livné haadam guévourotav, oukhvod hadar malkhouto.\nMalkhoutkha malkhout kol olamim, oumémshaltkha békhol dor vador.\nSomèkh Ado-naï lékhol hanoflim, vézokèf lékhol hakéfoufim.\nÈné khol élékha yéssabérou, véata notène lahèm ète okhlam béito.\nPoté\'ah ète yadékha, oumassbiya lékhol \'haï ratson.\nTsadik Ado-naï békhol drakhav, vé\'hassid békhol maassav.\nKarov Ado-naï lékhol korav, lékhol achère yikraouhou véémet.\nRétson yéréav yaassé, véète chav\'atam yichma véyochi\'èm.\nChomèr Ado-naï ète kol ohavav, véèt kol harécha\'im yachmid.\nTéhilat Ado-naï yédabèr pi, vivarèkh kol bassar chèm kodsho léolam vaèd.\nVaana\'hnou névarèkh Ya, méata véad olam, Halélouya.' },
      { id: 'amida-m', title: 'עֲמִידָה', titlePhonetic: 'Amida', always: true,
        text: '— 1. אָבוֹת —\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת, וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם, לְמַעַן שְׁמוֹ בְּאַהֲבָה. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְיָ, מָגֵן אַבְרָהָם.\n\n— 2. גְּבוּרוֹת —\n\nאַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ. מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוֹךָ בַּעַל גְּבוּרוֹת, וּמִי דּוֹמֶה לָּךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה. וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים. בָּרוּךְ אַתָּה יְיָ, מְחַיֵּה הַמֵּתִים.\n\n— 3. קְדֻשָּׁה (בְּמִנְיָן) —\n\nנְקַדֵּשׁ אֶת שִׁמְךָ בָּעוֹלָם, כְּשֵׁם שֶׁמַּקְדִּישִׁים אוֹתוֹ בִּשְׁמֵי מָרוֹם. כַּכָּתוּב עַל יַד נְבִיאֶךָ: וְקָרָא זֶה אֶל זֶה וְאָמַר. קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ. לְעֻמָּתָם בָּרוּךְ יֹאמֵרוּ. בָּרוּךְ כְּבוֹד יְיָ מִמְּקוֹמוֹ. וּבְדִבְרֵי קׇדְשְׁךָ כָּתוּב לֵאמֹר. יִמְלֹךְ יְיָ לְעוֹלָם, אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר, הַלְלוּיָהּ.\n\n(בְּיָחִיד: אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכׇל יוֹם יְהַלְלוּךָ סֶּלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.)\n\n— 4. אַתָּה חוֹנֵן (דַּעַת) —\n\nאַתָּה חוֹנֵן לְאָדָם דַּעַת, וּמְלַמֵּד לֶאֱנוֹשׁ בִּינָה. חׇנֵּנוּ מֵאִתְּךָ דֵּעָה בִּינָה וְהַשְׂכֵּל. בָּרוּךְ אַתָּה יְיָ, חוֹנֵן הַדָּעַת.\n\n— 5. הֲשִׁיבֵנוּ (תְּשׁוּבָה) —\n\nהֲשִׁיבֵנוּ אָבִינוּ לְתוֹרָתֶךָ, וְקָרְבֵנוּ מַלְכֵּנוּ לַעֲבוֹדָתֶךָ, וְהַחֲזִירֵנוּ בִּתְשׁוּבָה שְׁלֵמָה לְפָנֶיךָ. בָּרוּךְ אַתָּה יְיָ, הָרוֹצֶה בִּתְשׁוּבָה.\n\n— 6. סְלַח לָנוּ (סְלִיחָה) —\n\nסְלַח לָנוּ אָבִינוּ כִּי חָטָאנוּ, מְחַל לָנוּ מַלְכֵּנוּ כִּי פָשָׁעְנוּ, כִּי מוֹחֵל וְסוֹלֵחַ אָתָּה. בָּרוּךְ אַתָּה יְיָ, חַנּוּן הַמַּרְבֶּה לִסְלֹחַ.\n\n— 7. רְאֵה (גְּאֻלָּה) —\n\nרְאֵה נָא בְעׇנְיֵנוּ, וְרִיבָה רִיבֵנוּ, וּגְאָלֵנוּ מְהֵרָה לְמַעַן שְׁמֶךָ, כִּי גּוֹאֵל חָזָק אָתָּה. בָּרוּךְ אַתָּה יְיָ, גּוֹאֵל יִשְׂרָאֵל.\n\n— 8. רְפָאֵנוּ (רְפוּאָה) —\n\nרְפָאֵנוּ יְיָ וְנֵרָפֵא, הוֹשִׁיעֵנוּ וְנִוָּשֵׁעָה, כִּי תְהִלָּתֵנוּ אָתָּה, וְהַעֲלֵה רְפוּאָה שְׁלֵמָה לְכׇל מַכּוֹתֵינוּ, כִּי אֵל מֶלֶךְ רוֹפֵא נֶאֱמָן וְרַחֲמָן אָתָּה. בָּרוּךְ אַתָּה יְיָ, רוֹפֵא חוֹלֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 9. בָּרֵךְ עָלֵינוּ (שָׁנִים) —\n\nבָּרֵךְ עָלֵינוּ יְיָ אֱלֹהֵינוּ אֶת הַשָּׁנָה הַזֹּאת וְאֶת כׇּל מִינֵי תְבוּאָתָהּ לְטוֹבָה, וְתֵן בְּרָכָה עַל פְּנֵי הָאֲדָמָה, וְשַׂבְּעֵנוּ מִטּוּבָהּ, וּבָרֵךְ שְׁנָתֵנוּ כַּשָּׁנִים הַטּוֹבוֹת. בָּרוּךְ אַתָּה יְיָ, מְבָרֵךְ הַשָּׁנִים.\n\n— 10. תְּקַע בְּשׁוֹפָר (קִבּוּץ גָּלֻיּוֹת) —\n\nתְּקַע בְּשׁוֹפָר גָּדוֹל לְחֵרוּתֵנוּ, וְשָׂא נֵס לְקַבֵּץ גָּלֻיּוֹתֵינוּ, וְקַבְּצֵנוּ יַחַד מֵאַרְבַּע כַּנְפוֹת הָאָרֶץ. בָּרוּךְ אַתָּה יְיָ, מְקַבֵּץ נִדְחֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 11. הָשִׁיבָה שׁוֹפְטֵינוּ (מִשְׁפָּט) —\n\nהָשִׁיבָה שׁוֹפְטֵינוּ כְּבָרִאשׁוֹנָה, וְיוֹעֲצֵינוּ כְּבַתְּחִלָּה, וְהָסֵר מִמֶּנּוּ יָגוֹן וַאֲנָחָה, וּמְלֹךְ עָלֵינוּ אַתָּה יְיָ לְבַדְּךָ בְּחֶסֶד וּבְרַחֲמִים, וְצַדְּקֵנוּ בַּמִּשְׁפָּט. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ אוֹהֵב צְדָקָה וּמִשְׁפָּט.\n\n— 12. וְלַמַּלְשִׁינִים (מִינִים) —\n\nוְלַמַּלְשִׁינִים אַל תְּהִי תִקְוָה, וְכׇל הָרִשְׁעָה כְּרֶגַע תֹּאבֵד, וְכׇל אוֹיְבֶיךָ מְהֵרָה יִכָּרֵתוּ, וְהַזֵּדִים מְהֵרָה תְעַקֵּר וּתְשַׁבֵּר וּתְמַגֵּר וְתַכְנִיעַ בִּמְהֵרָה בְיָמֵינוּ. בָּרוּךְ אַתָּה יְיָ, שׁוֹבֵר אוֹיְבִים וּמַכְנִיעַ זֵדִים.\n\n— 13. עַל הַצַּדִּיקִים (צַדִּיקִים) —\n\nעַל הַצַּדִּיקִים וְעַל הַחֲסִידִים, וְעַל זִקְנֵי עַמְּךָ בֵּית יִשְׂרָאֵל, וְעַל פְּלֵיטַת סוֹפְרֵיהֶם, וְעַל גֵּרֵי הַצֶּדֶק וְעָלֵינוּ, יֶהֱמוּ נָא רַחֲמֶיךָ יְיָ אֱלֹהֵינוּ, וְתֵן שָׂכָר טוֹב לְכׇל הַבּוֹטְחִים בְּשִׁמְךָ בֶּאֱמֶת, וְשִׂים חֶלְקֵנוּ עִמָּהֶם לְעוֹלָם וְלֹא נֵבוֹשׁ כִּי בְךָ בָטָחְנוּ. בָּרוּךְ אַתָּה יְיָ, מִשְׁעָן וּמִבְטָח לַצַּדִּיקִים.\n\n— 14. וְלִירוּשָׁלַיִם (יְרוּשָׁלַיִם) —\n\nוְלִירוּשָׁלַיִם עִירְךָ בְּרַחֲמִים תָּשׁוּב, וְתִשְׁכּוֹן בְּתוֹכָהּ כַּאֲשֶׁר דִּבַּרְתָּ, וּבְנֵה אוֹתָהּ בְּקָרוֹב בְּיָמֵינוּ בִּנְיַן עוֹלָם, וְכִסֵּא דָוִד מְהֵרָה לְתוֹכָהּ תָּכִין. בָּרוּךְ אַתָּה יְיָ, בּוֹנֵה יְרוּשָׁלָיִם.\n\n— 15. אֶת צֶמַח דָּוִד (דָּוִד) —\n\nאֶת צֶמַח דָּוִד עַבְדְּךָ מְהֵרָה תַצְמִיחַ, וְקַרְנוֹ תָּרוּם בִּישׁוּעָתֶךָ, כִּי לִישׁוּעָתְךָ קִוִּינוּ כׇּל הַיּוֹם. בָּרוּךְ אַתָּה יְיָ, מַצְמִיחַ קֶרֶן יְשׁוּעָה.\n\n— 16. שְׁמַע קוֹלֵנוּ —\n\nשְׁמַע קוֹלֵנוּ יְיָ אֱלֹהֵינוּ, חוּס וְרַחֵם עָלֵינוּ, וְקַבֵּל בְּרַחֲמִים וּבְרָצוֹן אֶת תְּפִלָּתֵנוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלּוֹת וְתַחֲנוּנִים אָתָּה, וּמִלְּפָנֶיךָ מַלְכֵּנוּ רֵיקָם אַל תְּשִׁיבֵנוּ, כִּי אַתָּה שׁוֹמֵעַ תְּפִלַּת כׇּל פֶּה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.\n\n— 17. רְצֵה (עֲבוֹדָה) —\n\nרְצֵה יְיָ אֱלֹהֵינוּ בְּעַמְּךָ יִשְׂרָאֵל וּבִתְפִלָּתָם, וְהָשֵׁב אֶת הָעֲבוֹדָה לִדְבִיר בֵּיתֶךָ, וְאִשֵּׁי יִשְׂרָאֵל וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן, וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ. וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר שְׁכִינָתוֹ לְצִיּוֹן.\n\n— 18. מוֹדִים —\n\nמוֹדִים אֲנַחְנוּ לָךְ, שָׁאַתָּה הוּא יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ לְעוֹלָם וָעֶד. צוּר חַיֵּינוּ, מָגֵן יִשְׁעֵנוּ, אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְּךָ וּנְסַפֵּר תְּהִלָּתֶךָ, עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ, וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ, וְעַל נִסֶּיךָ שֶׁבְּכׇל יוֹם עִמָּנוּ, וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכׇל עֵת, עֶרֶב וָבֹקֶר וְצׇהֳרָיִם. הַטּוֹב, כִּי לֹא כָלוּ רַחֲמֶיךָ, וְהַמְרַחֵם, כִּי לֹא תַמּוּ חֲסָדֶיךָ, מֵעוֹלָם קִוִּינוּ לָךְ.\n\nוְעַל כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד. וְכׇל הַחַיִּים יוֹדוּךָ סֶּלָה, וִיהַלְלוּ אֶת שִׁמְךָ בֶּאֱמֶת, הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. בָּרוּךְ אַתָּה יְיָ, הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת.\n\n— 19. שִׂים שָׁלוֹם —\n\nשִׂים שָׁלוֹם טוֹבָה וּבְרָכָה, חֵן וָחֶסֶד וְרַחֲמִים, עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ אָבִינוּ כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ, כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ יְיָ אֱלֹהֵינוּ תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד, וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם. וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת עַמְּךָ יִשְׂרָאֵל בְּכׇל עֵת וּבְכׇל שָׁעָה בִּשְׁלוֹמֶךָ. בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם.\n\n— —\n\nאֱלֹהַי, נְצוֹר לְשׁוֹנִי מֵרָע, וּשְׂפָתַי מִדַּבֵּר מִרְמָה, וְלִמְקַלְלַי נַפְשִׁי תִדֹּם, וְנַפְשִׁי כֶּעָפָר לַכֹּל תִּהְיֶה. פְּתַח לִבִּי בְּתוֹרָתֶךָ, וּבְמִצְוֹתֶיךָ תִּרְדּוֹף נַפְשִׁי. וְכׇל הַחוֹשְׁבִים עָלַי רָעָה, מְהֵרָה הָפֵר עֲצָתָם וְקַלְקֵל מַחֲשַׁבְתָּם. עֲשֵׂה לְמַעַן שְׁמֶךָ, עֲשֵׂה לְמַעַן יְמִינֶךָ, עֲשֵׂה לְמַעַן קְדֻשָּׁתֶךָ, עֲשֵׂה לְמַעַן תּוֹרָתֶךָ. לְמַעַן יֵחָלְצוּן יְדִידֶיךָ, הוֹשִׁיעָה יְמִינְךָ וַעֲנֵנִי. יִהְיוּ לְרָצוֹן אִמְרֵי פִי וְהֶגְיוֹן לִבִּי לְפָנֶיךָ, יְיָ צוּרִי וְגוֹאֲלִי.',
        phonetic: '— 1. Avot —\n\nBaroukh ata Ado-naï Elo-hénou vElo-hé avotéinou, Elo-hé Avraham, Elo-hé Its\'hak, vElo-hé Yaakov, haEl hagadol haguibor véhanora, El èlyione, gomèl \'hassadim tovim, vékoné hakol, vézokhèr \'hasdé avot, oumévi goèl livné vnéhèm, lémaan chémo béahava. Mélekh ozèr oumochia oumagèn. Baroukh ata Ado-naï, magèn Avraham.\n\n— 2. Guévourot —\n\nAta guibor léolam Ado-naï, mé\'hayé métim ata, rav léhochia. Mékhalkel \'hayim bé\'hessèd, mé\'hayé métim béra\'hamim rabim, somèkh noflim, vérofé \'holim, oumatir assourim, oumékayèm émounato lichnèï afar. Mi khamokha baal guévourot, oumi domé lakh, Mélekh mémit oumé\'hayé oumatsmi\'ah yéchoua. Vénééman ata léha\'hayot métim. Baroukh ata Ado-naï, mé\'hayé hamétim.\n\n— 3. Kédoucha (béminiane) —\n\nNékadèch ète chimékha baolam, kéchèm chémakdichim oto bichmé marom. Kakatouv al yad néviékha : véka ra zé el zé véamar. Kadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo. Lé\'oumatam baroukh yomérou. Baroukh kévod Ado-naï miméko mo. Ouvédivrè kodchékha katouv lémor. Yimlokh Ado-naï léolam, Elohayikh Tsione lédor vador, Halélouya.\n\n(Béya\'hid : Ata kadoch véchimékha kadoch, oukédochim békhol yom yéhaléloukha séla. Baroukh ata Ado-naï, haEl hakadoch.)\n\n— 4. Ata \'honène (Daat) —\n\nAta \'honène léadam daat, oumélamèd léénocj bina. \'Honénou méitékha déa bina véhaskèl. Baroukh ata Ado-naï, \'honène hadaat.\n\n— 5. Hachivénou (Téchouva) —\n\nHachivénou Avinou léToratékha, vékarvénou Malkénou laavoda tékha, véha\'hazirénou bitchouva chéléma léfanékha. Baroukh ata Ado-naï, harotsé bitchouva.\n\n— 6. Séla\'h lanou (Séli\'ha) —\n\nSéla\'h lanou Avinou ki \'hatanou, mé\'hal lanou Malkénou ki fachanou, ki mo\'hèl vésolé\'ah ata. Baroukh ata Ado-naï, \'hanoun hamarbé lislo\'ah.\n\n— 7. Réé (Guéoula) —\n\nRéé na véonyénou, vériva rivénou, ougalénou méhéra lémaan chémékha, ki goèl \'hazak ata. Baroukh ata Ado-naï, goèl Israël.\n\n— 8. Réfaénou (Réfoua) —\n\nRéfaénou Ado-naï vénérafé, hochi\'énou vénivachéa, ki téhilaténou ata, véhaalé réfoua chéléma lékhol makotéinou, ki El Mélekh rofé nééman véra\'hamane ata. Baroukh ata Ado-naï, rofé \'holé amo Israël.\n\n— 9. Barèkh alénou (Chanim) —\n\nBarèkh alénou Ado-naï Elo-hénou ète hachana hazot véète kol miné tévouatah létova, vétène brakha al péné haadama, véssabénou mitouvah, ouvarèkh chnaténou kachanim hatovot. Baroukh ata Ado-naï, mévare\'kh hachanim.\n\n— 10. Téka béChofar (Kibouts galiouyot) —\n\nTéka béchofar gadol lé\'hérou ténou, véssa nèss lékabèts galiouyotéinou, vékabétsénou ya\'had méarba kanfot haarèts. Baroukh ata Ado-naï, mékabèts nid\'hé amo Israël.\n\n— 11. Hachiva choftéinou (Michpat) —\n\nHachiva choftéinou kévarichona, véyoatséinou kévat\'hila, véhassèr miménou yagone vaana\'ha, oumlokh alénou ata Ado-naï lévadékha bé\'hèssèd ouvéra\'hamim, vétsadékénou bamichpat. Baroukh ata Ado-naï, Mélekh ohèv tsédaka oumichpat.\n\n— 12. Vélamalachiniim (Minim) —\n\nVélamalachiniim al téhi tikva, vékhol haricha kéréga tovèd, vékhol oyvékha méhéra yikarétou, véhazédim méhéra tékakèr outé chabèr outémagèr vétakhnia biméhéra véyaménou. Baroukh ata Ado-naï, chovèr oyvim oumakhnia zédim.\n\n— 13. Al hatsadikim (Tsadikim) —\n\nAl hatsadikim véal ha\'hassidim, véal zikné amékha bèt Israël, véal plétat soféréhèm, véal guéré hatséddek véalénou, yéhémou na ra\'hamékha Ado-naï Elo-hénou, vétène sakhar tov lékhol habotéhim béchimékha béémèt, véssim \'helkénou imahèm léolam vélo névoch ki békha bata\'hnou. Baroukh ata Ado-naï, mich\'ane oumivta\'h latsadikim.\n\n— 14. VéliYérouchalaïm (Yérouchalaïm) —\n\nVéliYérouchalaïm irékha béra\'hamim tachouv, vétichkone bétokha kaachère dibarta, ouvné otah békarov béyaménou binyane olam, vékissé David méhéra létokha takhiné. Baroukh ata Ado-naï, boné Yérouchalaïm.\n\n— 15. Ète tséma\'h David (David) —\n\nÈte tséma\'h David avdékha méhéra tatsmi\'ah, vékarna taroum bichououatékha, ki lichououatkha kivinou kol hayom. Baroukh ata Ado-naï, matsmi\'ah kérène yéchoua.\n\n— 16. Chéma kolénou —\n\nChéma kolénou Ado-naï Elo-hénou, \'houss véra\'hèm alénou, vékabèl béra\'hamim ouvératson ète téfilaténou, ki El choméa téfilot véta\'hanounim ata, oumiléfanékha Malkénou réikam al téchivénou, ki ata choméa téfilat kol pé. Baroukh ata Ado-naï, choméa téfila.\n\n— 17. Rétsé (Avoda) —\n\nRétsé Ado-naï Elo-hénou béamékha Israël ouvitéfilatam, véhachèv ète haavoda lidvir bétékha, véiché Israël outéfilatam béahava tékabèl béra tsone, outéhi léra tsone tamid avodat Israël amékha. Véte\'hézéna ènénou béchouvékha léTsione béra\'hamim. Baroukh ata Ado-naï, hama\'hazir chékhinato léTsione.\n\n— 18. Modim —\n\nModim ana\'hnou lakh, chaata hou Ado-naï Elo-hénou vElo-hé avotéinou léolam vaèd. Tsour \'hayénou, magèn yich\'énou, ata hou lédor vador. Nodé lékha ouné sapèr téhilatékha, al \'hayénou haméssourim béyadékha, véal nichmotéinou hapékoudot lakh, véal nissékha chébékhol yom imanou, véal niflèotékha vétovotékha chébékhol èt, érèv vavoker vétsohoraïm. Hatov, ki lo khalou ra\'hamékha, véhaméra\'hèm, ki lo tamou \'hassadékha, méolam kivinou lakh.\n\nVéal koulam yitbarakh véyitromam chimékha Malkénou tamid léolam vaèd. Vékhol ha\'hayim yodoukha séla, vihalélo u ète chimékha béémèt, haEl yéchouaténou véèzraténou séla. Baroukh ata Ado-naï, hatov chimékha oulékha naé léhodot.\n\n— 19. Sim Chalom —\n\nSim chalom tova ouvrakha, \'hène va\'hèssèd véra\'hamim, alénou véal kol Israël amékha. Barkhénou Avinou koullanou kéé\'had béor panékha, ki véor panékha natata lanou Ado-naï Elo-hénou Torat \'hayim véahavat \'hèssèd, outsdaka ouvrakha véra\'hamim vé\'hayim véchalom. Vétov béènékha lévarèkh ète amékha Israël békhol èt ouvékhol chaah bichlo mékha. Baroukh ata Ado-naï, hamévare\'kh ète amo Israël bachalom.\n\n— —\n\nElo-haï, nétsor léchoni méra, ousfataï midabèr mirma, vélimkalélaï nafchi tidom, vénafchi kéafar lakol tihyé. Péta\'h libi béToratékha, ouvémitsvotékha tirdof nafchi. Vékhol ha\'hochvim alaï raa, méhéra hafèr atsatam vékalkèl ma\'hachavtam. Assé lémaan chémékha, assé lémaan yéminékha, assé lémaan kédouchatékha, assé lémaan Toratékha. Lémaan yé\'halétsoun yédidékha, hochia yéminékha vaanéni. Yihyou lératson imré fi véhéguione libi léfanékha, Ado-naï tsouri végoali.' },
      { id: 'tahnoun-m', title: 'תַּחֲנוּן', titlePhonetic: 'Ta\'hanoun', tahnoun_day: true,
        text: 'וַיֹּאמֶר דָּוִד אֶל גָד, צַר לִי מְאֹד, נִפְּלָה נָא בְיַד יְיָ כִּי רַבִּים רַחֲמָיו, וּבְיַד אָדָם אַל אֶפֹּלָה.\n\nרַחוּם וְחַנּוּן, חָטָאתִי לְפָנֶיךָ, יְיָ מָלֵא רַחֲמִים, רַחֵם עָלַי וְקַבֵּל תַּחֲנוּנָי.',
        phonetic: 'Vayomère David el Gad, tsar li méod, nipéla na béyad Ado-naï ki rabim ra\'hamav, ouvéyad adam al épola.\n\nRa\'houm vé\'hanoun, \'hatati léfanékha, Ado-naï malé ra\'hamim, ra\'hèm alaï vékabèl ta\'hanounaï.' },
      { id: 'aleinu-m', title: 'עָלֵינוּ', titlePhonetic: 'Alénou', always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכׇל הֲמוֹנָם.\n\nוַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא. שֶׁהוּא נוֹטֶה שָׁמַיִם וְיֹסֵד אָרֶץ, וּמוֹשַׁב יְקָרוֹ בַּשָּׁמַיִם מִמַּעַל, וּשְׁכִינַת עֻזּוֹ בְּגׇבְהֵי מְרוֹמִים. הוּא אֱלֹהֵינוּ אֵין עוֹד, אֱמֶת מַלְכֵּנוּ אֶפֶס זוּלָתוֹ, כַּכָּתוּב בְּתוֹרָתוֹ: וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ, כִּי יְיָ הוּא הָאֱלֹהִים בַּשָּׁמַיִם מִמַּעַל וְעַל הָאָרֶץ מִתָּחַת, אֵין עוֹד.\n\nעַל כֵּן נְקַוֶּה לְּךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזֶּךָ, לְהַעֲבִיר גִּלּוּלִים מִן הָאָרֶץ, וְהָאֱלִילִים כָּרוֹת יִכָּרֵתוּן, לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי. וְכׇל בְּנֵי בָשָׂר יִקְרְאוּ בִשְׁמֶךָ, לְהַפְנוֹת אֵלֶיךָ כׇּל רִשְׁעֵי אָרֶץ. יַכִּירוּ וְיֵדְעוּ כׇּל יוֹשְׁבֵי תֵבֵל, כִּי לְךָ תִּכְרַע כׇּל בֶּרֶךְ, תִּשָּׁבַע כׇּל לָשׁוֹן. לְפָנֶיךָ יְיָ אֱלֹהֵינוּ יִכְרְעוּ וְיִפֹּלוּ, וְלִכְבוֹד שִׁמְךָ יְקָר יִתֵּנוּ. וִיקַבְּלוּ כֻלָּם אֶת עֹל מַלְכוּתֶךָ, וְתִמְלֹךְ עֲלֵיהֶם מְהֵרָה לְעוֹלָם וָעֶד. כִּי הַמַּלְכוּת שֶׁלְּךָ הִיא, וּלְעוֹלְמֵי עַד תִּמְלוֹךְ בְּכָבוֹד. כַּכָּתוּב בְּתוֹרָתֶךָ: יְיָ יִמְלֹךְ לְעֹלָם וָעֶד. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כׇּל הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד וּשְׁמוֹ אֶחָד.',
        phonetic: 'Alénou léchabéa\'h laAdone hakol, latèt guédoula léyotsèr béréchit, chélo assanou kégoïé haaratsot, vélo samanou kémichpé\'hot haadama, chélo sam \'hélkénou kahèm, végoralénou kékhol hamonam.\n\nVaana\'hnou kor\'im oumichistaahavim oumodim lifné Mélekh malkhé hamélakhim, haKadoch Baroukh hou. Chéhou noté chamaïm véyossèd arèts, oumochav yékaro bachamaïm mimaal, ouchkhinat ouzo bégov\'hé méromim. Hou Elo-hénou ène od, émèt Malkénou éfèss zoulato, kakatouv béTorato : véyadaata hayom vahachèvota el lévavékha, ki Ado-naï hou haElohim bachamaïm mimaal véal haarèts mita\'hat, ène od.\n\nAl kène nékavé lékha Ado-naï Elo-hénou, lirot méhéra bétifèrèt ouzékha, léhaavir guiloulim mine haarèts, véhaélilim karot yikarétoun, létakène olam bémalkout Chadaï. Vékhol bné vassar yikréou vichémékha, léhafnot élékha kol rich\'é arèts. Yakirou véyédé\'ou kol yochvé tével, ki lékha tikra kol bérèkh, tichava kol lachone. Léfanékha Ado-naï Elo-hénou yikhréou véyipolou, vélikhvod chimékha yékar yiténou. Vikablou khoulam ète ol malkhouté kha, vétimlokh aléhèm méhéra léolam vaèd. Ki hamalkout chélékha hi, ouléolmé ad timlokh békhavod. Kakatouv béToratékha : Ado-naï yimlokh léolam vaèd. Vénéémar : véhaya Ado-naï léMélekh al kol haarèts, bayom hahou yihyé Ado-naï é\'had ouchmo é\'had.' },
      { id: 'kaddish-yatom-m', title: 'קַדִּישׁ יָתוֹם', titlePhonetic: 'Kaddich Yatom', always: true,
        text: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכׇל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.\n\nיִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא בְּרִיךְ הוּא. לְעֵלָּא מִן כׇּל בִּרְכָתָא וְשִׁירָתָא, תֻּשְׁבְּחָתָא וְנֶחֱמָתָא, דַּאֲמִירָן בְּעָלְמָא. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא, וְחַיִּים עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל. וְאִמְרוּ אָמֵן.\n\nעֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו, הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל. וְאִמְרוּ אָמֵן.',
        phonetic: 'Yitgadal véyitkadach chéméh raba. Béalma di véra khiréoutéh, véyamlikh malkoutéh bé\'hayékhone ouvyomékhone ouv\'hayé dékhol bèt Israël, baagala ouvizmane kariv. Véimrou amène.\n\nYéhé chéméh raba mévarakh léalam oulalmé almaya.\n\nYitbarakh véyichtaba\'h véyitpaar véyitromam véyitnassé véyithadar véyitalé véyithalal chéméh dékoudcha bérikh hou. Léèla mine kol birkhata véchirata, touchbé\'hata véné\'hèmata, daamirane béalma. Véimrou amène.\n\nYéhé chlama raba mine chémaya, vé\'hayim alénou véal kol Israël. Véimrou amène.\n\nOssé chalom bimromav, hou yaassé chalom alénou véal kol Israël. Véimrou amène.' }
    ]
  },
  arvit: {
    label: 'עַרְבִית', labelPhonetic: 'Arvit', labelFr: 'Priere du soir', sublabel: 'Arvit', icon: '🌙', image: 'assets/Yaakov.webp', imagePosition: 'center 70%',
    sections: [
      { id: 'barchu', title: 'בָּרְכוּ', titlePhonetic: 'Barékhou', always: true,
        text: 'בָּרְכוּ אֶת יְיָ הַמְּבֹרָךְ.\nבָּרוּךְ יְיָ הַמְּבֹרָךְ לְעוֹלָם וָעֶד.\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בִּדְבָרוֹ מַעֲרִיב עֲרָבִים, בְּחׇכְמָה פּוֹתֵחַ שְׁעָרִים, וּבִתְבוּנָה מְשַׁנֶּה עִתִּים, וּמַחֲלִיף אֶת הַזְּמַנִּים, וּמְסַדֵּר אֶת הַכּוֹכָבִים בְּמִשְׁמְרוֹתֵיהֶם בָּרָקִיעַ כִּרְצוֹנוֹ. בּוֹרֵא יוֹם וָלָיְלָה, גּוֹלֵל אוֹר מִפְּנֵי חֹשֶׁךְ וְחֹשֶׁךְ מִפְּנֵי אוֹר, וּמַעֲבִיר יוֹם וּמֵבִיא לָיְלָה, וּמַבְדִּיל בֵּין יוֹם וּבֵין לָיְלָה, יְיָ צְבָאוֹת שְׁמוֹ. אֵל חַי וְקַיָּם, תָּמִיד יִמְלוֹךְ עָלֵינוּ לְעוֹלָם וָעֶד. בָּרוּךְ אַתָּה יְיָ, הַמַּעֲרִיב עֲרָבִים.',
        phonetic: 'Barékhou ète Ado-naï hamévorakh.\nBaroukh Ado-naï hamévorakh léolam vaèd.\n\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, achère bidvaro maariv aravim, bé\'hokhma poté\'ah chéarim, ouvitvonna méchané itim, ouma\'halif ète hazémanim, ouméssadèr ète hakokhavim bémichmérothèm barakiya kirtsono. Boré yom valaïla, golèl or mipné \'hochèkh vé\'hochèkh mipné or, oumaavir yom oumévi laïla, oumavdil bèn yom ouvèn laïla, Ado-naï tsévaot chémo. El \'haï vékayam, tamid yimlokh alénou léolam vaèd. Baroukh ata Ado-naï, hamaaariv aravim.' },
      { id: 'shema-a', title: 'קְרִיאַת שְׁמַע', titlePhonetic: 'Kriat Chéma', always: true,
        text: 'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד׃\n\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.\n\nוְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ בְּכׇל לְבָבְךָ וּבְכׇל נַפְשְׁךָ וּבְכׇל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ, וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשׇׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ, וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.\n\nוְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ אֶל מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם, לְאַהֲבָה אֶת יְיָ אֱלֹהֵיכֶם וּלְעׇבְדוֹ בְּכׇל לְבַבְכֶם וּבְכׇל נַפְשְׁכֶם. וְנָתַתִּי מְטַר אַרְצְכֶם בְּעִתּוֹ, יוֹרֶה וּמַלְקוֹשׁ, וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ, וְאָכַלְתָּ וְשָׂבָעְתָּ.\n\nוַיֹּאמֶר יְיָ אֶל מֹשֶׁה לֵּאמֹר. דַּבֵּר אֶל בְּנֵי יִשְׂרָאֵל וְאָמַרְתָּ אֲלֵהֶם, וְעָשׂוּ לָהֶם צִיצִת עַל כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם. וְהָיָה לָכֶם לְצִיצִת, וּרְאִיתֶם אֹתוֹ וּזְכַרְתֶּם אֶת כׇּל מִצְוֹת יְיָ וַעֲשִׂיתֶם אֹתָם. אֲנִי יְיָ אֱלֹהֵיכֶם אֲשֶׁר הוֹצֵאתִי אֶתְכֶם מֵאֶרֶץ מִצְרַיִם לִהְיוֹת לָכֶם לֵאלֹהִים, אֲנִי יְיָ אֱלֹהֵיכֶם. אֱמֶת.',
        phonetic: 'Chéma Israël, Ado-naï Elo-hénou, Ado-naï É\'had.\n\nBaroukh chem kevod malkhouto léolam vaèd.\n\nVéahavta ète Ado-naï Elohékha békhol lévavékha ouvékhol nafchékha ouvékhol méodékha. Véhayou hadévarim haélé achère anokhi métsavékha hayom al lévavékha. Véchinantam lévanékha, védibarta bam béchivtékha bévétékha ouvlékhté kha vadérèkh ouvchokh békha ouvkoumékha. Oukchartam léot al yadékha, véhayou létotafot bèn ènékha. Oukhtavtam al mézouzot bètékha ouvichaérékha.\n\nVéhaya im chamoa tichméou el mitsvotaï achère anokhi métsavé etkhèm hayom, léahava ète Ado-naï Elohékhèm ouléovdo békhol lévavkhèm ouvékhol nafchékhèm. Vénatati métar artsékhèm béito, yoré oumalcoche, véassafta dégagnékha vétirocjékha véyitsharékha. Vénatati èssèv béssadékha livhémtékha, véakhalta véssavata.\n\nVayomèr Ado-naï el Moché lémor. Dabèr el bné Israël véamarta aléhèm, véassou lahèm tsitsit al kanfé vigdéhèm lédorotam. Véhaya lakhèm létsitsit, ouritèm oto ouzkhartem ète kol mitsvot Ado-naï vaassitèm otam. Ani Ado-naï Elo-hékhèm achère hotsèti etkhèm méérèts Mitsraïm lihyot lakhèm lElohim, ani Ado-naï Elo-hékhèm. Émèt.' },
      { id: 'amida-a', title: 'עֲמִידָה', titlePhonetic: 'Amida', always: true,
        text: '— 1. אָבוֹת —\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת, וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם, לְמַעַן שְׁמוֹ בְּאַהֲבָה. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְיָ, מָגֵן אַבְרָהָם.\n\n— 2. גְּבוּרוֹת —\n\nאַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ. מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוֹךָ בַּעַל גְּבוּרוֹת, וּמִי דּוֹמֶה לָּךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה. וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים. בָּרוּךְ אַתָּה יְיָ, מְחַיֵּה הַמֵּתִים.\n\n— 3. קְדֻשָּׁה (בְּמִנְיָן) —\n\nנְקַדֵּשׁ אֶת שִׁמְךָ בָּעוֹלָם, כְּשֵׁם שֶׁמַּקְדִּישִׁים אוֹתוֹ בִּשְׁמֵי מָרוֹם. כַּכָּתוּב עַל יַד נְבִיאֶךָ: וְקָרָא זֶה אֶל זֶה וְאָמַר. קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ. לְעֻמָּתָם בָּרוּךְ יֹאמֵרוּ. בָּרוּךְ כְּבוֹד יְיָ מִמְּקוֹמוֹ. וּבְדִבְרֵי קׇדְשְׁךָ כָּתוּב לֵאמֹר. יִמְלֹךְ יְיָ לְעוֹלָם, אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר, הַלְלוּיָהּ.\n\n(בְּיָחִיד: אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכׇל יוֹם יְהַלְלוּךָ סֶּלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.)\n\n— 4. אַתָּה חוֹנֵן (דַּעַת) —\n\nאַתָּה חוֹנֵן לְאָדָם דַּעַת, וּמְלַמֵּד לֶאֱנוֹשׁ בִּינָה. חׇנֵּנוּ מֵאִתְּךָ דֵּעָה בִּינָה וְהַשְׂכֵּל. בָּרוּךְ אַתָּה יְיָ, חוֹנֵן הַדָּעַת.\n\n— 5. הֲשִׁיבֵנוּ (תְּשׁוּבָה) —\n\nהֲשִׁיבֵנוּ אָבִינוּ לְתוֹרָתֶךָ, וְקָרְבֵנוּ מַלְכֵּנוּ לַעֲבוֹדָתֶךָ, וְהַחֲזִירֵנוּ בִּתְשׁוּבָה שְׁלֵמָה לְפָנֶיךָ. בָּרוּךְ אַתָּה יְיָ, הָרוֹצֶה בִּתְשׁוּבָה.\n\n— 6. סְלַח לָנוּ (סְלִיחָה) —\n\nסְלַח לָנוּ אָבִינוּ כִּי חָטָאנוּ, מְחַל לָנוּ מַלְכֵּנוּ כִּי פָשָׁעְנוּ, כִּי מוֹחֵל וְסוֹלֵחַ אָתָּה. בָּרוּךְ אַתָּה יְיָ, חַנּוּן הַמַּרְבֶּה לִסְלֹחַ.\n\n— 7. רְאֵה (גְּאֻלָּה) —\n\nרְאֵה נָא בְעׇנְיֵנוּ, וְרִיבָה רִיבֵנוּ, וּגְאָלֵנוּ מְהֵרָה לְמַעַן שְׁמֶךָ, כִּי גּוֹאֵל חָזָק אָתָּה. בָּרוּךְ אַתָּה יְיָ, גּוֹאֵל יִשְׂרָאֵל.\n\n— 8. רְפָאֵנוּ (רְפוּאָה) —\n\nרְפָאֵנוּ יְיָ וְנֵרָפֵא, הוֹשִׁיעֵנוּ וְנִוָּשֵׁעָה, כִּי תְהִלָּתֵנוּ אָתָּה, וְהַעֲלֵה רְפוּאָה שְׁלֵמָה לְכׇל מַכּוֹתֵינוּ, כִּי אֵל מֶלֶךְ רוֹפֵא נֶאֱמָן וְרַחֲמָן אָתָּה. בָּרוּךְ אַתָּה יְיָ, רוֹפֵא חוֹלֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 9. בָּרֵךְ עָלֵינוּ (שָׁנִים) —\n\nבָּרֵךְ עָלֵינוּ יְיָ אֱלֹהֵינוּ אֶת הַשָּׁנָה הַזֹּאת וְאֶת כׇּל מִינֵי תְבוּאָתָהּ לְטוֹבָה, וְתֵן בְּרָכָה עַל פְּנֵי הָאֲדָמָה, וְשַׂבְּעֵנוּ מִטּוּבָהּ, וּבָרֵךְ שְׁנָתֵנוּ כַּשָּׁנִים הַטּוֹבוֹת. בָּרוּךְ אַתָּה יְיָ, מְבָרֵךְ הַשָּׁנִים.\n\n— 10. תְּקַע בְּשׁוֹפָר (קִבּוּץ גָּלֻיּוֹת) —\n\nתְּקַע בְּשׁוֹפָר גָּדוֹל לְחֵרוּתֵנוּ, וְשָׂא נֵס לְקַבֵּץ גָּלֻיּוֹתֵינוּ, וְקַבְּצֵנוּ יַחַד מֵאַרְבַּע כַּנְפוֹת הָאָרֶץ. בָּרוּךְ אַתָּה יְיָ, מְקַבֵּץ נִדְחֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 11. הָשִׁיבָה שׁוֹפְטֵינוּ (מִשְׁפָּט) —\n\nהָשִׁיבָה שׁוֹפְטֵינוּ כְּבָרִאשׁוֹנָה, וְיוֹעֲצֵינוּ כְּבַתְּחִלָּה, וְהָסֵר מִמֶּנּוּ יָגוֹן וַאֲנָחָה, וּמְלֹךְ עָלֵינוּ אַתָּה יְיָ לְבַדְּךָ בְּחֶסֶד וּבְרַחֲמִים, וְצַדְּקֵנוּ בַּמִּשְׁפָּט. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ אוֹהֵב צְדָקָה וּמִשְׁפָּט.\n\n— 12. וְלַמַּלְשִׁינִים (מִינִים) —\n\nוְלַמַּלְשִׁינִים אַל תְּהִי תִקְוָה, וְכׇל הָרִשְׁעָה כְּרֶגַע תֹּאבֵד, וְכׇל אוֹיְבֶיךָ מְהֵרָה יִכָּרֵתוּ, וְהַזֵּדִים מְהֵרָה תְעַקֵּר וּתְשַׁבֵּר וּתְמַגֵּר וְתַכְנִיעַ בִּמְהֵרָה בְיָמֵינוּ. בָּרוּךְ אַתָּה יְיָ, שׁוֹבֵר אוֹיְבִים וּמַכְנִיעַ זֵדִים.\n\n— 13. עַל הַצַּדִּיקִים (צַדִּיקִים) —\n\nעַל הַצַּדִּיקִים וְעַל הַחֲסִידִים, וְעַל זִקְנֵי עַמְּךָ בֵּית יִשְׂרָאֵל, וְעַל פְּלֵיטַת סוֹפְרֵיהֶם, וְעַל גֵּרֵי הַצֶּדֶק וְעָלֵינוּ, יֶהֱמוּ נָא רַחֲמֶיךָ יְיָ אֱלֹהֵינוּ, וְתֵן שָׂכָר טוֹב לְכׇל הַבּוֹטְחִים בְּשִׁמְךָ בֶּאֱמֶת, וְשִׂים חֶלְקֵנוּ עִמָּהֶם לְעוֹלָם וְלֹא נֵבוֹשׁ כִּי בְךָ בָטָחְנוּ. בָּרוּךְ אַתָּה יְיָ, מִשְׁעָן וּמִבְטָח לַצַּדִּיקִים.\n\n— 14. וְלִירוּשָׁלַיִם (יְרוּשָׁלַיִם) —\n\nוְלִירוּשָׁלַיִם עִירְךָ בְּרַחֲמִים תָּשׁוּב, וְתִשְׁכּוֹן בְּתוֹכָהּ כַּאֲשֶׁר דִּבַּרְתָּ, וּבְנֵה אוֹתָהּ בְּקָרוֹב בְּיָמֵינוּ בִּנְיַן עוֹלָם, וְכִסֵּא דָוִד מְהֵרָה לְתוֹכָהּ תָּכִין. בָּרוּךְ אַתָּה יְיָ, בּוֹנֵה יְרוּשָׁלָיִם.\n\n— 15. אֶת צֶמַח דָּוִד (דָּוִד) —\n\nאֶת צֶמַח דָּוִד עַבְדְּךָ מְהֵרָה תַצְמִיחַ, וְקַרְנוֹ תָּרוּם בִּישׁוּעָתֶךָ, כִּי לִישׁוּעָתְךָ קִוִּינוּ כׇּל הַיּוֹם. בָּרוּךְ אַתָּה יְיָ, מַצְמִיחַ קֶרֶן יְשׁוּעָה.\n\n— 16. שְׁמַע קוֹלֵנוּ —\n\nשְׁמַע קוֹלֵנוּ יְיָ אֱלֹהֵינוּ, חוּס וְרַחֵם עָלֵינוּ, וְקַבֵּל בְּרַחֲמִים וּבְרָצוֹן אֶת תְּפִלָּתֵנוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלּוֹת וְתַחֲנוּנִים אָתָּה, וּמִלְּפָנֶיךָ מַלְכֵּנוּ רֵיקָם אַל תְּשִׁיבֵנוּ, כִּי אַתָּה שׁוֹמֵעַ תְּפִלַּת כׇּל פֶּה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.\n\n— 17. רְצֵה (עֲבוֹדָה) —\n\nרְצֵה יְיָ אֱלֹהֵינוּ בְּעַמְּךָ יִשְׂרָאֵל וּבִתְפִלָּתָם, וְהָשֵׁב אֶת הָעֲבוֹדָה לִדְבִיר בֵּיתֶךָ, וְאִשֵּׁי יִשְׂרָאֵל וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן, וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ. וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר שְׁכִינָתוֹ לְצִיּוֹן.\n\n— 18. מוֹדִים —\n\nמוֹדִים אֲנַחְנוּ לָךְ, שָׁאַתָּה הוּא יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ לְעוֹלָם וָעֶד. צוּר חַיֵּינוּ, מָגֵן יִשְׁעֵנוּ, אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְּךָ וּנְסַפֵּר תְּהִלָּתֶךָ, עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ, וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ, וְעַל נִסֶּיךָ שֶׁבְּכׇל יוֹם עִמָּנוּ, וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכׇל עֵת, עֶרֶב וָבֹקֶר וְצׇהֳרָיִם. הַטּוֹב, כִּי לֹא כָלוּ רַחֲמֶיךָ, וְהַמְרַחֵם, כִּי לֹא תַמּוּ חֲסָדֶיךָ, מֵעוֹלָם קִוִּינוּ לָךְ.\n\nוְעַל כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד. וְכׇל הַחַיִּים יוֹדוּךָ סֶּלָה, וִיהַלְלוּ אֶת שִׁמְךָ בֶּאֱמֶת, הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. בָּרוּךְ אַתָּה יְיָ, הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת.\n\n— 19. שִׂים שָׁלוֹם —\n\nשִׂים שָׁלוֹם טוֹבָה וּבְרָכָה, חֵן וָחֶסֶד וְרַחֲמִים, עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ אָבִינוּ כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ, כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ יְיָ אֱלֹהֵינוּ תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד, וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם. וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת עַמְּךָ יִשְׂרָאֵל בְּכׇל עֵת וּבְכׇל שָׁעָה בִּשְׁלוֹמֶךָ. בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם.\n\n— —\n\nאֱלֹהַי, נְצוֹר לְשׁוֹנִי מֵרָע, וּשְׂפָתַי מִדַּבֵּר מִרְמָה, וְלִמְקַלְלַי נַפְשִׁי תִדֹּם, וְנַפְשִׁי כֶּעָפָר לַכֹּל תִּהְיֶה. פְּתַח לִבִּי בְּתוֹרָתֶךָ, וּבְמִצְוֹתֶיךָ תִּרְדּוֹף נַפְשִׁי. וְכׇל הַחוֹשְׁבִים עָלַי רָעָה, מְהֵרָה הָפֵר עֲצָתָם וְקַלְקֵל מַחֲשַׁבְתָּם. עֲשֵׂה לְמַעַן שְׁמֶךָ, עֲשֵׂה לְמַעַן יְמִינֶךָ, עֲשֵׂה לְמַעַן קְדֻשָּׁתֶךָ, עֲשֵׂה לְמַעַן תּוֹרָתֶךָ. לְמַעַן יֵחָלְצוּן יְדִידֶיךָ, הוֹשִׁיעָה יְמִינְךָ וַעֲנֵנִי. יִהְיוּ לְרָצוֹן אִמְרֵי פִי וְהֶגְיוֹן לִבִּי לְפָנֶיךָ, יְיָ צוּרִי וְגוֹאֲלִי.',
        phonetic: '— 1. Avot —\n\nBaroukh ata Ado-naï Elo-hénou vElo-hé avotéinou, Elo-hé Avraham, Elo-hé Its\'hak, vElo-hé Yaakov, haEl hagadol haguibor véhanora, El èlyione, gomèl \'hassadim tovim, vékoné hakol, vézokhèr \'hasdé avot, oumévi goèl livné vnéhèm, lémaan chémo béahava. Mélekh ozèr oumochia oumagèn. Baroukh ata Ado-naï, magèn Avraham.\n\n— 2. Guévourot —\n\nAta guibor léolam Ado-naï, mé\'hayé métim ata, rav léhochia. Mékhalkel \'hayim bé\'hessèd, mé\'hayé métim béra\'hamim rabim, somèkh noflim, vérofé \'holim, oumatir assourim, oumékayèm émounato lichnèï afar. Mi khamokha baal guévourot, oumi domé lakh, Mélekh mémit oumé\'hayé oumatsmi\'ah yéchoua. Vénééman ata léha\'hayot métim. Baroukh ata Ado-naï, mé\'hayé hamétim.\n\n— 3. Kédoucha (béminiane) —\n\nNékadèch ète chimékha baolam, kéchèm chémakdichim oto bichmé marom. Kakatouv al yad néviékha : véka ra zé el zé véamar. Kadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo. Lé\'oumatam baroukh yomérou. Baroukh kévod Ado-naï miméko mo. Ouvédivrè kodchékha katouv lémor. Yimlokh Ado-naï léolam, Elohayikh Tsione lédor vador, Halélouya.\n\n(Béya\'hid : Ata kadoch véchimékha kadoch, oukédochim békhol yom yéhaléloukha séla. Baroukh ata Ado-naï, haEl hakadoch.)\n\n— 4. Ata \'honène (Daat) —\n\nAta \'honène léadam daat, oumélamèd léénocj bina. \'Honénou méitékha déa bina véhaskèl. Baroukh ata Ado-naï, \'honène hadaat.\n\n— 5. Hachivénou (Téchouva) —\n\nHachivénou Avinou léToratékha, vékarvénou Malkénou laavoda tékha, véha\'hazirénou bitchouva chéléma léfanékha. Baroukh ata Ado-naï, harotsé bitchouva.\n\n— 6. Séla\'h lanou (Séli\'ha) —\n\nSéla\'h lanou Avinou ki \'hatanou, mé\'hal lanou Malkénou ki fachanou, ki mo\'hèl vésolé\'ah ata. Baroukh ata Ado-naï, \'hanoun hamarbé lislo\'ah.\n\n— 7. Réé (Guéoula) —\n\nRéé na véonyénou, vériva rivénou, ougalénou méhéra lémaan chémékha, ki goèl \'hazak ata. Baroukh ata Ado-naï, goèl Israël.\n\n— 8. Réfaénou (Réfoua) —\n\nRéfaénou Ado-naï vénérafé, hochi\'énou vénivachéa, ki téhilaténou ata, véhaalé réfoua chéléma lékhol makotéinou, ki El Mélekh rofé nééman véra\'hamane ata. Baroukh ata Ado-naï, rofé \'holé amo Israël.\n\n— 9. Barèkh alénou (Chanim) —\n\nBarèkh alénou Ado-naï Elo-hénou ète hachana hazot véète kol miné tévouatah létova, vétène brakha al péné haadama, véssabénou mitouvah, ouvarèkh chnaténou kachanim hatovot. Baroukh ata Ado-naï, mévare\'kh hachanim.\n\n— 10. Téka béChofar (Kibouts galiouyot) —\n\nTéka béchofar gadol lé\'hérou ténou, véssa nèss lékabèts galiouyotéinou, vékabétsénou ya\'had méarba kanfot haarèts. Baroukh ata Ado-naï, mékabèts nid\'hé amo Israël.\n\n— 11. Hachiva choftéinou (Michpat) —\n\nHachiva choftéinou kévarichona, véyoatséinou kévat\'hila, véhassèr miménou yagone vaana\'ha, oumlokh alénou ata Ado-naï lévadékha bé\'hèssèd ouvéra\'hamim, vétsadékénou bamichpat. Baroukh ata Ado-naï, Mélekh ohèv tsédaka oumichpat.\n\n— 12. Vélamalachiniim (Minim) —\n\nVélamalachiniim al téhi tikva, vékhol haricha kéréga tovèd, vékhol oyvékha méhéra yikarétou, véhazédim méhéra tékakèr outé chabèr outémagèr vétakhnia biméhéra véyaménou. Baroukh ata Ado-naï, chovèr oyvim oumakhnia zédim.\n\n— 13. Al hatsadikim (Tsadikim) —\n\nAl hatsadikim véal ha\'hassidim, véal zikné amékha bèt Israël, véal plétat soféréhèm, véal guéré hatséddek véalénou, yéhémou na ra\'hamékha Ado-naï Elo-hénou, vétène sakhar tov lékhol habotéhim béchimékha béémèt, véssim \'helkénou imahèm léolam vélo névoch ki békha bata\'hnou. Baroukh ata Ado-naï, mich\'ane oumivta\'h latsadikim.\n\n— 14. VéliYérouchalaïm (Yérouchalaïm) —\n\nVéliYérouchalaïm irékha béra\'hamim tachouv, vétichkone bétokha kaachère dibarta, ouvné otah békarov béyaménou binyane olam, vékissé David méhéra létokha takhiné. Baroukh ata Ado-naï, boné Yérouchalaïm.\n\n— 15. Ète tséma\'h David (David) —\n\nÈte tséma\'h David avdékha méhéra tatsmi\'ah, vékarna taroum bichououatékha, ki lichououatkha kivinou kol hayom. Baroukh ata Ado-naï, matsmi\'ah kérène yéchoua.\n\n— 16. Chéma kolénou —\n\nChéma kolénou Ado-naï Elo-hénou, \'houss véra\'hèm alénou, vékabèl béra\'hamim ouvératson ète téfilaténou, ki El choméa téfilot véta\'hanounim ata, oumiléfanékha Malkénou réikam al téchivénou, ki ata choméa téfilat kol pé. Baroukh ata Ado-naï, choméa téfila.\n\n— 17. Rétsé (Avoda) —\n\nRétsé Ado-naï Elo-hénou béamékha Israël ouvitéfilatam, véhachèv ète haavoda lidvir bétékha, véiché Israël outéfilatam béahava tékabèl béra tsone, outéhi léra tsone tamid avodat Israël amékha. Véte\'hézéna ènénou béchouvékha léTsione béra\'hamim. Baroukh ata Ado-naï, hama\'hazir chékhinato léTsione.\n\n— 18. Modim —\n\nModim ana\'hnou lakh, chaata hou Ado-naï Elo-hénou vElo-hé avotéinou léolam vaèd. Tsour \'hayénou, magèn yich\'énou, ata hou lédor vador. Nodé lékha ouné sapèr téhilatékha, al \'hayénou haméssourim béyadékha, véal nichmotéinou hapékoudot lakh, véal nissékha chébékhol yom imanou, véal niflèotékha vétovotékha chébékhol èt, érèv vavoker vétsohoraïm. Hatov, ki lo khalou ra\'hamékha, véhaméra\'hèm, ki lo tamou \'hassadékha, méolam kivinou lakh.\n\nVéal koulam yitbarakh véyitromam chimékha Malkénou tamid léolam vaèd. Vékhol ha\'hayim yodoukha séla, vihalélo u ète chimékha béémèt, haEl yéchouaténou véèzraténou séla. Baroukh ata Ado-naï, hatov chimékha oulékha naé léhodot.\n\n— 19. Sim Chalom —\n\nSim chalom tova ouvrakha, \'hène va\'hèssèd véra\'hamim, alénou véal kol Israël amékha. Barkhénou Avinou koullanou kéé\'had béor panékha, ki véor panékha natata lanou Ado-naï Elo-hénou Torat \'hayim véahavat \'hèssèd, outsdaka ouvrakha véra\'hamim vé\'hayim véchalom. Vétov béènékha lévarèkh ète amékha Israël békhol èt ouvékhol chaah bichlo mékha. Baroukh ata Ado-naï, hamévare\'kh ète amo Israël bachalom.\n\n— —\n\nElo-haï, nétsor léchoni méra, ousfataï midabèr mirma, vélimkalélaï nafchi tidom, vénafchi kéafar lakol tihyé. Péta\'h libi béToratékha, ouvémitsvotékha tirdof nafchi. Vékhol ha\'hochvim alaï raa, méhéra hafèr atsatam vékalkèl ma\'hachavtam. Assé lémaan chémékha, assé lémaan yéminékha, assé lémaan kédouchatékha, assé lémaan Toratékha. Lémaan yé\'halétsoun yédidékha, hochia yéminékha vaanéni. Yihyou lératson imré fi véhéguione libi léfanékha, Ado-naï tsouri végoali.' },
      { id: 'aleinu-a', title: 'עָלֵינוּ', titlePhonetic: 'Alénou', always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכׇל הֲמוֹנָם.\n\nוַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא. שֶׁהוּא נוֹטֶה שָׁמַיִם וְיֹסֵד אָרֶץ, וּמוֹשַׁב יְקָרוֹ בַּשָּׁמַיִם מִמַּעַל, וּשְׁכִינַת עֻזּוֹ בְּגׇבְהֵי מְרוֹמִים. הוּא אֱלֹהֵינוּ אֵין עוֹד, אֱמֶת מַלְכֵּנוּ אֶפֶס זוּלָתוֹ, כַּכָּתוּב בְּתוֹרָתוֹ: וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ, כִּי יְיָ הוּא הָאֱלֹהִים בַּשָּׁמַיִם מִמַּעַל וְעַל הָאָרֶץ מִתָּחַת, אֵין עוֹד.\n\nעַל כֵּן נְקַוֶּה לְּךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזֶּךָ, לְהַעֲבִיר גִּלּוּלִים מִן הָאָרֶץ, וְהָאֱלִילִים כָּרוֹת יִכָּרֵתוּן, לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי. וְכׇל בְּנֵי בָשָׂר יִקְרְאוּ בִשְׁמֶךָ, לְהַפְנוֹת אֵלֶיךָ כׇּל רִשְׁעֵי אָרֶץ. יַכִּירוּ וְיֵדְעוּ כׇּל יוֹשְׁבֵי תֵבֵל, כִּי לְךָ תִּכְרַע כׇּל בֶּרֶךְ, תִּשָּׁבַע כׇּל לָשׁוֹן. לְפָנֶיךָ יְיָ אֱלֹהֵינוּ יִכְרְעוּ וְיִפֹּלוּ, וְלִכְבוֹד שִׁמְךָ יְקָר יִתֵּנוּ. וִיקַבְּלוּ כֻלָּם אֶת עֹל מַלְכוּתֶךָ, וְתִמְלֹךְ עֲלֵיהֶם מְהֵרָה לְעוֹלָם וָעֶד. כִּי הַמַּלְכוּת שֶׁלְּךָ הִיא, וּלְעוֹלְמֵי עַד תִּמְלוֹךְ בְּכָבוֹד. כַּכָּתוּב בְּתוֹרָתֶךָ: יְיָ יִמְלֹךְ לְעֹלָם וָעֶד. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כׇּל הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד וּשְׁמוֹ אֶחָד.',
        phonetic: 'Alénou léchabéa\'h laAdone hakol, latèt guédoula léyotsèr béréchit, chélo assanou kégoïé haaratsot, vélo samanou kémichpé\'hot haadama, chélo sam \'hélkénou kahèm, végoralénou kékhol hamonam.\n\nVaana\'hnou kor\'im oumichistaahavim oumodim lifné Mélekh malkhé hamélakhim, haKadoch Baroukh hou. Chéhou noté chamaïm véyossèd arèts, oumochav yékaro bachamaïm mimaal, ouchkhinat ouzo bégov\'hé méromim. Hou Elo-hénou ène od, émèt Malkénou éfèss zoulato, kakatouv béTorato : véyadaata hayom vahachèvota el lévavékha, ki Ado-naï hou haElohim bachamaïm mimaal véal haarèts mita\'hat, ène od.\n\nAl kène nékavé lékha Ado-naï Elo-hénou, lirot méhéra bétifèrèt ouzékha, léhaavir guiloulim mine haarèts, véhaélilim karot yikarétoun, létakène olam bémalkout Chadaï. Vékhol bné vassar yikréou vichémékha, léhafnot élékha kol rich\'é arèts. Yakirou véyédé\'ou kol yochvé tével, ki lékha tikra kol bérèkh, tichava kol lachone. Léfanékha Ado-naï Elo-hénou yikhréou véyipolou, vélikhvod chimékha yékar yiténou. Vikablou khoulam ète ol malkhouté kha, vétimlokh aléhèm méhéra léolam vaèd. Ki hamalkout chélékha hi, ouléolmé ad timlokh békhavod. Kakatouv béToratékha : Ado-naï yimlokh léolam vaèd. Vénéémar : véhaya Ado-naï léMélekh al kol haarèts, bayom hahou yihyé Ado-naï é\'had ouchmo é\'had.' },
      { id: 'kaddish-yatom-a', title: 'קַדִּישׁ יָתוֹם', titlePhonetic: 'Kaddich Yatom', always: true,
        text: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכׇל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.\n\nיִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא בְּרִיךְ הוּא. לְעֵלָּא מִן כׇּל בִּרְכָתָא וְשִׁירָתָא, תֻּשְׁבְּחָתָא וְנֶחֱמָתָא, דַּאֲמִירָן בְּעָלְמָא. וְאִמְרוּ אָמֵן.\n\nיְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא, וְחַיִּים עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל. וְאִמְרוּ אָמֵן.\n\nעֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו, הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל. וְאִמְרוּ אָמֵן.',
        phonetic: 'Yitgadal véyitkadach chéméh raba. Béalma di véra khiréoutéh, véyamlikh malkoutéh bé\'hayékhone ouvyomékhone ouv\'hayé dékhol bèt Israël, baagala ouvizmane kariv. Véimrou amène.\n\nYéhé chéméh raba mévarakh léalam oulalmé almaya.\n\nYitbarakh véyichtaba\'h véyitpaar véyitromam véyitnassé véyithadar véyitalé véyithalal chéméh dékoudcha bérikh hou. Léèla mine kol birkhata véchirata, touchbé\'hata véné\'hèmata, daamirane béalma. Véimrou amène.\n\nYéhé chlama raba mine chémaya, vé\'hayim alénou véal kol Israël. Véimrou amène.\n\nOssé chalom bimromav, hou yaassé chalom alénou véal kol Israël. Véimrou amène.' }
    ]
  }
};

// ── Chir Chel Yom — psaume du jour (dynamique) ─────────────────────────────
var SHIR_YOM_DAYS = ['רִאשׁוֹן','שֵׁנִי','שְׁלִישִׁי','רְבִיעִי','חֲמִישִׁי','שִׁשִּׁי','שַׁבָּת'];
var SHIR_YOM_DAYS_PH = ['Richone','Chéni','Chlichi','Révii','Hamichi','Chichi','Chabat'];

var SHIR_YOM_DATA = [
  // 0 = Dimanche — Psaume 24
  { psalm: 'כ״ד', psalmPh: '24',
    text: 'לְדָוִד מִזְמוֹר, לַיְיָ הָאָרֶץ וּמְלוֹאָהּ, תֵּבֵל וְיוֹשְׁבֵי בָהּ. כִּי הוּא עַל יַמִּים יְסָדָהּ, וְעַל נְהָרוֹת יְכוֹנְנֶהָ. מִי יַעֲלֶה בְהַר יְיָ, וּמִי יָקוּם בִּמְקוֹם קׇדְשׁוֹ. נְקִי כַפַּיִם וּבַר לֵבָב, אֲשֶׁר לֹא נָשָׂא לַשָּׁוְא נַפְשִׁי, וְלֹא נִשְׁבַּע לְמִרְמָה. יִשָּׂא בְרָכָה מֵאֵת יְיָ, וּצְדָקָה מֵאֱלֹהֵי יִשְׁעוֹ. זֶה דּוֹר דֹּרְשָׁיו, מְבַקְשֵׁי פָנֶיךָ יַעֲקֹב סֶלָה. שְׂאוּ שְׁעָרִים רָאשֵׁיכֶם, וְהִנָּשְׂאוּ פִּתְחֵי עוֹלָם, וְיָבוֹא מֶלֶךְ הַכָּבוֹד. מִי זֶה מֶלֶךְ הַכָּבוֹד, יְיָ עִזּוּז וְגִבּוֹר, יְיָ גִּבּוֹר מִלְחָמָה. שְׂאוּ שְׁעָרִים רָאשֵׁיכֶם, וּשְׂאוּ פִּתְחֵי עוֹלָם, וְיָבֹא מֶלֶךְ הַכָּבוֹד. מִי הוּא זֶה מֶלֶךְ הַכָּבוֹד, יְיָ צְבָאוֹת הוּא מֶלֶךְ הַכָּבוֹד סֶלָה.',
    phonetic: 'LéDavid mizmor, lAdo-naï haarèts ouméloah, tévèl véyochvé vah. Ki hou al yamim yéssadah, véal néharot yékhonénéha. Mi yaalé véhar Ado-naï, oumi yakoum bimkom kodsho. Néki khapaïm ouvar lévav, achère lo nassa lachav nafchi, vélo nichba lémirma. Yissa brakha méèt Ado-naï, outsdaka méElo-hé yich\'o. Zé dor dorchav, mévakché fanékha Yaakov séla. Séou chéarim rachékhèm, véhinasséou pit\'hé olam, véyavo Mélekh hakavod. Mi zé Mélekh hakavod, Ado-naï izouz véguibor, Ado-naï guibor mil\'hama. Séou chéarim rachékhèm, ousséou pit\'hé olam, véyavo Mélekh hakavod. Mi hou zé Mélekh hakavod, Ado-naï tsévaot hou Mélekh hakavod séla.' },

  // 1 = Lundi — Psaume 48
  { psalm: 'מ״ח', psalmPh: '48',
    text: 'שִׁיר מִזְמוֹר לִבְנֵי קֹרַח. גָּדוֹל יְיָ וּמְהֻלָּל מְאֹד, בְּעִיר אֱלֹהֵינוּ הַר קׇדְשׁוֹ. יְפֵה נוֹף מְשׂוֹשׂ כׇּל הָאָרֶץ, הַר צִיּוֹן יַרְכְּתֵי צָפוֹן, קִרְיַת מֶלֶךְ רָב. אֱלֹהִים בְּאַרְמְנוֹתֶיהָ נוֹדַע לְמִשְׂגָּב. כִּי הִנֵּה הַמְּלָכִים נוֹעֲדוּ, עָבְרוּ יַחְדָּו. הֵמָּה רָאוּ כֵּן תָּמָהוּ, נִבְהֲלוּ נֶחְפָּזוּ. רְעָדָה אֲחָזָתַם שָׁם, חִיל כַּיּוֹלֵדָה. בְּרוּחַ קָדִים תְּשַׁבֵּר אֳנִיּוֹת תַּרְשִׁישׁ. כַּאֲשֶׁר שָׁמַעְנוּ כֵּן רָאִינוּ בְּעִיר יְיָ צְבָאוֹת, בְּעִיר אֱלֹהֵינוּ, אֱלֹהִים יְכוֹנְנֶהָ עַד עוֹלָם סֶלָה. דִּמִּינוּ אֱלֹהִים חַסְדֶּךָ בְּקֶרֶב הֵיכָלֶךָ. כְּשִׁמְךָ אֱלֹהִים כֵּן תְּהִלָּתְךָ עַל קַצְוֵי אֶרֶץ, צֶדֶק מָלְאָה יְמִינֶךָ. יִשְׂמַח הַר צִיּוֹן, תָּגֵלְנָה בְּנוֹת יְהוּדָה, לְמַעַן מִשְׁפָּטֶיךָ. סֹבּוּ צִיּוֹן וְהַקִּיפוּהָ, סִפְרוּ מִגְדָּלֶיהָ. שִׁיתוּ לִבְּכֶם לְחֵילָהּ, פַּסְּגוּ אַרְמְנוֹתֶיהָ, לְמַעַן תְּסַפְּרוּ לְדוֹר אַחֲרוֹן. כִּי זֶה אֱלֹהִים אֱלֹהֵינוּ עוֹלָם וָעֶד, הוּא יְנַהֲגֵנוּ עַל מוּת.',
    phonetic: 'Chir mizmor livné Kora\'h. Gadol Ado-naï ouméhoulal méod, béir Elo-hénou har kodsho. Yéfé nof méssos kol haarèts, har Tsione yarkhété tsafone, kiryat Mélekh rav. Elohim béarménotéha noda lémissgav. Ki hiné hamélakhim no\'adou, avrou ya\'hdav. Héma raou kène tamahou, nivhalou né\'hpazou. Réada a\'hazatam cham, \'hil kayoléda. Bérouah kadim téchabèr oniyot Tarchich. Kaachère chamanou kène rainou béir Ado-naï tsévaot, béir Elo-hénou, Elohim yékhonénéha ad olam séla. Diminou Elohim \'hasdékha békérèv héikhalékha. Kéchimékha Elohim kène téhilatékha al katsvé érèts, tsédék maléa yéminékha. Yisma\'h har Tsione, taguélna bénot Yéhouda, lémaan michpatékha. Sobou Tsione véhakifouha, sifrou migdaléha. Chitou libékhèm lé\'héilah, passégou arménotéha, lémaan téssapérou lédor a\'harone. Ki zé Elohim Elo-hénou olam vaèd, hou yénahaguénou al mout.' },

  // 2 = Mardi — Psaume 82
  { psalm: 'פ״ב', psalmPh: '82',
    text: 'מִזְמוֹר לְאָסָף. אֱלֹהִים נִצָּב בַּעֲדַת אֵל, בְּקֶרֶב אֱלֹהִים יִשְׁפֹּט. עַד מָתַי תִּשְׁפְּטוּ עָוֶל, וּפְנֵי רְשָׁעִים תִּשְׂאוּ סֶלָה. שִׁפְטוּ דַל וְיָתוֹם, עָנִי וָרָשׁ הַצְדִּיקוּ. פַּלְּטוּ דַל וְאֶבְיוֹן, מִיַּד רְשָׁעִים הַצִּילוּ. לֹא יָדְעוּ וְלֹא יָבִינוּ, בַּחֲשֵׁכָה יִתְהַלָּכוּ, יִמּוֹטוּ כׇּל מוֹסְדֵי אָרֶץ. אֲנִי אָמַרְתִּי אֱלֹהִים אַתֶּם, וּבְנֵי עֶלְיוֹן כֻּלְּכֶם. אָכֵן כְּאָדָם תְּמוּתוּן, וּכְאַחַד הַשָּׂרִים תִּפֹּלוּ. קוּמָה אֱלֹהִים שׇׁפְטָה הָאָרֶץ, כִּי אַתָּה תִנְחַל בְּכׇל הַגּוֹיִם.',
    phonetic: 'Mizmor léAssaf. Elohim nitsav baadath El, békérèv Elohim yichpot. Ad mataï tichpétou avèl, oufné récha\'im tisséou séla. Chiftou dal véyatom, ani varach hatsdikou. Palétou dal véévyone, miyad récha\'im hatssiilou. Lo yadou vélo yavinou, ba\'hachékha yithalakhou, yimotou kol mosdé arèts. Ani amarti Elohim atèm, ouvné Elyione koulkhèm. Akhène kéadam témoutoun, oukhé a\'had hassarim tipolou. Kouma Elohim chofta haarèts, ki ata tin\'hal békhol hagoyim.' },

  // 3 = Mercredi — Psaume 94
  { psalm: 'צ״ד', psalmPh: '94',
    text: 'אֵל נְקָמוֹת יְיָ, אֵל נְקָמוֹת הוֹפִיעַ. הִנָּשֵׂא שֹׁפֵט הָאָרֶץ, הָשֵׁב גְּמוּל עַל גֵּאִים. עַד מָתַי רְשָׁעִים יְיָ, עַד מָתַי רְשָׁעִים יַעֲלֹזוּ. יַבִּיעוּ יְדַבְּרוּ עָתָק, יִתְאַמְּרוּ כׇּל פֹּעֲלֵי אָוֶן. עַמְּךָ יְיָ יְדַכְּאוּ, וְנַחֲלָתְךָ יְעַנּוּ. אַלְמָנָה וְגֵר יַהֲרֹגוּ, וִיתוֹמִים יְרַצֵּחוּ. וַיֹּאמְרוּ לֹא יִרְאֶה יָהּ, וְלֹא יָבִין אֱלֹהֵי יַעֲקֹב. בִּינוּ בֹּעֲרִים בָּעָם, וּכְסִילִים מָתַי תַּשְׂכִּילוּ. הֲנֹטַע אֹזֶן הֲלֹא יִשְׁמָע, אִם יֹצֵר עַיִן הֲלֹא יַבִּיט. הֲיֹסֵר גּוֹיִם הֲלֹא יוֹכִיחַ, הַמְלַמֵּד אָדָם דָּעַת. יְיָ יֹדֵעַ מַחְשְׁבוֹת אָדָם, כִּי הֵמָּה הָבֶל. אַשְׁרֵי הַגֶּבֶר אֲשֶׁר תְּיַסְּרֶנּוּ יָהּ, וּמִתּוֹרָתְךָ תְלַמְּדֶנּוּ. לְהַשְׁקִיט לוֹ מִימֵי רָע, עַד יִכָּרֶה לָרָשָׁע שָׁחַת. כִּי לֹא יִטֹּשׁ יְיָ עַמּוֹ, וְנַחֲלָתוֹ לֹא יַעֲזֹב. כִּי עַד צֶדֶק יָשׁוּב מִשְׁפָּט, וְאַחֲרָיו כׇּל יִשְׁרֵי לֵב. מִי יָקוּם לִי עִם מְרֵעִים, מִי יִתְיַצֵּב לִי עִם פֹּעֲלֵי אָוֶן. לוּלֵי יְיָ עֶזְרָתָה לִי, כִּמְעַט שָׁכְנָה דוּמָה נַפְשִׁי. אִם אָמַרְתִּי מָטָה רַגְלִי, חַסְדְּךָ יְיָ יִסְעָדֵנִי. בְּרֹב שַׂרְעַפַּי בְּקִרְבִּי, תַּנְחוּמֶיךָ יְשַׁעַשְׁעוּ נַפְשִׁי. הַיְחׇבְרְךָ כִּסֵּא הַוּוֹת, יֹצֵר עָמָל עֲלֵי חֹק. יָגוֹדּוּ עַל נֶפֶשׁ צַדִּיק, וְדָם נָקִי יַרְשִׁיעוּ. וַיְהִי יְיָ לִי לְמִשְׂגָּב, וֵאלֹהַי לְצוּר מַחְסִי. וַיָּשֶׁב עֲלֵיהֶם אֶת אוֹנָם, וּבְרָעָתָם יַצְמִיתֵם, יַצְמִיתֵם יְיָ אֱלֹהֵינוּ.',
    phonetic: 'El nékamot Ado-naï, El nékamot hofia. Hinassé chofète haarèts, hachèv guémoul al guéim. Ad mataï récha\'im Ado-naï, ad mataï récha\'im yaalozou. Yabi\'ou yédabérou atak, yitamérou kol po\'alé avène. Amékha Ado-naï yédakhéou, véna\'halatékha yéanou. Almana véguer yaharogou, vitomim yératséhou. Vayomrou lo yiré Ya, vélo yavine Elo-hé Yaakov. Binou bo\'arim baam, oukhsilim mataï taskilou. Hanota ozène halo yichma, im yotsèr ayine halo yabit. Hayossèr goyim halo yokhia\'h, hamlamèd adam daat. Ado-naï yodéa ma\'hchévot adam, ki héma havèl. Achré haguévèr achère téyassèrénou Ya, oumiToratékha télamédénou. Léhachkit lo mimé ra, ad yikaré larcha chah\'at. Ki lo yitoch Ado-naï amo, véna\'halato lo yaazov. Ki ad tsédèk yachouv michpat, véa\'harav kol yichré lèv. Mi yakoum li im méréim, mi yityatsèv li im po\'alé avène. Loulé Ado-naï èzrata li, kimat chakhna douma nafchi. Im amarti mata ragli, \'hasdékha Ado-naï yissadéni. Bérov sar\'apaï békirbi, tan\'houmékha yécha\'achou nafchi. Hayé\'havérkha kissé havot, yotsèr amal alé \'hok. Yagoudou al néfèch tsadik, védam naki yarchiyou. Vayéhi Ado-naï li lémissgav, vElo-haï létsour ma\'hassi. Vayachèv aléhèm ète onam, ouvra\'atam yatsmitèm, yatsmitèm Ado-naï Elo-hénou.' },

  // 4 = Jeudi — Psaume 81
  { psalm: 'פ״א', psalmPh: '81',
    text: 'לַמְנַצֵּחַ עַל הַגִּתִּית לְאָסָף. הַרְנִינוּ לֵאלֹהִים עוּזֵּנוּ, הָרִיעוּ לֵאלֹהֵי יַעֲקֹב. שְׂאוּ זִמְרָה וּתְנוּ תֹף, כִּנּוֹר נָעִים עִם נָבֶל. תִּקְעוּ בַחֹדֶשׁ שׁוֹפָר, בַּכֵּסֶה לְיוֹם חַגֵּנוּ. כִּי חֹק לְיִשְׂרָאֵל הוּא, מִשְׁפָּט לֵאלֹהֵי יַעֲקֹב. עֵדוּת בִּיהוֹסֵף שָׂמוֹ, בְּצֵאתוֹ עַל אֶרֶץ מִצְרָיִם, שְׂפַת לֹא יָדַעְתִּי אֶשְׁמָע. הֲסִירוֹתִי מִסֵּבֶל שִׁכְמוֹ, כַּפָּיו מִדּוּד תַּעֲבֹרְנָה. בַּצָּרָה קָרָאתָ וָאֲחַלְּצֶךָ, אֶעֶנְךָ בְּסֵתֶר רַעַם, אֶבְחָנְךָ עַל מֵי מְרִיבָה סֶלָה. שְׁמַע עַמִּי וְאָעִידָה בָּךְ, יִשְׂרָאֵל אִם תִּשְׁמַע לִי. לֹא יִהְיֶה בְךָ אֵל זָר, וְלֹא תִשְׁתַּחֲוֶה לְאֵל נֵכָר. אָנֹכִי יְיָ אֱלֹהֶיךָ, הַמַּעַלְךָ מֵאֶרֶץ מִצְרָיִם, הַרְחֶב פִּיךָ וַאֲמַלְאֵהוּ. וְלֹא שָׁמַע עַמִּי לְקוֹלִי, וְיִשְׂרָאֵל לֹא אָבָה לִי. וָאֲשַׁלְּחֵהוּ בִּשְׁרִירוּת לִבָּם, יֵלְכוּ בְּמוֹעֲצוֹתֵיהֶם. לוּ עַמִּי שֹׁמֵעַ לִי, יִשְׂרָאֵל בִּדְרָכַי יְהַלֵּכוּ. כִּמְעַט אוֹיְבֵיהֶם אַכְנִיעַ, וְעַל צָרֵיהֶם אָשִׁיב יָדִי. מְשַׂנְאֵי יְיָ יְכַחֲשׁוּ לוֹ, וִיהִי עִתָּם לְעוֹלָם. וַיַּאֲכִילֵהוּ מֵחֵלֶב חִטָּה, וּמִצּוּר דְּבַשׁ אַשְׂבִּיעֶךָ.',
    phonetic: 'Lamnatséa\'h al haguitit léAssaf. Harninoù lElo-him ouzénou, hari\'ou lElo-hé Yaakov. Séou zimra outénou tof, kinor na\'im im navèl. Tikou va\'hodèch chofar, bakéssé léyom \'haguénou. Ki \'hok léIsraël hou, michpat lElo-hé Yaakov. Èdout biYhossef samo, bétséto al érèts Mitsraïm, sfat lo yadati èchma. Hasiroti misévèl chikhmo, kapav midoud taavorna. Batsara karata va a\'halétsékha, èèn\'kha béssétèr raam, èv\'hanékha al mé mériva séla. Chéma ami véa\'ida bakh, Israël im tichma li. Lo yihyé békha el zar, vélo tichta\'havé léel nékhar. Anokhi Ado-naï Elo-hékha, hamaalékha méérèts Mitsraïm, har\'hèv pikha va amaléhou. Vélo chama ami lékoli, véIsraël lo ava li. Va achalé\'hou bichrirot libam, yélkhou bémoatsotéhèm. Lou ami choméa li, Israël bidrakhay yéhalékou. Kimat oyvéhèm akhnia, véal tsaréhèm achiv yadi. Méssané Ado-naï yékha\'hachou lo, vihi itam léolam. Vaya\'akhiléhou mé\'hélèv \'hita, oumitsour dvach asbiékha.' },

  // 5 = Vendredi — Psaume 93
  { psalm: 'צ״ג', psalmPh: '93',
    text: 'יְיָ מָלָךְ גֵּאוּת לָבֵשׁ, לָבֵשׁ יְיָ עֹז הִתְאַזָּר, אַף תִּכּוֹן תֵּבֵל בַּל תִּמּוֹט. נָכוֹן כִּסְאֲךָ מֵאָז, מֵעוֹלָם אָתָּה. נָשְׂאוּ נְהָרוֹת יְיָ, נָשְׂאוּ נְהָרוֹת קוֹלָם, יִשְׂאוּ נְהָרוֹת דׇּכְיָם. מִקֹּלוֹת מַיִם רַבִּים, אַדִּירִים מִשְׁבְּרֵי יָם, אַדִּיר בַּמָּרוֹם יְיָ. עֵדֹתֶיךָ נֶאֶמְנוּ מְאֹד, לְבֵיתְךָ נָאֲוָה קֹדֶשׁ, יְיָ לְאֹרֶךְ יָמִים.',
    phonetic: 'Ado-naï malakh guéout lavèch, lavèch Ado-naï oz hitazar, af tikone tévèl bal timot. Nakhone kissaakha méaz, méolam ata. Nasséou néharot Ado-naï, nasséou néharot kolam, yisséou néharot dokhyam. Mikolot mayim rabim, adirim michbéré yam, adir bamarom Ado-naï. Èdotékha nééménou méod, lévètkha naava kodèch, Ado-naï léorèkh yamim.' },

  // 6 = Chabbat — Psaume 92
  { psalm: 'צ״ב', psalmPh: '92',
    text: 'מִזְמוֹר שִׁיר לְיוֹם הַשַּׁבָּת. טוֹב לְהֹדוֹת לַיְיָ, וּלְזַמֵּר לְשִׁמְךָ עֶלְיוֹן. לְהַגִּיד בַּבֹּקֶר חַסְדֶּךָ, וֶאֱמוּנָתְךָ בַּלֵּילוֹת. עֲלֵי עָשׂוֹר וַעֲלֵי נָבֶל, עֲלֵי הִגָּיוֹן בְּכִנּוֹר. כִּי שִׂמַּחְתַּנִי יְיָ בְּפׇעֳלֶךָ, בְּמַעֲשֵׂי יָדֶיךָ אֲרַנֵּן. מַה גָּדְלוּ מַעֲשֶׂיךָ יְיָ, מְאֹד עָמְקוּ מַחְשְׁבֹתֶיךָ. אִישׁ בַּעַר לֹא יֵדָע, וּכְסִיל לֹא יָבִין אֶת זֹאת. בִּפְרֹחַ רְשָׁעִים כְּמוֹ עֵשֶׂב, וַיָּצִיצוּ כׇּל פֹּעֲלֵי אָוֶן, לְהִשָּׁמְדָם עֲדֵי עַד. וְאַתָּה מָרוֹם לְעֹלָם יְיָ. כִּי הִנֵּה אֹיְבֶיךָ יְיָ, כִּי הִנֵּה אֹיְבֶיךָ יֹאבֵדוּ, יִתְפָּרְדוּ כׇּל פֹּעֲלֵי אָוֶן. וַתָּרֶם כִּרְאֵים קַרְנִי, בַּלֹּתִי בְּשֶׁמֶן רַעֲנָן. וַתַּבֵּט עֵינִי בְּשׁוּרָי, בַּקָּמִים עָלַי מְרֵעִים, תִּשְׁמַעְנָה אׇזְנָי. צַדִּיק כַּתָּמָר יִפְרָח, כְּאֶרֶז בַּלְּבָנוֹן יִשְׂגֶּה. שְׁתוּלִים בְּבֵית יְיָ, בְּחַצְרוֹת אֱלֹהֵינוּ יַפְרִיחוּ. עוֹד יְנוּבוּן בְּשֵׂיבָה, דְּשֵׁנִים וְרַעֲנַנִּים יִהְיוּ. לְהַגִּיד כִּי יָשָׁר יְיָ, צוּרִי וְלֹא עַוְלָתָה בּוֹ.',
    phonetic: 'Mizmor chir léyom haChabat. Tov léhodot lAdo-naï, oulézamèr léchimékha Elyione. Léhaguid baboker \'hasdékha, véémounatékha balélot. Alé assor vavalé navèl, alé higayone békhinnor. Ki sima\'htani Ado-naï béfoalékha, bémaassé yadékha aranène. Ma gadlou maassékha Ado-naï, méod amkou ma\'hchévotékha. Ich baar lo yéda, oukhsil lo yavine ète zot. Bifro\'ah récha\'im kémo éssèv, vayatsitsou kol po\'alé avène, léhichamédam adé ad. Véata marom léolam Ado-naï. Ki hiné oyvékha Ado-naï, ki hiné oyvékha yovédou, yitparédo u kol po\'alé avène. Vatarèm kiréim karni, baloti béchémène raanane. Vatabèt èni béchouraï, bakamim alaï méréim, tichmaéna oznaï. Tsadik katamar yifra\'h, kéérèz balévanone yissgué. Chtoulim bévèt Ado-naï, bé\'hatsrot Elo-hénou yafri\'hou. Od yénouvoun bésséva, dchénim véraananim yihyou. Léhaguid ki yachar Ado-naï, tsouri vélo avlata bo.' }
];

function patchShirYom(sections) {
  for (var i = 0; i < sections.length; i++) {
    if (sections[i].id === 'shir-yom') {
      var dow = new Date().getDay();
      var info = SHIR_YOM_DATA[dow];
      var dayHe = SHIR_YOM_DAYS[dow];
      var dayPh = SHIR_YOM_DAYS_PH[dow];
      if (dow === 6) {
        // Chabbat — intro differente
        sections[i].text = 'הַיּוֹם יוֹם ' + dayHe + ', שֶׁבּוֹ הָיוּ הַלְוִיִּם אוֹמְרִים בְּבֵית הַמִּקְדָּשׁ:\n\n— מִזְמוֹר ' + info.psalm + ' —\n\n' + info.text;
        sections[i].phonetic = 'Hayom yom ' + dayPh + ', chébo hayou haléviyim omrim bévèt hamikdach :\n\n— Mizmor ' + info.psalmPh + ' —\n\n' + info.phonetic;
      } else {
        sections[i].text = 'הַיּוֹם יוֹם ' + dayHe + ' בַּשַּׁבָּת, שֶׁבּוֹ הָיוּ הַלְוִיִּם אוֹמְרִים בְּבֵית הַמִּקְדָּשׁ:\n\n— מִזְמוֹר ' + info.psalm + ' —\n\n' + info.text;
        sections[i].phonetic = 'Hayom yom ' + dayPh + ' bachabat, chébo hayou haléviyim omrim bévèt hamikdach :\n\n— Mizmor ' + info.psalmPh + ' —\n\n' + info.phonetic;
      }
      break;
    }
  }
}

// ── Logique date hébraïque (utilise gregToHebrew de app.js) ───────────────
var HEB_MONTHS_HE = {1:'תשרי',2:'חשון',3:'כסלו',4:'טבת',5:'שבט',6:'אדר א׳',7:'אדר ב׳',8:'ניסן',9:'אייר',10:'סיון',11:'תמוז',12:'אב',13:'אלול'};
var HEB_MONTHS_FR = {1:'Tichri',2:'Hechvan',3:'Kislev',4:'Tevet',5:'Chevat',6:'Adar I',7:'Adar II',8:'Nissan',9:'Iyar',10:'Sivan',11:'Tamouz',12:'Av',13:'Eloul'};

function _hebYear(hy) {
  var t = hy % 1000;
  var h = Math.floor(t / 100);
  var d = t % 100;
  var gim = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
  var yod = ['','י','כ','ל','מ','נ','ס','ע','פ','צ'];
  var mea = ['','ק','ר','ש','ת','תק','תר','תש','תת','תתק'];
  var s = 'ה׳' + mea[h];
  if (d === 15) s += 'ט״ו';
  else if (d === 16) s += 'ט״ז';
  else if (d > 10) s += yod[Math.floor(d/10)] + '״' + gim[d%10];
  else if (d === 10) s += '״י';
  else s += '״' + gim[d];
  return s;
}

function _gematriaDay(n) {
  var gim = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
  var yod = ['','י','כ','ל'];
  if (n === 15) return 'ט״ו';
  if (n === 16) return 'ט״ז';
  if (n >= 10) return yod[Math.floor(n/10)] + '״' + gim[n%10];
  return gim[n];
}

function getHDate() {
  var d = new Date();
  var dayOfWeek = d.getDay();
  var heb = gregToHebrew(d.getFullYear(), d.getMonth()+1, d.getDate());
  var hm = heb.hm;
  var hd = heb.hd;
  var isShabbat = dayOfWeek === 6;
  var isRoshHodesh = hd === 1 || hd === 30;
  // Jours sans Tahanoun (calendrier Habad)
  var noTahanoun = false;
  if (isShabbat) noTahanoun = true;
  if (isRoshHodesh) noTahanoun = true;
  if (dayOfWeek === 5 && d.getHours() >= 13) noTahanoun = true; // Vendredi apres-midi (minha)
  // Tout le mois de Nissan
  if (hm === 8) noTahanoun = true;
  // Tishrei: du 1 au 13 (Roch Hachana, jours entre RH et YK, YK, et veilles)
  // Souccot, Chemini Atseret, Simhat Torah: 15-23 Tishrei
  if (hm === 1 && (hd <= 13 || hd >= 15)) noTahanoun = true;
  // Hanoucca: 25 Kislev - 2 Tevet
  if (hm === 3 && hd >= 25) noTahanoun = true;
  if (hm === 4 && hd <= 2) noTahanoun = true;
  // Tou Bichvat
  if (hm === 5 && hd === 15) noTahanoun = true;
  // Pourim et Chouchane Pourim: 14-15 Adar (ou Adar II si bissextile)
  if (hm === 6 && (hd === 14 || hd === 15)) noTahanoun = true;
  if (hm === 7 && (hd === 14 || hd === 15)) noTahanoun = true;
  // Pourim Katan: 14-15 Adar I (annee bissextile)
  // Lag BaOmer: 18 Iyyar
  if (hm === 9 && hd === 18) noTahanoun = true;
  // Yom HaAtsmaout: 5 Iyyar (approx)
  if (hm === 9 && hd === 5) noTahanoun = true;
  // Chavouot: 6-7 Sivan
  if (hm === 10 && (hd === 6 || hd === 7)) noTahanoun = true;
  // Tou BeAv: 15 Av
  if (hm === 12 && hd === 15) noTahanoun = true;
  // Erev fetes: pas tahanoun a minha la veille
  // 14 Tishrei (erev Souccot), 29 Elul (erev RH)
  if (hm === 1 && hd === 14) noTahanoun = true;
  if (hm === 13 && hd === 29) noTahanoun = true;
  // Erev Chavouot
  if (hm === 10 && hd === 5) noTahanoun = true;
  // Isrou Hag
  if (hm === 8 && hd === 22) noTahanoun = true; // Isrou Hag Pessah
  if (hm === 10 && hd === 8) noTahanoun = true; // Isrou Hag Chavouot
  if (hm === 1 && hd === 24) noTahanoun = true; // Isrou Hag Souccot

  var monthNameHe = HEB_MONTHS_HE[hm] || '';
  if (hm === 6 && !_hyyIsLeap(heb.hy)) monthNameHe = 'אדר';
  var labelHe = _gematriaDay(hd) + ' ' + monthNameHe + ' ' + _hebYear(heb.hy);

  var monthNameFr = HEB_MONTHS_FR[hm] || '';
  if (hm === 6 && !_hyyIsLeap(heb.hy)) monthNameFr = 'Adar';
  var labelFr = hd + ' ' + monthNameFr + ' ' + heb.hy;

  return {
    isRoshHodesh: isRoshHodesh,
    isTahnounDay: !noTahanoun,
    isShabbat:    isShabbat,
    label:        labelHe,
    labelFr:      labelFr,
    hm: hm,
    hd: hd,
  };
}

function filterSections(sections, hdate) {
  return sections.filter(function(s) {
    if (s.male_only && state.isFemale) return false;
    if (s.nusach_only && s.nusach_only !== state.nusach) return false;
    if (s.always)      return true;
    if (s.rosh_hodesh) return hdate.isRoshHodesh;
    if (s.tahnoun_day) return hdate.isTahnounDay;
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

    /* Header sticky — tout en un bloc */
    '.ss-header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,0.96);',
    '  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);',
    '  border-bottom: 1px solid #ececec; padding: 8px 12px 0; }',

    /* Row 1 : books (left/center) + controls (right) */
    '.ss-header-top { display:flex; align-items:center; gap:6px; margin-bottom:4px; padding:0 2px; }',
    '.ss-header-center { display:flex; align-items:center; justify-content:center; gap:8px; flex:1; min-width:0; }',
    '.ss-header-right { display:flex; flex-direction:column; align-items:center; flex-shrink:0; width:105px; }',
    '.ss-header-right-block { display:flex; flex-direction:column; background:#f0f0f0; border-radius:10px; padding:3px; gap:1px; align-items:stretch; width:100%; box-sizing:border-box; }',
    '.ss-header-right-block .ss-lang-btn { padding:4px 8px; border-radius:7px; border:none; background:transparent; font-size:10px; font-weight:600; cursor:pointer; transition:all .25s; color:#999; white-space:nowrap; text-align:center; }',
    '.ss-header-right-block .ss-lang-btn.active { background:#fff; color:#333; box-shadow:0 1px 4px rgba(0,0,0,.1); }',
    '.ss-header-right-block .ss-toggle-inline { display:flex; align-items:center; justify-content:center; gap:4px; padding:4px 8px; border-radius:7px; border:none; background:transparent; font-size:10px; font-weight:500; color:#555; cursor:pointer; transition:all .25s; }',
    '.ss-header-right-block .ss-toggle-inline.active { background:#fff; color:#333; box-shadow:0 1px 4px rgba(0,0,0,.1); }',
    '.ss-toggle-inline .ss-toggle-knob { width:24px; height:14px; border-radius:7px; background:#e0e0e0; position:relative; flex-shrink:0; transition:background .2s; }',
    '.ss-toggle-inline.active .ss-toggle-knob { background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); }',
    '.ss-toggle-inline .ss-toggle-dot { position:absolute; top:2px; left:2px; width:10px; height:10px; border-radius:50%; background:#fff; transition:left .2s; box-shadow:0 1px 2px rgba(0,0,0,.2); }',
    '.ss-toggle-inline.active .ss-toggle-dot { left:calc(100% - 12px); }',
    '.ss-toggle-inline .ss-fem-label { transition:opacity .3s; }',
    '.ss-compass-btn { width:28px; height:28px; border-radius:50%; border:1.5px solid #e0e0e0;',
    '  background:#fff; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:0; position:relative; }',
    '.ss-compass-btn svg { width:18px; height:18px; }',
    '.ss-hdate-inline { font-family:"Frank Ruhl Libre",serif; font-size:12px; font-weight:600; color:#888; text-align:center; width:100%; margin-top:2px; }',

    /* Lang switcher vertical */
    '.ss-lang-switcher { display:flex; flex-direction:column; background:#f0f0f0; border-radius:8px; padding:2px; gap:1px; }',
    '.ss-lang-btn { padding:4px 8px; border-radius:6px; border:none; background:transparent;',
    '  font-size:10px; font-weight:600; cursor:pointer; transition:all .25s; color:#999; white-space:nowrap; }',
    '.ss-lang-btn.active { background:#fff; color:#333; box-shadow:0 1px 4px rgba(0,0,0,.1); }',

    /* Banner hero (comme le banner Tefila) */
    '.ss-hero { position:relative; width:calc(100% - 32px); height:150px; overflow:hidden; margin:16px auto 0; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.12); }',
    '.ss-hero img { width:100%; height:100%; object-fit:cover; object-position:center 30%; border-radius:16px; }',
    '.ss-hero-overlay { position:absolute; inset:0; background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0) 100%); border-radius:16px; }',
    '.ss-hero-back { position:absolute; top:12px; left:12px; z-index:2; background:rgba(0,0,0,0.35); border:none; color:#fff; font-size:20px; width:36px; height:36px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); }',
    '.ss-hero-text-bottom { position:absolute; bottom:12px; left:0; right:0; z-index:1; text-align:center; }',
    '.ss-hero-title { font-size:22px; font-weight:800; color:#fff; text-shadow:0 1px 6px rgba(0,0,0,0.6); }',
    /* Swipe hint arrows */
    '.ss-swipe-hint { position:absolute; top:50%; z-index:3; transform:translateY(-50%); color:rgba(255,255,255,0.8); font-size:18px; opacity:0; pointer-events:none; }',
    '.ss-swipe-hint-left { left:10px; animation:ssSwipeLeft 2.5s ease-in-out 1.5s 2; }',
    '.ss-swipe-hint-right { right:10px; animation:ssSwipeRight 2.5s ease-in-out 1.5s 2; }',
    '@keyframes ssSwipeLeft { 0%{opacity:0;transform:translateY(-50%) translateX(0)} 20%{opacity:0.9} 50%{opacity:0.9;transform:translateY(-50%) translateX(-8px)} 80%{opacity:0} 100%{opacity:0;transform:translateY(-50%) translateX(0)} }',
    '@keyframes ssSwipeRight { 0%{opacity:0;transform:translateY(-50%) translateX(0)} 20%{opacity:0.9} 50%{opacity:0.9;transform:translateY(-50%) translateX(8px)} 80%{opacity:0} 100%{opacity:0;transform:translateY(-50%) translateX(0)} }',
    /* Dot indicators */
    '.ss-hero-dots { position:absolute; bottom:36px; left:0; right:0; z-index:2; display:flex; justify-content:center; gap:6px; }',
    '.ss-hero-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.4); }',
    '.ss-hero-dot.active { background:#fff; width:18px; border-radius:3px; }',

    /* Nusach cards (inside header-center) */
    '.ss-nusach-card { display:flex; align-items:center; justify-content:center; padding:4px; border-radius:10px; cursor:pointer;',
    '  border:2px solid transparent; background:#fff; transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,0.08); }',
    '.ss-nusach-card.active { border-color:#833ab4; box-shadow:0 2px 10px rgba(131,58,180,0.2); }',
    '.ss-nusach-card-img { width:60px; height:80px; border-radius:6px; object-fit:cover; }',
    '.ss-nusach { padding:5px 14px; border-radius:100px; font-family:"Frank Ruhl Libre",serif;',
    '  font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; border:1.5px solid #e5e5e5; background:#fff; color:#555; }',
    '.ss-nusach.active { border-color:transparent; color:#fff; background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  box-shadow:0 2px 8px rgba(131,58,180,.22); }',
    '.ss-toggle { display:flex; align-items:center; gap:4px; padding:4px 6px 4px 5px;',
    '  border-radius:100px; cursor:pointer; transition:all .25s; border:1.5px solid #e0e0e0;',
    '  background:#fff; font-size:10px; font-weight:500; color:#555; width:72px; box-sizing:border-box; }',
    '.ss-toggle.active { border-color:transparent; color:#fff;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); }',
    '.ss-toggle-knob { width:24px; height:14px; border-radius:7px; background:#e0e0e0;',
    '  position:relative; flex-shrink:0; transition:background .2s; }',
    '.ss-toggle.active .ss-toggle-knob { background:rgba(255,255,255,.35); }',
    '.ss-toggle-dot { position:absolute; top:2px; left:2px; width:10px; height:10px;',
    '  border-radius:50%; background:#fff; transition:left .2s; box-shadow:0 1px 2px rgba(0,0,0,.2); }',
    '.ss-toggle.active .ss-toggle-dot { left:calc(100% - 12px); }',
    '.ss-toggle-wrap { display:flex; flex-direction:column; align-items:center; gap:2px; }',
    '.ss-toggle-sub { font-size:9px; color:#999; font-weight:500; }',

    /* Row 3 : 4 tabs (3 prieres + info jour) */
    '.ss-tabs { display:flex; gap:6px; margin-bottom:6px; }',
    '.ss-tab { flex:1; padding:7px 4px; border-radius:10px; cursor:pointer; border:1px solid #e8e8e8;',
    '  background:#fff; text-align:center; transition:all .2s; }',
    '.ss-tab.active { border-color:transparent;',
    '  background: linear-gradient(white,white) padding-box,',
    '    linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045) border-box; }',
    '.ss-tab-icon { font-size:16px; }',
    '.ss-tab-he { font-family:"Frank Ruhl Libre",serif; font-size:11px; font-weight:500; color:#888; }',
    '.ss-tab.active .ss-tab-he { font-weight:700; background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }',
    '.ss-tab.ss-tab-img { padding:0; overflow:hidden; position:relative; min-height:60px;',
    '  background-size:cover; background-position:center; border:none; }',
    '.ss-tab.ss-tab-img .ss-tab-icon { display:none; }',
    '.ss-tab.ss-tab-img .ss-tab-label { position:absolute; bottom:0; left:0; right:0;',
    '  padding:4px 0; color:#fff; font-size:12px; font-weight:700; text-align:center;',
    '  background:linear-gradient(transparent, rgba(0,0,0,0.6)); }',
    '.ss-tab.ss-tab-img.active { border:2px solid transparent;',
    '  background-size:cover; background-position:center;',
    '  border-image: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045) 1; border-radius:10px; }',
    '.ss-tab.ss-tab-img.active { outline:2px solid #833ab4; outline-offset:-2px; }',
    '.ss-tab-info { flex:1.2; padding:7px 6px; border-radius:10px; text-align:center;',
    '  font-size:10px; line-height:1.4; font-weight:600; border:1.5px solid transparent;',
    '  background: linear-gradient(white,white) padding-box,',
    '    linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045) border-box; color:#833ab4; }',
    '.ss-tab-info.has-alert { color:#fff;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  box-shadow:0 2px 10px rgba(131,58,180,.3); animation: ssPulse 2s ease-in-out infinite; }',
    '@keyframes ssPulse { 0%,100%{box-shadow:0 2px 10px rgba(131,58,180,.3)} 50%{box-shadow:0 2px 18px rgba(131,58,180,.5)} }',

    /* Row 4 : barre sections (dans le header => sticky ensemble) */
    '.ss-sections-bar { overflow-x:auto; overflow-y:hidden; padding:6px 0 8px;',
    '  display:flex; scrollbar-width:none; -ms-overflow-style:none; white-space:nowrap; }',
    '.ss-sections-bar::-webkit-scrollbar { display:none; }',
    '.ss-sections-bar-inner { display:flex; gap:6px; padding:0 12px; }',
    '.ss-sec-pill { padding:6px 14px; border-radius:100px; border:none; white-space:nowrap;',
    '  font-family:"Frank Ruhl Libre",serif; font-size:13px; font-weight:500;',
    '  cursor:pointer; transition:all .25s; background:#f2f2f2; color:#888; flex-shrink:0; }',
    '.ss-sec-pill.active { color:#fff;',
    '  background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  box-shadow:0 2px 8px rgba(131,58,180,.25); }',

    /* Contenu continu plein ecran */
    '.ss-content { padding:0 16px 100px; touch-action:pan-y; overflow-x:hidden; }',
    '.ss-section { padding-top:20px; }',
    '.ss-section-title { font-family:"Frank Ruhl Libre",serif; font-size:18px; font-weight:700;',
    '  padding:8px 0; margin-bottom:6px; color:#999;',
    '  border-bottom:1px solid #f0f0f0; }',
    '.ss-section-title.active-title { background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);',
    '  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }',
    '.ss-section-body { font-family:"Frank Ruhl Libre",serif; direction:rtl;',
    '  font-size:28px; line-height:2.2; color:#222; white-space:pre-line; }',
    '.ss-section-body.ss-phonetic-body { direction:ltr; font-family:system-ui,sans-serif;',
    '  font-size:24px; line-height:1.9; color:#333; }',

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
  var smoothBearing = null;
  var SMOOTHING = 0.15; // filtre passe-bas (0 = pas de changement, 1 = brut)
  function angleDiff(a, b) {
    var d = ((b - a + 540) % 360) - 180;
    return d;
  }
  function handler(e) {
    var raw = null;
    if (e.webkitCompassHeading != null) raw = e.webkitCompassHeading;
    else if (e.alpha != null) raw = (360 - e.alpha) % 360;
    if (raw == null) return;
    if (smoothBearing == null) { smoothBearing = raw; }
    else { smoothBearing = (smoothBearing + angleDiff(smoothBearing, raw) * SMOOTHING + 360) % 360; }
    compassState.bearing = Math.round(smoothBearing);
    var needle = document.getElementById('ss-compass-needle');
    if (needle) {
      needle.style.transition = 'transform 0.3s ease-out';
      needle.style.transform = 'rotate(' + (113 - compassState.bearing) + 'deg)';
    }
    var info = document.getElementById('ss-compass-info');
    if (info) {
      info.innerHTML = 'Cap : <span class="ss-grad-text">' + compassState.bearing + '°</span> \u2192 J\u00e9rusalem : <span class="ss-grad-text">113\u00b0</span>';
    }
  }
  window.addEventListener('deviceorientationabsolute', handler, true);
  window.addEventListener('deviceorientation', handler, true);
}

// ── Traductions françaises des titres de sections ────────────────────────
var TITLE_FR = {
  'modeh': 'Je reconnais', 'netilat': 'Ablution des mains',
  'asher-yatzar': 'Asher Yatzar', 'elohai-neshama': 'Mon Dieu, l\'ame',
  'brachot': 'Benedictions du matin', 'tfilin': 'Pose des Tefilines',
  'psukei': 'Versets de louanges', 'birkot-shema': 'Benedictions du Chema',
  'shema': 'Lecture du Chema', 'amida': 'Amida (debout)',
  'hallel': 'Hallel', 'tahnoun': 'Supplications',
  'kaddish-half': 'Demi-Kaddich', 'ashrei-2': 'Achre (2e)',
  'uva': 'Et un sauveur viendra', 'aleinu': 'A nous de louer',
  'shir-yom': 'Cantique du jour', 'kaddish-yatom': 'Kaddich de l\'orphelin',
  'ashrei-m': 'Achre', 'amida-m': 'Amida (debout)',
  'tahnoun-m': 'Supplications', 'aleinu-m': 'A nous de louer',
  'kaddish-yatom-m': 'Kaddich de l\'orphelin',
  'barchu': 'Invocation', 'shema-a': 'Lecture du Chema',
  'amida-a': 'Amida (debout)', 'aleinu-a': 'A nous de louer',
  'kaddish-yatom-a': 'Kaddich de l\'orphelin'
};

// ── Helpers de langue ────────────────────────────────────────────────────
function sectionTitle(s) {
  if (state.lang === 'hebrew')   return (state.isFemale && s.titleFemale) ? s.titleFemale : s.title;
  if (state.lang === 'phonetic') return (state.isFemale && s.titlePhoneticFemale) ? s.titlePhoneticFemale : (s.titlePhonetic || s.title);
  return TITLE_FR[s.id] || s.titlePhonetic || s.title;
}
function tefilahLabel(t) {
  if (state.lang === 'hebrew')   return t.label;
  if (state.lang === 'phonetic') return t.labelPhonetic || t.sublabel;
  return t.labelFr || t.sublabel;
}
function nusachLabel(n) {
  if (state.lang === 'hebrew')   return n.label;
  if (state.lang === 'phonetic') return n.labelPhonetic || n.label;
  return n.labelFr || n.label;
}

// ── Labels multilingues pour les toggles ─────────────────────────────────
var TOGGLE_LABELS = {
  isFemale:  { hebrew: 'נשים', phonetic: 'Nachim', french: 'Femmes', sub: { hebrew: '', phonetic: 'Femme', french: '' } }
};

// ── Render helpers ─────────────────────────────────────────────────────────
function renderLangSwitcher() {
  var langs = [
    { id: 'hebrew',   label: 'עברית' },
    { id: 'phonetic', label: 'Phonetique' }
  ];
  return '<div class="ss-lang-switcher">' + langs.map(function(l) {
    return '<button class="ss-lang-btn' + (state.lang === l.id ? ' active' : '') + '" ' +
      'onclick="window.siddurSetLang(\'' + l.id + '\')">' + l.label + '</button>';
  }).join('') + '</div>';
}

function renderNusachim() {
  var images = {
    chabad: 'assets/tehilat-hachem-cover.webp',
    mizrach: 'assets/patah-eliyahou-cover.webp'
  };
  // Cartes nusachim uniquement (tehilat + patakh)
  return NUSACHIM.map(function(n) {
    var img = images[n.id] || '';
    return '<div class="ss-nusach-card' + (state.nusach === n.id ? ' active' : '') + '" ' +
      'onclick="window.siddurSetNusach(\'' + n.id + '\')">' +
      (img ? '<img class="ss-nusach-card-img" src="' + img + '" alt="' + n.labelPhonetic + '">' : '') +
      '</div>';
  }).join('');
}

// Ancien renderNusachim en mode pill (pour fallback si besoin)
function renderNusachimPills() {
  var images = {
    chabad: 'assets/tehilat-hachem-cover.webp',
    mizrach: 'assets/patah-eliyahou-cover.webp'
  };
  return NUSACHIM.map(function(n) {
    var img = images[n.id];
    var content = img
      ? '<img src="' + img + '" alt="' + n.labelPhonetic + '" style="height:28px;vertical-align:middle;border-radius:3px;">'
      : nusachLabel(n);
    return '<button class="ss-nusach' + (state.nusach === n.id ? ' active' : '') + '" ' +
      'onclick="window.siddurSetNusach(\'' + n.id + '\')">' + content + '</button>';
  }).join('');
}

function renderToggle(key) {
  var active = state[key];
  var labels = TOGGLE_LABELS[key];
  var label = labels ? labels[state.lang] || labels.hebrew : key;
  var sub = labels && labels.sub ? labels.sub[state.lang] || '' : '';
  return '<div class="ss-toggle-wrap"><button class="ss-toggle' + (active ? ' active' : '') + '" onclick="window.siddurToggle(\'' + key + '\')">' +
    '<div class="ss-toggle-knob"><div class="ss-toggle-dot"></div></div>' +
    label + '</button>' + (sub ? '<span class="ss-toggle-sub">' + sub + '</span>' : '') + '</div>';
}

function renderControlsBlock() {
  var langs = [
    { id: 'hebrew',   label: 'עברית' },
    { id: 'phonetic', label: 'Phonetique' }
  ];
  var langBtns = langs.map(function(l) {
    return '<button class="ss-lang-btn' + (state.lang === l.id ? ' active' : '') + '" ' +
      'onclick="window.siddurSetLang(\'' + l.id + '\')">' + l.label + '</button>';
  }).join('');
  var femLabel = TOGGLE_LABELS.isFemale;
  var femActive = state.isFemale;
  // En phonetique : afficher d'abord Nachim, puis Femme apres 2s (via timer dans siddurSetLang)
  var femText = state._showFemmeLabel ? 'Femme' : (femLabel[state.lang] || femLabel.hebrew);
  return '<div class="ss-header-right-block">' +
    langBtns +
    '<button class="ss-toggle-inline' + (femActive ? ' active' : '') + '" onclick="window.siddurToggle(\'isFemale\')">' +
    '<div class="ss-toggle-knob"><div class="ss-toggle-dot"></div></div>' +
    '<span class="ss-fem-label">' + femText + '</span></button>' +
    '</div>';
}

function renderTabs() {
  var showAll = state.tabsExpanded;
  return Object.keys(TEFILOT).map(function(key) {
    var t = TEFILOT[key];
    var isActive = state.tefilah === key;
    var hidden = !showAll && !isActive;
    if (isActive && !showAll) {
      // Onglet actif seul : masque car deja dans ss-row-nusach
      return '';
    }
    if (hidden) return '';
    // Mode expande : tous les onglets visibles
    if (t.image) {
      return '<button class="ss-tab ss-tab-img' + (isActive ? ' active' : '') + '" ' +
        'style="background-image:url(\'' + t.image + '\')" ' +
        'onclick="window.siddurSetTefilah(\'' + key + '\')">' +
        '<div class="ss-tab-label">' + t.labelPhonetic + '</div>' +
        '</button>';
    }
    return '<button class="ss-tab' + (isActive ? ' active' : '') + '" onclick="window.siddurSetTefilah(\'' + key + '\')">' +
      '<div class="ss-tab-icon">' + t.icon + '</div>' +
      '<div class="ss-tab-he">' + tefilahLabel(t) + '</div>' +
      '</button>';
  }).join('');
}

function renderBanner(hdate) {
  if (!hdate.isRoshHodesh && hdate.isTahnounDay) return '';
  var icon  = hdate.isRoshHodesh ? '🌙' : '✨';
  var titles = {
    rh:  { hebrew: 'ראש חודש — הלל מתווסף', phonetic: 'Roch \'Hodech — Hallel ajoute', french: 'Nouvelle lune — Hallel ajoute' },
    nt:  { hebrew: 'אין תחנון היום', phonetic: 'Ene Ta\'hanoun hayom', french: 'Pas de Ta\'hanoun aujourd\'hui' }
  };
  var k = hdate.isRoshHodesh ? 'rh' : 'nt';
  var title = titles[k][state.lang] || titles[k].hebrew;
  return '<div class="ss-banner">' +
    '<span style="font-size:18px">' + icon + '</span>' +
    '<div><div class="ss-banner-title">' + title + '</div></div></div>';
}

function renderSectionsBar(sections) {
  return '<div class="ss-sections-bar" id="ss-sections-bar"><div class="ss-sections-bar-inner">' +
    sections.map(function(s, i) {
      return '<button class="ss-sec-pill' + (i === 0 ? ' active' : '') + '" ' +
        'data-section="' + s.id + '" onclick="window.siddurScrollTo(\'' + s.id + '\')">' +
        sectionTitle(s) + '</button>';
    }).join('') + '</div></div>';
}

// ── Adaptations feminines du texte ─────────────────────────────────────────
// Applique TOUTES les variantes feminines a un texte de priere
// selon la section, la langue et le nusach.
//
// Differences homme/femme :
// 1. modeh -> modah (Moda Ani, Elohai Neshama, Leolam yehe adam) — les 2 nusahim
// 2. Brachot 3e : Habad = supprimer "shelo asani isha"
//                 Mizrah = remplacer par "she'asani kirtsono"
// 3. Mizrah seulement : goy -> goya, eved -> shifha
function applyFemaleText(txt, sectionId, isHebrew) {
  // 1. modeh -> modah (dans toutes les sections qui le contiennent)
  if (isHebrew) {
    txt = txt.replace(/מוֹדֶה אֲנִי/g, 'מוֹדָה אֲנִי');
    txt = txt.replace(/וּמוֹדֶה עַל/g, 'וּמוֹדָה עַל');
  } else {
    txt = txt.replace(/\b(M|m)od[\u00e8\u00e9] ani/g, function(m) { return m[0] === 'M' ? 'Moda ani' : 'moda ani'; });
    txt = txt.replace(/\b(O|o)umod[\u00e8\u00e9] al/g, function(m) { return m[0] === 'O' ? 'Oumoda al' : 'oumoda al'; });
  }

  // 2 & 3. Brachot : logique selon nusach
  if (sectionId === 'brachot') {
    if (isHebrew) {
      if (state.nusach === 'chabad') {
        // Habad : supprimer la ligne "shelo asani isha"
        txt = txt.replace(/[^\n]*שֶׁלֹּא עָשַׂנִי אִשָּׁה[^\n]*\n?/g, '');
      } else {
        // Mizrah : goy->goya, eved->shifha, isha->kirtsono
        txt = txt.replace('שֶׁלֹּא עָשַׂנִי גּוֹי', 'שֶׁלֹּא עָשַׂנִי גּוֹיָה');
        txt = txt.replace('שֶׁלֹּא עָשַׂנִי עָבֶד', 'שֶׁלֹּא עָשַׂנִי שִׁפְחָה');
        txt = txt.replace('שֶׁלֹּא עָשַׂנִי אִשָּׁה', 'שֶׁעָשַׂנִי כִּרְצוֹנוֹ');
        // Patakh : bracha #1 hanoten au lieu de asher natan
        txt = txt.replace('אֲשֶׁר נָתַן לַשֶּׂכְוִי', 'הַנּוֹתֵן לַשֶּׂכְוִי');
        // Patakh : Birkhot HaTorah "al divrei" au lieu de "laassok bedivrei"
        txt = txt.replace('לַעֲסוֹק בְּדִבְרֵי תוֹרָה', 'עַל דִּבְרֵי תוֹרָה');
        // Patakh : Birkat Kohanim avec intro et conclusion
        txt = txt.replace('יְבָרֶכְךָ יְיָ וְיִשְׁמְרֶךָ', 'וַיְדַבֵּר יְיָ אֶל מֹשֶׁה לֵּאמֹר. דַּבֵּר אֶל אַהֲרֹן וְאֶל בָּנָיו לֵאמֹר, כֹּה תְבָרְכוּ אֶת בְּנֵי יִשְׂרָאֵל, אָמוֹר לָהֶם.\nיְבָרֶכְךָ יְיָ וְיִשְׁמְרֶךָ');
        txt = txt.replace('וְיָשֵׂם לְךָ שָׁלוֹם.\n', 'וְיָשֵׂם לְךָ שָׁלוֹם.\nוְשָׂמוּ אֶת שְׁמִי עַל בְּנֵי יִשְׂרָאֵל, וַאֲנִי אֲבָרְכֵם.\n');
        // Patakh : Yehi Ratson version etendue
        txt = txt.replace(
          'שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ, וְדַבְּקֵנוּ בְּמִצְוֹתֶיךָ, וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא, וְלֹא לִידֵי עֲבֵרָה וְעָוֹן, וְלֹא לִידֵי נִסָּיוֹן, וְלֹא לִידֵי בִזָּיוֹן, וְאַל תַּשְׁלֶט בָּנוּ יֵצֶר הָרָע, וְהַרְחִיקֵנוּ מֵאָדָם רָע וּמֵחָבֵר רָע, וְדַבְּקֵנוּ בְּיֵצֶר הַטּוֹב וּבְמַעֲשִׂים טוֹבִים, וְכֹף אֶת יִצְרֵנוּ לְהִשְׁתַּעְבֶּד לָךְ, וּתְנֵנוּ הַיּוֹם וּבְכׇל יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כׇל רוֹאֵינוּ, וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים. בָּרוּךְ אַתָּה יְיָ, גּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל.',
          'שֶׁתַּצִּילֵנוּ הַיּוֹם וּבְכׇל יוֹם מֵעַזֵּי פָנִים וּמֵעַזּוּת פָּנִים, מֵאָדָם רָע, מֵאִשָּׁה רָעָה, מִיֵּצֶר רָע, מֵחָבֵר רָע, מִשָּׁכֵן רָע, מִפֶּגַע רָע, מֵעַיִן הָרָע, מִלָּשׁוֹן הָרָע, מִמַּלְשִׁינוּת, מֵעֵדוּת שֶׁקֶר, מִשִּׂנְאַת הַבְּרִיּוֹת, מֵעָלִילָה, מִמִּיתָה מְשֻׁנָּה, מֵחֳלָאִים רָעִים, מִמִּקְרִים רָעִים, מִדִּין קָשֶׁה וּמִבַּעַל דִּין קָשֶׁה, בֵּין שֶׁהוּא בֶּן בְּרִית וּבֵין שֶׁאֵינוֹ בֶּן בְּרִית, וּמִדִּינָהּ שֶׁל גֵּיהִנָּם.');
      }
    } else {
      if (state.nusach === 'chabad') {
        txt = txt.replace(/[^\n]*ch[^\n]*assani icha[^\n]*\n?/gi, '');
      } else {
        txt = txt.replace(/ch\u00e9lo assani go\u00ef/gi, 'ch\u00e9lo assani goya');
        txt = txt.replace(/ch\u00e9lo assani av\u00e8d/gi, 'ch\u00e9lo assani chif\'ha');
        txt = txt.replace(/ch\u00e9lo assani icha/gi, 'ch\u00e9assani kirtsono');
        // Patakh : bracha #1 hanot\u00e8ne au lieu de ach\u00e8re natane
        txt = txt.replace('ach\u00e8re natane lass\u00e9khvi', 'hanot\u00e8ne lass\u00e9khvi');
        // Patakh : Birkhot HaTorah "al divr\u00e9" au lieu de "laassok b\u00e9divr\u00e9"
        txt = txt.replace('laassok b\u00e9divr\u00e9\u00e9 Tora', 'al divr\u00e9 Tora');
        // Patakh : Birkat Kohanim avec intro et conclusion
        txt = txt.replace('Y\u00e9var\u00e8kh\u00e9kha Ado-na\u00ef v\u00e9yichm\u00e9r\u00e8kha', 'Vayedab\u00e8r Ado-na\u00ef \u00e8l Moch\u00e9 l\u00e9mor. Dab\u00e8r \u00e8l Aharone v\u00e9\u00e8l banav l\u00e9mor, ko t\u00e9var\u00e9khou \u00e8te b\u00e9n\u00e9 Isra\u00ebl, amor lah\u00e8m.\nY\u00e9var\u00e8kh\u00e9kha Ado-na\u00ef v\u00e9yichm\u00e9r\u00e8kha');
        txt = txt.replace('v\u00e9yass\u00e8m l\u00e9kha chalom.\n', 'v\u00e9yass\u00e8m l\u00e9kha chalom.\nV\u00e9samou \u00e8te ch\u00e9mi al b\u00e9n\u00e9 Isra\u00ebl, vaani avar\u00e8kh\u00e8m.\n');
        // Patakh : Yehi Ratson version \u00e9tendue
        txt = txt.replace(
          'ch\u00e9targuil\u00e9nou b\u00e9Torat\u00e8kha, v\u00e9dab\u00e9k\u00e9nou b\u00e9mitsvot\u00e8kha, v\u00e9al t\u00e9vi\u00e9nou lo lid\u00e9 \'h\u00e8t, v\u00e9lo lid\u00e9 av\u00e9ra v\u00e9avone, v\u00e9lo lid\u00e9 nissayone, v\u00e9lo lid\u00e9 vizayone, v\u00e9al tachl\u00e8t banou y\u00e9ts\u00e8r hara, v\u00e9har\'hik\u00e9nou m\u00e9adam ra oum\u00e9\'hav\u00e8r ra, v\u00e9dab\u00e9k\u00e9nou b\u00e9y\u00e9ts\u00e8r hatov ouv\u00e9maassim tovim, v\u00e9khof \u00e8te yitsr\u00e9nou l\u00e9hichtab\u00e8d lakh, out\u00e9n\u00e9nou hayom ouv\u00e9khol yom l\u00e9\'h\u00e8ne oul\u00e9\'h\u00e8ss\u00e8d oul\u00e9ra\'hamim b\u00e9\u00e8n\u00e8kha ouv\u00e9\u00e8n\u00e9 khol ro\u00e9nou, v\u00e9tigm\u00e9l\u00e9nou \'hassadim tovim. Baroukh ata Ado-na\u00ef, gom\u00e8l \'hassadim tovim l\u00e9amo Isra\u00ebl.',
          'ch\u00e9tatsi l\u00e9nou hayom ouv\u00e9khol yom m\u00e9azz\u00e9 fanim oum\u00e9azzoute panim, m\u00e9adam ra, m\u00e9icha raa, miy\u00e9ts\u00e8re ra, m\u00e9hav\u00e8re ra, michakh\u00e8ne ra, mip\u00e9ga ra, m\u00e9ayin hara, milachone hara, mimalchinout, m\u00e9\u00e9dout ch\u00e9k\u00e8re, missin\u00e9at habriryot, m\u00e9alila, mimmita m\u00e9chouna, m\u00e9\'holaim raim, mimmikrim raim, middin\u00e9 kach\u00e9 oumibaal din\u00e9 kach\u00e9, b\u00e9ine ch\u00e9hou b\u00e8ne b\u00e9rit ouv\u00e9ine ch\u00e9\u00e9no b\u00e8ne b\u00e9rit, oumidinah ch\u00e8l gu\u00e9h\u00e9nam.');
      }
    }
  }

  return txt;
}

function renderSections(sections) {
  var isHe = state.lang === 'hebrew';
  var fem = state.isFemale;
  return sections.map(function(s) {
    var displayTitle = sectionTitle(s);
    var titleDir = isHe ? 'rtl' : 'ltr';
    var bodyClass = 'ss-section-body';
    var bodyText = s.text;
    if (!isHe && s.phonetic) {
      bodyClass += ' ss-phonetic-body';
      bodyText = s.phonetic;
    }
    // Variantes feminines
    if (fem) {
      bodyText = applyFemaleText(bodyText, s.id, isHe);
    }
    return '<div class="ss-section" id="ss-sec-' + s.id + '">' +
      '<div class="ss-section-title" style="direction:' + titleDir + ';text-align:' + (isHe ? 'right' : 'left') + '">' + displayTitle + '</div>' +
      '<div class="' + bodyClass + '">' + bodyText + '</div>' +
      '</div>';
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

// ── Scroll spy : met à jour la pill active au scroll ─────────────────────
var _scrollSpyRaf = null;
function initScrollSpy() {
  if (_scrollSpyRaf) return; // deja actif
  function onScroll() {
    _scrollSpyRaf = requestAnimationFrame(function() {
      _scrollSpyRaf = null;
      var header = document.querySelector('.ss-header');
      if (!header) return;
      var offset = header.offsetHeight + 20;
      var secs = document.querySelectorAll('.ss-section');
      var activeId = null;
      secs.forEach(function(sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top <= offset) activeId = sec.id.replace('ss-sec-', '');
      });
      if (!activeId) return;
      var pills = document.querySelectorAll('.ss-sec-pill');
      var changed = false;
      pills.forEach(function(p) {
        var isActive = p.getAttribute('data-section') === activeId;
        if (isActive && !p.classList.contains('active')) changed = true;
        p.classList.toggle('active', isActive);
      });
      if (changed) {
        var ap = document.querySelector('.ss-sec-pill.active');
        if (ap) ap.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Render principal ───────────────────────────────────────────────────────
window.siddurRender = render;
function render() {
  var container = document.getElementById('siddur-smart-root');
  if (!container) return;

  // Auto-detect tefila selon heure
  var h = new Date().getHours();
  if (!state._tefilahManual) {
    if      (h >= 5  && h < 13) state.tefilah = 'shacharit';
    else if (h >= 13 && h < 19) state.tefilah = 'mincha';
    else                        state.tefilah = 'arvit';
  }

  var hdate    = getHDate();
  var tefilah  = TEFILOT[state.tefilah];
  var sections = filterSections(tefilah.sections, hdate);
  patchShirYom(sections);

  // Info du jour
  var isHe = state.lang === 'hebrew';
  var infoLines = [];
  // Roch Hodech => Yaale veYavo + Hallel
  if (hdate.isRoshHodesh) {
    infoLines.push(isHe ? '🌙 ר״ח' : '🌙 Roch Hodech');
    infoLines.push(isHe ? 'יעלה ויבוא + הלל' : 'Yaale veYavo + Hallel');
  }
  if (!hdate.isTahnounDay && !hdate.isRoshHodesh) {
    infoLines.push(isHe ? '✨ אין תחנון' : '✨ Pas de Ta\'hanoun');
  }
  if (hdate.isShabbat) {
    infoLines.push(isHe ? '🕯 שבת' : '🕯 Chabbat');
  }
  // Fetes avec Yaale veYavo (Hol Hamoed)
  var hm = hdate.hm; var hd = hdate.hd;
  var isHolHamoed = (hm === 8 && hd >= 16 && hd <= 20) || (hm === 1 && hd >= 16 && hd <= 21);
  if (isHolHamoed) {
    infoLines.push(isHe ? '🎪 חול המועד' : '🎪 Hol Hamoed');
    if (infoLines.indexOf(isHe ? 'יעלה ויבוא' : 'Yaale veYavo') === -1) {
      infoLines.push(isHe ? 'יעלה ויבוא' : 'Yaale veYavo');
    }
  }
  var hasAlert = infoLines.length > 0;
  var infoTab = '<div class="ss-tab-info' + (hasAlert ? ' has-alert' : '') + '">' +
    (hasAlert ? infoLines.join('<br>') : (isHe ? 'יום רגיל' : 'Jour normal')) +
    '</div>';

  // Banner hero avec l'image de la tefila
  var heroBanner = '';
  if (tefilah.image) {
    var tefilaKeys = Object.keys(TEFILOT);
    var tefilaIdx = tefilaKeys.indexOf(state.tefilah);
    var dots = tefilaKeys.map(function(k, i) {
      return '<div class="ss-hero-dot' + (i === tefilaIdx ? ' active' : '') + '"></div>';
    }).join('');
    var prevLabel = tefilaIdx > 0 ? TEFILOT[tefilaKeys[tefilaIdx - 1]].labelPhonetic : 'Tefila';
    var nextLabel = tefilaIdx < tefilaKeys.length - 1 ? TEFILOT[tefilaKeys[tefilaIdx + 1]].labelPhonetic : '';
    heroBanner = '<div class="ss-hero">' +
      '<img src="' + tefilah.image + '" alt="' + tefilah.labelPhonetic + '" style="object-position:' + (tefilah.imagePosition || 'center 30%') + '">' +
      '<div class="ss-hero-overlay"></div>' +
      '<div class="ss-swipe-hint ss-swipe-hint-left">&larr; ' + prevLabel + '</div>' +
      (nextLabel ? '<div class="ss-swipe-hint ss-swipe-hint-right">' + nextLabel + ' &rarr;</div>' : '') +
      '<div class="ss-hero-dots">' + dots + '</div>' +
      '<div class="ss-hero-text-bottom">' +
      '<div class="ss-hero-title">' + tefilah.labelPhonetic + '</div>' +
      '</div></div>';
  }

  container.innerHTML =
    '<div class="ss-wrap">' +

    // Banner hero
    heroBanner +

    // Header sticky unique
    '<div class="ss-header">' +
    // Row 1 : books (center) + unified controls block (right)
    '<div class="ss-header-top">' +
    '<div class="ss-header-center">' +
    renderNusachim() +
    '</div>' +
    '<div class="ss-header-right">' +
    renderControlsBlock() +
    '<button class="ss-compass-btn" onclick="window.siddurOpenCompass()" style="margin-top:4px">' +
    '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#bbb" stroke-width="1.2"/>' +
    '<line x1="16" y1="2" x2="16" y2="6" stroke="#e74c3c" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="16" y1="26" x2="16" y2="30" stroke="#bbb" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="2" y1="16" x2="6" y2="16" stroke="#bbb" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="26" y1="16" x2="30" y2="16" stroke="#bbb" stroke-width="1" stroke-linecap="round"/>' +
    '<text x="16" y="5.5" text-anchor="middle" font-size="4" fill="#e74c3c" font-weight="700">N</text>' +
    '<polygon points="16,9 18.5,14.5 16,13 13.5,14.5" fill="#c0a44d" opacity="0.9"/>' +
    '<polygon points="16,23 13.5,17.5 16,19 18.5,17.5" fill="#c0a44d" opacity="0.9"/>' +
    '</svg></button>' +
    '</div>' +
    '</div>' +
    '<div class="ss-hdate-inline"' + (state.lang === 'hebrew' ? ' style="direction:rtl"' : '') + '>' + (state.lang === 'hebrew' ? hdate.label : hdate.labelFr) + '</div>' +
    // Row 3 : 3 prieres + info jour
    '<div class="ss-tabs">' + renderTabs() + infoTab + '</div>' +
    // Row 4 : barre sections
    renderSectionsBar(sections) +
    '</div>' +

    // Contenu continu
    '<div class="ss-content">' +
    renderSections(sections) +
    '</div>' +

    // FAB
    '<div class="ss-fab">' +
    (state.autoScroll ? '<div class="ss-fab-speed"><span>Vitesse</span><input type="range" min="1" max="8" value="' + state.scrollSpeed + '" oninput="window.siddurSetSpeed(this.value)"></div>' : '') +
    '<button class="ss-fab-btn' + (state.autoScroll ? ' active' : '') + '" onclick="window.siddurToggleScroll()">' +
    (state.autoScroll ? '⏸' : '▶') + '</button></div>' +

    '</div>';

  // Activer le scroll spy
  initScrollSpy();
  // Activer le pinch-to-zoom sur le texte
  initPinchZoom();
  // Swipe sur le hero pour changer de tefila
  initHeroSwipe();
}

function initHeroSwipe() {
  var hero = document.querySelector('.ss-hero');
  if (!hero) return;
  var startX = 0;
  var startY = 0;
  hero.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  hero.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    var keys = Object.keys(TEFILOT);
    var idx = keys.indexOf(state.tefilah);
    if (dx < 0 && idx < keys.length - 1) {
      window.siddurSetTefilah(keys[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      window.siddurSetTefilah(keys[idx - 1]);
    } else if (dx > 0 && idx === 0) {
      // Sur Cha'harit, swipe droit = retour a Tefila
      switchTab('sub-tefila');
    }
  }, { passive: true });
}

// ── API publique (appelée depuis le HTML inline) ───────────────────────────
window.siddurSetTefilah = function(key) {
  state.tefilah = key;
  state._tefilahManual = true;
  state.tabsExpanded = false;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.siddurExpandTabs = function() {
  state.tabsExpanded = true;
  render();
};
window.siddurSetNusach = function(id) {
  state.nusach = id;
  render();
};
window.siddurSetLang = function(lang) {
  state.lang = lang;
  if (window._femmeTimer) clearTimeout(window._femmeTimer);
  if (lang === 'phonetic') {
    state._showFemmeLabel = false;
    render();
    window._femmeTimer = setTimeout(function() {
      state._showFemmeLabel = true;
      var label = document.querySelector('.ss-fem-label');
      if (label) label.textContent = 'Femme';
    }, 2000);
  } else {
    state._showFemmeLabel = false;
    render();
  }
};
window.siddurToggle = function(key) {
  state[key] = !state[key];
  render();
};
window.siddurScrollTo = function(id) {
  var el = document.getElementById('ss-sec-' + id);
  var header = document.querySelector('.ss-header');
  if (!el) return;
  var offset = header ? header.offsetHeight : 0;
  var top = el.getBoundingClientRect().top + window.scrollY - offset - 4;
  window.scrollTo({ top: top, behavior: 'smooth' });
  // Mettre a jour la pill active
  var pills = document.querySelectorAll('.ss-sec-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  var activePill = document.querySelector('.ss-sec-pill[data-section="' + id + '"]');
  if (activePill) {
    activePill.classList.add('active');
    activePill.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
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
// ── Pinch-to-zoom sur le texte du siddour ───────────────────────────────────
var _pinchState = { active: false, startDist: 0, startSize: 28 };
var _savedFontSize = 28; // taille par defaut (px)
var FONT_MIN = 16, FONT_MAX = 42;

function initPinchZoom() {
  var el = document.querySelector('.ss-content');
  if (!el || el._pinchBound) return;
  el._pinchBound = true;

  el.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      _pinchState.active = true;
      _pinchState.startDist = pinchDist(e);
      _pinchState.startSize = _savedFontSize;
    }
  }, { passive: true });

  el.addEventListener('touchmove', function(e) {
    if (!_pinchState.active || e.touches.length !== 2) return;
    var ratio = pinchDist(e) / _pinchState.startDist;
    var newSize = Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, _pinchState.startSize * ratio)));
    if (newSize !== _savedFontSize) {
      _savedFontSize = newSize;
      applyZoom(el, newSize);
    }
  }, { passive: true });

  el.addEventListener('touchend', function() {
    _pinchState.active = false;
  }, { passive: true });

  // Appliquer la taille sauvegardee
  applyZoom(el, _savedFontSize);
}

function pinchDist(e) {
  var dx = e.touches[0].clientX - e.touches[1].clientX;
  var dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function applyZoom(el, size) {
  var bodies = el.querySelectorAll('.ss-section-body');
  bodies.forEach(function(b) {
    if (b.classList.contains('ss-phonetic-body')) {
      b.style.fontSize = Math.max(FONT_MIN, size - 2) + 'px';
    } else {
      b.style.fontSize = size + 'px';
    }
  });
}

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

      // Render immédiatement si le panel siddour est déjà visible au lancement
      var root = document.getElementById('siddur-smart-root');
      var panel = document.getElementById('panel-sub-tefila-siddur');
      if (root && panel && panel.style.display !== 'none') {
        render();
      }

      clearInterval(_interval);
    }
  }, 200);
}

init();

})();
