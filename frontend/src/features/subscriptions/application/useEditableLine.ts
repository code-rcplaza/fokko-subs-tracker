import { useQuery } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import type { LineDetail } from "../domain/detail";
import type { EditableLine } from "../domain/edit";
import { billingDayOf, type Possible } from "../domain/review";
import { lineDetailQueryKey } from "./useLineDetail";
import { possibleQueryKey } from "./useReview";

/** From Revisión the line is still a possible one: it has no detail, so it comes from that list. */
export type EditSource = "detail" | "review";

const firstDay = 1;

function editableOfDetail(detail: LineDetail): EditableLine {
  return {
    lineKey: detail.lineKey,
    name: detail.name,
    alias: detail.alias,
    amount: detail.amount,
    billingDay: detail.cycle.day,
  };
}

function editableOfPossible(possible: Possible): EditableLine {
  const billingDay = billingDayOf(possible.charges) ?? firstDay;
  return {
    lineKey: possible.lineKey,
    name: possible.name,
    alias: possible.alias,
    amount: possible.amount,
    billingDay,
  };
}

/** Whichever of the two was read; with neither, nothing to edit yet. */
function editableOf(read: {
  readonly detail: LineDetail | undefined;
  readonly possible: Possible | undefined;
}): EditableLine | undefined {
  if (read.detail !== undefined) {
    return editableOfDetail(read.detail);
  }
  return read.possible === undefined ? undefined : editableOfPossible(read.possible);
}

export interface EditableLineRequest {
  readonly lineKey: string;
  readonly source: EditSource;
}

/** The line Editar starts from, and its detail (the manual form needs the currency and the name). */
export function useEditableLine({ lineKey, source }: EditableLineRequest) {
  const { subscriptions } = useGateways();
  const detail = useQuery({
    queryKey: lineDetailQueryKey(lineKey),
    queryFn: () => subscriptions.readLineDetail(lineKey),
    enabled: source === "detail",
  });
  const possible = useQuery({
    queryKey: possibleQueryKey,
    queryFn: () => subscriptions.readPossible(),
    enabled: source === "review",
  });
  const read = source === "detail" ? detail : possible;
  const fromReview = possible.data?.find((line) => line.lineKey === lineKey);
  const line = editableOf({ detail: source === "detail" ? detail.data : undefined, possible: fromReview });

  return {
    line,
    detail: detail.data,
    isLoading: read.isPending,
    isMissing: source === "review" && possible.isSuccess && fromReview === undefined,
    error: read.isError ? serverMessageOf(read.error) : undefined,
  };
}
