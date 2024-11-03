import { Types } from 'mongoose';

export interface BaseModelInterface {
    _id: Types.ObjectId;
    token?: string;
}
