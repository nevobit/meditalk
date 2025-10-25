import { model, Model, Schema, mongoose } from 'mongoose';
import { Collection } from "./constants";
import { MonoContext } from '@mdi/core-modules';
import { DATA_SOURCES_KEY } from './constants';

export const getModel = <T>(collectionName: Collection, schema: Schema): Model<T> => {
    return model<T>(collectionName, schema);
}

export const getMongooseClient = () => {
    const dataSources = MonoContext.getState()[DATA_SOURCES_KEY] as {
        mongoose: typeof mongoose;
    };

    if (!dataSources.mongoose) throw new Error(`No mongoose client found`);
    return dataSources.mongoose;
}