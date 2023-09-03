import { Competition } from 'src/logic/ladder';

export type TournamentDetailModel = {
  fencer_id: string;
  tournament_id: string;
  competition: Competition;
};
