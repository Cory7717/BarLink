import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPlanIdFromKey } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const { ownerId, planKey } = await req.json();
    
    if (!ownerId || !planKey) {
      return NextResponse.json({ error: 'Missing ownerId or planKey' }, { status: 400 });
    }

    const planId = getPlanIdFromKey(planKey);
    const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard/subscription/success`;
    const cancelUrl = `${process.env.NEXTAUTH_URL}/pricing`;

    // Create PayPal subscription
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'BarPulse',
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'SUBSCRIBE_NOW',
        },
      }),
    });

    const subscription = await response.json();

    if (!response.ok) {
      console.error('PayPal subscription creation failed:', subscription);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Store subscription in DB with INCOMPLETE status
    await prisma.subscription.upsert({
      where: { ownerId },
      create: {
        ownerId,
        plan: planKey.toUpperCase().replace('MONTH', '_MONTH'),
        status: 'INCOMPLETE',
        paypalSubscriptionId: subscription.id,
      },
      update: {
        plan: planKey.toUpperCase().replace('MONTH', '_MONTH'),
        status: 'INCOMPLETE',
        paypalSubscriptionId: subscription.id,
      },
    });

    // Return approval URL for user to complete payment
    const approvalLink = subscription.links.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href;

    return NextResponse.json({ approvalUrl: approvalLink, subscriptionId: subscription.id });
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
