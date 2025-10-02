import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "./routes";
import { privateRoutes } from "./routes";
import NotFound from "../screens/NotFound";

export const router = createBrowserRouter([
    ...publicRoutes,
    ...privateRoutes,
    { path: "*", element: <NotFound /> }
]);
