import { Collection, getModel } from "@mdi/constant-definitions";
import { User } from "@mdi/contracts";
import { UserSchemaMongo } from "@mdi/contracts";

export const findByEmail = async (email: string): Promise<User> => {
    const model = getModel<User>(Collection.USERS, UserSchemaMongo);

    const user = await model.findOne({ email });
    if (!user) throw new Error("User not found");

    return user;
};