import { createFileRoute } from "@tanstack/react-router";
import { AddManualScreen } from "../../../features/subscriptions/presentation/screens/AddManualScreen";

function AddManualRoute() {
  const { me } = Route.useRouteContext();
  return <AddManualScreen account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/subs/agregar")({ component: AddManualRoute });
