import type { EmailProvider } from "./types";
import { createResendProvider } from "./providers/resend";
import { type RenderInput, renderTemplate } from "./templates/render";

type CreateMailerOptions = {
    provider?: "resend" | "ses" | "smtp";
    from: string;
    replyTo?: string;
    RESEND_API_KEY?: string;
};

export const createMailer = (opts: CreateMailerOptions) => {
    let provider: EmailProvider;

    switch (opts.provider ?? "resend") {
        case "resend":
            if (!opts.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
            provider = createResendProvider({
                apiKey: opts.RESEND_API_KEY,
                defaultFrom: opts.from,
                defaultReplyTo: opts.replyTo,
            });
            break;
        // case "ses": provider = createSesProvider(...); break;
        // case "smtp": provider = createSmtpProvider(...); break;
        default:
            throw new Error("Unsupported email provider");
    }

    const send = (p: { to: string | string[]; subject: string; html: string; text?: string; from?: string; replyTo?: string }) =>
        provider.send(p);

    const sendTemplate = async <T extends { name: string; props: unknown }>(p: {
        to: string | string[];
        template: T;
        from?: string;
        replyTo?: string;
    }) => {
        const { subject, html, text } = renderTemplate(p.template as unknown as RenderInput);
        return provider.send({ to: p.to, subject, html, text, from: p.from, replyTo: p.replyTo });
    };

    return { send, sendTemplate };
};
