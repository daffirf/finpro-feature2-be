"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.priceRule.deleteMany();
    await prisma.room.deleteMany();
    await prisma.property.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.user.deleteMany();
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    // Create Users
    console.log('👤 Creating users...');
    const user1 = await prisma.user.create({
        data: {
            email: 'user@example.com',
            name: 'John Doe',
            phone: '081234567890',
            password: hashedPassword,
            role: 'USER',
        },
    });
    const user2 = await prisma.user.create({
        data: {
            email: 'user2@example.com',
            name: 'Jane Smith',
            phone: '081234567891',
            password: hashedPassword,
            role: 'USER',
        },
    });
    const tenantUser1 = await prisma.user.create({
        data: {
            email: 'tenant1@example.com',
            name: 'Budi Santoso',
            phone: '081234567892',
            password: hashedPassword,
            role: 'TENANT',
        },
    });
    const tenantUser2 = await prisma.user.create({
        data: {
            email: 'tenant2@example.com',
            name: 'Siti Rahayu',
            phone: '081234567893',
            password: hashedPassword,
            role: 'TENANT',
        },
    });
    // Create Tenants
    console.log('🏢 Creating tenants...');
    const tenant1 = await prisma.tenant.create({
        data: {
            userId: tenantUser1.id,
            businessName: 'Bali Villa Paradise',
            address: 'Jl. Raya Ubud No. 123, Bali',
            phone: '0361234567',
            description: 'Penyedia villa dan resort terbaik di Bali',
            isVerified: true,
        },
    });
    const tenant2 = await prisma.tenant.create({
        data: {
            userId: tenantUser2.id,
            businessName: 'Jakarta Apartement',
            address: 'Jl. Sudirman No. 456, Jakarta',
            phone: '0217654321',
            description: 'Apartemen mewah di pusat kota Jakarta',
            isVerified: true,
        },
    });
    // Create Properties
    console.log('🏠 Creating properties...');
    const property1 = await prisma.property.create({
        data: {
            tenantId: tenant1.id,
            name: 'Villa Sunset View',
            description: 'Villa mewah dengan pemandangan sunset yang menakjubkan. Dilengkapi dengan kolam renang private, taman tropis, dan akses langsung ke pantai.',
            address: 'Jl. Pantai Berawa No. 88, Canggu, Bali',
            city: 'Bali',
            latitude: -8.6481,
            longitude: 115.1378,
            amenities: ['WiFi', 'Kolam Renang', 'Parkir', 'AC', 'Dapur', 'TV', 'Pemanas Air'],
            images: [
                '/uploads/properties/villa-sunset-1.jpg',
                '/uploads/properties/villa-sunset-2.jpg',
                '/uploads/properties/villa-sunset-3.jpg',
            ],
            basePrice: 1500000,
            isActive: true,
        },
    });
    const property2 = await prisma.property.create({
        data: {
            tenantId: tenant1.id,
            name: 'Villa Ocean Breeze',
            description: 'Villa modern dengan desain minimalis di tepi pantai. Perfect untuk liburan keluarga atau honeymoon.',
            address: 'Jl. Pantai Seminyak No. 45, Seminyak, Bali',
            city: 'Bali',
            latitude: -8.6920,
            longitude: 115.1727,
            amenities: ['WiFi', 'Kolam Renang', 'Parkir', 'AC', 'Dapur', 'Gym', 'BBQ Area'],
            images: [
                '/uploads/properties/villa-ocean-1.jpg',
                '/uploads/properties/villa-ocean-2.jpg',
            ],
            basePrice: 2000000,
            isActive: true,
        },
    });
    const property3 = await prisma.property.create({
        data: {
            tenantId: tenant2.id,
            name: 'Luxury Apartement Sudirman',
            description: 'Apartemen mewah di jantung kota Jakarta. Akses mudah ke pusat bisnis dan mall.',
            address: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
            city: 'Jakarta',
            latitude: -6.2251,
            longitude: 106.8097,
            amenities: ['WiFi', 'Parkir', 'AC', 'Gym', 'Security 24/7', 'Mall Access'],
            images: [
                '/uploads/properties/apt-sudirman-1.jpg',
                '/uploads/properties/apt-sudirman-2.jpg',
            ],
            basePrice: 800000,
            isActive: true,
        },
    });
    const property4 = await prisma.property.create({
        data: {
            tenantId: tenant2.id,
            name: 'Modern Studio Senopati',
            description: 'Studio apartment modern di area Senopati. Cocok untuk profesional muda.',
            address: 'Jl. Senopati No. 88, Jakarta Selatan',
            city: 'Jakarta',
            latitude: -6.2347,
            longitude: 106.8157,
            amenities: ['WiFi', 'AC', 'Parkir', 'Security', 'Laundry'],
            images: ['/uploads/properties/studio-senopati-1.jpg'],
            basePrice: 500000,
            isActive: true,
        },
    });
    // Create Rooms
    console.log('🛏️  Creating rooms...');
    const room1 = await prisma.room.create({
        data: {
            propertyId: property1.id,
            name: 'Deluxe Room',
            description: 'Kamar deluxe dengan pemandangan taman',
            capacity: 2,
            basePrice: 1500000,
            images: ['/uploads/rooms/villa-sunset-deluxe.jpg'],
            isActive: true,
        },
    });
    const room2 = await prisma.room.create({
        data: {
            propertyId: property1.id,
            name: 'Family Suite',
            description: 'Suite besar untuk keluarga hingga 4 orang',
            capacity: 4,
            basePrice: 2500000,
            images: ['/uploads/rooms/villa-sunset-suite.jpg'],
            isActive: true,
        },
    });
    const room3 = await prisma.room.create({
        data: {
            propertyId: property2.id,
            name: 'Ocean View Room',
            description: 'Kamar dengan pemandangan laut',
            capacity: 2,
            basePrice: 2000000,
            images: ['/uploads/rooms/villa-ocean-room.jpg'],
            isActive: true,
        },
    });
    const room4 = await prisma.room.create({
        data: {
            propertyId: property3.id,
            name: '1 Bedroom Apartment',
            description: 'Apartemen 1 kamar tidur fully furnished',
            capacity: 2,
            basePrice: 800000,
            images: ['/uploads/rooms/apt-1br.jpg'],
            isActive: true,
        },
    });
    const room5 = await prisma.room.create({
        data: {
            propertyId: property4.id,
            name: 'Studio Room',
            description: 'Studio modern dengan fasilitas lengkap',
            capacity: 2,
            basePrice: 500000,
            images: ['/uploads/rooms/studio-room.jpg'],
            isActive: true,
        },
    });
    // Create Price Rules
    console.log('💰 Creating price rules...');
    // Weekend pricing for Villa Sunset View
    await prisma.priceRule.create({
        data: {
            propertyId: property1.id,
            name: 'Weekend Rate',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            priceType: 'PERCENTAGE',
            value: 30, // +30% on weekends
            isActive: true,
        },
    });
    // Holiday pricing for Villa Ocean Breeze
    await prisma.priceRule.create({
        data: {
            propertyId: property2.id,
            name: 'Holiday Season',
            startDate: new Date('2025-12-20'),
            endDate: new Date('2026-01-05'),
            priceType: 'PERCENTAGE',
            value: 50, // +50% during holidays
            isActive: true,
        },
    });
    // Special discount for Jakarta Apartment
    await prisma.priceRule.create({
        data: {
            propertyId: property3.id,
            name: 'Weekday Discount',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            priceType: 'PERCENTAGE',
            value: -10, // -10% on weekdays
            isActive: true,
        },
    });
    // Create Bookings
    console.log('📅 Creating bookings...');
    const booking1 = await prisma.booking.create({
        data: {
            userId: user1.id,
            propertyId: property1.id,
            roomId: room1.id,
            checkIn: new Date('2025-11-01'),
            checkOut: new Date('2025-11-05'),
            guests: 2,
            totalPrice: 6000000,
            status: 'CONFIRMED',
            notes: 'Mohon disiapkan welcome drink',
        },
    });
    const booking2 = await prisma.booking.create({
        data: {
            userId: user2.id,
            propertyId: property2.id,
            roomId: room3.id,
            checkIn: new Date('2025-11-10'),
            checkOut: new Date('2025-11-15'),
            guests: 2,
            totalPrice: 10000000,
            status: 'PENDING_PAYMENT',
            notes: 'Honeymoon package',
        },
    });
    const booking3 = await prisma.booking.create({
        data: {
            userId: user1.id,
            propertyId: property3.id,
            roomId: room4.id,
            checkIn: new Date('2025-10-15'),
            checkOut: new Date('2025-10-20'),
            guests: 2,
            totalPrice: 4000000,
            status: 'COMPLETED',
            paymentProof: '/uploads/payments/payment-proof-1.jpg',
        },
    });
    // Create Reviews
    console.log('⭐ Creating reviews...');
    await prisma.review.create({
        data: {
            userId: user1.id,
            propertyId: property3.id,
            bookingId: booking3.id,
            rating: 5,
            comment: 'Apartemen sangat bersih dan nyaman! Lokasi strategis, dekat dengan pusat kota. Staff ramah dan helpful. Highly recommended!',
            response: 'Terima kasih atas review positifnya! Kami senang Anda menikmati menginap di apartemen kami. Ditunggu kunjungan berikutnya!',
        },
    });
    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 4 (2 regular users, 2 tenants)`);
    console.log(`   - Tenants: 2`);
    console.log(`   - Properties: 4`);
    console.log(`   - Rooms: 5`);
    console.log(`   - Price Rules: 3`);
    console.log(`   - Bookings: 3`);
    console.log(`   - Reviews: 1`);
    console.log('\n🔑 Login Credentials:');
    console.log('   User 1:');
    console.log('   - Email: user@example.com');
    console.log('   - Password: password123');
    console.log('');
    console.log('   User 2:');
    console.log('   - Email: user2@example.com');
    console.log('   - Password: password123');
    console.log('');
    console.log('   Tenant 1:');
    console.log('   - Email: tenant1@example.com');
    console.log('   - Password: password123');
    console.log('   - Business: Bali Villa Paradise');
    console.log('');
    console.log('   Tenant 2:');
    console.log('   - Email: tenant2@example.com');
    console.log('   - Password: password123');
    console.log('   - Business: Jakarta Apartement');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
