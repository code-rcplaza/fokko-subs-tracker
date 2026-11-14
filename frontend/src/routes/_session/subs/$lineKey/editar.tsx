import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { EditScreen } from "../../../../features/subscriptions/presentation/screens/EditScreen";

/** `?desde=revision`: the line is still a possible one, and saving goes back there. */
const editSearchSchema = z.object({ desde: z.enum(["revision"]).optional().catch(undefined) });

function EditRoute() {
  const { lineKey } = Route.useParams();
  const { desde } = Route.useSearch();
  const { me } = Route.useRouteContext();
  return (
    <EditScreen
      lineKey={lineKey}
      source={desde === "revision" ? "review" : "detail"}
      account={{ name: me.name, email: me.email }}
    />
  );
}

export const Route = createFileRoute("/_session/subs/$lineKey/editar")({
  validateSearch: editSearchSchema,
  component: EditRoute,
});
