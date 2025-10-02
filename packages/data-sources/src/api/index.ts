import axios, {
  AxiosRequestHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaderValue
} from "axios";
import FunctionQueue, {
  FunctionQueueResult,
  QueueableFunction,
} from "@simplyhexagonal/function-queue";
import { MonoContext } from "@mdi/core-modules";
import * as crypto from 'crypto';

export interface InitApiOptions {
  apiBaseUrl: string;
  apiName: string;
  apiSecret: string;
  headers?: Partial<AxiosRequestHeaders>;
  rateLimitMs?: number;
  timeout?: number;
  maxRetries?: number;
}

export interface GenericApi {
  request: (config: AxiosRequestConfig) => Promise<FunctionQueueResult<unknown>>;
}

export const generateHeaders = (path: string, body: object | string, apiSecret: string) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body || {});
  const dataToSign = `${path}|${bodyString}|${timestamp}`;

  const signature = crypto.createHmac('sha256', apiSecret)
    .update(dataToSign)
    .digest('hex');

  return {
    "x-timestamp": timestamp,
    "x-signature": signature,
    "x-path": path,
  } as { [key: string]: AxiosHeaderValue };
};



export const initApi = async ({
  apiBaseUrl,
  apiName,
  apiSecret,
  headers,
  rateLimitMs,
  timeout,
  maxRetries,
}: InitApiOptions) => {
  const newHeaders = generateHeaders(apiBaseUrl, {}, apiSecret);

  const api = axios.create({
    baseURL: apiBaseUrl,
    headers: { ...headers, ...newHeaders },
  });

  const requestFn: QueueableFunction<
    AxiosRequestConfig,
    AxiosResponse["data"]
  > = (config: AxiosRequestConfig) => {
    return api.request(config).then(({ data }) => data);
  };

  const requestQ = new FunctionQueue(requestFn, {
    waitTimeBetweenRuns: rateLimitMs || 400,
    getResultTimeout: timeout || 30000,
    maxRetries: maxRetries || 0,
  });

  const request = async (config: AxiosRequestConfig) => {
    const payloadId = await requestQ.queuePayload(config);

    requestQ.processQueue();

    const result = await requestQ.getResult(payloadId);

    return result;
  };

  MonoContext.setState({
    dataSources: {
      ...(MonoContext.getState()["dataSources"] || {}),
      [`${apiName}`]: { request },
    },
  });
};
