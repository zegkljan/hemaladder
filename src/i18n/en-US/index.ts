import {
  Category,
  CoefficientType,
  Division,
  FencerNationality,
  TournamentsCountry,
} from 'src/logic/ladder';

export default {
  appName: 'Unofficial czech HEMA ladder',
  sourceCode: 'Source code',
  settings: 'Settings',
  fencerCountryTitle: 'Fencers',
  fencerCountry: {
    [FencerNationality.CZ]: 'CZ',
    [FencerNationality.ALL]: 'All',
  },
  tournamentsCountryTitle: 'Tournaments',
  tournamentsCountry: {
    [TournamentsCountry.CZ]: 'CZ',
    [TournamentsCountry.ALL]: 'All',
  },
  divisionTitle: 'Division',
  division: {
    [Division.LS]: 'Long sword',
    [Division.R]: 'Rapier',
    [Division.RD]: 'Rapier and dagger',
    [Division.SB]: 'Sword and buckler',
  },
  categoryTitle: 'Category',
  category: {
    [Category.MO]: 'Men/open',
    [Category.W]: 'Women',
  },
  ladderTable: {
    rankLabel: 'Rank',
    nameLabel: 'Name',
    surnameLabel: 'Surname',
    clubLabel: 'Club',
    pointsLabel: 'No. of points',
    detailsLabel: 'Details',

    fencerDetail: {
      fencer: 'About fencer',
      tournaments: 'Tournament participation',
      hemaratingsLinkLabel: 'HEMA Ratings profile',
      noTournamentsLabel: 'No. of tournaments in ladder',
      avgPtsPerTournamentLabel: 'Average points per tournament',
      tournament: 'Tournament',
      date: 'Date',
      country: 'Country',
      noParticipants: 'No. of participants',
      rank: 'Rank',
      coefficient: 'Coefficient',
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
      tournamentDetailLabel: 'Tournament detail',
      close: 'Close',
    },
    tournamentDetail: {
      hemaratingsDetailTooltip: 'Open record at HEMA Ratings',
    },
  },
};
