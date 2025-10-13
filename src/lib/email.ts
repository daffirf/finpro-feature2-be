import nodemailer from 'nodemailer'
import type { Booking, User, Property, Room } from '@/generated/prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

interface BookingWithDetails extends Booking {
  user: Pick<User, 'name' | 'email'>
  property: Pick<Property, 'name' | 'address'>
  room: Pick<Room, 'name'>
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  booking: BookingWithDetails
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.user.email,
      subject: 'Booking Confirmed - Property Rental',
      html: `
        <h1>Booking Confirmed</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking has been confirmed!</p>
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Property:</strong> ${booking.property.name}</li>
          <li><strong>Room:</strong> ${booking.room.name}</li>
          <li><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString('id-ID')}</li>
          <li><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString('id-ID')}</li>
          <li><strong>Total Price:</strong> Rp ${Number(booking.totalPrice).toLocaleString('id-ID')}</li>
        </ul>
        
        <p>See you soon!</p>
      `
    })
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
}

/**
 * Send payment rejection email
 */
export async function sendPaymentRejection(
  booking: BookingWithDetails,
  reason?: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.user.email,
      subject: 'Payment Rejected - Property Rental',
      html: `
        <h1>Payment Rejected</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Unfortunately, your payment has been rejected.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Property:</strong> ${booking.property.name}</li>
          <li><strong>Room:</strong> ${booking.room.name}</li>
          <li><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString('id-ID')}</li>
          <li><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString('id-ID')}</li>
        </ul>
        
        <p>Please upload a valid payment proof.</p>
      `
    })
  } catch (error) {
    console.error('Failed to send rejection email:', error)
  }
}

/**
 * Send check-in reminder (H-1)
 */
export async function sendCheckInReminder(
  booking: BookingWithDetails
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.user.email,
      subject: 'Check-in Reminder - Tomorrow!',
      html: `
        <h1>Check-in Reminder</h1>
        <p>Hi ${booking.user.name},</p>
        <p>This is a reminder that your check-in is <strong>tomorrow</strong>!</p>
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Property:</strong> ${booking.property.name}</li>
          <li><strong>Address:</strong> ${booking.property.address}</li>
          <li><strong>Room:</strong> ${booking.room.name}</li>
          <li><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString('id-ID')}</li>
          <li><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString('id-ID')}</li>
        </ul>
        
        <p>We look forward to welcoming you!</p>
      `
    })
  } catch (error) {
    console.error('Failed to send reminder email:', error)
  }
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellation(
  booking: BookingWithDetails,
  reason?: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.user.email,
      subject: 'Booking Cancelled - Property Rental',
      html: `
        <h1>Booking Cancelled</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking has been cancelled.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Property:</strong> ${booking.property.name}</li>
          <li><strong>Room:</strong> ${booking.room.name}</li>
          <li><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString('id-ID')}</li>
          <li><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString('id-ID')}</li>
        </ul>
      `
    })
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
  }
}

