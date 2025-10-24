import type { Base } from '../../../common';

export interface User extends Base {
    name: string;
    identification: string;
    city: string;
    country: string;
    voiceSample: string;
    email: string;
    avatar: string;
    emailVerifiedAt: Date;
    lastLoginAt: Date;
}