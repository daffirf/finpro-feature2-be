export const __esModule: boolean;
export namespace Prisma {
    let TransactionIsolationLevel: any;
    namespace UserScalarFieldEnum {
        let id: string;
        let email: string;
        let name: string;
        let phone: string;
        let password: string;
        let role: string;
        let createdAt: string;
        let updatedAt: string;
    }
    namespace TenantScalarFieldEnum {
        let id_1: string;
        export { id_1 as id };
        export let userId: string;
        export let businessName: string;
        export let address: string;
        let phone_1: string;
        export { phone_1 as phone };
        export let description: string;
        export let isVerified: string;
        let createdAt_1: string;
        export { createdAt_1 as createdAt };
        let updatedAt_1: string;
        export { updatedAt_1 as updatedAt };
    }
    namespace PropertyScalarFieldEnum {
        let id_2: string;
        export { id_2 as id };
        export let tenantId: string;
        let name_1: string;
        export { name_1 as name };
        let description_1: string;
        export { description_1 as description };
        let address_1: string;
        export { address_1 as address };
        export let city: string;
        export let latitude: string;
        export let longitude: string;
        export let amenities: string;
        export let images: string;
        export let basePrice: string;
        export let isActive: string;
        let createdAt_2: string;
        export { createdAt_2 as createdAt };
        let updatedAt_2: string;
        export { updatedAt_2 as updatedAt };
    }
    namespace RoomScalarFieldEnum {
        let id_3: string;
        export { id_3 as id };
        export let propertyId: string;
        let name_2: string;
        export { name_2 as name };
        let description_2: string;
        export { description_2 as description };
        export let capacity: string;
        let basePrice_1: string;
        export { basePrice_1 as basePrice };
        let images_1: string;
        export { images_1 as images };
        let isActive_1: string;
        export { isActive_1 as isActive };
        let createdAt_3: string;
        export { createdAt_3 as createdAt };
        let updatedAt_3: string;
        export { updatedAt_3 as updatedAt };
    }
    namespace PriceRuleScalarFieldEnum {
        let id_4: string;
        export { id_4 as id };
        let propertyId_1: string;
        export { propertyId_1 as propertyId };
        let name_3: string;
        export { name_3 as name };
        export let startDate: string;
        export let endDate: string;
        export let priceType: string;
        export let value: string;
        let isActive_2: string;
        export { isActive_2 as isActive };
        let createdAt_4: string;
        export { createdAt_4 as createdAt };
        let updatedAt_4: string;
        export { updatedAt_4 as updatedAt };
    }
    namespace BookingScalarFieldEnum {
        let id_5: string;
        export { id_5 as id };
        let userId_1: string;
        export { userId_1 as userId };
        let propertyId_2: string;
        export { propertyId_2 as propertyId };
        export let roomId: string;
        export let checkIn: string;
        export let checkOut: string;
        export let guests: string;
        export let totalPrice: string;
        export let status: string;
        export let paymentProof: string;
        export let notes: string;
        let createdAt_5: string;
        export { createdAt_5 as createdAt };
        let updatedAt_5: string;
        export { updatedAt_5 as updatedAt };
    }
    namespace ReviewScalarFieldEnum {
        let id_6: string;
        export { id_6 as id };
        let userId_2: string;
        export { userId_2 as userId };
        let propertyId_3: string;
        export { propertyId_3 as propertyId };
        export let bookingId: string;
        export let rating: string;
        export let comment: string;
        export let response: string;
        let createdAt_6: string;
        export { createdAt_6 as createdAt };
        let updatedAt_6: string;
        export { updatedAt_6 as updatedAt };
    }
    namespace SortOrder {
        let asc: string;
        let desc: string;
    }
    namespace QueryMode {
        let _default: string;
        export { _default as default };
        export let insensitive: string;
    }
    namespace NullsOrder {
        let first: string;
        let last: string;
    }
    namespace ModelName {
        let User: string;
        let Tenant: string;
        let Property: string;
        let Room: string;
        let PriceRule: string;
        let Booking: string;
        let Review: string;
    }
}
export namespace $Enums {
    namespace UserRole {
        let USER: string;
        let TENANT: string;
        let ADMIN: string;
    }
    namespace BookingStatus {
        let PENDING_PAYMENT: string;
        let PAYMENT_CONFIRMED: string;
        let CONFIRMED: string;
        let CANCELLED: string;
        let COMPLETED: string;
    }
    namespace PriceType {
        let PERCENTAGE: string;
        let FIXED: string;
    }
}
export namespace UserRole {
    let USER_1: string;
    export { USER_1 as USER };
    let TENANT_1: string;
    export { TENANT_1 as TENANT };
    let ADMIN_1: string;
    export { ADMIN_1 as ADMIN };
}
export namespace BookingStatus {
    let PENDING_PAYMENT_1: string;
    export { PENDING_PAYMENT_1 as PENDING_PAYMENT };
    let PAYMENT_CONFIRMED_1: string;
    export { PAYMENT_CONFIRMED_1 as PAYMENT_CONFIRMED };
    let CONFIRMED_1: string;
    export { CONFIRMED_1 as CONFIRMED };
    let CANCELLED_1: string;
    export { CANCELLED_1 as CANCELLED };
    let COMPLETED_1: string;
    export { COMPLETED_1 as COMPLETED };
}
export namespace PriceType {
    let PERCENTAGE_1: string;
    export { PERCENTAGE_1 as PERCENTAGE };
    let FIXED_1: string;
    export { FIXED_1 as FIXED };
}
export namespace Prisma {
    export namespace prismaVersion {
        let client: string;
        let engine: string;
    }
    export { PrismaClientKnownRequestError };
    export { PrismaClientUnknownRequestError };
    export { PrismaClientRustPanicError };
    export { PrismaClientInitializationError };
    export { PrismaClientValidationError };
    export { Decimal };
    export { sqltag as sql };
    export { empty };
    export { join };
    export { raw };
    export let validator: any;
    export let getExtensionContext: any;
    export let defineExtension: any;
    export let DbNull: any;
    export let JsonNull: any;
    export let AnyNull: any;
    export namespace NullTypes {
        let DbNull_1: any;
        export { DbNull_1 as DbNull };
        let JsonNull_1: any;
        export { JsonNull_1 as JsonNull };
        let AnyNull_1: any;
        export { AnyNull_1 as AnyNull };
    }
}
export const PrismaClient: any;
import { PrismaClientKnownRequestError } from "./runtime/edge.js";
import { PrismaClientUnknownRequestError } from "./runtime/edge.js";
import { PrismaClientRustPanicError } from "./runtime/edge.js";
import { PrismaClientInitializationError } from "./runtime/edge.js";
import { PrismaClientValidationError } from "./runtime/edge.js";
import { Decimal } from "./runtime/edge.js";
import { sqltag } from "./runtime/edge.js";
import { empty } from "./runtime/edge.js";
import { join } from "./runtime/edge.js";
import { raw } from "./runtime/edge.js";
