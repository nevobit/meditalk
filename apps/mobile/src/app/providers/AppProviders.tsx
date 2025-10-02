import { ReactNode, useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { makeApolloClient } from "./ApolloClient";
import "@/i18n/i18n";

export function AppProviders({ children }: { children: ReactNode }) {
    const client = useMemo(() => makeApolloClient(), []);
    return (
        <SafeAreaProvider>
            <ApolloProvider client={client}>{children}</ApolloProvider>
        </SafeAreaProvider>
    );
}
