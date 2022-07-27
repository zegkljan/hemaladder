import { Category, CoefficientType, Division } from 'src/logic/ladder';

export default {
  appName: 'Neoficiální český HEMA žebříček',
  sourceCode: 'Zdrojový kód',
  settings: 'Nastavení',
  seasonTitle: 'Sezóna',
  divisionTitle: 'Divize',
  division: {
    [Division.LS]: 'Dlouhý meč',
    [Division.R]: 'Rapír',
    [Division.RD]: 'Rapír a dýka',
    [Division.SB]: 'Meč a štítek',
  },
  categoryTitle: 'Kategorie',
  category: {
    [Category.MEN_OPEN]: 'Muži/open',
    [Category.WOMEN]: 'Ženy',
  },
  ladderTable: {
    rankLabel: 'Pořadí',
    nameLabel: 'Jméno',
    surnameLabel: 'Příjmení',
    clubLabel: 'Klub',
    pointsLabel: 'Počet bodů',
    detailsLabel: 'Detaily',

    fencerDetail: {
      fencer: 'O šermíři',
      tournaments: 'Účast na turnajích',
      hemaratingsLinkLabel: 'HEMA Ratings profil',
      noTournamentsLabel: 'Počet turnajů v žebříčku',
      avgPtsPerTournamentLabel: 'Průměrný počet bodů na turnaj',
      tournament: 'Turnaj',
      date: 'Datum',
      country: 'Země',
      noParticipants: 'Počet účastníků',
      rank: 'Umístění',
      coefficient: 'Koeficient',
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
      tournamentDetailLabel: 'Detail turnaje',
      close: 'Zavřít',
    },
    tournamentDetail: {
      hemaratingsDetailTooltip: 'Otevřít záznam na HEMA Ratings',
    },
  },
};
