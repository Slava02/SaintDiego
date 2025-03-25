import { TimeSlot, Service, Location, Recurrence } from './event';

export type CreateTimeSlotRequest = Omit<TimeSlot, 'id' | 'location' | 'status'>;

export interface ApiError {
    code: string;
    message: string;
    details?: string;
} 