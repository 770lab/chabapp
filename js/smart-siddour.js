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
  phonetic:   false,
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
      { id: 'modeh', title: 'מודה אני', titlePhonetic: 'Modé Ani', always: true,
        text: 'מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.',
        phonetic: 'Modé ani léfanékha, Mélekh \'haï vékayam, chéhé\'hézarta bi nichmati bé\'hemla, raba émounatékha.' },

      { id: 'netilat', title: 'נטילת ידיים', titlePhonetic: 'Nétilat Yadaïm', always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָיִם.',
        phonetic: 'Baroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav, vétsivanou al nétilat yadaïm.' },

      { id: 'brachot', title: 'בִּרְכוֹת הַשַּׁחַר', titlePhonetic: 'Birkhot Hacha\'har', always: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לַשֶּׂכְוִי בִינָה לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה.\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי גּוֹי.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי עָבֶד.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי אִשָּׁה.\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, פּוֹקֵחַ עִוְרִים.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, מַלְבִּישׁ עֲרֻמִּים.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, מַתִּיר אֲסוּרִים.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, זוֹקֵף כְּפוּפִים.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, רוֹקַע הָאָרֶץ עַל הַמָּיִם.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִּי כׇּל צׇרְכִּי.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמֵּכִין מִצְעֲדֵי גָבֶר.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אוֹזֵר יִשְׂרָאֵל בִּגְבוּרָה.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, עוֹטֵר יִשְׂרָאֵל בְּתִפְאָרָה.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַנּוֹתֵן לַיָּעֵף כֹּחַ.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּעֲבִיר שֵׁנָה מֵעֵינָי וּתְנוּמָה מֵעַפְעַפָּי.',
        phonetic: 'Baroukh ata Ado-naï Elo-hénou Mélekh haolam, achère natane lassékhvi bina léhav\'hine beine yom ouveine laïla.\n\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, chélo assani goï.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, chélo assani aved.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, chélo assani icha.\n\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, poké\'ah ivrim.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, malbich aroumim.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, matir assourim.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, zokèf kéfoufim.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, roka haarèts al hamaïm.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, chéassa li kol tsorki.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, hamékhin mits\'adé gavèr.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, ozèr Israël bigvoura.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, otèr Israël bétif\'ara.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, hanotène layaèf koa\'h.\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, hamaavir chéna méèïnaï outénouma méaf\'apaï.' },

      { id: 'tfilin', title: 'הנחת תפילין', titlePhonetic: 'Hana\'hat Téfiline', always: true, male_only: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לְהָנִיחַ תְּפִלִּין.\n\nתְּפִלִּין שֶׁל רֹאשׁ:\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל מִצְוַת תְּפִלִּין.\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.',
        phonetic: 'Baroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav, vétsivanou léhania\'h téfiline.\n\nTéfiline chel roch :\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav, vétsivanou al mitsvat téfiline.\nBaroukh chem kevod malkhouto léolam vaèd.' },

      { id: 'psukei', title: 'פְּסוּקֵי דְּזִמְרָה', titlePhonetic: 'Pessouké déZimra', always: true,
        text: 'בָּרוּךְ שֶׁאָמַר וְהָיָה הָעוֹלָם, בָּרוּךְ הוּא, בָּרוּךְ עֹשֵׂה בְרֵאשִׁית, בָּרוּךְ אוֹמֵר וְעוֹשֶׂה, בָּרוּךְ גּוֹזֵר וּמְקַיֵּם, בָּרוּךְ מְרַחֵם עַל הָאָרֶץ, בָּרוּךְ מְרַחֵם עַל הַבְּרִיּוֹת, בָּרוּךְ מְשַׁלֵּם שָׂכָר טוֹב לִירֵאָיו, בָּרוּךְ חַי לָעַד וְקַיָּם לָנֶצַח, בָּרוּךְ פּוֹדֶה וּמַצִּיל, בָּרוּךְ שְׁמוֹ.\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הָאֵל הָאָב הָרַחֲמָן, הַמְהֻלָּל בְּפֶה עַמּוֹ, מְשֻׁבָּח וּמְפֹאָר בִּלְשׁוֹן חֲסִידָיו וַעֲבָדָיו, וּבְשִׁירֵי דָוִד עַבְדֶּךָ. נְהַלֶּלְךָ יְיָ אֱלֹהֵינוּ בִּשְׁבָחוֹת וּבִזְמִירוֹת, נְגַדֶּלְךָ וּנְשַׁבֵּחֲךָ וּנְפָאֶרְךָ וְנַזְכִּיר שִׁמְךָ, וְנַמְלִיכְךָ מַלְכֵּנוּ אֱלֹהֵינוּ. יָחִיד, חֵי הָעוֹלָמִים, מֶלֶךְ מְשֻׁבָּח וּמְפֹאָר עֲדֵי עַד שְׁמוֹ הַגָּדוֹל. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת.\n\n— הוֹדוּ —\n\nהוֹדוּ לַיְיָ קִרְאוּ בִשְׁמוֹ, הוֹדִיעוּ בָעַמִּים עֲלִילוֹתָיו. שִׁירוּ לוֹ, זַמְּרוּ לוֹ, שִׂיחוּ בְּכׇל נִפְלְאוֹתָיו. הִתְהַלְלוּ בְּשֵׁם קׇדְשׁוֹ, יִשְׂמַח לֵב מְבַקְשֵׁי יְיָ. דִּרְשׁוּ יְיָ וְעֻזּוֹ, בַּקְּשׁוּ פָנָיו תָּמִיד.\n\n— מִזְמוֹר לְתוֹדָה (תהלים ק) —\n\nמִזְמוֹר לְתוֹדָה, הָרִיעוּ לַיְיָ כׇּל הָאָרֶץ. עִבְדוּ אֶת יְיָ בְּשִׂמְחָה, בֹּאוּ לְפָנָיו בִּרְנָנָה. דְּעוּ כִּי יְיָ הוּא אֱלֹהִים, הוּא עָשָׂנוּ וְלוֹ אֲנַחְנוּ, עַמּוֹ וְצֹאן מַרְעִיתוֹ. בֹּאוּ שְׁעָרָיו בְּתוֹדָה, חֲצֵרֹתָיו בִּתְהִלָּה, הוֹדוּ לוֹ בָּרְכוּ שְׁמוֹ. כִּי טוֹב יְיָ, לְעוֹלָם חַסְדּוֹ, וְעַד דֹּר וָדֹר אֱמוּנָתוֹ.\n\n— אַשְׁרֵי (תהלים קמה) —\n\nאַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה.\nאַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ, אַשְׁרֵי הָעָם שֶׁיְיָ אֱלֹהָיו.\nתְּהִלָּה לְדָוִד: אֲרוֹמִמְךָ אֱלוֹהַי הַמֶּלֶךְ, וַאֲבָרְכָה שִׁמְךָ לְעוֹלָם וָעֶד.\nבְּכׇל יוֹם אֲבָרְכֶךָּ, וַאֲהַלְלָה שִׁמְךָ לְעוֹלָם וָעֶד.\nגָּדוֹל יְיָ וּמְהֻלָּל מְאֹד, וְלִגְדֻלָּתוֹ אֵין חֵקֶר.\nדּוֹר לְדוֹר יְשַׁבַּח מַעֲשֶׂיךָ, וּגְבוּרֹתֶיךָ יַגִּידוּ.\nהֲדַר כְּבוֹד הוֹדֶךָ, וְדִבְרֵי נִפְלְאוֹתֶיךָ אָשִׂיחָה.\nוֶעֱזוּז נוֹרְאוֹתֶיךָ יֹאמֵרוּ, וּגְדֻלָּתְךָ אֲסַפְּרֶנָּה.\nזֵכֶר רַב טוּבְךָ יַבִּיעוּ, וְצִדְקָתְךָ יְרַנֵּנוּ.\nחַנּוּן וְרַחוּם יְיָ, אֶרֶךְ אַפַּיִם וּגְדׇל חָסֶד.\nטוֹב יְיָ לַכֹּל, וְרַחֲמָיו עַל כׇּל מַעֲשָׂיו.\nיוֹדוּךָ יְיָ כׇּל מַעֲשֶׂיךָ, וַחֲסִידֶיךָ יְבָרְכוּכָה.\nכְּבוֹד מַלְכוּתְךָ יֹאמֵרוּ, וּגְבוּרָתְךָ יְדַבֵּרוּ.\nלְהוֹדִיעַ לִבְנֵי הָאָדָם גְּבוּרֹתָיו, וּכְבוֹד הֲדַר מַלְכוּתוֹ.\nמַלְכוּתְךָ מַלְכוּת כׇּל עוֹלָמִים, וּמֶמְשַׁלְתְּךָ בְּכׇל דּוֹר וָדוֹר.\nסוֹמֵךְ יְיָ לְכׇל הַנֹּפְלִים, וְזוֹקֵף לְכׇל הַכְּפוּפִים.\nעֵינֵי כֹל אֵלֶיךָ יְשַׂבֵּרוּ, וְאַתָּה נוֹתֵן לָהֶם אֶת אׇכְלָם בְּעִתּוֹ.\nפּוֹתֵחַ אֶת יָדֶךָ, וּמַשְׂבִּיעַ לְכׇל חַי רָצוֹן.\nצַדִּיק יְיָ בְּכׇל דְּרָכָיו, וְחָסִיד בְּכׇל מַעֲשָׂיו.\nקָרוֹב יְיָ לְכׇל קֹרְאָיו, לְכֹל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת.\nרְצוֹן יְרֵאָיו יַעֲשֶׂה, וְאֶת שַׁוְעָתָם יִשְׁמַע וְיוֹשִׁיעֵם.\nשׁוֹמֵר יְיָ אֶת כׇּל אֹהֲבָיו, וְאֵת כׇּל הָרְשָׁעִים יַשְׁמִיד.\nתְּהִלַּת יְיָ יְדַבֶּר פִּי, וִיבָרֵךְ כׇּל בָּשָׂר שֵׁם קׇדְשׁוֹ לְעוֹלָם וָעֶד.\nוַאֲנַחְנוּ נְבָרֵךְ יָהּ, מֵעַתָּה וְעַד עוֹלָם, הַלְלוּיָהּ.\n\n— יִשְׁתַּבַּח —\n\nיִשְׁתַּבַּח שִׁמְךָ לָעַד מַלְכֵּנוּ, הָאֵל הַמֶּלֶךְ הַגָּדוֹל וְהַקָּדוֹשׁ בַּשָּׁמַיִם וּבָאָרֶץ. כִּי לְךָ נָאֶה, יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שִׁיר וּשְׁבָחָה, הַלֵּל וְזִמְרָה, עֹז וּמֶמְשָׁלָה, נֶצַח, גְּדֻלָּה וּגְבוּרָה, תְּהִלָּה וְתִפְאֶרֶת, קְדֻשָּׁה וּמַלְכוּת, בְּרָכוֹת וְהוֹדָאוֹת מֵעַתָּה וְעַד עוֹלָם. בָּרוּךְ אַתָּה יְיָ, אֵל מֶלֶךְ גָּדוֹל בַּתִּשְׁבָּחוֹת, אֵל הַהוֹדָאוֹת, אֲדוֹן הַנִּפְלָאוֹת, הַבּוֹחֵר בְּשִׁירֵי זִמְרָה, מֶלֶךְ אֵל חֵי הָעוֹלָמִים.',
        phonetic: 'Baroukh chéamar véhaya haolam, Baroukh hou, Baroukh ossé béréchit, Baroukh omère véossé, Baroukh gozère oumékayèm, Baroukh méra\'hèm al haarèts, Baroukh méra\'hèm al habériyot, Baroukh méchalèm sakhar tov liréav, Baroukh \'haï laad vékayam lanétsa\'h, Baroukh podé oumatsil, Baroukh chémo.\n\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, haEl haAv hara\'hamane, haméhoulal béfé amo, méchouba\'h ouméfoar bilchone \'hassidav vaavadav, ouvéchiré David avdékha. Néhalélékha Ado-naï Elo-hénou bichva\'hot ouvizmirot, négadélékha ounéchabé\'hakha ounéfaèrékha vénazkhir chimékha, vénamlikh\'kha Malkénou Elo-hénou. Ya\'hid, \'Héï haolamim, Mélekh méchouba\'h ouméfoar adé ad chémo hagadol. Baroukh ata Ado-naï, Mélekh méhoulal batichba\'hot.\n\n— Hodou —\n\nHodou lAdo-naï kirou vichmo, hodio\'u vaamim alilotav. Chirou lo, zamérou lo, si\'hou békhol nifléotav. Hithaléloù béchèm kodsho, yisma\'h lèv mévakché Ado-naï. Dirchou Ado-naï véouzo, bakéchou fanav tamid.\n\n— Mizmor léToda (Psaume 100) —\n\nMizmor léToda, hari\'ou lAdo-naï kol haarèts. Ivdou ète Ado-naï bésim\'ha, bo\'ou léfanav birnana. Dé\'ou ki Ado-naï hou Elohim, hou assanou vélo ana\'hnou, amo vétson mar\'ito. Bo\'ou chéarav bétoda, \'hatsèrotav bitéhila, hodou lo barékhou chémo. Ki tov Ado-naï, léolam \'hasdo, véad dor vador émounato.\n\n— Achré (Psaume 145) —\n\nAchré yochvé vétékha, od yéhaléloukha séla.\nAchré haam chékakha lo, achré haam chéAdo-naï Elohav.\nTéhila léDavid : Aromimékha Elohaï haMélekh, vaavarkha chimékha léolam vaèd.\nBékhol yom avarkékha, vaahallela chimékha léolam vaèd.\nGadol Ado-naï ouméhoulal méod, véligdoulato eine \'hékèr.\nDor lédor yéchabba\'h maassékha, ouguévourotékha yaguidou.\nHadar kévod hodékha, védivrè niflèotékha assi\'ha.\nVeèzouz norèotékha yomérou, ouguédoulatékha assapérèna.\nZékhèr rav touvékha yabi\'ou, vétsidkatékha yéranénou.\n\'Hanoun véra\'houm Ado-naï, érèkh apaïm ougdol \'hassèd.\nTov Ado-naï lakol, véra\'hamav al kol maassav.\nYodoukha Ado-naï kol maassékha, va\'hassidékha yévarékhoukha.\nKévod malkhoutkha yomérou, ouguévouratkha yédabérou.\nLéhodia livné haadam guévourotav, oukhvod hadar malkhouto.\nMalkhoutkha malkhout kol olamim, oumémshaltkha békhol dor vador.\nSomèkh Ado-naï lékhol hanoflim, vézokèf lékhol hakéfoufim.\nÈné khol élékha yéssabérou, véata notène lahèm ète okhlam béito.\nPoté\'ah ète yadékha, oumassbiya lékhol \'haï ratson.\nTsadik Ado-naï békhol drakhav, vé\'hassid békhol maassav.\nKarov Ado-naï lékhol korav, lékhol achère yikraouhou véémet.\nRétson yéréav yaassé, véète chav\'atam yichma véyochi\'èm.\nChomèr Ado-naï ète kol ohavav, véèt kol harécha\'im yachmid.\nTéhilat Ado-naï yédabèr pi, vivarèkh kol bassar chèm kodsho léolam vaèd.\nVaana\'hnou névarèkh Ya, méata véad olam, Halélouya.\n\n— Yichtaba\'h —\n\nYichtaba\'h chimékha laad Malkénou, haEl haMélekh hagadol véhakadoch bachamaïm ouva\'arèts. Ki lékha naé, Ado-naï Elo-hénou vElo-hé avotéinou, chir ouchva\'ha, halèl vézimra, oz oumémsala, nétsah, guédoula ouguévoura, téhila vétifèrèt, kédoucha oumalkout, brakhot véhodaot méata véad olam. Baroukh ata Ado-naï, El Mélekh gadol batichba\'hot, El hahodaot, Adone haniflaot, habo\'hèr béchiré zimra, Mélekh El \'héï haolamim.' },

      { id: 'shema', title: 'קְרִיאַת שְׁמַע', titlePhonetic: 'Kriat Chéma', always: true,
        text: 'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד׃\n\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.\n\nוְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ בְּכׇל לְבָבְךָ וּבְכׇל נַפְשְׁךָ וּבְכׇל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ, וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשׇׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ, וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.\n\nוְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ אֶל מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם, לְאַהֲבָה אֶת יְיָ אֱלֹהֵיכֶם וּלְעׇבְדוֹ בְּכׇל לְבַבְכֶם וּבְכׇל נַפְשְׁכֶם. וְנָתַתִּי מְטַר אַרְצְכֶם בְּעִתּוֹ, יוֹרֶה וּמַלְקוֹשׁ, וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ, וְאָכַלְתָּ וְשָׂבָעְתָּ. הִשָּׁמְרוּ לָכֶם פֶּן יִפְתֶּה לְבַבְכֶם, וְסַרְתֶּם וַעֲבַדְתֶּם אֱלֹהִים אֲחֵרִים וְהִשְׁתַּחֲוִיתֶם לָהֶם. וְחָרָה אַף יְיָ בָּכֶם, וְעָצַר אֶת הַשָּׁמַיִם וְלֹא יִהְיֶה מָטָר, וְהָאֲדָמָה לֹא תִתֵּן אֶת יְבוּלָהּ, וַאֲבַדְתֶּם מְהֵרָה מֵעַל הָאָרֶץ הַטֹּבָה אֲשֶׁר יְיָ נֹתֵן לָכֶם. וְשַׂמְתֶּם אֶת דְּבָרַי אֵלֶּה עַל לְבַבְכֶם וְעַל נַפְשְׁכֶם, וּקְשַׁרְתֶּם אֹתָם לְאוֹת עַל יֶדְכֶם, וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֵיכֶם. וְלִמַּדְתֶּם אֹתָם אֶת בְּנֵיכֶם לְדַבֵּר בָּם, בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשׇׁכְבְּךָ וּבְקוּמֶךָ. וּכְתַבְתָּם עַל מְזוּזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ. לְמַעַן יִרְבּוּ יְמֵיכֶם וִימֵי בְנֵיכֶם עַל הָאֲדָמָה אֲשֶׁר נִשְׁבַּע יְיָ לַאֲבֹתֵיכֶם לָתֵת לָהֶם, כִּימֵי הַשָּׁמַיִם עַל הָאָרֶץ.\n\nוַיֹּאמֶר יְיָ אֶל מֹשֶׁה לֵּאמֹר. דַּבֵּר אֶל בְּנֵי יִשְׂרָאֵל וְאָמַרְתָּ אֲלֵהֶם, וְעָשׂוּ לָהֶם צִיצִת עַל כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם, וְנָתְנוּ עַל צִיצִת הַכָּנָף פְּתִיל תְּכֵלֶת. וְהָיָה לָכֶם לְצִיצִת, וּרְאִיתֶם אֹתוֹ וּזְכַרְתֶּם אֶת כׇּל מִצְוֹת יְיָ וַעֲשִׂיתֶם אֹתָם, וְלֹא תָתוּרוּ אַחֲרֵי לְבַבְכֶם וְאַחֲרֵי עֵינֵיכֶם אֲשֶׁר אַתֶּם זֹנִים אַחֲרֵיהֶם. לְמַעַן תִּזְכְּרוּ וַעֲשִׂיתֶם אֶת כׇּל מִצְוֹתָי, וִהְיִיתֶם קְדֹשִׁים לֵאלֹהֵיכֶם. אֲנִי יְיָ אֱלֹהֵיכֶם אֲשֶׁר הוֹצֵאתִי אֶתְכֶם מֵאֶרֶץ מִצְרַיִם לִהְיוֹת לָכֶם לֵאלֹהִים, אֲנִי יְיָ אֱלֹהֵיכֶם. אֱמֶת.',
        phonetic: 'Chéma Israël, Ado-naï Elo-hénou, Ado-naï É\'had.\n\nBaroukh chem kevod malkhouto léolam vaèd.\n\nVéahavta ète Ado-naï Elohékha békhol lévavékha ouvékhol nafchékha ouvékhol méodékha. Véhayou hadévarim haélé achère anokhi métsavékha hayom al lévavékha. Véchinantam lé vanékha, védibarta bam béchivtékha bévétékha ouvlékhté kha vadérèkh ouvchokh békha ouvkoumékha. Oukchartam léot al yadékha, véhayou létotafot bèn ènékha. Oukhtavtam al mézouzot bètékha ouvichaérékha.\n\nVéhaya im chamoa tichméou el mitsvotaï achère anokhi métsavé etkhèm hayom, léahava ète Ado-naï Elohékhèm ouléovdo békhol lévavkhèm ouvékhol nafchékhèm. Vénatati métar artsékhèm béito, yoré oumalcoche, véassafta dégagnékha vétirocjékha véyitsharékha. Vénatati èssèv béssadékha livhémtékha, véakhalta véssavata. Hichamérou lakhèm pène yifté lévavkhèm, véssartèm vaavadtèm élohim a\'hérim véhichtahaavitèm lahèm. Vé\'hara af Ado-naï bakhèm, véatsar ète hachamaïm vélo yihyé matar, véhaadama lo titèn ète yévoulah, vaavadtèm méhéra méal haarèts hatova achère Ado-naï notèn lakhèm. Véssamtèm ète dévaraï élé al lévavkhèm véal nafchékhèm, oukchartèm otam léot al yédkhèm, véhayou létotafot bèn ènékhèm. Vélimadtèm otam ète bénékhèm lédabèr bam, béchivtékha bévétékha ouvlékhté kha vadérèkh ouvchokh békha ouvkoumékha. Oukhtavtam al mézouzot bètékha ouvichaérékha. Lémaan yirbou yémékhèm vimé vénékhèm al haadama achère nichba Ado-naï laavotékhèm latèt lahèm, kimé hachamaïm al haarèts.\n\nVayomèr Ado-naï el Moché lémor. Dabèr el bné Israël véamarta aléhèm, véassou lahèm tsitsit al kanfé vigdéhèm lédorotam, vénaténou al tsitsit hakanaf pétil tékhélèt. Véhaya lakhèm létsitsit, ouritèm oto ouzkhartem ète kol mitsvot Ado-naï vaassitèm otam, vélo tatourou a\'haré lévavkhèm véa\'haré ènékhèm achère atèm zonim a\'haréhèm. Lémaan tizkérou vaassitèm ète kol mitsvotaï, vihyitèm kédochim lElo-hékhèm. Ani Ado-naï Elo-hékhèm achère hotsèti etkhèm méérèts Mitsraïm lihyot lakhèm lElohim, ani Ado-naï Elo-hékhèm. Émèt.' },

      { id: 'amida', title: 'עֲמִידָה', titlePhonetic: 'Amida', always: true,
        text: '— 1. אָבוֹת —\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת, וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם, לְמַעַן שְׁמוֹ בְּאַהֲבָה. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְיָ, מָגֵן אַבְרָהָם.\n\n— 2. גְּבוּרוֹת —\n\nאַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ. מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוֹךָ בַּעַל גְּבוּרוֹת, וּמִי דּוֹמֶה לָּךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה. וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים. בָּרוּךְ אַתָּה יְיָ, מְחַיֵּה הַמֵּתִים.\n\n— 3. קְדֻשָּׁה (בְּמִנְיָן) —\n\nנְקַדֵּשׁ אֶת שִׁמְךָ בָּעוֹלָם, כְּשֵׁם שֶׁמַּקְדִּישִׁים אוֹתוֹ בִּשְׁמֵי מָרוֹם. כַּכָּתוּב עַל יַד נְבִיאֶךָ: וְקָרָא זֶה אֶל זֶה וְאָמַר. קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ. לְעֻמָּתָם בָּרוּךְ יֹאמֵרוּ. בָּרוּךְ כְּבוֹד יְיָ מִמְּקוֹמוֹ. וּבְדִבְרֵי קׇדְשְׁךָ כָּתוּב לֵאמֹר. יִמְלֹךְ יְיָ לְעוֹלָם, אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר, הַלְלוּיָהּ.\n\n(בְּיָחִיד: אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכׇל יוֹם יְהַלְלוּךָ סֶּלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.)\n\n— 4. אַתָּה חוֹנֵן (דַּעַת) —\n\nאַתָּה חוֹנֵן לְאָדָם דַּעַת, וּמְלַמֵּד לֶאֱנוֹשׁ בִּינָה. חׇנֵּנוּ מֵאִתְּךָ דֵּעָה בִּינָה וְהַשְׂכֵּל. בָּרוּךְ אַתָּה יְיָ, חוֹנֵן הַדָּעַת.\n\n— 5. הֲשִׁיבֵנוּ (תְּשׁוּבָה) —\n\nהֲשִׁיבֵנוּ אָבִינוּ לְתוֹרָתֶךָ, וְקָרְבֵנוּ מַלְכֵּנוּ לַעֲבוֹדָתֶךָ, וְהַחֲזִירֵנוּ בִּתְשׁוּבָה שְׁלֵמָה לְפָנֶיךָ. בָּרוּךְ אַתָּה יְיָ, הָרוֹצֶה בִּתְשׁוּבָה.\n\n— 6. סְלַח לָנוּ (סְלִיחָה) —\n\nסְלַח לָנוּ אָבִינוּ כִּי חָטָאנוּ, מְחַל לָנוּ מַלְכֵּנוּ כִּי פָשָׁעְנוּ, כִּי מוֹחֵל וְסוֹלֵחַ אָתָּה. בָּרוּךְ אַתָּה יְיָ, חַנּוּן הַמַּרְבֶּה לִסְלֹחַ.\n\n— 7. רְאֵה (גְּאֻלָּה) —\n\nרְאֵה נָא בְעׇנְיֵנוּ, וְרִיבָה רִיבֵנוּ, וּגְאָלֵנוּ מְהֵרָה לְמַעַן שְׁמֶךָ, כִּי גּוֹאֵל חָזָק אָתָּה. בָּרוּךְ אַתָּה יְיָ, גּוֹאֵל יִשְׂרָאֵל.\n\n— 8. רְפָאֵנוּ (רְפוּאָה) —\n\nרְפָאֵנוּ יְיָ וְנֵרָפֵא, הוֹשִׁיעֵנוּ וְנִוָּשֵׁעָה, כִּי תְהִלָּתֵנוּ אָתָּה, וְהַעֲלֵה רְפוּאָה שְׁלֵמָה לְכׇל מַכּוֹתֵינוּ, כִּי אֵל מֶלֶךְ רוֹפֵא נֶאֱמָן וְרַחֲמָן אָתָּה. בָּרוּךְ אַתָּה יְיָ, רוֹפֵא חוֹלֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 9. בָּרֵךְ עָלֵינוּ (שָׁנִים) —\n\nבָּרֵךְ עָלֵינוּ יְיָ אֱלֹהֵינוּ אֶת הַשָּׁנָה הַזֹּאת וְאֶת כׇּל מִינֵי תְבוּאָתָהּ לְטוֹבָה, וְתֵן בְּרָכָה עַל פְּנֵי הָאֲדָמָה, וְשַׂבְּעֵנוּ מִטּוּבָהּ, וּבָרֵךְ שְׁנָתֵנוּ כַּשָּׁנִים הַטּוֹבוֹת. בָּרוּךְ אַתָּה יְיָ, מְבָרֵךְ הַשָּׁנִים.\n\n— 10. תְּקַע בְּשׁוֹפָר (קִבּוּץ גָּלֻיּוֹת) —\n\nתְּקַע בְּשׁוֹפָר גָּדוֹל לְחֵרוּתֵנוּ, וְשָׂא נֵס לְקַבֵּץ גָּלֻיּוֹתֵינוּ, וְקַבְּצֵנוּ יַחַד מֵאַרְבַּע כַּנְפוֹת הָאָרֶץ. בָּרוּךְ אַתָּה יְיָ, מְקַבֵּץ נִדְחֵי עַמּוֹ יִשְׂרָאֵל.\n\n— 11. הָשִׁיבָה שׁוֹפְטֵינוּ (מִשְׁפָּט) —\n\nהָשִׁיבָה שׁוֹפְטֵינוּ כְּבָרִאשׁוֹנָה, וְיוֹעֲצֵינוּ כְּבַתְּחִלָּה, וְהָסֵר מִמֶּנּוּ יָגוֹן וַאֲנָחָה, וּמְלֹךְ עָלֵינוּ אַתָּה יְיָ לְבַדְּךָ בְּחֶסֶד וּבְרַחֲמִים, וְצַדְּקֵנוּ בַּמִּשְׁפָּט. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ אוֹהֵב צְדָקָה וּמִשְׁפָּט.\n\n— 12. וְלַמַּלְשִׁינִים (מִינִים) —\n\nוְלַמַּלְשִׁינִים אַל תְּהִי תִקְוָה, וְכׇל הָרִשְׁעָה כְּרֶגַע תֹּאבֵד, וְכׇל אוֹיְבֶיךָ מְהֵרָה יִכָּרֵתוּ, וְהַזֵּדִים מְהֵרָה תְעַקֵּר וּתְשַׁבֵּר וּתְמַגֵּר וְתַכְנִיעַ בִּמְהֵרָה בְיָמֵינוּ. בָּרוּךְ אַתָּה יְיָ, שׁוֹבֵר אוֹיְבִים וּמַכְנִיעַ זֵדִים.\n\n— 13. עַל הַצַּדִּיקִים (צַדִּיקִים) —\n\nעַל הַצַּדִּיקִים וְעַל הַחֲסִידִים, וְעַל זִקְנֵי עַמְּךָ בֵּית יִשְׂרָאֵל, וְעַל פְּלֵיטַת סוֹפְרֵיהֶם, וְעַל גֵּרֵי הַצֶּדֶק וְעָלֵינוּ, יֶהֱמוּ נָא רַחֲמֶיךָ יְיָ אֱלֹהֵינוּ, וְתֵן שָׂכָר טוֹב לְכׇל הַבּוֹטְחִים בְּשִׁמְךָ בֶּאֱמֶת, וְשִׂים חֶלְקֵנוּ עִמָּהֶם לְעוֹלָם וְלֹא נֵבוֹשׁ כִּי בְךָ בָטָחְנוּ. בָּרוּךְ אַתָּה יְיָ, מִשְׁעָן וּמִבְטָח לַצַּדִּיקִים.\n\n— 14. וְלִירוּשָׁלַיִם (יְרוּשָׁלַיִם) —\n\nוְלִירוּשָׁלַיִם עִירְךָ בְּרַחֲמִים תָּשׁוּב, וְתִשְׁכּוֹן בְּתוֹכָהּ כַּאֲשֶׁר דִּבַּרְתָּ, וּבְנֵה אוֹתָהּ בְּקָרוֹב בְּיָמֵינוּ בִּנְיַן עוֹלָם, וְכִסֵּא דָוִד מְהֵרָה לְתוֹכָהּ תָּכִין. בָּרוּךְ אַתָּה יְיָ, בּוֹנֵה יְרוּשָׁלָיִם.\n\n— 15. אֶת צֶמַח דָּוִד (דָּוִד) —\n\nאֶת צֶמַח דָּוִד עַבְדְּךָ מְהֵרָה תַצְמִיחַ, וְקַרְנוֹ תָּרוּם בִּישׁוּעָתֶךָ, כִּי לִישׁוּעָתְךָ קִוִּינוּ כׇּל הַיּוֹם. בָּרוּךְ אַתָּה יְיָ, מַצְמִיחַ קֶרֶן יְשׁוּעָה.\n\n— 16. שְׁמַע קוֹלֵנוּ —\n\nשְׁמַע קוֹלֵנוּ יְיָ אֱלֹהֵינוּ, חוּס וְרַחֵם עָלֵינוּ, וְקַבֵּל בְּרַחֲמִים וּבְרָצוֹן אֶת תְּפִלָּתֵנוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלּוֹת וְתַחֲנוּנִים אָתָּה, וּמִלְּפָנֶיךָ מַלְכֵּנוּ רֵיקָם אַל תְּשִׁיבֵנוּ, כִּי אַתָּה שׁוֹמֵעַ תְּפִלַּת כׇּל פֶּה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.\n\n— 17. רְצֵה (עֲבוֹדָה) —\n\nרְצֵה יְיָ אֱלֹהֵינוּ בְּעַמְּךָ יִשְׂרָאֵל וּבִתְפִלָּתָם, וְהָשֵׁב אֶת הָעֲבוֹדָה לִדְבִיר בֵּיתֶךָ, וְאִשֵּׁי יִשְׂרָאֵל וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן, וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ. וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר שְׁכִינָתוֹ לְצִיּוֹן.\n\n— 18. מוֹדִים —\n\nמוֹדִים אֲנַחְנוּ לָךְ, שָׁאַתָּה הוּא יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ לְעוֹלָם וָעֶד. צוּר חַיֵּינוּ, מָגֵן יִשְׁעֵנוּ, אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְּךָ וּנְסַפֵּר תְּהִלָּתֶךָ, עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ, וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ, וְעַל נִסֶּיךָ שֶׁבְּכׇל יוֹם עִמָּנוּ, וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכׇל עֵת, עֶרֶב וָבֹקֶר וְצׇהֳרָיִם. הַטּוֹב, כִּי לֹא כָלוּ רַחֲמֶיךָ, וְהַמְרַחֵם, כִּי לֹא תַמּוּ חֲסָדֶיךָ, מֵעוֹלָם קִוִּינוּ לָךְ.\n\nוְעַל כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד. וְכׇל הַחַיִּים יוֹדוּךָ סֶּלָה, וִיהַלְלוּ אֶת שִׁמְךָ בֶּאֱמֶת, הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. בָּרוּךְ אַתָּה יְיָ, הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת.\n\n— 19. שִׂים שָׁלוֹם —\n\nשִׂים שָׁלוֹם טוֹבָה וּבְרָכָה, חֵן וָחֶסֶד וְרַחֲמִים, עָלֵינוּ וְעַל כׇּל יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ אָבִינוּ כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ, כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ יְיָ אֱלֹהֵינוּ תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד, וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם. וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת עַמְּךָ יִשְׂרָאֵל בְּכׇל עֵת וּבְכׇל שָׁעָה בִּשְׁלוֹמֶךָ. בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם.\n\n— —\n\nאֱלֹהַי, נְצוֹר לְשׁוֹנִי מֵרָע, וּשְׂפָתַי מִדַּבֵּר מִרְמָה, וְלִמְקַלְלַי נַפְשִׁי תִדֹּם, וְנַפְשִׁי כֶּעָפָר לַכֹּל תִּהְיֶה. פְּתַח לִבִּי בְּתוֹרָתֶךָ, וּבְמִצְוֹתֶיךָ תִּרְדּוֹף נַפְשִׁי. וְכׇל הַחוֹשְׁבִים עָלַי רָעָה, מְהֵרָה הָפֵר עֲצָתָם וְקַלְקֵל מַחֲשַׁבְתָּם. עֲשֵׂה לְמַעַן שְׁמֶךָ, עֲשֵׂה לְמַעַן יְמִינֶךָ, עֲשֵׂה לְמַעַן קְדֻשָּׁתֶךָ, עֲשֵׂה לְמַעַן תּוֹרָתֶךָ. לְמַעַן יֵחָלְצוּן יְדִידֶיךָ, הוֹשִׁיעָה יְמִינְךָ וַעֲנֵנִי. יִהְיוּ לְרָצוֹן אִמְרֵי פִי וְהֶגְיוֹן לִבִּי לְפָנֶיךָ, יְיָ צוּרִי וְגוֹאֲלִי.',
        phonetic: '— 1. Avot —\n\nBaroukh ata Ado-naï Elo-hénou vElo-hé avotéinou, Elo-hé Avraham, Elo-hé Its\'hak, vElo-hé Yaakov, haEl hagadol haguibor véhanora, El èlyione, gomèl \'hassadim tovim, vékoné hakol, vézokhèr \'hasdé avot, oumévi goèl livné vnéhèm, lémaan chémo béahava. Mélekh ozèr oumochia oumagèn. Baroukh ata Ado-naï, magèn Avraham.\n\n— 2. Guévourot —\n\nAta guibor léolam Ado-naï, mé\'hayé métim ata, rav léhochia. Mékhalkel \'hayim bé\'hessèd, mé\'hayé métim béra\'hamim rabim, somèkh noflim, vérofé \'holim, oumatir assourim, oumékayèm émounato lichnèï afar. Mi khamokha baal guévourot, oumi domé lakh, Mélekh mémit oumé\'hayé oumatsmi\'ah yéchoua. Vénééman ata léha\'hayot métim. Baroukh ata Ado-naï, mé\'hayé hamétim.\n\n— 3. Kédoucha (béminiane) —\n\nNékadèch ète chimékha baolam, kéchèm chémakdichim oto bichmé marom. Kakatouv al yad néviékha : véka ra zé el zé véamar. Kadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo. Lé\'oumatam baroukh yomérou. Baroukh kévod Ado-naï miméko mo. Ouvédivrè kodchékha katouv lémor. Yimlokh Ado-naï léolam, Elohayikh Tsione lédor vador, Halélouya.\n\n(Béya\'hid : Ata kadoch véchimékha kadoch, oukédochim békhol yom yéhaléloukha séla. Baroukh ata Ado-naï, haEl hakadoch.)\n\n— 4. Ata \'honène (Daat) —\n\nAta \'honène léadam daat, oumélamèd léénocj bina. \'Honénou méitékha déa bina véhaskèl. Baroukh ata Ado-naï, \'honène hadaat.\n\n— 5. Hachivénou (Téchouva) —\n\nHachivénou Avinou léToratékha, vékarvénou Malkénou laavoda tékha, véha\'hazirénou bitchouva chéléma léfanékha. Baroukh ata Ado-naï, harotsé bitchouva.\n\n— 6. Séla\'h lanou (Séli\'ha) —\n\nSéla\'h lanou Avinou ki \'hatanou, mé\'hal lanou Malkénou ki fachanou, ki mo\'hèl vésolé\'ah ata. Baroukh ata Ado-naï, \'hanoun hamarbé lislo\'ah.\n\n— 7. Réé (Guéoula) —\n\nRéé na véonyénou, vériva rivénou, ougalénou méhéra lémaan chémékha, ki goèl \'hazak ata. Baroukh ata Ado-naï, goèl Israël.\n\n— 8. Réfaénou (Réfoua) —\n\nRéfaénou Ado-naï vénérafé, hochi\'énou vénivachéa, ki téhilaténou ata, véhaalé réfoua chéléma lékhol makotéinou, ki El Mélekh rofé nééman véra\'hamane ata. Baroukh ata Ado-naï, rofé \'holé amo Israël.\n\n— 9. Barèkh alénou (Chanim) —\n\nBarèkh alénou Ado-naï Elo-hénou ète hachana hazot véète kol miné tévouatah létova, vétène brakha al péné haadama, véssabénou mitouvah, ouvarèkh chnaténou kachanim hatovot. Baroukh ata Ado-naï, mévare\'kh hachanim.\n\n— 10. Téka béChofar (Kibouts galiouyot) —\n\nTéka béchofar gadol lé\'hérou ténou, véssa nèss lékabèts galiouyotéinou, vékabétsénou ya\'had méarba kanfot haarèts. Baroukh ata Ado-naï, mékabèts nid\'hé amo Israël.\n\n— 11. Hachiva choftéinou (Michpat) —\n\nHachiva choftéinou kévarichona, véyoatséinou kévat\'hila, véhassèr miménou yagone vaana\'ha, oumlokh alénou ata Ado-naï lévadékha bé\'hèssèd ouvéra\'hamim, vétsadékénou bamichpat. Baroukh ata Ado-naï, Mélekh ohèv tsédaka oumichpat.\n\n— 12. Vélamalachiniim (Minim) —\n\nVélamalachiniim al téhi tikva, vékhol haricha kéréga tovèd, vékhol oyvékha méhéra yikarétou, véhazédim méhéra tékakèr outé chabèr outémagèr vétakhnia biméhéra véyaménou. Baroukh ata Ado-naï, chovèr oyvim oumakhnia zédim.\n\n— 13. Al hatsadikim (Tsadikim) —\n\nAl hatsadikim véal ha\'hassidim, véal zikné amékha bèt Israël, véal plétat soféréhèm, véal guéré hatséddek véalénou, yéhémou na ra\'hamékha Ado-naï Elo-hénou, vétène sakhar tov lékhol habotéhim béchimékha béémèt, véssim \'helkénou imahèm léolam vélo névoch ki békha bata\'hnou. Baroukh ata Ado-naï, mich\'ane oumivta\'h latsadikim.\n\n— 14. VéliYérouchalaïm (Yérouchalaïm) —\n\nVéliYérouchalaïm irékha béra\'hamim tachouv, vétichkone bétokha kaachère dibarta, ouvné otah békarov béyaménou binyane olam, vékissé David méhéra létokha takhiné. Baroukh ata Ado-naï, boné Yérouchalaïm.\n\n— 15. Ète tséma\'h David (David) —\n\nÈte tséma\'h David avdékha méhéra tatsmi\'ah, vékarna taroum bichououatékha, ki lichououatkha kivinou kol hayom. Baroukh ata Ado-naï, matsmi\'ah kérène yéchoua.\n\n— 16. Chéma kolénou —\n\nChéma kolénou Ado-naï Elo-hénou, \'houss véra\'hèm alénou, vékabèl béra\'hamim ouvératson ète téfilaténou, ki El choméa téfilot véta\'hanounim ata, oumiléfanékha Malkénou réikam al téchivénou, ki ata choméa téfilat kol pé. Baroukh ata Ado-naï, choméa téfila.\n\n— 17. Rétsé (Avoda) —\n\nRétsé Ado-naï Elo-hénou béamékha Israël ouvitéfilatam, véhachèv ète haavoda lidvir bétékha, véiché Israël outéfilatam béahava tékabèl béra tsone, outéhi léra tsone tamid avodat Israël amékha. Véte\'hézéna ènénou béchouvékha léTsione béra\'hamim. Baroukh ata Ado-naï, hama\'hazir chékhinato léTsione.\n\n— 18. Modim —\n\nModim ana\'hnou lakh, chaata hou Ado-naï Elo-hénou vElo-hé avotéinou léolam vaèd. Tsour \'hayénou, magèn yich\'énou, ata hou lédor vador. Nodé lékha ouné sapèr téhilatékha, al \'hayénou haméssourim béyadékha, véal nichmotéinou hapékoudot lakh, véal nissékha chébékhol yom imanou, véal niflèotékha vétovotékha chébékhol èt, érèv vavoker vétsohoraïm. Hatov, ki lo khalou ra\'hamékha, véhaméra\'hèm, ki lo tamou \'hassadékha, méolam kivinou lakh.\n\nVéal koulam yitbarakh véyitromam chimékha Malkénou tamid léolam vaèd. Vékhol ha\'hayim yodoukha séla, vihalélo u ète chimékha béémèt, haEl yéchouaténou véèzraténou séla. Baroukh ata Ado-naï, hatov chimékha oulékha naé léhodot.\n\n— 19. Sim Chalom —\n\nSim chalom tova ouvrakha, \'hène va\'hèssèd véra\'hamim, alénou véal kol Israël amékha. Barkhénou Avinou koullanou kéé\'had béor panékha, ki véor panékha natata lanou Ado-naï Elo-hénou Torat \'hayim véahavat \'hèssèd, outsdaka ouvrakha véra\'hamim vé\'hayim véchalom. Vétov béènékha lévarèkh ète amékha Israël békhol èt ouvékhol chaah bichlo mékha. Baroukh ata Ado-naï, hamévare\'kh ète amo Israël bachalom.\n\n— —\n\nElo-haï, nétsor léchoni méra, ousfataï midabèr mirma, vélimkalélaï nafchi tidom, vénafchi kéafar lakol tihyé. Péta\'h libi béToratékha, ouvémitsvotékha tirdof nafchi. Vékhol ha\'hochvim alaï raa, méhéra hafèr atsatam vékalkèl ma\'hachavtam. Assé lémaan chémékha, assé lémaan yéminékha, assé lémaan kédouchatékha, assé lémaan Toratékha. Lémaan yé\'halétsoun yédidékha, hochia yéminékha vaanéni. Yihyou lératson imré fi véhéguione libi léfanékha, Ado-naï tsouri végoali.' },

      { id: 'hallel', title: 'הַלֵּל', titlePhonetic: 'Hallel', rosh_hodesh: true,
        text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ לִקְרֹא אֶת הַהַלֵּל.\n\nהַלְלוּיָהּ, הַלְלוּ עַבְדֵי יְיָ, הַלְלוּ אֶת שֵׁם יְיָ. יְהִי שֵׁם יְיָ מְבֹרָךְ, מֵעַתָּה וְעַד עוֹלָם. מִמִּזְרַח שֶׁמֶשׁ עַד מְבוֹאוֹ, מְהֻלָּל שֵׁם יְיָ. רָם עַל כׇּל גּוֹיִם יְיָ, עַל הַשָּׁמַיִם כְּבוֹדוֹ.\n\nמִן הַמֵּצַר קָרָאתִי יָהּ, עָנָנִי בַמֶּרְחָב יָהּ. יְיָ לִי לֹא אִירָא, מַה יַּעֲשֶׂה לִי אָדָם. יְיָ לִי בְּעֹזְרָי, וַאֲנִי אֶרְאֶה בְשֹׂנְאָי. טוֹב לַחֲסוֹת בַּיְיָ מִבְּטֹחַ בָּאָדָם. טוֹב לַחֲסוֹת בַּיְיָ מִבְּטֹחַ בִּנְדִיבִים.\n\nהוֹדוּ לַיְיָ כִּי טוֹב, כִּי לְעוֹלָם חַסְדּוֹ.',
        phonetic: 'Baroukh ata Ado-naï Elo-hénou Mélekh haolam, achère kidéchanou bémitsvotav vétsivanou likro ète haHalèl.\n\nHalélouya, hallélou avdé Ado-naï, hallélou ète chem Ado-naï. Yéhi chem Ado-naï mévorakh, méata véad olam. Mimizra\'h chémèch ad mévo\'o, méhoulal chem Ado-naï. Ram al kol goyim Ado-naï, al hachamaïm kévodo.\n\nMin haméitsar karati Ya, anani vamèr\'hav Ya. Ado-naï li lo ira, ma yaassé li adam. Ado-naï li béozraï, vaani èré vésonéaï. Tov la\'hassot bAdo-naï mibétoa\'h baadam. Tov la\'hassot bAdo-naï mibétoa\'h bindivim.\n\nHodou lAdo-naï ki tov, ki léolam \'hasdo.' },

      { id: 'tahnoun', title: 'תַּחֲנוּן', titlePhonetic: 'Ta\'hanoun', tahnoun_day: true,
        text: 'וַיֹּאמֶר דָּוִד אֶל גָד, צַר לִי מְאֹד, נִפְּלָה נָא בְיַד יְיָ כִּי רַבִּים רַחֲמָיו, וּבְיַד אָדָם אַל אֶפֹּלָה.\n\nרַחוּם וְחַנּוּן, חָטָאתִי לְפָנֶיךָ, יְיָ מָלֵא רַחֲמִים, רַחֵם עָלַי וְקַבֵּל תַּחֲנוּנָי.\n\nיְיָ אַל בְּאַפְּךָ תוֹכִיחֵנִי, וְאַל בַּחֲמָתְךָ תְיַסְּרֵנִי. חׇנֵּנִי יְיָ כִּי אֻמְלַל אָנִי, רְפָאֵנִי יְיָ כִּי נִבְהֲלוּ עֲצָמָי. וְנַפְשִׁי נִבְהֲלָה מְאֹד, וְאַתָּה יְיָ עַד מָתָי. שׁוּבָה יְיָ חַלְּצָה נַפְשִׁי, הוֹשִׁיעֵנִי לְמַעַן חַסְדֶּךָ.',
        phonetic: 'Vayomère David el Gad, tsar li méod, nipéla na béyad Ado-naï ki rabim ra\'hamav, ouvéyad adam al épola.\n\nRa\'houm vé\'hanoun, \'hatati léfanékha, Ado-naï malé ra\'hamim, ra\'hèm alaï vékabèl ta\'hanounaï.\n\nAdo-naï al béapékha tokhi\'héni, véal ba\'hamatékha téyasséréni. \'Honéni Ado-naï ki oumlal ani, réfaéni Ado-naï ki nivhalou atsamaï. Vénafchi nivhala méod, véata Ado-naï ad mataï. Chouva Ado-naï \'haltsa nafchi, hochi\'éni lémaan \'hasdékha.' },

      { id: 'uva', title: 'וּבָא לְצִיּוֹן', titlePhonetic: 'Ouva léTsione', always: true,
        text: 'וּבָא לְצִיּוֹן גּוֹאֵל, וּלְשָׁבֵי פֶשַׁע בְּיַעֲקֹב, נְאֻם יְיָ. וַאֲנִי, זֹאת בְּרִיתִי אוֹתָם אָמַר יְיָ, רוּחִי אֲשֶׁר עָלֶיךָ וּדְבָרַי אֲשֶׁר שַׂמְתִּי בְּפִיךָ, לֹא יָמוּשׁוּ מִפִּיךָ וּמִפִּי זַרְעֲךָ וּמִפִּי זֶרַע זַרְעֲךָ, אָמַר יְיָ, מֵעַתָּה וְעַד עוֹלָם.\n\nוְאַתָּה קָדוֹשׁ, יוֹשֵׁב תְּהִלּוֹת יִשְׂרָאֵל.\n\nקָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְיָ צְבָאוֹת, מְלֹא כׇל הָאָרֶץ כְּבוֹדוֹ.\nבָּרוּךְ כְּבוֹד יְיָ מִמְּקוֹמוֹ.\nיִמְלֹךְ יְיָ לְעוֹלָם, אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר, הַלְלוּיָהּ.',
        phonetic: 'Ouva léTsione goèl, oulchavé pécha béYaakov, néoum Ado-naï. Vaani, zot briti otam amar Ado-naï, rou\'hi achère alékha oudvaraï achère samti béfikha, lo yamouchou mifikha oumipi zar\'akha oumipi zéra zar\'akha, amar Ado-naï, méata véad olam.\n\nVéata kadoch, yochèv téhilot Israël.\n\nKadoch Kadoch Kadoch Ado-naï tsévaot, mélo khol haarèts kévodo.\nBaroukh kévod Ado-naï miméko mo.\nYimlokh Ado-naï léolam, Elohayikh Tsione lédor vador, Halélouya.' },

      { id: 'aleinu', title: 'עָלֵינוּ', titlePhonetic: 'Alénou', always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכׇל הֲמוֹנָם.\n\nוַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא. שֶׁהוּא נוֹטֶה שָׁמַיִם וְיֹסֵד אָרֶץ, וּמוֹשַׁב יְקָרוֹ בַּשָּׁמַיִם מִמַּעַל, וּשְׁכִינַת עֻזּוֹ בְּגׇבְהֵי מְרוֹמִים. הוּא אֱלֹהֵינוּ אֵין עוֹד, אֱמֶת מַלְכֵּנוּ אֶפֶס זוּלָתוֹ, כַּכָּתוּב בְּתוֹרָתוֹ: וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ, כִּי יְיָ הוּא הָאֱלֹהִים בַּשָּׁמַיִם מִמַּעַל וְעַל הָאָרֶץ מִתָּחַת, אֵין עוֹד.\n\nעַל כֵּן נְקַוֶּה לְּךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזֶּךָ, לְהַעֲבִיר גִּלּוּלִים מִן הָאָרֶץ, וְהָאֱלִילִים כָּרוֹת יִכָּרֵתוּן, לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי. וְכׇל בְּנֵי בָשָׂר יִקְרְאוּ בִשְׁמֶךָ, לְהַפְנוֹת אֵלֶיךָ כׇּל רִשְׁעֵי אָרֶץ. יַכִּירוּ וְיֵדְעוּ כׇּל יוֹשְׁבֵי תֵבֵל, כִּי לְךָ תִּכְרַע כׇּל בֶּרֶךְ, תִּשָּׁבַע כׇּל לָשׁוֹן. לְפָנֶיךָ יְיָ אֱלֹהֵינוּ יִכְרְעוּ וְיִפֹּלוּ, וְלִכְבוֹד שִׁמְךָ יְקָר יִתֵּנוּ. וִיקַבְּלוּ כֻלָּם אֶת עֹל מַלְכוּתֶךָ, וְתִמְלֹךְ עֲלֵיהֶם מְהֵרָה לְעוֹלָם וָעֶד. כִּי הַמַּלְכוּת שֶׁלְּךָ הִיא, וּלְעוֹלְמֵי עַד תִּמְלוֹךְ בְּכָבוֹד. כַּכָּתוּב בְּתוֹרָתֶךָ: יְיָ יִמְלֹךְ לְעֹלָם וָעֶד. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כׇּל הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד וּשְׁמוֹ אֶחָד.',
        phonetic: 'Alénou léchabéa\'h laAdone hakol, latèt guédoula léyotsèr béréchit, chélo assanou kégoïé haaratsot, vélo samanou kémichpé\'hot haadama, chélo sam \'hélkénou kahèm, végoralénou kékhol hamonam.\n\nVaana\'hnou kor\'im oumichistaahavim oumodim lifné Mélekh malkhé hamélakhim, haKadoch Baroukh hou. Chéhou noté chamaïm véyossèd arèts, oumochav yékaro bachamaïm mimaal, ouchkhinat ouzo bégov\'hé méromim. Hou Elo-hénou ène od, émèt Malkénou éfèss zoulato, kakatouv béTorato : véyadaata hayom vahachèvota el lévavékha, ki Ado-naï hou haElohim bachamaïm mimaal véal haarèts mita\'hat, ène od.\n\nAl kène nékavé lékha Ado-naï Elo-hénou, lirot méhéra bétifèrèt ouzékha, léhaavir guiloulim mine haarèts, véhaélilim karot yikarétoun, létakène olam bémalkout Chadaï. Vékhol bné vassar yikréou vichémékha, léhafnot élékha kol rich\'é arèts. Yakirou véyédé\'ou kol yochvé tével, ki lékha tikra kol bérèkh, tichava kol lachone. Léfanékha Ado-naï Elo-hénou yikhréou véyipolou, vélikhvod chimékha yékar yiténou. Vikablou khoulam ète ol malkhouté kha, vétimlokh aléhèm méhéra léolam vaèd. Ki hamalkout chélékha hi, ouléolmé ad timlokh békhavod. Kakatouv béToratékha : Ado-naï yimlokh léolam vaèd. Vénéémar : véhaya Ado-naï léMélekh al kol haarèts, bayom hahou yihyé Ado-naï é\'had ouchmo é\'had.' },
    ]
  },
  mincha: {
    label: 'מִנְחָה', sublabel: 'Mincha', icon: '☀️',
    sections: [
      { id: 'ashrei-m', title: 'אַשְׁרֵי', titlePhonetic: 'Achré', always: true,
        text: 'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה.\nאַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ, אַשְׁרֵי הָעָם שֶׁיְיָ אֱלֹהָיו.\nתְּהִלָּה לְדָוִד: אֲרוֹמִמְךָ אֱלוֹהַי הַמֶּלֶךְ, וַאֲבָרְכָה שִׁמְךָ לְעוֹלָם וָעֶד.\nבְּכׇל יוֹם אֲבָרְכֶךָּ, וַאֲהַלְלָה שִׁמְךָ לְעוֹלָם וָעֶד.\nגָּדוֹל יְיָ וּמְהֻלָּל מְאֹד, וְלִגְדֻלָּתוֹ אֵין חֵקֶר.\nדּוֹר לְדוֹר יְשַׁבַּח מַעֲשֶׂיךָ, וּגְבוּרֹתֶיךָ יַגִּידוּ.\nהֲדַר כְּבוֹד הוֹדֶךָ, וְדִבְרֵי נִפְלְאוֹתֶיךָ אָשִׂיחָה.\nוֶעֱזוּז נוֹרְאוֹתֶיךָ יֹאמֵרוּ, וּגְדֻלָּתְךָ אֲסַפְּרֶנָּה.\nזֵכֶר רַב טוּבְךָ יַבִּיעוּ, וְצִדְקָתְךָ יְרַנֵּנוּ.\nחַנּוּן וְרַחוּם יְיָ, אֶרֶךְ אַפַּיִם וּגְדׇל חָסֶד.\nטוֹב יְיָ לַכֹּל, וְרַחֲמָיו עַל כׇּל מַעֲשָׂיו.\nיוֹדוּךָ יְיָ כׇּל מַעֲשֶׂיךָ, וַחֲסִידֶיךָ יְבָרְכוּכָה.\nכְּבוֹד מַלְכוּתְךָ יֹאמֵרוּ, וּגְבוּרָתְךָ יְדַבֵּרוּ.\nלְהוֹדִיעַ לִבְנֵי הָאָדָם גְּבוּרֹתָיו, וּכְבוֹד הֲדַר מַלְכוּתוֹ.\nמַלְכוּתְךָ מַלְכוּת כׇּל עוֹלָמִים, וּמֶמְשַׁלְתְּךָ בְּכׇל דּוֹר וָדוֹר.\nסוֹמֵךְ יְיָ לְכׇל הַנֹּפְלִים, וְזוֹקֵף לְכׇל הַכְּפוּפִים.\nעֵינֵי כֹל אֵלֶיךָ יְשַׂבֵּרוּ, וְאַתָּה נוֹתֵן לָהֶם אֶת אׇכְלָם בְּעִתּוֹ.\nפּוֹתֵחַ אֶת יָדֶךָ, וּמַשְׂבִּיעַ לְכׇל חַי רָצוֹן.\nצַדִּיק יְיָ בְּכׇל דְּרָכָיו, וְחָסִיד בְּכׇל מַעֲשָׂיו.\nקָרוֹב יְיָ לְכׇל קֹרְאָיו, לְכֹל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת.\nרְצוֹן יְרֵאָיו יַעֲשֶׂה, וְאֶת שַׁוְעָתָם יִשְׁמַע וְיוֹשִׁיעֵם.\nשׁוֹמֵר יְיָ אֶת כׇּל אֹהֲבָיו, וְאֵת כׇּל הָרְשָׁעִים יַשְׁמִיד.\nתְּהִלַּת יְיָ יְדַבֶּר פִּי, וִיבָרֵךְ כׇּל בָּשָׂר שֵׁם קׇדְשׁוֹ לְעוֹלָם וָעֶד.\nוַאֲנַחְנוּ נְבָרֵךְ יָהּ, מֵעַתָּה וְעַד עוֹלָם, הַלְלוּיָהּ.',
        phonetic: 'Achré yochvé vétékha, od yéhaléloukha séla.\nAchré haam chékakha lo, achré haam chéAdo-naï Elohav.\nTéhila léDavid : Aromimékha Elohaï haMélekh, vaavarkha chimékha léolam vaèd.\nBékhol yom avarkékha, vaahallela chimékha léolam vaèd.\nGadol Ado-naï ouméhoulal méod, véligdoulato eine \'hékèr.\nDor lédor yéchabba\'h maassékha, ouguévourotékha yaguidou.\nHadar kévod hodékha, védivrè niflèotékha assi\'ha.\nVeèzouz norèotékha yomérou, ouguédoulatékha assapérèna.\nZékhèr rav touvékha yabi\'ou, vétsidkatékha yéranénou.\n\'Hanoun véra\'houm Ado-naï, érèkh apaïm ougdol \'hassèd.\nTov Ado-naï lakol, véra\'hamav al kol maassav.\nYodoukha Ado-naï kol maassékha, va\'hassidékha yévarékhoukha.\nKévod malkhoutkha yomérou, ouguévouratkha yédabérou.\nLéhodia livné haadam guévourotav, oukhvod hadar malkhouto.\nMalkhoutkha malkhout kol olamim, oumémshaltkha békhol dor vador.\nSomèkh Ado-naï lékhol hanoflim, vézokèf lékhol hakéfoufim.\nÈné khol élékha yéssabérou, véata notène lahèm ète okhlam béito.\nPoté\'ah ète yadékha, oumassbiya lékhol \'haï ratson.\nTsadik Ado-naï békhol drakhav, vé\'hassid békhol maassav.\nKarov Ado-naï lékhol korav, lékhol achère yikraouhou véémet.\nRétson yéréav yaassé, véète chav\'atam yichma véyochi\'èm.\nChomèr Ado-naï ète kol ohavav, véèt kol harécha\'im yachmid.\nTéhilat Ado-naï yédabèr pi, vivarèkh kol bassar chèm kodsho léolam vaèd.\nVaana\'hnou névarèkh Ya, méata véad olam, Halélouya.' },
      { id: 'amida-m', title: 'עֲמִידָה', titlePhonetic: 'Amida', always: true,
        text: 'עֲמִידָה דְּמִנְחָה — אוֹתָן 19 בְּרָכוֹת כְּמוֹ בְּשַׁחֲרִית.\n\nהַקְּדֻשָּׁה (בְּרָכָה 3) נֶאֱמֶרֶת רַק בְּמִנְיָן. בְּיָחִיד אוֹמְרִים: אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכׇל יוֹם יְהַלְלוּךָ סֶּלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.\n\nסֵדֶר הַבְּרָכוֹת:\n1. אָבוֹת · 2. גְּבוּרוֹת · 3. קְדֻשָּׁה · 4. אַתָּה חוֹנֵן · 5. הֲשִׁיבֵנוּ · 6. סְלַח לָנוּ · 7. רְאֵה · 8. רְפָאֵנוּ · 9. בָּרֵךְ עָלֵינוּ · 10. תְּקַע בְּשׁוֹפָר · 11. הָשִׁיבָה שׁוֹפְטֵינוּ · 12. וְלַמַּלְשִׁינִים · 13. עַל הַצַּדִּיקִים · 14. וְלִירוּשָׁלַיִם · 15. אֶת צֶמַח דָּוִד · 16. שְׁמַע קוֹלֵנוּ · 17. רְצֵה · 18. מוֹדִים · 19. שִׂים שָׁלוֹם',
        phonetic: 'Amida de Min\'ha — les mêmes 19 bénédictions que dans la Amida de Cha\'harit.\n\nLa Kédoucha (bénédiction 3) se dit uniquement avec un miniane. En privé, on dit : Ata kadoch véchimékha kadoch, oukédochim békhol yom yéhaléloukha séla. Baroukh ata Ado-naï, haEl hakadoch.\n\nOrdre des bénédictions :\n1. Avot · 2. Guévourot · 3. Kédoucha · 4. Ata \'honène · 5. Hachivénou · 6. Séla\'h lanou · 7. Réé · 8. Réfaénou · 9. Barèkh alénou · 10. Téka béChofar · 11. Hachiva choftéinou · 12. Vélamalachiniim · 13. Al hatsadikim · 14. VéliYérouchalaïm · 15. Ète tséma\'h David · 16. Chéma kolénou · 17. Rétsé · 18. Modim · 19. Sim Chalom' },
      { id: 'tahnoun-m', title: 'תַּחֲנוּן', titlePhonetic: 'Ta\'hanoun', tahnoun_day: true,
        text: 'וַיֹּאמֶר דָּוִד אֶל גָד, צַר לִי מְאֹד, נִפְּלָה נָא בְיַד יְיָ כִּי רַבִּים רַחֲמָיו, וּבְיַד אָדָם אַל אֶפֹּלָה.\n\nרַחוּם וְחַנּוּן, חָטָאתִי לְפָנֶיךָ, יְיָ מָלֵא רַחֲמִים, רַחֵם עָלַי וְקַבֵּל תַּחֲנוּנָי.',
        phonetic: 'Vayomère David el Gad, tsar li méod, nipéla na béyad Ado-naï ki rabim ra\'hamav, ouvéyad adam al épola.\n\nRa\'houm vé\'hanoun, \'hatati léfanékha, Ado-naï malé ra\'hamim, ra\'hèm alaï vékabèl ta\'hanounaï.' },
      { id: 'aleinu-m', title: 'עָלֵינוּ', titlePhonetic: 'Alénou', always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכׇל הֲמוֹנָם.\n\nוַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא.\n\nעַל כֵּן נְקַוֶּה לְּךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזֶּךָ. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כׇּל הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד וּשְׁמוֹ אֶחָד.',
        phonetic: 'Alénou léchabéa\'h laAdone hakol, latèt guédoula léyotsèr béréchit, chélo assanou kégoïé haaratsot, vélo samanou kémichpé\'hot haadama, chélo sam \'hélkénou kahèm, végoralénou kékhol hamonam.\n\nVaana\'hnou kor\'im oumichistaahavim oumodim lifné Mélekh malkhé hamélakhim, haKadoch Baroukh hou.\n\nAl kène nékavé lékha Ado-naï Elo-hénou, lirot méhéra bétifèrèt ouzékha. Vénéémar : véhaya Ado-naï léMélekh al kol haarèts, bayom hahou yihyé Ado-naï é\'had ouchmo é\'had.' },
    ]
  },
  arvit: {
    label: 'עַרְבִית', sublabel: 'Arvit', icon: '🌙',
    sections: [
      { id: 'barchu', title: 'בָּרְכוּ', titlePhonetic: 'Barékhou', always: true,
        text: 'בָּרְכוּ אֶת יְיָ הַמְּבֹרָךְ.\nבָּרוּךְ יְיָ הַמְּבֹרָךְ לְעוֹלָם וָעֶד.\n\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בִּדְבָרוֹ מַעֲרִיב עֲרָבִים, בְּחׇכְמָה פּוֹתֵחַ שְׁעָרִים, וּבִתְבוּנָה מְשַׁנֶּה עִתִּים, וּמַחֲלִיף אֶת הַזְּמַנִּים, וּמְסַדֵּר אֶת הַכּוֹכָבִים בְּמִשְׁמְרוֹתֵיהֶם בָּרָקִיעַ כִּרְצוֹנוֹ. בּוֹרֵא יוֹם וָלָיְלָה, גּוֹלֵל אוֹר מִפְּנֵי חֹשֶׁךְ וְחֹשֶׁךְ מִפְּנֵי אוֹר, וּמַעֲבִיר יוֹם וּמֵבִיא לָיְלָה, וּמַבְדִּיל בֵּין יוֹם וּבֵין לָיְלָה, יְיָ צְבָאוֹת שְׁמוֹ. אֵל חַי וְקַיָּם, תָּמִיד יִמְלוֹךְ עָלֵינוּ לְעוֹלָם וָעֶד. בָּרוּךְ אַתָּה יְיָ, הַמַּעֲרִיב עֲרָבִים.',
        phonetic: 'Barékhou ète Ado-naï hamévorakh.\nBaroukh Ado-naï hamévorakh léolam vaèd.\n\nBaroukh ata Ado-naï Elo-hénou Mélekh haolam, achère bidvaro maariv aravim, bé\'hokhma poté\'ah chéarim, ouvitvonna méchané itim, ouma\'halif ète hazémanim, ouméssadèr ète hakokhavim bémichmérothèm barakiya kirtsono. Boré yom valaïla, golèl or mipné \'hochèkh vé\'hochèkh mipné or, oumaavir yom oumévi laïla, oumavdil bèn yom ouvèn laïla, Ado-naï tsévaot chémo. El \'haï vékayam, tamid yimlokh alénou léolam vaèd. Baroukh ata Ado-naï, hamaaariv aravim.' },
      { id: 'shema-a', title: 'קְרִיאַת שְׁמַע', titlePhonetic: 'Kriat Chéma', always: true,
        text: 'שְׁמַע יִשְׂרָאֵל יְיָ אֱלֹהֵינוּ יְיָ אֶחָד׃\n\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.\n\nוְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ בְּכׇל לְבָבְךָ וּבְכׇל נַפְשְׁךָ וּבְכׇל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ, וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשׇׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ, וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.\n\nוְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ אֶל מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם, לְאַהֲבָה אֶת יְיָ אֱלֹהֵיכֶם וּלְעׇבְדוֹ בְּכׇל לְבַבְכֶם וּבְכׇל נַפְשְׁכֶם. וְנָתַתִּי מְטַר אַרְצְכֶם בְּעִתּוֹ, יוֹרֶה וּמַלְקוֹשׁ, וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ, וְאָכַלְתָּ וְשָׂבָעְתָּ.\n\nוַיֹּאמֶר יְיָ אֶל מֹשֶׁה לֵּאמֹר. דַּבֵּר אֶל בְּנֵי יִשְׂרָאֵל וְאָמַרְתָּ אֲלֵהֶם, וְעָשׂוּ לָהֶם צִיצִת עַל כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם. וְהָיָה לָכֶם לְצִיצִת, וּרְאִיתֶם אֹתוֹ וּזְכַרְתֶּם אֶת כׇּל מִצְוֹת יְיָ וַעֲשִׂיתֶם אֹתָם. אֲנִי יְיָ אֱלֹהֵיכֶם אֲשֶׁר הוֹצֵאתִי אֶתְכֶם מֵאֶרֶץ מִצְרַיִם לִהְיוֹת לָכֶם לֵאלֹהִים, אֲנִי יְיָ אֱלֹהֵיכֶם. אֱמֶת.',
        phonetic: 'Chéma Israël, Ado-naï Elo-hénou, Ado-naï É\'had.\n\nBaroukh chem kevod malkhouto léolam vaèd.\n\nVéahavta ète Ado-naï Elohékha békhol lévavékha ouvékhol nafchékha ouvékhol méodékha. Véhayou hadévarim haélé achère anokhi métsavékha hayom al lévavékha. Véchinantam lévanékha, védibarta bam béchivtékha bévétékha ouvlékhté kha vadérèkh ouvchokh békha ouvkoumékha. Oukchartam léot al yadékha, véhayou létotafot bèn ènékha. Oukhtavtam al mézouzot bètékha ouvichaérékha.\n\nVéhaya im chamoa tichméou el mitsvotaï achère anokhi métsavé etkhèm hayom, léahava ète Ado-naï Elohékhèm ouléovdo békhol lévavkhèm ouvékhol nafchékhèm. Vénatati métar artsékhèm béito, yoré oumalcoche, véassafta dégagnékha vétirocjékha véyitsharékha. Vénatati èssèv béssadékha livhémtékha, véakhalta véssavata.\n\nVayomèr Ado-naï el Moché lémor. Dabèr el bné Israël véamarta aléhèm, véassou lahèm tsitsit al kanfé vigdéhèm lédorotam. Véhaya lakhèm létsitsit, ouritèm oto ouzkhartem ète kol mitsvot Ado-naï vaassitèm otam. Ani Ado-naï Elo-hékhèm achère hotsèti etkhèm méérèts Mitsraïm lihyot lakhèm lElohim, ani Ado-naï Elo-hékhèm. Émèt.' },
      { id: 'amida-a', title: 'עֲמִידָה', titlePhonetic: 'Amida', always: true,
        text: 'עֲמִידָה דְּעַרְבִית — אוֹתָן 19 בְּרָכוֹת כְּמוֹ בְּשַׁחֲרִית.\n\nהַקְּדֻשָּׁה (בְּרָכָה 3) נֶאֱמֶרֶת רַק בְּמִנְיָן. בְּיָחִיד אוֹמְרִים: אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכׇל יוֹם יְהַלְלוּךָ סֶּלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.\n\nסֵדֶר הַבְּרָכוֹת:\n1. אָבוֹת · 2. גְּבוּרוֹת · 3. קְדֻשָּׁה · 4. אַתָּה חוֹנֵן · 5. הֲשִׁיבֵנוּ · 6. סְלַח לָנוּ · 7. רְאֵה · 8. רְפָאֵנוּ · 9. בָּרֵךְ עָלֵינוּ · 10. תְּקַע בְּשׁוֹפָר · 11. הָשִׁיבָה שׁוֹפְטֵינוּ · 12. וְלַמַּלְשִׁינִים · 13. עַל הַצַּדִּיקִים · 14. וְלִירוּשָׁלַיִם · 15. אֶת צֶמַח דָּוִד · 16. שְׁמַע קוֹלֵנוּ · 17. רְצֵה · 18. מוֹדִים · 19. שִׂים שָׁלוֹם',
        phonetic: 'Amida de Arvit — les mêmes 19 bénédictions que dans la Amida de Cha\'harit.\n\nLa Kédoucha (bénédiction 3) se dit uniquement avec un miniane. En privé, on dit : Ata kadoch véchimékha kadoch, oukédochim békhol yom yéhaléloukha séla. Baroukh ata Ado-naï, haEl hakadoch.\n\nOrdre des bénédictions :\n1. Avot · 2. Guévourot · 3. Kédoucha · 4. Ata \'honène · 5. Hachivénou · 6. Séla\'h lanou · 7. Réé · 8. Réfaénou · 9. Barèkh alénou · 10. Téka béChofar · 11. Hachiva choftéinou · 12. Vélamalachiniim · 13. Al hatsadikim · 14. VéliYérouchalaïm · 15. Ète tséma\'h David · 16. Chéma kolénou · 17. Rétsé · 18. Modim · 19. Sim Chalom' },
      { id: 'aleinu-a', title: 'עָלֵינוּ', titlePhonetic: 'Alénou', always: true,
        text: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכׇל הֲמוֹנָם.\n\nוַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא.\n\nעַל כֵּן נְקַוֶּה לְּךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזֶּךָ. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כׇּל הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד וּשְׁמוֹ אֶחָד.',
        phonetic: 'Alénou léchabéa\'h laAdone hakol, latèt guédoula léyotsèr béréchit, chélo assanou kégoïé haaratsot, vélo samanou kémichpé\'hot haadama, chélo sam \'hélkénou kahèm, végoralénou kékhol hamonam.\n\nVaana\'hnou kor\'im oumichistaahavim oumodim lifné Mélekh malkhé hamélakhim, haKadoch Baroukh hou.\n\nAl kène nékavé lékha Ado-naï Elo-hénou, lirot méhéra bétifèrèt ouzékha. Vénéémar : véhaya Ado-naï léMélekh al kol haarèts, bayom hahou yihyé Ado-naï é\'had ouchmo é\'had.' },
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
    '.ss-card-title-phonetic { font-family:system-ui,sans-serif; font-size:11px; color:#aaa;',
    '  direction:ltr; text-align:right; margin-top:1px; font-weight:400;',
    '  -webkit-text-fill-color:#aaa; background:none; }',
    '.ss-card-badge { font-size:10px; border-radius:6px; padding:2px 7px; font-family:sans-serif; }',
    '.ss-badge-rh { background:linear-gradient(135deg,#833ab415,#fcb04515); color:#833ab4; border:1px solid #833ab430; }',
    '.ss-badge-male { background:#f5f5f5; color:#999; }',
    '.ss-card-chevron { font-size:12px; color:#ccc; transition:transform .3s; flex-shrink:0; }',
    '.ss-card.open .ss-card-chevron { transform:rotate(180deg); }',
    '.ss-card-body { padding:0 16px 16px; direction:rtl; font-family:"Frank Ruhl Libre",serif;',
    '  font-size:17px; line-height:2.1; color:#222; border-top:1px solid #f0f0f0;',
    '  padding-top:12px; white-space:pre-line; animation:ssFadeIn .25s ease; }',
    '.ss-card-phonetic { direction:ltr; font-family:system-ui,sans-serif; font-size:15px;',
    '  line-height:1.8; color:#666; border-top:1px dashed #e0e0e0; margin-top:0;',
    '  padding-top:10px; background:linear-gradient(135deg,rgba(131,58,180,.03),rgba(252,176,69,.03));',
    '  border-radius:0 0 12px 12px; }',

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
    var bodyContent = '';
    if (open) {
      if (state.phonetic && s.phonetic) {
        bodyContent = '<div class="ss-card-body">' + s.text + '</div>' +
          '<div class="ss-card-body ss-card-phonetic">' + s.phonetic + '</div>';
      } else {
        bodyContent = '<div class="ss-card-body">' + s.text + '</div>';
      }
    }
    return '<div class="ss-card' + (open ? ' open' : '') + '" id="ss-card-' + s.id + '">' +
      '<div class="ss-card-header" onclick="window.siddurToggleCard(\'' + s.id + '\')">' +
      '<div class="ss-card-left"><div class="ss-card-dot"></div>' +
      '<div><span class="ss-card-title">' + s.title + '</span>' +
      (state.phonetic && s.titlePhonetic ? '<div class="ss-card-title-phonetic">' + s.titlePhonetic + '</div>' : '') +
      '</div>' + badges + '</div>' +
      '<span class="ss-card-chevron">▾</span></div>' +
      bodyContent + '</div>';
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
    renderToggle('phonétique', 'phonetic') +
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
