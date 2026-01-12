import * as React from "react";

declare module "expo-router" {
  export const Tabs: React.ComponentType<unknown>;
  export const Slot: React.ComponentType<unknown>;
  export const Stack: React.ComponentType<unknown>;
  export const Redirect: React.ComponentType<{ href: string }>;
}
