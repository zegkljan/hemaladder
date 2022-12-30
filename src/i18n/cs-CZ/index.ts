import { Category, CoefficientType, Division, View } from 'src/logic/ladder';

export default {
  appName: 'Neoficiální český HEMA žebříček',
  sourceCode: 'Zdrojový kód',
  ladderOnFacebook: 'Facebooková stránka',
  addResults: {
    buttonLabel: 'Doplnit výsledky',
    title: 'Jak doplnit výsledky?',
    main: `Pokud v žebříčku nejsou zahrnuty výsledky turnaje, kde jste byli,
    dejte prosím vědět, a to následujícím způsobem:
    <ol>
      <li>
        Připravte si data:
        <ul>
          <li>Název turnaje</li>
          <li>Datum konání<sup>1</sup></li>
          <li>Země, ve které se turnaj odehrával</li>
          <li>Stránka či FB událost turnaje, existuje-li</li>
          <li>Stránka turnaje na HEMA Ratings, existuje-li</li>
          <li>
            Výsledky pro každou divizi<sup>2</sup> a kategorii<sup
              >3</sup
            >
            sestávající se z
            <ul>
              <li>Celkový počet účastníků v dané divizi a kategorii</li>
              <li>
                Seznam výsledků lidí, které chcete doplnit<sup>4</sup>.
                Pro každého člověka uveďte
                <ul>
                  <li>Jméno a příjmení</li>
                  <li>
                    Konečná příčka, na jaké se umístil(a) na konci
                    turnaje
                  </li>
                  <li>
                    Jeho/její HEMA Ratings ID<sup>5</sup>, existuje-li
                  </li>
                  <li>Klub, za který startoval(a)</li>
                  <li>
                    HEMA Ratings ID klubu<sup>6</sup>, existuje-li
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        Data odešlete na
        <a href="mailto:zegkljan{'@'}gmail.com">zegkljan{'@'}gmail.com</a> a do
        předmětu uveďte <em>Data pro HEMA žebříček</em>.
      </li>
      <li>
        Vyčkejte, než data zapracuji, případně reagujte na mé doplňující dotazy.
      </li>
    </ol>`,
    footnotes: `<ol>
    <li>V případě vícedenního turnaje uveďte první den.</li>
    <li>Divize jsou: dlouhý meč, rapír a dýka, šavle...</li>
    <li>Kategorie jsou: muži/open, ženy, dívky do 10 let...</li>
    <li>
      Evidujeme jen šermíře startující za české kluby, případně české
      šermíře, kteří soutěží bez klubu.
    </li>
    <li>
      Číslo v adrese stránky "profilu" daného člověka na HEMA Ratings.<br />
      Příklad: Jan Žegklitz má stránku
      <a href="https://hemaratings.com/fighters/details/3631/"
        >https://hemaratings.com/fighters/details/<strong
          >3631</strong
        ></a
      >
      a tedy jeho ID je 3631.
    </li>
    <li>
      Číslo v adrese stránky "profilu" daného klubu na HEMA Ratings.<br />
      Příklad: SHŠ Krkavci mají stránku
      <a href="https://hemaratings.com/clubs/details/362/"
        >https://hemaratings.com/clubs/details/<strong>362</strong></a
      >
      a tedy jejich ID je 362.
    </li>
  </ol>`,
  },
  close: 'Zavřít',
  settings: 'Nastavení',
  chooseSeason: 'Vyberte sezónu',
  divisionNoData: 'Pro tuto sezónu neobsahuje tato divize žádná data.',
  categoryNoData:
    'Pro tuto sezónu a divizi neobsahuje tato kategorie žádná data.',
  noData: 'Pro tuto kombinaci sezóny, divize a kategorie nejsou žádná data.',
  seasonTitle: 'Sezóna',
  divisionTitle: 'Divize',
  divisionNoTournaments: 'Počet turnajů',
  division: {
    [Division.LS]: 'Dlouhý meč',
    [Division.R]: 'Rapír',
    [Division.RAD]: 'Rapír a dýka',
    [Division.SAB]: 'Meč a štítek',
    [Division.SB]: 'Šavle',
    [Division.M]: 'Tesák (messer)',
    [Division.SS]: 'Renesanční meč (sidesword)',
    [Division.SM]: 'Kordík (smallsword)',
  },
  divisionSingleTournamentWarningTooltip:
    'V této divizi je zaznamenán pouze jeden turnaj.',
  categoryTitle: 'Kategorie',
  category: {
    [Category.MEN_OPEN]: 'Muži/open',
    [Category.WOMEN]: 'Ženy',
  },
  view: {
    [View.LADDER]: 'Žebříček',
    [View.CLUBS]: 'Kluby',
    [View.TOURNAMENTS]: 'Turnaje',
  },
  clubLabel: 'Klub',
  pointsLabel: 'Počet bodů',
  noClub: '(bez klubu)',
  pointsPerFencerLabel: 'Počet bodů na šermíře',
  tournamentLabel: 'Turnaj',
  dateLabel: 'Datum',
  countryLabel: 'Země',
  noParticipantsLabel: 'Počet účastníků',
  coefficientLabel: 'Koeficient',
  hemaratingsLabel: 'HEMA Ratings',
  hemaratingsDetailTooltip: 'Otevřít záznam turnaje na HEMA Ratings',
  hemaratingsNoDetailTooltip: 'Turnaj nemá záznam na HEMA Ratings',
  noFencersLabel: 'Počet šermířů',
  ladderTable: {
    rankLabel: 'Pořadí',
    previousSeasonChangeLabel: '+/-',
    previousSeasonChangeTooltip: 'Změna od předchozí sezóny',
    previousSeasonChangeNewInSeasonTooltip: 'Žádný záznam v předchozí sezóně',
    previousSeasonChangeBetterTooltip: {
      n1: 'Zlepšení o 1 místo',
      n2: 'Zlepšení o {n} místa',
      n5: 'Zlepšení o {n} míst',
    },
    previousSeasonChangeWorseTooltip: {
      n1: 'Zhoršení o 1 místo',
      n2: 'Zhoršení o {n} místa',
      n5: 'Zhoršení o {n} míst',
    },
    previousSeasonChangeNoChangeTooltip: 'Beze změny',
    nameLabel: 'Jméno',
    surnameLabel: 'Příjmení',
    detailsLabel: 'Detaily',
    fencerDetail: {
      fencer: 'O šermíři',
      tournaments: 'Účast na turnajích',
      hemaratingsLinkLabel: 'HEMA Ratings profil',
      noTournamentsLabel: 'Počet turnajů v žebříčku',
      avgPtsPerTournamentLabel: 'Průměrný počet bodů na turnaj',
      rank: 'Umístění',
      coefficientType: {
        [CoefficientType.FOREIGN]: 'Zahraniční turnaj',
        [CoefficientType.TOURNAMENT]: 'Koeficient turnaje',
        [CoefficientType.HIGHER_CATEGORY]: 'Vyšší kategorie',
        [CoefficientType.RANK_1]: 'První místo',
        [CoefficientType.RANK_2]: 'Druhé místo',
        [CoefficientType.RANK_3]: 'Třetí místo',
        [CoefficientType.RANK_4]: 'Čtvrté místo',
      },
      coefficientTotal: 'Celkem',
      points: 'Počet bodů',
      tournamentDetailLabel: 'HEMA Ratings',
    },
  },
  clubsTable: {
    pointsHeaderTooltip: 'Součet počtu bodů získaných šermíři daného klubu',
  },
  countries: {
    af: 'Afghánistán',
    ax: 'Alandy',
    al: 'Albánie',
    dz: 'Alžírsko',
    as: 'Americká Samoa',
    vi: 'Americké Panenské ostrovy',
    ad: 'Andorra',
    ao: 'Angola',
    ai: 'Anguilla',
    aq: 'Antarktida',
    ag: 'Antigua a Barbuda',
    ar: 'Argentina',
    am: 'Arménie',
    aw: 'Aruba',
    au: 'Austrálie',
    az: 'Ázerbájdžán',
    bs: 'Bahamy',
    bh: 'Bahrajn',
    bd: 'Bangladéš',
    bb: 'Barbados',
    be: 'Belgie',
    bz: 'Belize',
    by: 'Bělorusko',
    bj: 'Benin',
    bm: 'Bermudy',
    bt: 'Bhútán',
    bo: 'Bolívie',
    bq: 'Bonaire, Svatý Eustach a Saba',
    ba: 'Bosna a Hercegovina',
    bw: 'Botswana',
    bv: 'Bouvetův ostrov',
    br: 'Brazílie',
    io: 'Britské indickooceánské území',
    vg: 'Britské Panenské ostrovy',
    bn: 'Brunej',
    bg: 'Bulharsko',
    bf: 'Burkina Faso',
    bi: 'Burundi',
    ck: 'Cookovy ostrovy',
    cw: 'Curaçao',
    td: 'Čad',
    me: 'Černá Hora',
    cz: 'Česko',
    cn: 'Čína',
    dk: 'Dánsko',
    dm: 'Dominika',
    do: 'Dominikánská republika',
    dj: 'Džibutsko',
    eg: 'Egypt',
    ec: 'Ekvádor',
    er: 'Eritrea',
    ee: 'Estonsko',
    et: 'Etiopie',
    fo: 'Faerské ostrovy',
    fk: 'Falklandy (Malvíny)',
    fj: 'Fidži',
    ph: 'Filipíny',
    fi: 'Finsko',
    fr: 'Francie',
    gf: 'Francouzská Guyana',
    tf: 'Francouzská jižní a antarktická území',
    pf: 'Francouzská Polynésie',
    ga: 'Gabon',
    gm: 'Gambie',
    gh: 'Ghana',
    gi: 'Gibraltar',
    gd: 'Grenada',
    gl: 'Grónsko',
    ge: 'Gruzie',
    gp: 'Guadeloupe',
    gu: 'Guam',
    gt: 'Guatemala',
    gn: 'Guinea',
    gw: 'Guinea-Bissau',
    gg: 'Guernsey',
    gy: 'Guyana',
    ht: 'Haiti',
    hm: 'Heardův ostrov a McDonaldovy ostrovy',
    hn: 'Honduras',
    hk: 'Hongkong',
    cl: 'Chile',
    hr: 'Chorvatsko',
    in: 'Indie',
    id: 'Indonésie',
    iq: 'Irák',
    ir: 'Írán',
    ie: 'Irsko',
    is: 'Island',
    it: 'Itálie',
    il: 'Izrael',
    jm: 'Jamajka',
    jp: 'Japonsko',
    ye: 'Jemen',
    je: 'Jersey',
    za: 'Jihoafrická republika',
    gs: 'Jižní Georgie a Jižní Sandwichovy ostrovy',
    kr: 'Jižní Korea',
    ss: 'Jižní Súdán',
    jo: 'Jordánsko',
    ky: 'Kajmanské ostrovy',
    kh: 'Kambodža',
    cm: 'Kamerun',
    ca: 'Kanada',
    cv: 'Kapverdy',
    qa: 'Katar',
    kz: 'Kazachstán',
    ke: 'Keňa',
    ki: 'Kiribati',
    cc: 'Kokosové ostrovy',
    co: 'Kolumbie',
    km: 'Komory',
    cg: 'Kongo',
    cd: 'Konžská demokratická republika',
    cr: 'Kostarika',
    cu: 'Kuba',
    kw: 'Kuvajt',
    cy: 'Kypr',
    kg: 'Kyrgyzstán',
    la: 'Laos',
    ls: 'Lesotho',
    lb: 'Libanon',
    lr: 'Libérie',
    ly: 'Libye',
    li: 'Lichtenštejnsko',
    lt: 'Litva',
    lv: 'Lotyšsko',
    lu: 'Lucembursko',
    mo: 'Macao',
    mg: 'Madagaskar',
    hu: 'Maďarsko',
    my: 'Malajsie',
    mw: 'Malawi',
    mv: 'Maledivy',
    ml: 'Mali',
    mt: 'Malta',
    im: 'Ostrov Man',
    ma: 'Maroko',
    mh: 'Marshallovy ostrovy',
    mq: 'Martinik',
    mu: 'Mauricius',
    mr: 'Mauritánie',
    yt: 'Mayotte',
    um: 'Menší odlehlé ostrovy USA',
    mx: 'Mexiko',
    fm: 'Mikronésie',
    md: 'Moldavsko',
    mc: 'Monako',
    mn: 'Mongolsko',
    ms: 'Montserrat',
    mz: 'Mosambik',
    mm: 'Myanmar',
    na: 'Namibie',
    nr: 'Nauru',
    de: 'Německo',
    np: 'Nepál',
    ne: 'Niger',
    ng: 'Nigérie',
    ni: 'Nikaragua',
    nu: 'Niue',
    nl: 'Nizozemsko',
    nf: 'Norfolk',
    no: 'Norsko',
    nc: 'Nová Kaledonie',
    nz: 'Nový Zéland',
    om: 'Omán',
    pk: 'Pákistán',
    pw: 'Palau',
    ps: 'Palestinská autonomie',
    pa: 'Panama',
    pg: 'Papua Nová Guinea',
    py: 'Paraguay',
    pe: 'Peru',
    pn: 'Pitcairnovy ostrovy',
    ci: 'Pobřeží slonoviny',
    pl: 'Polsko',
    pr: 'Portoriko',
    pt: 'Portugalsko',
    at: 'Rakousko',
    re: 'Réunion',
    gq: 'Rovníková Guinea',
    ro: 'Rumunsko',
    ru: 'Rusko',
    rw: 'Rwanda',
    gr: 'Řecko',
    pm: 'Saint Pierre a Miquelon',
    sv: 'Salvador',
    ws: 'Samoa',
    sm: 'San Marino',
    sa: 'Saúdská Arábie',
    sn: 'Senegal',
    kp: 'Severní Korea',
    mk: 'Severní Makedonie',
    mp: 'Severní Mariany',
    sc: 'Seychely',
    sl: 'Sierra Leone',
    sg: 'Singapur',
    sk: 'Slovensko',
    si: 'Slovinsko',
    so: 'Somálsko',
    ae: 'Spojené arabské emiráty',
    gb: 'Spojené království Velké Británie a Severního Irska',
    us: 'Spojené státy americké',
    rs: 'Srbsko',
    lk: 'Srí Lanka',
    cf: 'Středoafrická republika',
    sd: 'Súdán',
    sr: 'Surinam',
    sh: 'Svatá Helena, Ascension a Tristan da Cunha',
    lc: 'Svatá Lucie',
    bl: 'Svatý Bartoloměj',
    kn: 'Svatý Kryštof a Nevis',
    mf: 'Svatý Martin (francouzská část)',
    sx: 'Svatý Martin (nizozemská část)',
    st: 'Svatý Tomáš a Princův ostrov',
    vc: 'Svatý Vincenc a Grenadiny',
    sz: 'Svazijsko',
    sy: 'Sýrie',
    sb: 'Šalomounovy ostrovy',
    es: 'Španělsko',
    sj: 'Špicberky a Jan Mayen',
    se: 'Švédsko',
    ch: 'Švýcarsko',
    tj: 'Tádžikistán',
    tz: 'Tanzanie',
    th: 'Thajsko',
    tw: 'Tchaj-wan',
    tg: 'Togo',
    tk: 'Tokelau',
    to: 'Tonga',
    tt: 'Trinidad a Tobago',
    tn: 'Tunisko',
    tr: 'Turecko',
    tm: 'Turkmenistán',
    tc: 'Turks a Caicos',
    tv: 'Tuvalu',
    ug: 'Uganda',
    ua: 'Ukrajina',
    uy: 'Uruguay',
    uz: 'Uzbekistán',
    cx: 'Vánoční ostrov',
    vu: 'Vanuatu',
    va: 'Vatikán',
    ve: 'Venezuela',
    vn: 'Vietnam',
    tl: 'Východní Timor',
    wf: 'Wallis a Futuna',
    zm: 'Zambie',
    eh: 'Západní Sahara',
    zw: 'Zimbabwe',
  },
};
