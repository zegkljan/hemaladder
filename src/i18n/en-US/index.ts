import { Category, CoefficientType, Division, View } from 'src/logic/ladder';

export default {
  appName: 'Unofficial czech HEMA ladder',
  sourceCode: 'Source code',
  ladderOnFacebook: 'Facebook page',
  addResults: {
    buttonLabel: 'Supply results',
    title: 'How to supply results?',
    main: `If the ladder does not include results of a tournament you
    attended, please let me know like this:
    <ol>
      <li>
        Prepare the data:
        <ul>
          <li>Tournament name</li>
          <li>Date of the tournament<sup>1</sup></li>
          <li>Country the tournament took place in</li>
          <li>Web page or FB event of the tournament, if one exists</li>
          <li>HEMA Ratings page of the tournament, if one exists</li>
          <li>Results for each division<sup>2</sup> and category<sup>3</sup> comprising of
            <ul>
              <li>The total number of participants in the given division and category.</li>
              <li>
                List of results of people you want to add<sup>4</sup>.
                For each person state
                <ul>
                  <li>Name and surname</li>
                  <li>Their final rank at the end of the tournament</li>
                  <li>Their HEMA Ratings ID<sup>5</sup>, if one exists</li>
                  <li>Club they represented</li>
                  <li>HEMA Ratings ID of the club<sup>6</sup>, if one exists</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        Send the data to
        <a href="mailto:zegkljan{'@'}gmail.com">zegkljan{'@'}gmail.com</a> and state
        <em>HEMA ladder data</em> in the subject.
      </li>
      <li>
        Wait untill I incorporate the data, possibly react to my supplementary questions.
      </li>
    </ol>`,
    footnotes: `<ol>
    <li>In case of multi-day tournament state the first day.</li>
    <li>Divisions are: long sword, rapier and dagger, saber...</li>
    <li>Categories are: men/open, women, girls under 10 years...</li>
    <li>
      We record only fencers representing Czech clubs, or Czech fencers competing without any club.
    </li>
    <li>
      The number in the address of the "profile" page on HEMA Ratings of the given person.<br />
      Example: Jan Žegklitz has page
      <a href="https://hemaratings.com/fighters/details/3631/"
        >https://hemaratings.com/fighters/details/<strong
          >3631</strong
        ></a
      >
      a therefore his ID is 3631.
    </li>
    <li>
      The number in the address of the "profile" page of on HEMA Ratings of the given club.<br />
      Example: SHŠ Krkavci have page
      <a href="https://hemaratings.com/clubs/details/362/"
        >https://hemaratings.com/clubs/details/<strong>362</strong></a
      >
      a therefore their ID is 362.
    </li>
  </ol>`,
  },
  close: 'Close',
  settings: 'Settings',
  chooseSeason: 'Choose season sezónu',
  divisionNoData: 'There is no data for this division in this season.',
  categoryNoData:
    'There is no data for this category in this season and division.',
  noData:
    'There is no data for this combination of season, division, and category.',
  seasonTitle: 'Season',
  divisionTitle: 'Division',
  divisionNoTournaments: 'No. of tournaments',
  division: {
    [Division.LS]: 'Long sword',
    [Division.R]: 'Rapier',
    [Division.RAD]: 'Rapier and dagger',
    [Division.SAB]: 'Sword and buckler',
    [Division.SB]: 'Saber',
    [Division.M]: 'Messer',
    [Division.SS]: 'Sidesword',
    [Division.SM]: 'Smallsword',
  },
  divisionSingleTournamentWarningTooltip:
    'There is only a single tournament recorded in this division.',
  categoryTitle: 'Category',
  category: {
    [Category.MEN_OPEN]: 'Men/open',
    [Category.WOMEN]: 'Women',
  },
  view: {
    [View.LADDER]: 'Ladder',
    [View.CLUBS]: 'Clubs',
    [View.TOURNAMENTS]: 'Tournaments',
  },
  clubLabel: 'Club',
  pointsLabel: 'No. of points',
  noClub: '(no club)',
  pointsPerFencerLabel: 'No. of points per fencer',
  tournamentLabel: 'Tournament',
  dateLabel: 'Date',
  countryLabel: 'Country',
  noParticipantsLabel: 'No. of participants',
  coefficientLabel: 'Coefficient',
  resultsLabel: 'Full results',
  resultsDetailTooltip: 'Open page with tournament results',
  resultsNoDetailTooltip: 'The tournament does not have results available online',
  hemaratingsLabel: 'HEMA Ratings',
  hemaratingsDetailTooltip: 'Open tournament record at HEMA Ratings',
  hemaratingsNoDetailTooltip: 'Tournament has no record at HEMA Ratings',
  noFencersLabel: 'No. of fencers',
  ladderTable: {
    rankLabel: 'Rank',
    previousSeasonChangeLabel: '+/-',
    previousSeasonChangeTooltip: 'Change from last season',
    previousSeasonChangeNewInSeasonTooltip: 'No record in previous season',
    previousSeasonChangeBetterTooltip: {
      n1: 'Better by 1 place',
      n2: 'Better by {n} places',
      n5: 'Better by {n} places',
    },
    previousSeasonChangeWorseTooltip: {
      n1: 'Worse by 1 place',
      n2: 'Worse by {n} places',
      n5: 'Worse by {n} places',
    },
    previousSeasonChangeNoChangeTooltip: 'No change',
    nameLabel: 'Name',
    surnameLabel: 'Surname',
    detailsLabel: 'Details',
    fencerDetail: {
      fencer: 'About fencer',
      tournaments: 'Tournament participation',
      hemaratingsLinkLabel: 'HEMA Ratings profile',
      noTournamentsLabel: 'No. of tournaments in ladder',
      avgPtsPerTournamentLabel: 'Average points per tournament',
      rank: 'Rank',
      coefficientType: {
        [CoefficientType.FOREIGN]: 'Tournament abroad',
        [CoefficientType.TOURNAMENT]: 'Tournament coefficient',
        [CoefficientType.HIGHER_CATEGORY]: 'Higher category',
        [CoefficientType.RANK_1]: 'First place',
        [CoefficientType.RANK_2]: 'Second place',
        [CoefficientType.RANK_3]: 'Third place',
        [CoefficientType.RANK_4]: 'Fourth place',
      },
      coefficientTotal: 'Total',
      points: 'No. of points',
      tournamentResultsLabel: 'Full results',
      tournamentDetailLabel: 'HEMA Ratings',
    },
  },
  clubsTable: {
    pointsHeaderTooltip:
      'Sum of points gained by the fencers of the given club',
  },
  countries: {
    af: 'Afghanistan',
    ax: 'Åland Islands',
    al: 'Albania',
    dz: 'Algeria',
    as: 'American Samoa',
    ad: 'Andorra',
    ao: 'Angola',
    ai: 'Anguilla',
    aq: 'Antarctica',
    ag: 'Antigua and Barbuda',
    ar: 'Argentina',
    am: 'Armenia',
    aw: 'Aruba',
    au: 'Australia',
    at: 'Austria',
    az: 'Azerbaijan',
    bs: 'Bahamas',
    bh: 'Bahrain',
    bd: 'Bangladesh',
    bb: 'Barbados',
    by: 'Belarus',
    be: 'Belgium',
    bz: 'Belize',
    bj: 'Benin',
    bm: 'Bermuda',
    bt: 'Bhutan',
    bo: 'Bolivia (Plurinational State of)',
    bq: 'Bonaire, Sint Eustatius and Saba[c]',
    ba: 'Bosnia and Herzegovina',
    bw: 'Botswana',
    bv: 'Bouvet Island',
    br: 'Brazil',
    io: 'British Indian Ocean Territory',
    bn: 'Brunei Darussalam',
    bg: 'Bulgaria',
    bf: 'Burkina Faso',
    bi: 'Burundi',
    cv: 'Cabo Verde',
    kh: 'Cambodia',
    cm: 'Cameroon',
    ca: 'Canada',
    ky: 'Cayman Islands',
    cf: 'Central African Republic',
    td: 'Chad',
    cl: 'Chile',
    cn: 'China[b]',
    cx: 'Christmas Island',
    cc: 'Cocos (Keeling) Islands',
    co: 'Colombia',
    km: 'Comoros',
    cg: 'Congo',
    cd: 'Congo, Democratic Republic of the',
    ck: 'Cook Islands',
    cr: 'Costa Rica',
    ci: "Côte d'Ivoire",
    hr: 'Croatia',
    cu: 'Cuba',
    cw: 'Curaçao',
    cy: 'Cyprus[b]',
    cz: 'Czechia',
    dk: 'Denmark',
    dj: 'Djibouti',
    dm: 'Dominica',
    do: 'Dominican Republic',
    ec: 'Ecuador',
    eg: 'Egypt',
    sv: 'El Salvador',
    gq: 'Equatorial Guinea',
    er: 'Eritrea',
    ee: 'Estonia',
    sz: 'Eswatini',
    et: 'Ethiopia',
    fk: 'Falkland Islands (Malvinas)[b]',
    fo: 'Faroe Islands',
    fj: 'Fiji',
    fi: 'Finland',
    fr: 'France',
    gf: 'French Guiana',
    pf: 'French Polynesia',
    tf: 'French Southern Territories',
    ga: 'Gabon',
    gm: 'Gambia',
    ge: 'Georgia',
    de: 'Germany',
    gh: 'Ghana',
    gi: 'Gibraltar',
    gr: 'Greece',
    gl: 'Greenland',
    gd: 'Grenada',
    gp: 'Guadeloupe',
    gu: 'Guam',
    gt: 'Guatemala',
    gg: 'Guernsey',
    gn: 'Guinea',
    gw: 'Guinea-Bissau',
    gy: 'Guyana',
    ht: 'Haiti',
    hm: 'Heard Island and McDonald Islands',
    va: 'Holy See',
    hn: 'Honduras',
    hk: 'Hong Kong',
    hu: 'Hungary',
    is: 'Iceland',
    in: 'India',
    id: 'Indonesia',
    ir: 'Iran (Islamic Republic of)',
    iq: 'Iraq',
    ie: 'Ireland',
    im: 'Isle of Man',
    il: 'Israel',
    it: 'Italy',
    jm: 'Jamaica',
    jp: 'Japan',
    je: 'Jersey',
    jo: 'Jordan',
    kz: 'Kazakhstan',
    ke: 'Kenya',
    ki: 'Kiribati',
    kp: "Korea (Democratic People's Republic of)",
    kr: 'Korea, Republic of',
    kw: 'Kuwait',
    kg: 'Kyrgyzstan',
    la: "Lao People's Democratic Republic",
    lv: 'Latvia',
    lb: 'Lebanon',
    ls: 'Lesotho',
    lr: 'Liberia',
    ly: 'Libya',
    li: 'Liechtenstein',
    lt: 'Lithuania',
    lu: 'Luxembourg',
    mo: 'Macao',
    mg: 'Madagascar',
    mw: 'Malawi',
    my: 'Malaysia',
    mv: 'Maldives',
    ml: 'Mali',
    mt: 'Malta',
    mh: 'Marshall Islands',
    mq: 'Martinique',
    mr: 'Mauritania',
    mu: 'Mauritius',
    yt: 'Mayotte',
    mx: 'Mexico',
    fm: 'Micronesia (Federated States of)',
    md: 'Moldova, Republic of',
    mc: 'Monaco',
    mn: 'Mongolia',
    me: 'Montenegro',
    ms: 'Montserrat',
    ma: 'Morocco',
    mz: 'Mozambique',
    mm: 'Myanmar',
    na: 'Namibia',
    nr: 'Nauru',
    np: 'Nepal',
    nl: 'Netherlands',
    nc: 'New Caledonia',
    nz: 'New Zealand',
    ni: 'Nicaragua',
    ne: 'Niger',
    ng: 'Nigeria',
    nu: 'Niue',
    nf: 'Norfolk Island',
    mk: 'North Macedonia',
    mp: 'Northern Mariana Islands',
    no: 'Norway',
    om: 'Oman',
    pk: 'Pakistan',
    pw: 'Palau',
    ps: 'Palestine, State of[b]',
    pa: 'Panama',
    pg: 'Papua New Guinea',
    py: 'Paraguay',
    pe: 'Peru',
    ph: 'Philippines',
    pn: 'Pitcairn',
    pl: 'Poland',
    pt: 'Portugal',
    pr: 'Puerto Rico',
    qa: 'Qatar',
    re: 'Réunion',
    ro: 'Romania',
    ru: 'Russian Federation',
    rw: 'Rwanda',
    bl: 'Saint Barthélemy',
    sh: 'Saint Helena, Ascension and Tristan da Cunha[d]',
    kn: 'Saint Kitts and Nevis',
    lc: 'Saint Lucia',
    mf: 'Saint Martin (French part)',
    pm: 'Saint Pierre and Miquelon',
    vc: 'Saint Vincent and the Grenadines',
    ws: 'Samoa',
    sm: 'San Marino',
    st: 'Sao Tome and Principe',
    sa: 'Saudi Arabia',
    sn: 'Senegal',
    rs: 'Serbia',
    sc: 'Seychelles',
    sl: 'Sierra Leone',
    sg: 'Singapore',
    sx: 'Sint Maarten (Dutch part)',
    sk: 'Slovakia',
    si: 'Slovenia',
    sb: 'Solomon Islands',
    so: 'Somalia',
    za: 'South Africa',
    gs: 'South Georgia and the South Sandwich Islands',
    ss: 'South Sudan',
    es: 'Spain',
    lk: 'Sri Lanka',
    sd: 'Sudan',
    sr: 'Suriname',
    sj: 'Svalbard and Jan Mayen[e]',
    se: 'Sweden',
    ch: 'Switzerland',
    sy: 'Syrian Arab Republic',
    tw: 'Taiwan, Province of China[b]',
    tj: 'Tajikistan',
    tz: 'Tanzania, United Republic of',
    th: 'Thailand',
    tl: 'Timor-Leste',
    tg: 'Togo',
    tk: 'Tokelau',
    to: 'Tonga',
    tt: 'Trinidad and Tobago',
    tn: 'Tunisia',
    tr: 'Türkiye',
    tm: 'Turkmenistan',
    tc: 'Turks and Caicos Islands',
    tv: 'Tuvalu',
    ug: 'Uganda',
    ua: 'Ukraine',
    ae: 'United Arab Emirates',
    gb: 'United Kingdom of Great Britain and Northern Ireland',
    us: 'United States of America',
    um: 'United States Minor Outlying Islands[f]',
    uy: 'Uruguay',
    uz: 'Uzbekistan',
    vu: 'Vanuatu',
    ve: 'Venezuela (Bolivarian Republic of)',
    vn: 'Viet Nam',
    vg: 'Virgin Islands (British)',
    vi: 'Virgin Islands (U.S.)',
    wf: 'Wallis and Futuna',
    eh: 'Western Sahara[b]',
    ye: 'Yemen',
    zm: 'Zambia',
    zw: 'Zimbabwe',
  },
};
