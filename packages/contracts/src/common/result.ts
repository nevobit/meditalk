export type PageInfo =
    | {
        kind: "offset";
        page: number;
        pages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextPage: number | null;
        previousPage: number | null;
    }
    | {
        kind: "cursor";
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
    };

export interface Edge<T> {
    cursor: string;
    node: T;
}

export interface Result<T> {
    items: T[];
    edges?: Edge<T>[];
    pageInfo: PageInfo;
    count?: number;
}


export interface OffsetArgs {
    page: number;
    pageSize: number;
}

export type CursorArgs =
    | { first: number; after?: string; last?: never; before?: never }
    | { last: number; before?: string; first?: never; after?: never };

export type PaginateArgs = Partial<OffsetArgs & CursorArgs>;