"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = getPaginationParams;
exports.getPaginationMeta = getPaginationMeta;
exports.createPaginatedResponse = createPaginatedResponse;
/**
 * Get pagination parameters from URL search params
 */
function getPaginationParams(searchParams, defaultLimit = 10, maxLimit = 100) {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit))));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
/**
 * Generate pagination metadata
 */
function getPaginationMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}
/**
 * Create paginated response
 */
function createPaginatedResponse(data, meta) {
    return {
        data,
        meta
    };
}
