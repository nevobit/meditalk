import { LifecycleStatus } from "./constants";

export type Timestamp = Date | string;

export interface Base<TId = string> {
    readonly id: TId;
    lifecycleStatus?: LifecycleStatus;
    readonly createdAt?: Timestamp;
    updatedAt?: Timestamp;
    readonly deletedAt?: Timestamp;
}