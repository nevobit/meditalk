import { lazy, } from "react";
import type { RouteObject } from "react-router-dom";
import { authLoader } from "../loaders";
import withSuspense from "../utils/with-suspense";
import { PrivateRoutes } from "./route-paths";
import ErrorBoundary from "@/app/screens/ErrorBoundary";
import RecordingScreen from "@/modules/recording/screens/Recording";
import ReportHistoryTable from "@/modules/informs/screens/List";
import ReportGeneration from "@/modules/reports/screens/ReportGeneration";

const Layout = lazy(() => import("@/app/components/Layout"));
const Dashbaord = lazy(() => import("@/modules/dashboard/screens/home"));


export const privateRoutes: RouteObject[] = [
    {
        path: PrivateRoutes.ROOT,
        loader: authLoader,
        element: withSuspense(<Layout />),
        errorElement: <ErrorBoundary />,
        children: [
            { index: true, element: withSuspense(<Dashbaord />) },
            {
                path: '/recording', element: withSuspense(<RecordingScreen templates={[
                    {
                        id: '1',
                        name: 'Consulta General',
                        description: 'Ideal para consultas médicas generales, revisiones de rutina, síntomas comunes y seguimiento de tratamientos. Incluye secciones para síntomas, diagnóstico, tratamiento y recomendaciones.'
                    },
                    {
                        id: '2',
                        name: 'Cirugía',
                        description: 'Plantilla especializada para procedimientos quirúrgicos. Incluye evaluación preoperatoria, descripción del procedimiento, complicaciones, cuidados postoperatorios y seguimiento.'
                    },
                    {
                        id: '3',
                        name: 'Emergencias',
                        description: 'Para casos de urgencia médica. Incluye evaluación rápida, signos vitales, diagnóstico de emergencia, tratamiento inmediato y derivación si es necesario.'
                    },
                    {
                        id: '4',
                        name: 'Pediatría',
                        description: 'Especializada para pacientes pediátricos. Incluye edad, peso, talla, síntomas específicos, desarrollo, vacunas y recomendaciones para padres.'
                    },
                    {
                        id: '5',
                        name: 'Cardiología',
                        description: 'Para evaluaciones cardiológicas. Incluye síntomas cardíacos, antecedentes, examen cardiovascular, estudios complementarios y plan de tratamiento.'
                    },
                    {
                        id: '6',
                        name: 'Ginecología',
                        description: 'Especializada en salud femenina. Incluye antecedentes ginecológicos, síntomas, examen físico, estudios complementarios y recomendaciones.'
                    }
                ]} />)
            },
            { path: '/report-generation', element: withSuspense(<ReportGeneration />) },
            { path: '/list', element: withSuspense(<ReportHistoryTable rows={[{ id: '1', date: '2021-01-01', durationSec: 100, patient: 'Juan Perez', template: 'Receta' }, { id: '2', date: '2021-01-02', durationSec: 200, patient: 'Maria Gomez', template: 'Receta' }, { id: '3', date: '2021-01-03', durationSec: 300, patient: 'Pedro Gomez', template: 'Receta' }]} />) },
        ]
    }
];
