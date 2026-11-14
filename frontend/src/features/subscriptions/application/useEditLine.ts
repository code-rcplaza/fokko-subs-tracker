import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { fieldErrorOf, serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import { translateServerKey } from "../../../lib/i18n/translate";
import {
  type EditableLine,
  type EditLineField,
  type EditLineForm,
  editLineFields,
  editLineFormOf,
  editLineFormSchema,
  lineChangesOf,
} from "../domain/edit";
import { manualNameMaxLength } from "../domain/manual";
import { subscriptionsQueryKey } from "./useReview";

export interface UseEditLineOptions {
  readonly line: EditableLine;
  readonly onSaved: () => void;
}

function translateFieldErrors(errors: FieldErrors<EditLineForm>): Partial<Record<EditLineField, string>> {
  return Object.fromEntries(
    editLineFields.flatMap((field) => {
      const key = errors[field]?.message;
      return key === undefined ? [] : [[field, translateServerKey(key, { max: manualNameMaxLength })]];
    }),
  );
}

/** Editar of a detected line: the alias and the override go only when they changed, in that order. */
export function useEditLine({ line, onSaved }: UseEditLineOptions) {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const form = useForm({ resolver: zodResolver(editLineFormSchema), defaultValues: editLineFormOf(line) });
  const [formError, setFormError] = useState<string | undefined>(undefined);

  function showServerError(error: unknown) {
    const rejected = editLineFields.flatMap((field) => {
      const key = fieldErrorOf(error, field);
      return key === undefined ? [] : [{ field, key }];
    });
    for (const { field, key } of rejected) {
      form.setError(field, { message: key });
    }
    setFormError(rejected.length > 0 ? undefined : serverMessageOf(error));
  }

  const saving = useMutation({
    mutationFn: async (edited: EditLineForm) => {
      const changes = lineChangesOf(line, edited);
      if (changes.alias !== undefined) {
        await subscriptions.nameLine(changes.alias);
      }
      if (changes.override !== undefined) {
        await subscriptions.saveOverride(changes.override);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
      onSaved();
    },
    onError: showServerError,
  });

  function send(edited: EditLineForm) {
    if (saving.isPending) {
      return;
    }
    setFormError(undefined);
    saving.mutate(edited);
  }

  return {
    fields: {
      alias: form.register("alias"),
      amount: form.register("amount"),
      billingDay: form.register("billingDay"),
    },
    errors: translateFieldErrors(form.formState.errors),
    formError,
    isSubmitting: saving.isPending,
    submit: form.handleSubmit(send),
  };
}
