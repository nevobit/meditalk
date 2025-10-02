import { Base } from '../../../common';

export interface Template extends Base {
    name: string;
    description: string;
    isActive: boolean;
    isDefault: boolean;
    content: string;
}
