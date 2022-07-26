import * as date from 'date-fns';
import { loadJSON } from './utils';

export type Season = {
  name: string;
  folder: string;
};

export enum Category {
  MEN_OPEN = 'mo',
  WOMEN = 'w',
}

const categoryReverseMap = {
  mo: Category.MEN_OPEN,
  w: Category.WOMEN,
};

export enum Division {
  LS = 'ls',
  SB = 'sb',
  R = 'r',
  RD = 'rd',
}

const divisionReverseMap = {
  ls: Division.LS,
  sb: Division.SB,
  r: Division.R,
  rd: Division.RD,
};

export enum CoefficientType {
  TOURNAMENT = 'tournament',
  FOREIGN = 'foreign',
  HIGHER_CATEGORY = 'higher_category',
  RANK_1 = 'rank_1',
  RANK_2 = 'rank_2',
  RANK_3 = 'rank_3',
  RANK_4 = 'rank_4',
}

const coefficientTypeReverseMap = {
  tournament: CoefficientType.TOURNAMENT,
  foreign: CoefficientType.FOREIGN,
  higher_category: CoefficientType.HIGHER_CATEGORY,
  rank_1: CoefficientType.RANK_1,
  rank_2: CoefficientType.RANK_2,
  rank_3: CoefficientType.RANK_3,
  rank_4: CoefficientType.RANK_4,
};


export type TournamentResultEntry = {
  fencer_id: string;
  rank: number;
};

export type Competition = {
  no_participants: number;
  results: TournamentResultEntry[];
};

export type Tournament = {
  name: string;
  date: Date;
  country: string;
  coefficient: number;
  competitions: Record<Division, Record<Category, Competition>>;
};

export type Tournaments = Record<string, Tournament>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTournaments(json: Record<string, any>): Tournaments {
  const res = {} as Tournaments;
  Object.keys(json).forEach((k) => {
    res[k] = {
      name: json[k].name,
      date: date.parseISO(json[k].date),
      country: json[k].country,
      coefficient: json[k].coefficient,
      competitions: Object.keys(json['competitions']).reduce((divs, div) => {
        divs[divisionReverseMap[div]] = Object.keys(json['competitions'][div]).reduce((cats, cat) => {
          cats[categoryReverseMap[cat]] = parseCompetition(json['competitions'][div][cat]);
          return cats;
        }, {});
        return divs;
      }, {} as Record<Division, Record<Category, Competition>>)
    }
  });
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCompetition(json: Record<string, any>): Competition {
  return {
    no_participants: json['no_participants'],
    results: parseResults(json['results'])
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResults(json: Record<string, any>[]): TournamentResultEntry[] {
  return json.map((result) => {
    return {
      fencer_id: result['fencer_id'],
      rank: result['rank']
    };
  });
}

export async function loadTournaments(season: Season): Promise<Tournaments> {
  return parseTournaments(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON(`data/seasons/${season.folder}/tournaments.json`)) as Record<string, any>
  );
}

export type People = Record<string, Person>;
export type Person = {
  id: string;
  name: string;
  surname: string;
  club_id: string;
  nationality?: string;
  category?: Category;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePeople(json: Record<string, any>): People {
  const res = {} as People;
  Object.keys(json).forEach((k) => {
    res[k] = {
      id: k,
      name: json[k].name,
      surname: json[k].surname,
      club_id: json[k].club_id,
      nationality: json[k].nationality,
      category:
        categoryReverseMap[json[k].category as keyof typeof categoryReverseMap],
    };
  });
  return res;
}

export async function loadPeople(): Promise<People> {
  return parsePeople(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON('data/people.json')) as Record<string, any>
  );
}

export type Clubs = Record<string, Club>;
export type Club = {
  id: string;
  name: string;
  country: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseClubs(json: Record<string, any>): Clubs {
  const res = {} as Clubs;
  Object.keys(json).forEach((k) => {
    res[k] = {
      id: k,
      name: json[k].name,
      country: json[k].country,
    };
  });
  return res;
}

export async function loadClubs(): Promise<Clubs> {
  return parseClubs(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON('data/clubs.json')) as Record<string, any>
  );
}

export type Coefficient = {
  c: number;
  type: CoefficientType
};

export type TournamentLadderEntry = {
  tournament_id: string;
  coefficients: Coefficient[];
  base_points: number;
  rank: number;
  points: number;
};

export type LadderEntry = {
  fencer_id: string;
  rank: number;
  tournaments: TournamentLadderEntry[];
};

export type Ladder = LadderEntry[];
export type Ladders = Record<Division, Record<Category, Ladder>>;

function parseLadders(json: Record<string, any>): Ladders {
  return Object.keys(json).reduce((divs, div) => {
    divs[divisionReverseMap[div]] = Object.keys(json[div]).reduce((cats, cat) => {
      cats[categoryReverseMap[cat]] = parseLadder(json[div][cat]);
      return cats;
    }, {});
    return divs;
  }, {} as Ladders);
}

function parseLadder(json: any[]): Ladder {
  return json.map(parseLadderEntry);
}

function parseLadderEntry(json: Record<string, any>): LadderEntry {
  return {
    fencer_id: json['fencer_id'],
    rank: json['rank'],
    tournaments: (json['tournaments'] as any[]).map(parseTournamentLadderEntry)
  };
}

function parseTournamentLadderEntry(json: Record<string, any>): TournamentLadderEntry {
  return {
    tournament_id: json['tournament_id'],
    rank: json['rank'],
    base_points: json['base_points'],
    coefficients: (json['coefficients'] as any[]).map(parseCoefficient),
    points: json['points']
  };
}

function parseCoefficient(json: Record<string, any>): Coefficient {
  return {
    c: json['c'],
    type: json['type']
  };
}
