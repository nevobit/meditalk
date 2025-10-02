import { Base } from '../../../common';

export interface Setting extends Base {
    name: string;
    value: string;
    description: string;
    type: string;
    category: string;
    isActive: boolean;
    isDefault: boolean;
}
