import { Collection, getModel } from "@mdi/constant-definitions";
import type { User } from "@mdi/contracts";
import { UserSchemaMongo } from "@mdi/contracts";

export const findById = async (id: string): Promise<User> => {
    const model = getModel<User>(Collection.USERS, UserSchemaMongo);

    const user = await model.findById(id);
    if (!user) throw new Error("User not found");

    return user;
};