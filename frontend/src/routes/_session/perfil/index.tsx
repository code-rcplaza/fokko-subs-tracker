import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "../../../features/profile/presentation/screens/ProfileScreen";

function ProfileRoute() {
  const { me } = Route.useRouteContext();
  return <ProfileScreen account={{ name: me.name, email: me.email, initials: me.initials }} />;
}

export const Route = createFileRoute("/_session/perfil/")({ component: ProfileRoute });
