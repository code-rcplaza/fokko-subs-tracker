import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import {
  type CadenceChoice,
  type CardState,
  type CardStates,
  cardStateOf,
  type Decision,
  decisionOf,
  pendingCard,
  progressOf,
  type ReviewCardView,
  resolvedStateOf,
} from "../domain/review";

export const subscriptionsQueryKey = ["subscriptions"] as const;
export const possibleQueryKey = ["subscriptions", "possible"] as const;

type CardErrors = Readonly<Record<string, string>>;

function withoutError(errors: CardErrors, lineKey: string): CardErrors {
  return Object.fromEntries(Object.entries(errors).filter(([key]) => key !== lineKey));
}

/**
 * Revisión: the possible ones and what the user decided on each. Decisions
 * live here, not in the cache: a confirmed line leaves the possible ones on
 * the server, and the card must stay to show "agregada" and its "Deshacer".
 * So the list is only marked stale, never refetched while deciding.
 */
export function useReview() {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const possible = useQuery({ queryKey: possibleQueryKey, queryFn: () => subscriptions.readPossible() });
  const [states, setStates] = useState<CardStates>({});
  const [errors, setErrors] = useState<CardErrors>({});
  const [sendingKeys, setSendingKeys] = useState<readonly string[]>([]);
  // A ref, so a second tap in the same tick already sees the first one.
  const sending = useRef<readonly string[]>([]);

  const changeState = (lineKey: string, state: CardState) =>
    setStates((current) => ({ ...current, [lineKey]: state }));
  const showError = (lineKey: string, error: unknown) =>
    setErrors((current) => ({ ...current, [lineKey]: serverMessageOf(error) }));
  const markSummaryStale = () =>
    queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey, refetchType: "none" });

  const startSending = (lineKey: string): boolean => {
    if (sending.current.includes(lineKey)) {
      return false;
    }
    sending.current = [...sending.current, lineKey];
    setSendingKeys(sending.current);
    setErrors((current) => withoutError(current, lineKey));
    return true;
  };
  const stopSending = (lineKey: string) => {
    sending.current = sending.current.filter((key) => key !== lineKey);
    setSendingKeys(sending.current);
  };

  const decide = useMutation({
    mutationFn: (decision: Decision) => subscriptions.decide(decision),
    onSuccess: (_, decision) => {
      changeState(decision.lineKey, resolvedStateOf(decision));
      return markSummaryStale();
    },
    onError: (error, decision) => {
      changeState(decision.lineKey, pendingCard);
      showError(decision.lineKey, error);
    },
    onSettled: (_, _error, decision) => stopSending(decision.lineKey),
  });

  const undo = useMutation({
    mutationFn: (lineKey: string) => subscriptions.undoDecision(lineKey),
    onSuccess: (_, lineKey) => {
      changeState(lineKey, pendingCard);
      return markSummaryStale();
    },
    onError: (error, lineKey) => showError(lineKey, error),
    onSettled: (_, _error, lineKey) => stopSending(lineKey),
  });

  const send = (decision: Decision) => {
    if (startSending(decision.lineKey)) {
      decide.mutate(decision);
    }
  };

  const lines = possible.data ?? [];
  const cards: readonly ReviewCardView[] = lines.map((line) => ({
    possible: line,
    state: cardStateOf(states, line.lineKey),
    isSending: sendingKeys.includes(line.lineKey),
    error: errors[line.lineKey],
  }));

  return {
    cards,
    progress: progressOf(
      lines.map((line) => line.lineKey),
      states,
    ),
    isLoading: possible.isPending,
    error: possible.isError ? serverMessageOf(possible.error) : undefined,
    answerYes: (lineKey: string) => changeState(lineKey, { kind: "choosing", cadence: undefined }),
    chooseCadence: ({ lineKey, cadence }: CadenceChoice) =>
      changeState(lineKey, { kind: "choosing", cadence }),
    cancelChoosing: (lineKey: string) => changeState(lineKey, pendingCard),
    confirm: (lineKey: string) => {
      const decision = decisionOf(lineKey, cardStateOf(states, lineKey));
      if (decision !== undefined) {
        send(decision);
      }
    },
    dismiss: (lineKey: string) => send({ lineKey, decision: "dismiss" }),
    undo: (lineKey: string) => {
      if (startSending(lineKey)) {
        undo.mutate(lineKey);
      }
    },
  };
}
