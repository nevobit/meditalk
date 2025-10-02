import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { guestLoader } from "../loaders";
import { PublicRoutes } from "./route-paths";
import withSuspense from "../utils/with-suspense";
import ErrorBoundary from "@/app/screens/ErrorBoundary";

const Signin = lazy(() => import("@/modules/auth/screens/Login"));
const Register = lazy(() => import("@/modules/auth/screens/Register"));


export const publicRoutes: RouteObject[] = [
    {
        path: PublicRoutes.SIGNIN,
        loader: guestLoader,
        element: withSuspense(<Signin />),
        errorElement: <ErrorBoundary />,
    },
    {
        path: PublicRoutes.SIGNUP,
        loader: guestLoader,
        element: withSuspense(<Register />),
        errorElement: <ErrorBoundary />,
    },

];
