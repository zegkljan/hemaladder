import * as date from 'date-fns';
import { loadJSON } from './utils';

export type Season = {
  name: string;
  folder: string;
};

function parseSeason(json: Record<string, unknown>): Season {
  return {
    name: json.name as string,
    folder: json.folder as string,
  };
}

export enum Category {
  MEN_OPEN = 'mo',
  WOMEN = 'w',
}

export const categoryReverseMap = {
  mo: Category.MEN_OPEN,
  w: Category.WOMEN,
};

export enum Division {
  LS = 'ls',
  SB = 'sb',
  R = 'r',
  RD = 'rd',
  SAB = 'sab',
}

export const divisionReverseMap = {
  ls: Division.LS,
  sb: Division.SB,
  r: Division.R,
  rd: Division.RD,
  sab: Division.SAB,
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

export type CompetitionsCategories = { [C in Category]?: Competition };
export type CompetitionsDivisions = {
  [D in Division]?: CompetitionsCategories;
};

export type Tournament = {
  name: string;
  date: Date;
  country: string;
  coefficient: number;
  competitions: CompetitionsDivisions;
};

export type Tournaments = Record<string, Tournament>;

function parseTournaments(json: Record<string, unknown>): Tournaments {
  const res = {} as Tournaments;
  Object.keys(json).forEach((k) => {
    const d = json[k] as {
      name: string;
      date: string;
      country: string;
      coefficient: number;
      competitions: Record<string, Record<string, Record<string, unknown>>>;
    };
    res[k] = {
      name: d.name,
      date: date.parseISO(d.date),
      country: d.country,
      coefficient: d.coefficient,
      competitions: Object.keys(d.competitions).reduce((divs, div) => {
        const categories = d.competitions[div];
        divs[divisionReverseMap[div as keyof typeof divisionReverseMap]] =
          Object.keys(categories).reduce((cats, cat) => {
            const competitions = categories[cat];
            cats[categoryReverseMap[cat as keyof typeof categoryReverseMap]] =
              parseCompetition(competitions);
            return cats;
          }, {} as CompetitionsCategories);
        return divs;
      }, {} as CompetitionsDivisions),
    };
  });
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCompetition(json: Record<string, any>): Competition {
  return {
    no_participants: json['no_participants'],
    results: parseResults(json['results']),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResults(json: Record<string, any>[]): TournamentResultEntry[] {
  return json.map((result) => {
    return {
      fencer_id: result['fencer_id'],
      rank: result['rank'],
    };
  });
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

export type Coefficient = {
  c: number;
  type: CoefficientType;
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
  points: number;
  tournaments: TournamentLadderEntry[];
};

export type Ladder = LadderEntry[];
export type Ladders = { [D in Division]?: { [C in Category]?: Ladder } };

function parseLadders(json: Record<string, unknown>): Ladders {
  return Object.keys(json).reduce((divs, div) => {
    const d: Division =
      divisionReverseMap[div as keyof typeof divisionReverseMap];
    divs[d] = Object.keys(json[div] as Record<string, unknown>).reduce(
      (cats, cat) => {
        const c: Category =
          categoryReverseMap[cat as keyof typeof categoryReverseMap];
        cats[c] = parseLadder(
          (json[div] as Record<string, unknown>)[cat] as Record<
            string,
            unknown
          >[]
        );
        return cats;
      },
      {} as { [C in Category]?: Ladder }
    );
    return divs;
  }, {} as Ladders);
}

function parseLadder(json: Record<string, unknown>[]): Ladder {
  return json.map(parseLadderEntry);
}

function parseLadderEntry(json: Record<string, unknown>): LadderEntry {
  return {
    fencer_id: json['fencer_id'] as string,
    rank: json['rank'] as number,
    points: json['points'] as number,
    tournaments: (json['tournaments'] as Record<string, unknown>[]).map(
      parseTournamentLadderEntry
    ),
  };
}

function parseTournamentLadderEntry(
  json: Record<string, unknown>
): TournamentLadderEntry {
  return {
    tournament_id: json['tournament_id'] as string,
    rank: json['rank'] as number,
    base_points: json['base_points'] as number,
    coefficients: (json['coefficients'] as Record<string, unknown>[]).map(
      parseCoefficient
    ),
    points: json['points'] as number,
  };
}

function parseCoefficient(json: Record<string, unknown>): Coefficient {
  return {
    c: json['c'] as number,
    type: coefficientTypeReverseMap[
      json['type'] as keyof typeof coefficientTypeReverseMap
    ],
  };
}

// loading data //

export async function loadPeople(): Promise<People> {
  return parsePeople(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON('data/people.json')) as Record<string, any>
  );
}

export async function loadClubs(): Promise<Clubs> {
  return parseClubs(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON('data/clubs.json')) as Record<string, any>
  );
}

export async function loadSeasons(): Promise<Season[]> {
  return (
    (await loadJSON('data/seasons.json')) as Record<string, unknown>[]
  ).map(parseSeason);
}

export async function loadTournaments(season: string): Promise<Tournaments> {
  return parseTournaments(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON(`data/seasons/${season}/tournaments.json`)) as Record<
      string,
      unknown
    >
  );
}

export async function loadLadders(season: string): Promise<Ladders> {
  return parseLadders(
    (await loadJSON(`data/seasons/${season}/ladders.json`)) as Record<
      string,
      unknown
    >
  );
}
