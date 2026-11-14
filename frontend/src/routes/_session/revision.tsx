import { createFileRoute } from "@tanstack/react-router";
import { ReviewScreen } from "../../features/subscriptions/presentation/screens/ReviewScreen";

function ReviewRoute() {
  const { me } = Route.useRouteContext();
  return <ReviewScreen account={{ name: me.name, email: me.email }} />;
}

export const Route = createFileRoute("/_session/revision")({ component: ReviewRoute });
