// ── Patakh Eliyahou — Tikounei Zohar 17a ──────────────────────────────────
// Recite par les communautes sefarades avant Chaharit et Minha
// et par les hassidim Habad le vendredi avant Minha
(function () {
'use strict';

var text =
'פָּתַח אֵלִיָּהוּ הַנָּבִיא זָכוּר לְטוֹב, וְאָמַר:\n\n' +

'רִבּוֹן עָלְמִין, אַנְתְּ הוּא חַד וְלָא בְחוּשְׁבָּן. אַנְתְּ הוּא עִלָּאָה עַל כָּל עִלָּאִין, סְתִימָא עַל כָּל סְתִימִין, לֵית מַחֲשָׁבָה תְּפִיסָא בָךְ כְּלָל.\n\n' +

'אַנְתְּ הוּא דְּאַפִּיקַת עֶשֶׂר תִּקּוּנִין, וּקְרֵינָן לוֹן עֶשֶׂר סְפִירָן, לְאַנְהָגָא בְהוֹן עָלְמִין סְתִימִין דְּלָא אִתְגַּלְיָן, וְעָלְמִין דְּאִתְגַּלְיָן. וּבְהוֹן אִתְכַּסִּיאַת מִבְּנֵי נָשָׁא. וְאַנְתְּ הוּא דְּקָשִׁיר לוֹן וּמְיַחֵד לוֹן. וּבְגִין דְּאַנְתְּ מִלְּגָאו, כָּל מַאן דְּאַפְרִישׁ חַד מִן חַבְרֵיהּ מֵאִלֵּין עֲשָׂרָה, אִתְחֲשִׁיב לֵיהּ כְּאִלּוּ אַפְרִישׁ בָּךְ.\n\n' +

'וְאִלֵּין עֶשֶׂר סְפִירָן, אִנּוּן אָזְלִין כְּסִדְרָן. חַד אָרִיךְ, וְחַד קָצִיר, וְחַד בֵּינוֹנִי. וְאַנְתְּ הוּא דְּאַנְהִיג לוֹן, וְלֵית מַאן דְּאַנְהִיג לָךְ, לָא לְעֵלָּא וְלָא לְתַתָּא וְלָא מִכָּל סִטְרָא. לְבוּשִׁין תַּקִּינַת לוֹן, דְּמִנַּיְיהוּ פָּרְחִין נִשְׁמָתִין לִבְנֵי נָשָׁא. וְכַמָּה גוּפִין תַּקִּינַת לוֹן, דְּאִתְקְרִיאוּ גוּפָא, לָגַבֵּי לְבוּשִׁין דִּמְכַסְּיָין עֲלֵיהוֹן.\n\n' +

'וְאִתְקְרִיאוּ בְתִקּוּנָא דָא:\n' +
'חֶסֶד — דְּרוֹעָא יְמִינָא.\n' +
'גְּבוּרָה — דְּרוֹעָא שְׂמָאלָא.\n' +
'תִּפְאֶרֶת — גּוּפָא.\n' +
'נֶצַח וְהוֹד — תְּרֵין שׁוֹקִין.\n' +
'יְסוֹד — סִיּוּמָא דְגוּפָא, אוֹת בְּרִית קֹדֶשׁ.\n' +
'מַלְכוּת — פֶּה, תּוֹרָה שֶׁבְּעַל פֶּה קָרֵינָן לָהּ.\n\n' +

'חָכְמָה — מוֹחָא, אִיהִי מַחֲשָׁבָה מִלְּגָאו.\n' +
'בִּינָה — לִבָּא, וּבָהּ הַלֵּב מֵבִין.\n' +
'וְעַל אִלֵּין תְּרֵין כְּתִיב: הַנִּסְתָּרוֹת לַייָ אֱלֹהֵינוּ.\n\n' +

'כֶּתֶר עֶלְיוֹן — אִיהוּ כֶּתֶר מַלְכוּת, וַעֲלֵיהּ אִתְּמַר: מַגִּיד מֵרֵאשִׁית אַחֲרִית. וְאִיהוּ קַרְקַפְתָּא דִתְפִלֵּי.\n' +
'מִלְּגָאו אִיהוּ יוֹ"ד הֵ"א וָא"ו הֵ"א, דְּאִיהוּ אֹרַח אֲצִילוּת.\n' +
'אִיהוּ שַׁקְיוּ דְאִילָנָא בִּדְרוֹעוֹי וְעַנְפּוֹי, כְּמַיָּא דְאַשְׁקֵי לְאִילָנָא, וְאִתְרַבֵּי בְּהַהוּא שַׁקְיוּ.\n\n' +

'רִבּוֹן עָלְמִין, אַנְתְּ הוּא עִלַּת הָעִלּוֹת, וְסִבַּת הַסִּבּוֹת, דְּאַשְׁקֵי לְאִילָנָא בְּהַהוּא נְבִיעוּ. וְהַהוּא נְבִיעוּ אִיהוּ כְּנִשְׁמָתָא לְגוּפָא, דְּאִיהוּ חַיִּים לְגוּפָא. וּבָךְ לֵית דִּמְיוֹן, וְלֵית דְּיוּקְנָא, מִכָּל מַה דִּלְגָאו וּמִכָּל מַה דִּלְבַר.\n\n' +

'וּבָרָאתָ שְׁמַיָּא וְאַרְעָא, וְאַפִּיקַת מִנְּהוֹן שִׁמְשָׁא וְסִיהֲרָא וְכוֹכְבַיָּא וּמַזָּלֵי. וּבְאַרְעָא — אִילָנֵי וְדִשְׁאִין וְגִנְתָּא דְעֵדֶן, וְעִשְׂבִּין וְחֵיוָן וְעוֹפִין וְנוּנֵי וּבְעִירֵי וּבְנֵי נָשָׁא.\n' +
'לְאִשְׁתְּמוֹדְעָא בְהוֹן עִלָּאֵי, וְאֵיךְ יִתְנַהֲגוּן עִלָּאֵי וְתַתָּאֵי, וְאֵיךְ אִשְׁתְּמוֹדְעָן מֵעִלָּאֵי וְתַתָּאֵי, וְלֵית דְּיָדַע בָּךְ כְּלָל.\n\n' +

'וּבַר מִנָּךְ לֵית יִחוּדָא בְּעִלָּאֵי וְתַתָּאֵי, וְאַנְתְּ אִשְׁתְּמוֹדַע אֲדוֹן עַל כֹּלָּא.\n' +
'וְכָל סְפִירָה אִית לָהּ שֵׁם יְדִיעָא, וּבְהוֹן אִתְקְרִיאוּ מַלְאָכַיָּא. וְאַנְתְּ לֵית לָךְ שֵׁם יְדִיעָא, דְּאַנְתְּ הוּא דִמְמַלֵּא כָל שְׁמָהָן, וְאַנְתְּ הוּא שְׁלִימוּ דְכֻלְּהוּ. וְכַד אַנְתְּ תִּסְתַּלֵּק מִנְּהוֹן, אִשְׁתָּאֲרוּ כֻּלְּהוּ שְׁמָהָן כְּגוּפָא בְלָא נִשְׁמָתָא.\n\n' +

'אַנְתְּ הוּא חַכִּים, וְלָא בְּחׇכְמָה יְדִיעָא. אַנְתְּ הוּא מֵבִין, וְלָא בְּבִינָה יְדִיעָא. לֵית לָךְ אֲתַר יְדִיעָא, אֶלָּא לְאִשְׁתְּמוֹדְעָא תֻּקְפָּךְ וְחֵילָךְ לִבְנֵי נָשָׁא. וּלְאַחֲזָאָה לוֹן אֵיךְ אִתְנַהִיג עָלְמָא בְּדִינָא וּבְרַחֲמֵי, דְּאִנּוּן צֶדֶק וּמִשְׁפָּט, כְּפוּם עוֹבָדֵיהוֹן דִּבְנֵי נָשָׁא.\n\n' +

'דִּין אִיהוּ גְבוּרָה, מִשְׁפָּט עַמּוּדָא דְאֶמְצָעִיתָא, צֶדֶק מַלְכוּת קַדִּישָׁא, מֹאזְנֵי צֶדֶק תְּרֵין סַמְכֵי קְשׁוֹט, הִין צֶדֶק אוֹת בְּרִית. כֹּלָּא לְאַחֲזָאָה אֵיךְ אִתְנַהִיג עָלְמָא, אֲבָל לָאו דְּאִית לָךְ צֶדֶק יְדִיעָא, דְּאִיהוּ דִין, וְלָא מִשְׁפָּט יְדִיעָא, דְּאִיהוּ רַחֲמֵי, וְלָא מִכָּל אִלֵּין מִדּוֹת כְּלָל.';

var phonetic =
"Pata'h Eliyahou hanavi zakhor létov, véamar :\n\n" +

"Ribone almine, Ante hou 'had véla bé'houchbane. Ante hou ilaah al kol ilaïne, sétima al kol sétimine, lète ma'hchava tévissa bakh klal.\n\n" +

"Ante hou déafikat assara tikounine, oukréinan lone assara séfirane, léanhaga véhone almine sétimine déla itgalyane, véalmine déitgalyane. Ouvéhone itkassiat mibné nacha. VéAnte hou dékachir lone ouméya'héd lone. Ouvéguine déAnte miléga'ou, kol mane déafrich 'had mine 'havréh méilène assara, it'hachiv léh kéilou africh bakh.\n\n" +

"Véilène assara séfirane, inoun azline késidrane. 'Had arikh, vé'had katsir, vé'had béinonui. VéAnte hou déanhig lone, vélète mane déanhig lakh, la léèla véla létata véla mikol sitra. Lévouchine takinat lone, déminaihou par'hine nichmatine livné nacha. Vékhama goufine takinat lone, déitkri'ou goufa, lagabé lévouchine dimkhassiyane aléhone.\n\n" +

"Véitkri'ou bétikkouna da :\n" +
"'Hessèd — déro'a yémina.\n" +
"Guévoura — déro'a sémala.\n" +
"Tiférète — goufa.\n" +
"Nétsa'h véHod — trène chokine.\n" +
"Yéssod — siyouma dégoufa, ot brit kodèch.\n" +
"Malkout — pé, Tora chébéal pé karéinan lah.\n\n" +

"'Hokhma — mo'ha, ihi ma'hchava miléga'ou.\n" +
"Bina — liba, ouvah halèv mévine.\n" +
"Véal ilène trène kétiv : hannistarot lAdo-naï Elo-hénou.\n\n" +

"Kétèr Èlyione — ihou kétèr malkout, vaaleih itmar : maguid méréchit a'harit. Véihou karkafta ditfilé.\n" +
"Miléga'ou ihou Youd Hé Vav Hé, déihou ora'h atsilout.\n" +
"Ihou chakyou déilana bidro'oi véanpoi, kémaya déachké léilana, véitrabé béhahou chakyou.\n\n" +

"Ribone almine, Ante hou ilat hailot, vésibat hassibote, déachké léilana béhahou névi'ou. Véhahou névi'ou ihou kénichmatah légoufa, déihou 'hayim légoufa. Ouvakh lète dimyone, vélète dioukna, mikol ma diléga'ou oumikol ma dilvar.\n\n" +

"Ouvarata chémaya véar'a, véafikat minéhone chimcha vésihra vékhokhovaya oumazalé. Ouvéar'a — ilané védich'ine véguinta déÈdène, vé'isvine vé'hévane vé'ofine vénouné ouvé'iré ouvné nacha.\n" +
"Léichtémod'a béhone ila'é, vé'èkh yitnahagoun ila'é vétata'é, vé'èkh ichtémod'ane mé'ila'é vétata'é, vélète déyada bakh klal.\n\n" +

"Ouvar minakh lète yi'houda bé'ila'é vétata'é, véAnte ichtémoda Adone al kola.\n" +
"Vékhol séfira it lah chème yédi'a, ouvéhone itkri'ou malakhaya. VéAnte lète lakh chème yédi'a, déAnte hou dimémalé kol chémahane, véAnte hou chélimoute dékhoulhou. Vékhad Ante tistalek minéhone, ichtaarou koulhou chémaahane kégoufa béla nichmatah.\n\n" +

"Ante hou 'hakime, véla bé'hokhma yédi'a. Ante hou mévine, véla bébina yédi'a. Lète lakh atar yédi'a, èla léichtémod'a toukpakh vé'hèlakh livné nacha. Oulé'hazaa lone èkh itnahi'g alma bédina ouvéra'hamé, déinoun tsédèk oumichpat, kéfoum ovadéhone divné nacha.\n\n" +

"Dine ihou guévoura, michpat amouda déèmtsa'ita, tsédèk malkout kaddicha, moznei tsédèk trène samkhé késhote, hine tsédèk ot brit. Kola lé'hazaa èkh itnahi'g alma, aval laou déit lakh tsédèk yédi'a, déihou dine, véla michpat yédi'a, déihou ra'hamé, véla mikol ilène midot klal.";

window.SIDDUR_PATAKH_ELIYAHOU = { text: text, phonetic: phonetic };

})();
