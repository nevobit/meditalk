import { Collection, getModel } from "@mdi/constant-definitions";
import type { User } from "@mdi/contracts";
import { UserSchemaMongo } from "@mdi/contracts";

export const findByEmail = async (email: string): Promise<User | null> => {
    const model = getModel<User>(Collection.USERS, UserSchemaMongo);

    const user = await model.findOne({ email });
    if (!user) return null;

    return user;
};