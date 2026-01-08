import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, topic, message } = body;

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email configuration
    const TO_EMAIL = 'coryarmer@gmail.com';
    
    // Format email content
    const emailSubject = `BarLink Contact Form: ${topic || 'General Inquiry'}`;
    const emailText = `
Name: ${name}
Email: ${email}
Topic: ${topic || 'Not specified'}

Message:
${message}

---
Sent from BarLink Contact Form
    `.trim();

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0891b2;">New Contact Form Submission</h2>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 10px 0;"><strong>Topic:</strong> ${topic || 'Not specified'}</p>
        </div>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #64748b; font-size: 12px;">Sent from BarLink Contact Form</p>
      </div>
    `.trim();

    // Check if Gmail SMTP credentials are configured (for production on Render)
    const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
    const SMTP_PORT = process.env.SMTP_PORT || '587';
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const FROM_EMAIL = process.env.SMTP_FROM || SMTP_USER || 'noreply@barlink.com';

    if (SMTP_USER && SMTP_PASS) {
      // Use Gmail SMTP
      try {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT),
          secure: SMTP_PORT === '465',
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"BarLink Contact Form" <${FROM_EMAIL}>`,
          to: TO_EMAIL,
          replyTo: email,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        });

        console.log('Email sent successfully via Gmail SMTP to:', TO_EMAIL);
      } catch (smtpError) {
        console.error('Gmail SMTP error:', smtpError);
        throw new Error('Failed to send email via SMTP');
      }
    } else {
      // Fallback: Log to console for development
      console.log('=== CONTACT FORM SUBMISSION ===');
      console.log('To:', TO_EMAIL);
      console.log('From:', email);
      console.log('Subject:', emailSubject);
      console.log('Content:', emailText);
      console.log('==============================');
      console.warn('⚠️  Gmail SMTP not configured. Email logged to console only.');
      console.warn('Configure these environment variables on Render:');
      console.warn('  SMTP_USER (your Gmail address)');
      console.warn('  SMTP_PASS (Gmail app password)');
      console.warn('  SMTP_HOST (smtp.gmail.com)');
      console.warn('  SMTP_PORT (587)');
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Your message has been received. We\'ll get back to you within one business day.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try emailing us directly at coryarmer@gmail.com' },
      { status: 500 }
    );
  }
}
