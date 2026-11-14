import { createFileRoute } from "@tanstack/react-router";
import { DeleteAllScreen } from "../../../features/profile/presentation/screens/DeleteAllScreen";

function DeleteAllRoute() {
  const { me } = Route.useRouteContext();
  return <DeleteAllScreen account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/perfil/eliminar")({ component: DeleteAllRoute });
