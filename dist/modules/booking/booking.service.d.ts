export interface CreateBookingDTO {
    propertyId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes?: string;
}
export declare class BookingService {
    createBooking(userId: string, data: CreateBookingDTO): Promise<{
        booking: {
            property: {
                name: string;
                address: string;
            };
            room: {
                name: string;
                capacity: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            propertyId: string;
            roomId: string;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            totalPrice: import("@/generated/prisma/runtime/library").Decimal;
            status: import("@/generated/prisma").$Enums.BookingStatus;
            paymentProof: string | null;
            notes: string | null;
        };
        message: string;
    }>;
    getBookingById(bookingId: string, userId: string): Promise<{
        booking: {
            user: {
                name: string;
                email: string;
            };
            property: {
                name: string;
                address: string;
            };
            room: {
                name: string;
                capacity: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            propertyId: string;
            roomId: string;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            totalPrice: import("@/generated/prisma/runtime/library").Decimal;
            status: import("@/generated/prisma").$Enums.BookingStatus;
            paymentProof: string | null;
            notes: string | null;
        };
    }>;
    cancelBooking(bookingId: string, userId: string, reason?: string): Promise<{
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            propertyId: string;
            roomId: string;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            totalPrice: import("@/generated/prisma/runtime/library").Decimal;
            status: import("@/generated/prisma").$Enums.BookingStatus;
            paymentProof: string | null;
            notes: string | null;
        };
        message: string;
    }>;
    uploadPaymentProof(userId: string, bookingId: string, fileUrl: string): Promise<{
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            propertyId: string;
            roomId: string;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            totalPrice: import("@/generated/prisma/runtime/library").Decimal;
            status: import("@/generated/prisma").$Enums.BookingStatus;
            paymentProof: string | null;
            notes: string | null;
        };
        message: string;
    }>;
    getUserBookings(userId: string): Promise<{
        bookings: ({
            property: {
                name: string;
                address: string;
            };
            room: {
                name: string;
                capacity: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            propertyId: string;
            roomId: string;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            totalPrice: import("@/generated/prisma/runtime/library").Decimal;
            status: import("@/generated/prisma").$Enums.BookingStatus;
            paymentProof: string | null;
            notes: string | null;
        })[];
    }>;
}
