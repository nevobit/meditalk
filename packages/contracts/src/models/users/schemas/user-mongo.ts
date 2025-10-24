import { Schema } from 'mongoose';
import type { User } from './user';

export const UserSchemaMongo = new Schema<User>(
    {
        name: { type: String },
        identification: { type: String },
        city: { type: String },
        country: { type: String },
        email: { type: String, unique: true },
        voiceSample: { type: String },
        avatar: { type: String },
        emailVerifiedAt: { type: Date },
        lastLoginAt: { type: Date },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);