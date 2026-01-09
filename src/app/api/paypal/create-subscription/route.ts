import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPlanIdFromKey } from '@/lib/paypal';

function planKeyToEnum(planKey: string) {
  switch (planKey) {
    case 'monthly':
      return 'MONTHLY';
    case 'sixmonth':
      return 'SIX_MONTH';
    case 'yearly':
      return 'YEARLY';
    default:
      return null;
  }
}

export async function POST(req: Request) {
  try {
    const { ownerId, planKey } = await req.json();
    
    if (!ownerId || !planKey) {
      return NextResponse.json({ error: 'Missing ownerId or planKey' }, { status: 400 });
    }

    const planId = getPlanIdFromKey(planKey).trim();
    const planEnum = planKeyToEnum(planKey);
    if (!planId || !planEnum) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || '';
    if (!baseUrl) {
      return NextResponse.json({ error: 'Missing base URL configuration' }, { status: 500 });
    }
    const returnUrl = `${baseUrl}/dashboard/subscription/success`;
    const cancelUrl = `${baseUrl}/pricing`;
    const taxes = { percentage: '8.25', inclusive: false };
    const paypalBase =
      process.env.PAYPAL_ENV === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    // Create PayPal subscription
    const response = await fetch(`${paypalBase}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        plan: { taxes }, // Override plan to apply TX sales tax on each billing cycle
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
        plan: planEnum,
        status: 'INCOMPLETE',
        paypalSubscriptionId: subscription.id,
      },
      update: {
        plan: planEnum,
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
