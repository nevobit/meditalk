import { lazy, } from "react";
import type { RouteObject } from "react-router-dom";
import { authLoader } from "../loaders";
import withSuspense from "../utils/with-suspense";
import { PrivateRoutes } from "./route-paths";
import ErrorBoundary from "@/app/screens/ErrorBoundary";

const Layout = lazy(() => import("@/app/components/Layout"));

export const privateRoutes: RouteObject[] = [
    {
        path: PrivateRoutes.ROOT,
        loader: authLoader,
        element: withSuspense(<Layout />),
        errorElement: <ErrorBoundary />,
        children: [
            { index: true, element: withSuspense(<Layout />) },
            // { path: PrivateRoutes.CONTACTS.replace, element: withSuspense(<Contacts />) },
            // { path: PrivateRoutes.PRODUCTS.replace, element: withSuspense(<Products />) },
        ]
    }
];
