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

    // For now, log the contact request
    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    console.log('Contact form submission:', {
      name,
      email,
      topic,
      message,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send an email here using a service like:
    // - Resend (recommended for Next.js)
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    // Example with Resend (you'd need to install and configure):
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'BarPulse Contact <noreply@barpulse.com>',
    //   to: 'coryarmer@gmail.com',
    //   replyTo: email,
    //   subject: `Contact Form: ${topic}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Topic:</strong> ${topic}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `,
    // });

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
