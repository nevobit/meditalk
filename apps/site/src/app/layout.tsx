import type { ReactNode } from "react";
import type { Metadata } from "next";

import "@mdi/design-system/css/web.css";
import { AppProviders } from "@/providers/app-providers";
import { Header } from "@/shared/components/header";
import { Sidebar } from "@/shared/components/Sidebar";


export const metadata: Metadata = {
    verification: {
        google: ''
    },
    metadataBase: new URL('https://repo.com.co'),
    title: {
        default: 'Repo',
        template: '%s | Repo'
    },
    description: 'desc',
    applicationName: 'Repo',
    keywords: [''],
    authors: [{ name: 'Nevobit', url: 'https://nevobit.co' }],
    creator: 'Nevobit Software',
    publisher: 'Nevobit Software',
    alternates: {
        canonical: '/',
        languages: {
            'es-ES': '/es-ES',
            'de-DE': '/de-DE',
        }
    },
    openGraph: {
        title: 'Repo',
        description: '...',
        url: 'https://repo.com.co',
        siteName: 'Repo',
        type: 'website',
        locale: 'es-ES',
    },
    twitter: {
        title: 'Repo',
        description: '...',
        creator: '@nevobitsoftware',
        site: 'Repo',
        card: 'summary_large_image',
    }
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <AppProviders>
                    <Header />
                    <Sidebar />
                    {children}
                </AppProviders>
            </body>
        </html>
    );
}
