import { Category, Division } from 'src/logic/ladder';

export type TournamentDetailModel = {
  fencer_id: string;
  tournament_id: string;
  division: Division;
  category: Category;
};
