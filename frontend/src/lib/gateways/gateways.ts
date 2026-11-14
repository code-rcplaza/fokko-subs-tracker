import type { AuthGateway } from "../../features/auth/application/ports";
import type { ProfileGateway } from "../../features/profile/application/ports";
import type { StatementsGateway } from "../../features/statements/application/ports";
import type { SubscriptionsGateway } from "../../features/subscriptions/application/ports";

/** Every port of the front; `main.tsx` builds the real ones, tests give doubles. */
export interface Gateways {
  readonly auth: AuthGateway;
  readonly statements: StatementsGateway;
  readonly subscriptions: SubscriptionsGateway;
  readonly profile: ProfileGateway;
}
