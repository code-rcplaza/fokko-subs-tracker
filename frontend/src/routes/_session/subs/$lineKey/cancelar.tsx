import { createFileRoute } from "@tanstack/react-router";
import { CancelGuideScreen } from "../../../../features/subscriptions/presentation/screens/CancelGuideScreen";

function CancelGuideRoute() {
  const { lineKey } = Route.useParams();
  const { me } = Route.useRouteContext();
  return <CancelGuideScreen lineKey={lineKey} account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/subs/$lineKey/cancelar")({ component: CancelGuideRoute });
