import { login as loginService } from "../services";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
    const { mutate, isPending } = useMutation({
        mutationFn: loginService,
    });

    return {
        login: mutate,
        isLogging: isPending,
    };
};