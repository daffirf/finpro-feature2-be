export interface PropertySearchParams {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    sortBy?: string;
    minPrice?: string;
    maxPrice?: string;
    amenities?: string[];
    page?: number;
    limit?: number;
}
export declare class PropertyService {
    searchProperties(params: PropertySearchParams): Promise<{
        data: ({
            reviews: {
                rating: number;
            }[];
            _count: {
                reviews: number;
            };
            rooms: {
                name: string;
                id: string;
                capacity: number;
                basePrice: import("@/generated/prisma/runtime/library").Decimal;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            basePrice: import("@/generated/prisma/runtime/library").Decimal;
            images: string[];
            isActive: boolean;
            tenantId: string;
            address: string;
            city: string;
            latitude: number | null;
            longitude: number | null;
            amenities: string[];
        })[];
        meta: import("@/lib/pagination").PaginationMeta;
    }>;
    getPropertyById(id: string): Promise<{
        property: {
            reviews: ({
                user: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                propertyId: string;
                bookingId: string;
                rating: number;
                comment: string;
                response: string | null;
            })[];
            _count: {
                reviews: number;
            };
            rooms: {
                name: string;
                id: string;
                description: string | null;
                capacity: number;
                basePrice: import("@/generated/prisma/runtime/library").Decimal;
                images: string[];
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            basePrice: import("@/generated/prisma/runtime/library").Decimal;
            images: string[];
            isActive: boolean;
            tenantId: string;
            address: string;
            city: string;
            latitude: number | null;
            longitude: number | null;
            amenities: string[];
        };
    }>;
    getPropertyPrices(propertyId: string, roomId: string, month: string): Promise<{
        prices: {
            date: string;
            price: number;
            isAvailable: boolean;
            isHoliday: boolean;
            isWeekend: boolean;
        }[];
    }>;
    private buildWhereClause;
    private getOrderByClause;
    private getBookedRoomIds;
    private checkRoomAvailability;
}
