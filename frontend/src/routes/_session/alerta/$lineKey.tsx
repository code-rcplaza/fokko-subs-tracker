import { createFileRoute } from "@tanstack/react-router";
import { AlertScreen } from "../../../features/subscriptions/presentation/screens/AlertScreen";

function AlertRoute() {
  const { lineKey } = Route.useParams();
  const { me } = Route.useRouteContext();
  return <AlertScreen lineKey={lineKey} account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/alerta/$lineKey")({ component: AlertRoute });
