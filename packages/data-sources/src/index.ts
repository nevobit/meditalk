import { type InitApiOptions, initApi } from "./api";
import { type InitMongooseOptions, initMongoose } from "./mongoose";
import { type InitPostgresOptions, initPostgresDb } from "./postgresql";
import { type InitRedisOptions, initRedis } from "./redis";
import { type GenericApi } from './api';

export interface InitDataSourcesOptions {
    api?: InitApiOptions[];
    postgresqldb?: InitPostgresOptions;
    redisdb?: InitRedisOptions;
    mongoose?: InitMongooseOptions;
}

export type { GenericApi };

export const initDataSources = async ({ api, postgresqldb, mongoose, redisdb }: InitDataSourcesOptions) => {
    if (api) {
        for (const apiOptions of api) {
            await initApi(apiOptions);
        }
    }
    if (postgresqldb) {
        await initPostgresDb(postgresqldb);
    }
    if (redisdb) {
        await initRedis(redisdb);
    }
    if (mongoose) {
        await initMongoose(mongoose);
    }
};