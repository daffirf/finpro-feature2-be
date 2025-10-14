export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
/**
 * Get pagination parameters from URL search params
 */
export declare function getPaginationParams(searchParams: URLSearchParams, defaultLimit?: number, maxLimit?: number): PaginationParams;
/**
 * Generate pagination metadata
 */
export declare function getPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
/**
 * Create paginated response
 */
export declare function createPaginatedResponse<T>(data: T[], meta: PaginationMeta): {
    data: T[];
    meta: PaginationMeta;
};
