import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function verifyPayPalWebhook(): boolean {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  // PayPal webhook verification logic
  // For production, implement full signature verification
  // https://developer.paypal.com/api/rest/webhooks/rest/#verify-webhook-signature
  
  return true; // TODO: implement proper verification
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // Headers can be used for signature verification if implemented

    if (!verifyPayPalWebhook()) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;
    const resource = event.resource;

    console.log('PayPal webhook received:', eventType);

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = resource.id;
        const subscription = await prisma.subscription.findFirst({
          where: { paypalSubscriptionId: subscriptionId },
        });

        if (subscription) {
          const nextBilling = resource.billing_info?.next_billing_time
            ? new Date(resource.billing_info.next_billing_time)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE',
              currentPeriodEnd: nextBilling,
              trialEndsAt: nextBilling,
              trialReminderSentAt: null,
            },
          });

          // Publish all bars owned by this owner
          await prisma.bar.updateMany({
            where: { ownerId: subscription.ownerId },
            data: { isPublished: true, publishedAt: new Date() },
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource.id;
        const subscription = await prisma.subscription.findFirst({
          where: { paypalSubscriptionId: subscriptionId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'CANCELED',
              canceledAt: new Date(),
            },
          });

          // Unpublish all bars owned by this owner
          await prisma.bar.updateMany({
            where: { ownerId: subscription.ownerId },
            data: { isPublished: false },
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const subscriptionId = resource.id;
        const subscription = await prisma.subscription.findFirst({
          where: { paypalSubscriptionId: subscriptionId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              currentPeriodEnd: new Date(resource.billing_info?.next_billing_time || subscription.currentPeriodEnd || new Date()),
            },
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const subscriptionId = resource.id;
        const subscription = await prisma.subscription.findFirst({
          where: { paypalSubscriptionId: subscriptionId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }

      default:
        console.log('Unhandled PayPal webhook event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
