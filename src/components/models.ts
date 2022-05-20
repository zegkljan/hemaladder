import { Category, Division } from 'src/logic/ladder';

export type TournamentDetailModel = {
  fencerID: string;
  tournamentID: string;
  division: Division;
  category: Category;
};
