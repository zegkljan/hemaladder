import * as date from 'date-fns';
import { loadJSON } from './utils';

export enum FencerNationality {
  CZ = 'cz',
  ALL = 'all',
}

export enum TournamentsCountry {
  CZ = 'cz',
  ALL = 'all',
}

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

export enum Category {
  MO = 'mo',
  W = 'w',
}

const categoryReverseMap = {
  mo: Category.MO,
  w: Category.W,
};

export enum CoefficientType {
  TOURNAMENT,
  FOREIGN,
  HIGHER_CATEGORY,
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
}

export type Tournaments = Record<string, Tournament>;
export type Tournament = {
  name: string;
  date: Date;
  country: string;
  coefficient: number;
  results: Record<Division, Record<Category, string[]>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTournaments(json: Record<string, any>): Tournaments {
  const res = {} as Tournaments;
  Object.keys(json).forEach((k) => {
    res[k] = {
      name: json[k].name,
      date: date.parseISO(json[k].date),
      country: json[k].country,
      coefficient: json[k].coefficient,
      results: parseResults(json[k].results),
    };
  });
  return res;
}

function parseResults(
  json: Record<string, Record<string, string[]>>
): Record<Division, Record<Category, string[]>> {
  const res = {} as Record<Division, Record<Category, string[]>>;
  for (const d in json) {
    const divRaw = json[d];
    const div = {} as Record<Category, string[]>;
    for (const c in divRaw) {
      div[categoryReverseMap[c as keyof typeof categoryReverseMap]] = divRaw[c];
    }
    res[divisionReverseMap[d as keyof typeof divisionReverseMap]] = div;
  }
  return res;
}

export async function loadTournaments(): Promise<Tournaments> {
  return parseTournaments(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await loadJSON('data/tournaments.json')) as Record<string, any>
  );
}

export type People = Record<string, Person>;
export type Person = {
  name: string;
  surname: string;
  clubID: string;
  nationality: string;
  category: Category;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePeople(json: Record<string, any>): People {
  const res = {} as People;
  Object.keys(json).forEach((k) => {
    res[k] = {
      name: json[k].name,
      surname: json[k].surname,
      clubID: json[k].clubID,
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
  name: string;
  country: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseClubs(json: Record<string, any>): Clubs {
  const res = {} as Clubs;
  Object.keys(json).forEach((k) => {
    res[k] = {
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

export type Ladder = {
  category: Category;
  fencerNationality: FencerNationality;
  tournamentsCountry: TournamentsCountry;
  entries: LadderEntry[];
};
export type Coefficient = {
  value: number;
  type: CoefficientType;
};
export type LadderEntry = {
  fencerID: string;
  rank: number;
  points: number;
  tournaments: {
    tournamentID: string;
    category: Category;
    coefficients: Coefficient[];
    points: number;
  }[];
};

export type LadderParams = {
  coefficients: {
    place: {
      first: number;
      second: number;
      third: number;
      fourth: number;
    };
    foreignTournament: number;
    higherCategory: number;
  };
  fencers: FencerNationality;
  tournaments: TournamentsCountry;
};

export function computeLadder(
  tournaments: Tournaments,
  people: People,
  clubs: Clubs,
  division: Division,
  category: Category,
  national: boolean,
  params: LadderParams
): Ladder {
  const intermediate = {} as Record<string, LadderEntry>;
  for (const tk in tournaments) {
    const t = tournaments[tk];
    if (
      params.tournaments != TournamentsCountry.ALL &&
      t.country != params.tournaments
    ) {
      continue;
    }
    const div = t.results[division];
    if (!div) {
      continue;
    }

    const cat = category;
    const ranking = div[cat];
    if (!ranking) {
      continue;
    }
    const participantsNum = ranking.length;
    ranking.forEach((participant, rank) => {
      const p = people[participant];
      if (!p) {
        return;
      }
      if (
        params.fencers != FencerNationality.ALL &&
        clubs[p.clubID].country != params.fencers
      ) {
        return;
      }
      const coeffs: Coefficient[] = [
        {
          type: CoefficientType.TOURNAMENT,
          value: t.coefficient,
        },
      ];
      if (national) {
        if (t.country != clubs[people[participant].clubID].country) {
          coeffs.push({
            type: CoefficientType.FOREIGN,
            value: params.coefficients.foreignTournament,
          });
        }
      }
      if (cat != category) {
        coeffs.push({
          type: CoefficientType.HIGHER_CATEGORY,
          value: params.coefficients.higherCategory,
        });
      }
      switch (rank) {
        case 0:
          coeffs.push({
            type: CoefficientType.RANK_1,
            value: params.coefficients.place.first,
          });
          break;
        case 1:
          coeffs.push({
            type: CoefficientType.RANK_2,
            value: params.coefficients.place.second,
          });
          break;
        case 2:
          coeffs.push({
            type: CoefficientType.RANK_3,
            value: params.coefficients.place.third,
          });
          break;
        case 3:
          coeffs.push({
            type: CoefficientType.RANK_4,
            value: params.coefficients.place.fourth,
          });
          break;
      }
      const coef = coeffs.map((c) => c.value).reduce((a, b) => a * b, 1);
      const points = Math.round((participantsNum - rank) * coef);

      if (!intermediate.hasOwnProperty(participant)) {
        intermediate[participant] = {
          fencerID: participant,
          rank: 0,
          points: 0,
          tournaments: [],
        };
      }
      intermediate[participant].points =
        intermediate[participant].points + points;
      intermediate[participant].tournaments.push({
        tournamentID: tk,
        category: cat,
        points: points,
        coefficients: coeffs,
      });
    });
  }

  return {
    category: category,
    fencerNationality: params.fencers,
    tournamentsCountry: params.tournaments,
    entries: Object.keys(intermediate)
      .sort((a, b) => intermediate[b].points - intermediate[a].points)
      .map((k, i) => {
        const entry = intermediate[k];
        entry.rank = i + 1;
        return entry;
      }),
  };
}
