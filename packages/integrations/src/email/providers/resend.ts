import { Resend } from "resend";
import type { EmailProvider, SendParams } from "../types";

export const createResendProvider = (opts: { apiKey: string; defaultFrom: string; defaultReplyTo?: string }): EmailProvider => {
    const client = new Resend(opts.apiKey);

    return {
        send: async ({ to, subject, html, text, from }: SendParams) => {
            const res = await client.emails.send({
                from: from ?? opts.defaultFrom,
                to,
                subject,
                html,
                text
            });
            if (res.error) throw res.error;
            return { id: res.data?.id ?? "" };
        },
    };
};
