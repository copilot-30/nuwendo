import { Resend } from 'resend';

// Initialize Resend
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const getEmailFrom = () => {
  // Prefer explicit env configuration
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }

  // Production-safe fallback for Nuwendo
  return 'noreply@nuwendo.com';
};

const formatDateTimeForEmail = (bookingDate, bookingTime) => {
  try {
    const datePart = bookingDate instanceof Date
      ? bookingDate.toISOString().split('T')[0]
      : String(bookingDate).split('T')[0];

    const timePart = bookingTime ? String(bookingTime).substring(0, 8) : '00:00:00';
    const date = new Date(`${datePart}T${timePart}`);

    if (Number.isNaN(date.getTime())) {
      return `${datePart} ${timePart}`;
    }

    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return `${bookingDate || ''} ${bookingTime || ''}`.trim();
  }
};

const formatCurrencyPhp = (value) => {
  try {
    const amount = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return `₱${value ?? 0}`;
  }
};

const buildTransactionReference = (orderId, createdAt) => {
  const date = new Date(createdAt || new Date());
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const paddedId = String(orderId).padStart(6, '0');
  return `TXN-${y}${m}${d}-${paddedId}`;
};

const sendNotificationEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn(`⚠️ Email service not configured. Skipping notification email to: ${to}`);
    return { success: false, skipped: true, reason: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html
    });

    if (error) {
      console.error('❌ Notification email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Notification email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code) => {
  if (!resend) {
    console.error('❌ Resend API key not configured');
    throw new Error('Email service not configured');
  }

  try {
    console.log('📧 Sending verification email via Resend to:', email);
    
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: 'Verify Your Nuwendo Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Nuwendo</h1>
              <p style="margin: 10px 0 0 0;">Verify Your Email Address</p>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Thank you for signing up with Nuwendo. To complete your registration, please use the verification code below:</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #6b7280;">Your Verification Code</p>
                <div class="code">${code}</div>
              </div>
              
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              
              <div class="footer">
                <p>© 2026 Nuwendo. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully via Resend, ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw new Error('Failed to send verification email: ' + error.message);
  }
};

// Send password reset email (for future use)
export const sendPasswordResetEmail = async (email, resetLink) => {
  if (!resend) {
    console.error('❌ Resend API key not configured');
    throw new Error('Email service not configured');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: 'Reset Your Nuwendo Password',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <p><a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw new Error('Failed to send password reset email: ' + error.message);
  }
};

export const sendBookingLifecycleEmail = async ({
  to,
  firstName,
  serviceName,
  bookingDate,
  bookingTime,
  appointmentType,
  eventType,
  meetingLink,
  reason,
  oldDate,
  oldTime,
  newDate,
  newTime
}) => {
  const displayName = firstName || 'Patient';
  const when = formatDateTimeForEmail(bookingDate, bookingTime);
  const oldWhen = oldDate && oldTime ? formatDateTimeForEmail(oldDate, oldTime) : null;
  const newWhen = newDate && newTime ? formatDateTimeForEmail(newDate, newTime) : null;

  const eventMap = {
    approved: {
      subject: 'Your Nuwendo booking has been approved',
      title: 'Booking Approved ✅',
      body: `Your booking for <strong>${serviceName}</strong> is now confirmed for <strong>${when}</strong>.`
    },
    cancelled: {
      subject: 'Your Nuwendo booking has been cancelled',
      title: 'Booking Cancelled',
      body: `Your booking for <strong>${serviceName}</strong> scheduled on <strong>${when}</strong> has been cancelled.`
    },
    rescheduled: {
      subject: 'Your Nuwendo booking has been rescheduled',
      title: 'Booking Rescheduled 🔄',
      body: `Your booking for <strong>${serviceName}</strong> has been moved${oldWhen ? ` from <strong>${oldWhen}</strong>` : ''} to <strong>${newWhen || when}</strong>.`
    },
    completed: {
      subject: 'Your Nuwendo appointment is marked completed',
      title: 'Appointment Completed ✅',
      body: `Your appointment for <strong>${serviceName}</strong> at <strong>${when}</strong> has been marked as completed.`
    },
    no_show: {
      subject: 'Update on your Nuwendo appointment status',
      title: 'Appointment Marked as No Show',
      body: `Your appointment for <strong>${serviceName}</strong> at <strong>${when}</strong> has been marked as no show.`
    }
  };

  const selected = eventMap[eventType] || eventMap.approved;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 22px;">${selected.title}</h2>
          </div>
          <div style="padding: 24px;">
            <p style="margin-top: 0;">Hi ${displayName},</p>
            <p>${selected.body}</p>
            <div style="margin: 16px 0; padding: 14px; border-radius: 10px; background: #f3f4f6;">
              <p style="margin: 0 0 6px 0;"><strong>Service:</strong> ${serviceName}</p>
              <p style="margin: 0 0 6px 0;"><strong>Appointment Type:</strong> ${appointmentType || 'N/A'}</p>
              <p style="margin: 0;"><strong>Date & Time:</strong> ${newWhen || when}</p>
            </div>
            ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" rel="noopener noreferrer">${meetingLink}</a></p>` : ''}
            ${reason ? `<p><strong>Note:</strong> ${reason}</p>` : ''}
            <p style="margin-bottom: 0; color: #6b7280;">If you have questions, please contact Nuwendo support.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendNotificationEmail({
    to,
    subject: selected.subject,
    html
  });
};

export const sendOrderLifecycleEmail = async ({
  to,
  firstName,
  orderId,
  createdAt,
  status,
  paymentVerified,
  totalAmount
}) => {
  const displayName = firstName || 'Customer';
  const transactionRef = buildTransactionReference(orderId, createdAt);

  let subject = `Update for your Nuwendo order ${transactionRef}`;
  let title = 'Order Update';
  let body = `There is an update for your order <strong>${transactionRef}</strong>.`;

  if (paymentVerified === true) {
    subject = `Payment approved for ${transactionRef}`;
    title = 'Payment Approved ✅';
    body = `Your payment for order <strong>${transactionRef}</strong> has been approved by our admin team.`;
  } else if (status === 'cancelled') {
    subject = `Order ${transactionRef} has been cancelled`;
    title = 'Order Cancelled';
    body = `Your order <strong>${transactionRef}</strong> has been cancelled.`;
  } else if (status) {
    subject = `Order ${transactionRef} status: ${status}`;
    title = `Order Status Updated: ${status}`;
    body = `Your order <strong>${transactionRef}</strong> status is now <strong>${status}</strong>.`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 22px;">${title}</h2>
          </div>
          <div style="padding: 24px;">
            <p style="margin-top: 0;">Hi ${displayName},</p>
            <p>${body}</p>
            <div style="margin: 16px 0; padding: 14px; border-radius: 10px; background: #f3f4f6;">
              <p style="margin: 0 0 6px 0;"><strong>Transaction Reference:</strong> ${transactionRef}</p>
              ${typeof totalAmount !== 'undefined' ? `<p style="margin: 0;"><strong>Total:</strong> ${formatCurrencyPhp(totalAmount)}</p>` : ''}
            </div>
            <p style="margin-bottom: 0; color: #6b7280;">Thank you for shopping with Nuwendo.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendNotificationEmail({
    to,
    subject,
    html
  });
};
