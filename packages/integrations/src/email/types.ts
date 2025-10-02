export type EmailAddress = string;
export type SendParams = {
    to: EmailAddress | EmailAddress[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
};

export type EmailProvider = {
    send: (params: SendParams) => Promise<{ id: string }>;
};
