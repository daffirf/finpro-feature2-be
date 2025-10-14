/**
 * Check if a room is available for the specified date range
 */
export declare function checkRoomAvailability(roomId: string, checkIn: string | Date, checkOut: string | Date): Promise<boolean>;
/**
 * Validate booking dates
 */
export declare function validateBookingDates(checkIn: string | Date, checkOut: string | Date): {
    valid: boolean;
    error?: string;
};
/**
 * Calculate total price for a booking with price rules
 */
export declare function calculateBookingPrice(roomId: string, checkIn: string | Date, checkOut: string | Date): Promise<number>;
/**
 * Calculate nights between two dates
 */
export declare function calculateNights(checkIn: string | Date, checkOut: string | Date): number;
/**
 * Check if booking payment is expired (1 hour timeout)
 */
export declare function isPaymentExpired(createdAt: Date): boolean;
