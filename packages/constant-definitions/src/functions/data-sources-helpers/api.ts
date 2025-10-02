import { MonoContext } from '@mdi/core-modules';
import { DATA_SOURCES_KEY } from './constants';
import {
    AxiosRequestConfig,
} from "axios";
import {
    FunctionQueueResult,
} from "@simplyhexagonal/function-queue";

export interface GenericApi {
    request: (config: AxiosRequestConfig) => Promise<FunctionQueueResult<unknown>>;
}

export const getApiClient = (apiName: string) => {
    const dataSources = MonoContext.getState()[DATA_SOURCES_KEY] as Record<string, GenericApi>;

    if (!dataSources[apiName]) throw new Error(`No API client found for ${apiName}`);

    return dataSources[apiName];
};