declare module '@paypal/checkout-server-sdk' {
  namespace core {
    export class Environment {
      constructor(clientId: string, clientSecret: string);
    }

    export class SandboxEnvironment extends Environment {}

    export class LiveEnvironment extends Environment {}

    export class PayPalHttpClient {
      constructor(environment: Environment);
      execute<T = unknown>(request: PayPalHttpRequest): Promise<PayPalHttpResponse<T>>;
    }

    export class PayPalHttpRequest {
      constructor(path: string, method: string);
      body?: Record<string, unknown>;
      headers?: Record<string, string>;
    }

    export class PayPalHttpResponse<T = unknown> {
      statusCode: number;
      headers: Record<string, string>;
      body: T;
    }
  }

  namespace orders {
    export class OrdersCreateRequest extends core.PayPalHttpRequest {
      constructor();
      body?: Record<string, unknown>;
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
      body?: Record<string, unknown>;
    }

    export class SubscriptionsGetRequest extends core.PayPalHttpRequest {
      constructor(subscriptionId: string);
    }

    export class SubscriptionsUpdateRequest extends core.PayPalHttpRequest {
      constructor(subscriptionId: string);
      body?: Record<string, unknown>;
    }

    export class SubscriptionsCancelRequest extends core.PayPalHttpRequest {
      constructor(subscriptionId: string);
      body?: Record<string, unknown>;
    }
  }

  namespace webhooks {
    export class WebhookVerifySignatureRequest extends core.PayPalHttpRequest {
      constructor();
      body?: Record<string, unknown>;
    }
  }
}

