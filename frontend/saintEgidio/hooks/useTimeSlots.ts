import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CreateTimeSlotRequest, TimeSlot } from '@/types/api';

export function useTimeSlots(params?: {
    status?: 'active' | 'archived';
    startDate?: string;
    endDate?: string;
}) {
    const queryClient = useQueryClient();

    const timeSlotsQuery = useQuery({
        queryKey: ['timeSlots', params],
        queryFn: () => api.getTimeSlots(params),
    });

    const createTimeSlotMutation = useMutation({
        mutationFn: (data: CreateTimeSlotRequest) => api.createTimeSlot(data),
        onSuccess: () => {
            // Инвалидируем кэш после успешного создания
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });

    return {
        timeSlots: timeSlotsQuery.data ?? [],
        isLoading: timeSlotsQuery.isLoading,
        error: timeSlotsQuery.error,
        createTimeSlot: createTimeSlotMutation.mutate,
        isCreating: createTimeSlotMutation.isPending,
        createError: createTimeSlotMutation.error,
    };
} 