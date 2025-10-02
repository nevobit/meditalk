export type KeyParams = Record<string, unknown>;

export type QueryKeyFactory<NS extends string> = {
    all: readonly [NS];

    list: <P extends KeyParams = Record<string, never>>(params?: P) =>
        readonly [NS, "list", P];

    detail: <P extends { id: string } & KeyParams>(params: P) =>
        readonly [NS, "detail", P];

    by: <S extends string, P extends KeyParams = Record<string, never>>(scope: S, params?: P) =>
        readonly [NS, S, P];

    search: <P extends KeyParams>(params: P) =>
        readonly [NS, "search", P];

    subresource: <
        S extends string,
        PARENT extends KeyParams,
        CHILD extends KeyParams = Record<string, never>
    >(
        parentScope: S,
        parent: PARENT,
        childScope: S | string,
        child?: CHILD
    ) => readonly [NS, S, PARENT, string, CHILD];

    infinite: <P extends KeyParams = Record<string, never>>(params?: P) =>
        readonly [NS, "infinite", P];

    meta: <S extends string = "config", P extends KeyParams = Record<string, never>>(scope?: S, params?: P) =>
        readonly [NS, "meta", S, P];

    mutation: <ACTION extends string, P extends KeyParams = Record<string, never>>(action: ACTION, params?: P) =>
        readonly [NS, "mutation", ACTION, P];

    prefetch: <S extends string, P extends KeyParams = Record<string, never>>(scope: S, params?: P) =>
        readonly [NS, "prefetch", S, P];
};

export function createQueryKeys<NS extends string>(namespace: NS): QueryKeyFactory<NS> {
    return {
        all: [namespace] as const,

        list: <P extends KeyParams = Record<string, never>>(params?: P) =>
            [namespace, "list", (params ?? {}) as P] as const,

        detail: <P extends { id: string } & KeyParams>(params: P) =>
            [namespace, "detail", params] as const,

        by: <S extends string, P extends KeyParams = Record<string, never>>(scope: S, params?: P) =>
            [namespace, scope, (params ?? {}) as P] as const,

        search: <P extends KeyParams>(params: P) =>
            [namespace, "search", params] as const,

        subresource: <
            S extends string,
            PARENT extends KeyParams,
            CHILD extends KeyParams = Record<string, never>
        >(parentScope: S, parent: PARENT, childScope: S | string, child?: CHILD) =>
            [namespace, parentScope, parent, String(childScope), (child ?? {}) as CHILD] as const,

        infinite: <P extends KeyParams = Record<string, never>>(params?: P) =>
            [namespace, "infinite", (params ?? {}) as P] as const,

        meta: <S extends string = "config", P extends KeyParams = Record<string, never>>(scope?: S, params?: P) =>
            [namespace, "meta", (scope ?? "config") as S, (params ?? {}) as P] as const,

        mutation: <ACTION extends string, P extends KeyParams = Record<string, never>>(action: ACTION, params?: P) =>
            [namespace, "mutation", action, (params ?? {}) as P] as const,

        prefetch: <S extends string, P extends KeyParams = Record<string, never>>(scope: S, params?: P) =>
            [namespace, "prefetch", scope, (params ?? {}) as P] as const,
    };
}
