export const reportKeys = {
    all: ['reports'] as const,
    lists: () => [...reportKeys.all, 'list'] as const,
    list: (filters: string) => [...reportKeys.lists(), { filters }] as const,
    details: () => [...reportKeys.all, 'detail'] as const,
    detail: (id: string) => [...reportKeys.details(), id] as const,
    mutations: {
        create: () => [...reportKeys.all, 'create'] as const,
        update: () => [...reportKeys.all, 'update'] as const,
        delete: () => [...reportKeys.all, 'delete'] as const,
        process: () => [...reportKeys.all, 'process'] as const,
    },
    mutation: (type: 'create' | 'update' | 'delete' | 'process') => reportKeys.mutations[type](),
};
