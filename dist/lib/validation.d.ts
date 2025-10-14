import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["USER", "TENANT"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "USER" | "TENANT";
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    role?: "USER" | "TENANT" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createPropertySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    basePrice: z.ZodNumber;
    amenities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    basePrice: number;
    address: string;
    city: string;
    images?: string[] | undefined;
    amenities?: string[] | undefined;
}, {
    name: string;
    description: string;
    basePrice: number;
    address: string;
    city: string;
    images?: string[] | undefined;
    amenities?: string[] | undefined;
}>;
export declare const createRoomSchema: z.ZodObject<{
    propertyId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    capacity: z.ZodNumber;
    basePrice: z.ZodNumber;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    propertyId: string;
    capacity: number;
    basePrice: number;
    description?: string | undefined;
    images?: string[] | undefined;
}, {
    name: string;
    propertyId: string;
    capacity: number;
    basePrice: number;
    description?: string | undefined;
    images?: string[] | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<{
    propertyId: z.ZodString;
    roomId: z.ZodString;
    checkIn: z.ZodString;
    checkOut: z.ZodString;
    guests: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    propertyId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes?: string | undefined;
}, {
    propertyId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes?: string | undefined;
}>;
export declare const searchSchema: z.ZodObject<{
    city: z.ZodString;
    checkIn: z.ZodString;
    checkOut: z.ZodString;
    guests: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    checkIn: string;
    checkOut: string;
    guests: number;
    city: string;
}, {
    checkIn: string;
    checkOut: string;
    guests: number;
    city: string;
}>;
export declare const createReviewSchema: z.ZodObject<{
    bookingId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    rating: number;
    comment: string;
}, {
    bookingId: string;
    rating: number;
    comment: string;
}>;
export declare const fileUploadSchema: z.ZodObject<{
    file: z.ZodType<import("buffer").File, z.ZodTypeDef, import("buffer").File>;
    maxSize: z.ZodDefault<z.ZodNumber>;
    allowedTypes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    file: import("buffer").File;
    maxSize: number;
    allowedTypes: string[];
}, {
    file: import("buffer").File;
    maxSize?: number | undefined;
    allowedTypes?: string[] | undefined;
}>;
export declare function validateFile(file: File, maxSize?: number, allowedTypes?: string[]): {
    valid: boolean;
    error?: string;
};
