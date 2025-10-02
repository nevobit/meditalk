import { api } from "@/shared/api";
import { type UpdateUserDto } from "@mdi/contracts";

export const login = async (email: string) => {
    const { data } = await api.post(`/auth/otp`, { email });
    return data;
}

export const register = async (email: string) => {
    const { data } = await api.post(`/auth/otp/register`, { email });
    return data;
}

export const registerVerify = async ({ user, email, code }: { user: UpdateUserDto, email: string, code: string }) => {
    const { data } = await api.post(`/auth/otp/verify`, { ...user, email, code });
    return data;
}   