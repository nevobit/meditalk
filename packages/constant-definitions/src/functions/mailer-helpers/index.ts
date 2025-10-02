import { MonoContext } from "@mdi/core-modules";

const MAILER_KEY = `mailer`;

export const setMailer = <T>(mailer: T): void => {
    MonoContext.setState({
        [MAILER_KEY]: mailer,
    });
};

export const getMailer = () => {
    return MonoContext.getState()[MAILER_KEY] as {
        send: (p: {
            to: string | string[];
            subject: string;
            html: string;
            text?: string;
            from?: string;
            replyTo?: string;
        }) => Promise<{
            id: string;
        }>;
        sendTemplate: <T extends {
            name: unknown;
            props: unknown;
        }>(p: {
            to: string | string[];
            template: T;
            from?: string;
            replyTo?: string;
        }) => Promise<unknown>;
    };
};