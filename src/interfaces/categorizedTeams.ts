import { TeamInterface } from '../models/team';

export interface ICategorizedTeams {
    firstPlace: TeamInterface[];
    secondPlace: TeamInterface[];
    thirdPlace: TeamInterface[];
}
