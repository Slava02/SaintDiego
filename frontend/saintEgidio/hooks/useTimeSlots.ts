import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TimeSlot, CreateTimeSlotRequest } from '@/types/event';

interface UseTimeSlotsOptions {
    status?: 'active' | 'archived';
    startDate?: string;
    endDate?: string;
}

export function useTimeSlots(options: UseTimeSlotsOptions = {}) {
    const queryClient = useQueryClient();

    // Запрос для получения списка временных слотов
    const { data: timeSlots = [], isLoading, error } = useQuery({
        queryKey: ['timeSlots', options],
        queryFn: () => api.getTimeSlots(options),
    });

    // Мутация для создания нового временного слота
    const createMutation = useMutation({
        mutationFn: (data: CreateTimeSlotRequest) => api.createTimeSlot(data),
        onSuccess: () => {
            // Инвалидируем кэш после успешного создания
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });

    // Мутация для архивации временного слота
    const archiveMutation = useMutation({
        mutationFn: (id: string) => api.archiveTimeSlot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });

    // Мутация для активации временного слота
    const activateMutation = useMutation({
        mutationFn: (id: string) => api.activateTimeSlot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });

    // Мутация для удаления временного слота
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteTimeSlot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });

    return {
        timeSlots,
        isLoading,
        error,
        createTimeSlot: createMutation.mutate,
        isCreating: createMutation.isPending,
        archiveTimeSlot: archiveMutation.mutate,
        isArchiving: archiveMutation.isPending,
        activateTimeSlot: activateMutation.mutate,
        isActivating: activateMutation.isPending,
        deleteTimeSlot: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
} 