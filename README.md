# HEMA Ladder

A customizable static web app and build utils for creating and presenting a HEMA ladder.

<!-- TOC depthfrom:2 -->

- [Dependencies](#dependencies)
- [Running and building](#running-and-building)
- [Data and brand configuration](#data-and-brand-configuration)
  - [brand directory](#brand-directory)
  - [clubs.json](#clubsjson)
  - [people.json](#peoplejson)
  - [seasons.json](#seasonsjson)
  - [people-clubs.json](#people-clubsjson)
  - [tournaments.json](#tournamentsjson)
- [How is the ladder calculated](#how-is-the-ladder-calculated)
  - [Coefficients](#coefficients)
    - [Additions to JsonLogic](#additions-to-jsonlogic)
  - [Result combiners](#result-combiners)
    - [All](#all)
    - [Best-n + championships](#best-n--championships)

<!-- /TOC -->

## Dependencies

- npm - for building the app
- python - for calculating the ladder

## Running and building

All tasks can be accomplished by running `npm run <script>` in the project root directory, where `<script>` is one of the following (only the "big" tasks are listed):

- `build` - generates the ladder, and builds the app; the result, i.e. what is to be deployed, is then in `dist/spa`
- `make-ladder` - only generates the ladder
  - may crash due to errors in data
  - tries to find missing objects (fencers and clubs) at HEMA Ratings

## Data and brand configuration

All custom data live in `src/build/resources`.
The required directory structure is

```
src/build/resources
├── brand
│   ├── config.mjs
│   └── logo.svg
└── data
    ├── clubs.json
    ├── people.json
    ├── seasons.json
    └── seasons
        ├── <season 1>
        │   ├── people-clubs.json
        │   └── tournaments.json
        ├── <season 2>
        │   ├── people-clubs.json
        │   └── tournaments.json
        └── ...
```

### `brand` directory

Contains app-wide configuration.

The file `config.mjs` is expected to conform to this definition (a file named `config.d.mts` with this content may exist as a sibling, but does not have to):

```typescript
type Texts = {
  // keys correspond to the locales, e.g. cs-CZ, en-US etc.
  [key in string]?: {
    appName: string;
    appDescription?: string;
    supplyResultsText: string;
    supplyResultsFootnotes: string;
    coefficientTypes: Record<string, string>; // keys correspond to coefficient types in seasons.json
  };
};

type Config = {
  fbLink?: string;
  // locales that will be available in the language switcher
  // the first one will also be used to get the app name for the og:title meta tag
  enabledLocales: string[];
  // one from enabledLocales; if none, detected automatically by system
  defaultLocale?: string;
  // base url of the page
  url?: string;
};

export declare const texts: Texts;
export declare const config: Config;
```

The file `logo.svg` is expected to contain the logo of the ladder, in an SVG format.
It will be transformed into appropriate formats for the web app favicon, and for the `og:image` meta information of the page during the build.

### `clubs.json`

Contains the information about all clubs, in the following format:

```javascript
{
  "id": {
    "name": "Club Name",
    "country": "cz"      // (optional) 2-letter country code of the club's residence
  },
  ...
}
```

where `id` is a numeric ID of the club as at [hemaratings.com](https://hemaratings.com), but stored as string, since json knows only string keys.

If a club does not exist on HEMA Ratings (yet), use a negative `id`, e.g.:

```javascript
"-42": {
  "name": "Brand New Club",
  "country": "cz"
}
```

### `people.json`

Contains the information about all people, in the following format:

```javascript
{
  "id": {
    "surname": "Surname",
    "name": "Name",
    "nationality": "cz",  // (optional) 2-letter country code of the fencer's nationality
  },
  ...
}
```

where `id` is a numeric ID of the fencer as at [hemaratings.com](https://hemaratings.com), but stored as string, since json knows only string keys.

If a fencer does not exist on HEMA Ratings (yet), use a negative `id`, e.g.:

```javascript
"-42": {
  "surname": "Fencer",
  "name": "New",
  "country": "cz"
}
```

### `seasons.json`

Contains the information about the individual seasons for which is the ladder computed, in the following format:

```javascript
[
  {
    "name": "season name", // human-readable season name
    "folder": "season data folder", // corresponds to <season 1>, <season 2>, ... as shown in the directory structure above
    "scorer": {
      "coefficients": [
        <rule 1>,
        <rule 2>,
        ...
      ]
    },
    "combiner": {
      "*": <combiner 1>, // for all divisions and categories unless specified explicitly
      "<division>": {
        "*": <combiner 2>, // for all categories in the division unless specified explicitly
        "<category>": <combiner 3>
      }
    }
  }
]
```

where `<rule 1>`, `<rule 2>`, ... are expressions describing coefficients applied to the base point values (see [Coefficients](#coefficients)), and `<combiner 1>`, `<combiner 2>`, ... are descriptions of how are tournaments counted for each fencer (see [Tournament combiners](#result-combiners)).

The seasons are processed sequentially, sorted by `name` in ascending order.
This is important, because previous season results are used to compute changes compared to the previous season.

### `people-clubs.json`

Contains a simple mapping from fencer IDs to club IDs, in the following format:

```javascript
{
  "fencer1ID": "club1ID",
  "fencer2ID": "club1ID",
  "fencer3ID": "club2ID",
  ...
}
```

where the IDs are numeric values stored in strings, and must reference the IDs in `people.json` and `clubs.json`.
A fencer does not have to have any club associated, they will then show as without a club.

This file is specific for each season, as fencers may change clubs.
Inside one season, however, a fencer must be associated with only one club (or no club).

### `tournaments.json`

This is the most important data file, as it contains the results of the tournaments, in the following format:

```javascript
{
  "id": {
    "name": "Tournament Name",
    "date": "2042-07-25", // date of the (first day of the) tournament
    "country": "cz", // two-letter code of the country where the tournament took place
    "championship": true, // (optional) set to true, if the tournament is a championship, default is false
    "competitions": [ // competitions run at the tournament
      {
        "subtitle": "advanced", // (optional) subtitle for this competition
        "division": "ls", // division (weapon) of the competition
        "category": "mo", // category of the competition
        "no_participants": 42, // total number of participants in the competition
        "results_link": "http://link.to/results", // (optional) link to publicly accessible results of the tournament
        "results": [
          {
            "fencer_id": "42", // id of the fencer, stored as string
            "rank": 42 // final rank of that fencer at the end of the competition
          },
          ...
        ]
      },
      ...
    ]
  }
}
```

where `id` is a numeric ID of the tournament as at [hemaratings.com](https://hemaratings.com), but stored as string, since json knows only string keys.

If the tournament is not on HEMA Ratings (yet), use negative ID.

## How is the ladder calculated

The ranking of the fencers in a particular ladder is determined by the number of **points** they have acquired by participating in tournaments.

For each fencer for each tournament the fencer has participated in, the number of points is determined as

`(N - R + 1) * coefficient`

where

- `N` is the total number of participants in the tournament (corresoponds to `no_participants` in [tournaments.json](#tournamentsjson)),
- `R` is the fencer's rank at the end of the tournament (corresponds to `rank` in [tournaments.json](#tournamentsjson)), and
- `coefficient` is a multiplicative coefficient determined based on coefficient rules (see below).

The total number of points for the fencer is then the sum of points from **counted tournaments**.
Which tournaments are counted is determined based on result combiner (see below).

### Coefficients

Coefficients are multiplicative constants that multiply the base number of points gained from a particular tournament, and are specified in [`seasons.json`](#seasonsjson) in `scorer.coefficients`.

Each entry is a rule that determines whether a coefficient is to be used, and its value.
A rule is a [JsonLogic](https://jsonlogic.com/) expression (with a few additions, see below) that is applied to an object of this structure:

```javascript
{
  "tournament": <tournament>, // a tournament object, as in tournaments.json
  "competition": <competition>, // a competition object, as in tournaments.json
  "rank": <rank> // the rank of the fencer (1 = winner), as in tournaments.json
}
```

A rule is expected to produce either `null` (when no coefficient is to be used based on this rule), or an object of this structure:

```javascript
{
  "type": "type of the coefficient", // used for display in results breakdown
  "value": 1.5 // value of the coefficient
}
```

All non-null results from the rules are collected, and the final coefficient is then the product of the individual coefficient values.
If no coefficient was produced by the rules, the default coefficient of 1 is used.
The `type` field should correspond to one of the keys in the field `coefficientTypes` in `config.mjs` in the [brand directory](#brand-directory).

#### Additions to JsonLogic

Two extra operators are available:

- `val` produces the argument as a raw value; used as the root node of the expression to produce the coefficient:
  ```javascript
  {
    "val": {
      "type": "championship",
      "value": 1.5
    }
  }
  ```
- `len` produces the length of the argument, which must be an array; typically used to get the number of recorded participants:
  ```javascript
  {
    "len": {
      "var": ["competition.results"]
    }
  }
  ```

### Result combiners

Result combiners determine which tournaments are counted for the purpose of computing the total number of points a fencer has in the ladder.

There are currently two types of combiners: _All_ and _Best-n + championship_

#### All

All tournaments are counted.
Defined as

```javascript
{
  "type": "all"
}
```

#### Best-n + championships

This combiner counts only these tournaments:

- those that have `"championship": true`, and
- best `n` of all others with respect to the number of points gained from them by the particular fencer.

Defined as

```javascript
{
  "type": "best-n+champ",
  "n": 5 // the n, i.e. the number of counted non-championship tournaments
}
```
