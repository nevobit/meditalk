import { register as registerService } from "../services";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
    const { mutate, isPending } = useMutation({
        mutationFn: registerService,
    });

    return {
        register: mutate,
        isRegistering: isPending,
    };
};