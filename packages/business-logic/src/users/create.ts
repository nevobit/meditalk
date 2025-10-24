import { Collection, getModel } from "@mdi/constant-definitions";
import { type CreateUserDto, type User, UserSchemaMongo } from "@mdi/contracts";

export const createUser = async (user: CreateUserDto) => {
    const model = getModel<User>(Collection.USERS, UserSchemaMongo);
    const newUser = await model.create(user);
    return newUser;
}