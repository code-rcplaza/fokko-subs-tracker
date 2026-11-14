import { createFileRoute } from "@tanstack/react-router";
import { SubsScreen } from "../../../features/subscriptions/presentation/screens/SubsScreen";

function SubsRoute() {
  const { me } = Route.useRouteContext();
  return <SubsScreen account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/subs/")({ component: SubsRoute });
