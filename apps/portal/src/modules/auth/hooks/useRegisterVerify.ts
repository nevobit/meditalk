import { registerVerify as registerVerifyService } from "../services";
import { useMutation } from "@tanstack/react-query";

export const useRegisterVerify = () => {
    const { mutate, isPending } = useMutation({
        mutationFn: registerVerifyService,
    });

    return {
        registerVerify: mutate,
        isVerifying: isPending,
    };
};