import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getReports, getReportById, createReport, updateReport, processAudioAndSave } from '../../services/reportService';
import { reportKeys } from './report-keys';
import type { UpdateReportRequest } from '../../services/reportService';

// Query for getting all reports for a user
export const useReports = (userId: string) => {
    return useQuery({
        queryKey: reportKeys.list(userId),
        queryFn: () => getReports(userId),
        enabled: !!userId,
    });
};

// Query for getting a specific report by ID
export const useReport = (id: string) => {
    return useQuery({
        queryKey: reportKeys.detail(id),
        queryFn: () => getReportById(id),
        enabled: !!id,
    });
};

// Mutation for creating a new report
export const useCreateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: reportKeys.mutation('create'),
        mutationFn: createReport,
        onSuccess: (_, variables) => {
            // Invalidate and refetch reports list for the user
            queryClient.invalidateQueries({
                queryKey: reportKeys.list(variables.userId)
            });
        },
    });
};

// Mutation for updating a report
export const useUpdateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: reportKeys.mutation('update'),
        mutationFn: ({ id, data }: { id: string; data: UpdateReportRequest }) =>
            updateReport(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: reportKeys.detail(data.id)
            });
            queryClient.invalidateQueries({
                queryKey: reportKeys.lists()
            });
        },
    });
};

// Mutation for processing audio and saving report
export const useProcessAudioAndSave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: reportKeys.mutation('process'),
        mutationFn: processAudioAndSave,
        onSuccess: (_, variables) => {
            // Invalidate reports list for the user
            queryClient.invalidateQueries({
                queryKey: reportKeys.list(variables.userId)
            });
        },
    });
};
