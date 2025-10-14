import type { Booking, User, Property, Room } from '@/generated/prisma';
interface BookingWithDetails extends Booking {
    user: Pick<User, 'name' | 'email'>;
    property: Pick<Property, 'name' | 'address'>;
    room: Pick<Room, 'name'>;
}
/**
 * Send booking confirmation email
 */
export declare function sendBookingConfirmation(booking: BookingWithDetails): Promise<void>;
/**
 * Send payment rejection email
 */
export declare function sendPaymentRejection(booking: BookingWithDetails, reason?: string): Promise<void>;
/**
 * Send check-in reminder (H-1)
 */
export declare function sendCheckInReminder(booking: BookingWithDetails): Promise<void>;
/**
 * Send booking cancellation email
 */
export declare function sendBookingCancellation(booking: BookingWithDetails, reason?: string): Promise<void>;
export {};
