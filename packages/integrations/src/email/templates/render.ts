import { otpTemplate } from "./otp";

export type RenderInput =
    | { name: "otp"; props: { verificationCode: string } }
    ;

export const renderTemplate = (input: RenderInput) => {
    console.log("input", input);
    switch (input.name) {
        case "otp": {
            const html = otpTemplate(input.props.verificationCode);
            const text = `Tu codigo de verificacion es: ${input.props.verificationCode}`;
            return { subject: "Tu codigo de verificacion", html, text };
        }
        default:
            throw new Error("Unknown template");
    }
};
