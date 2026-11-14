import { createFileRoute } from "@tanstack/react-router";
import { SummaryScreen } from "../../features/subscriptions/presentation/screens/SummaryScreen";

function SummaryRoute() {
  const { me } = Route.useRouteContext();
  return <SummaryScreen account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/resumen")({ component: SummaryRoute });
