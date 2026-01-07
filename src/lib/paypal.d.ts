declare module '@paypal/checkout-server-sdk' {
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

  export namespace orders {
    export class OrdersCreateRequest extends PayPalHttpRequest {
      constructor();
      body?: any;
    }

    export class OrdersGetRequest extends PayPalHttpRequest {
      constructor(orderId: string);
    }

    export class OrdersCaptureRequest extends PayPalHttpRequest {
      constructor(orderId: string);
    }
  }

  export namespace subscriptions {
    export class SubscriptionsCreateRequest extends PayPalHttpRequest {
      constructor();
      body?: any;
    }

    export class SubscriptionsGetRequest extends PayPalHttpRequest {
      constructor(subscriptionId: string);
    }

    export class SubscriptionsUpdateRequest extends PayPalHttpRequest {
      constructor(subscriptionId: string);
      body?: any;
    }

    export class SubscriptionsCancelRequest extends PayPalHttpRequest {
      constructor(subscriptionId: string);
      body?: any;
    }
  }

  export namespace webhooks {
    export class WebhookVerifySignatureRequest extends PayPalHttpRequest {
      constructor();
      body?: any;
    }
  }
}
