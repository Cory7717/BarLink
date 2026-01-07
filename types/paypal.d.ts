declare module '@paypal/checkout-server-sdk' {
  namespace core {
    export class Environment {
      constructor(clientId: string, clientSecret: string);
    }

    export class SandboxEnvironment extends Environment {}

    export class LiveEnvironment extends Environment {}

    export class PayPalHttpClient {
      constructor(environment: Environment);
      execute(request: PayPalHttpRequest): Promise<PayPalHttpResponse>;
    }

    export class PayPalHttpRequest {
      constructor(path: string, method: string);
      body?: any;
      headers?: Record<string, string>;
    }

    export class PayPalHttpResponse {
      statusCode: number;
      headers: Record<string, string>;
      body: any;
    }
  }

  namespace orders {
    export class OrdersCreateRequest extends core.PayPalHttpRequest {
      constructor();
      body?: any;
    }

    export class OrdersGetRequest extends core.PayPalHttpRequest {
      constructor(orderId: string);
    }

    export class OrdersCaptureRequest extends core.PayPalHttpRequest {
      constructor(orderId: string);
    }
  }

  namespace subscriptions {
    export class SubscriptionsCreateRequest extends core.PayPalHttpRequest {
      constructor();
      body?: any;
    }

    export class SubscriptionsGetRequest extends core.PayPalHttpRequest {
      constructor(subscriptionId: string);
    }

    export class SubscriptionsUpdateRequest extends core.PayPalHttpRequest {
      constructor(subscriptionId: string);
      body?: any;
    }

    export class SubscriptionsCancelRequest extends core.PayPalHttpRequest {
      constructor(subscriptionId: string);
      body?: any;
    }
  }

  namespace webhooks {
    export class WebhookVerifySignatureRequest extends core.PayPalHttpRequest {
      constructor();
      body?: any;
    }
  }
}

