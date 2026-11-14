import { createFileRoute } from "@tanstack/react-router";
import { DetailScreen } from "../../../../features/subscriptions/presentation/screens/DetailScreen";

function DetailRoute() {
  const { lineKey } = Route.useParams();
  const { me } = Route.useRouteContext();
  return <DetailScreen lineKey={lineKey} account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/subs/$lineKey/")({ component: DetailRoute });
