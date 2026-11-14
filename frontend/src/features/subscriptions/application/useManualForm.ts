import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { fieldErrorOf, serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import { translateServerKey } from "../../../lib/i18n/translate";
import {
  emptyManualForm,
  type ManualCurrency,
  type ManualField,
  type ManualForm,
  type ManualInput,
  manualFields,
  manualFormSchema,
  manualInputOf,
  manualNameMaxLength,
} from "../domain/manual";
import type { SubscriptionsGateway } from "./ports";
import { subscriptionsQueryKey } from "./useReview";

/** Field messages are keys (zod or the back); `{max}` fills the long name. */
function translateFieldErrors(errors: FieldErrors<ManualForm>): Partial<Record<ManualField, string>> {
  return Object.fromEntries(
    manualFields.flatMap((field) => {
      const key = errors[field]?.message;
      return key === undefined ? [] : [[field, translateServerKey(key, { max: manualNameMaxLength })]];
    }),
  );
}

interface ManualFormOptions {
  readonly initial: ManualForm;
  readonly save: (gateway: SubscriptionsGateway, input: ManualInput) => Promise<unknown>;
  readonly onSaved: () => void;
}

/** The form of a manual line, to add or to edit: zod, one send at a time, errors on their fields. */
function useManualForm({ initial, save, onSaved }: ManualFormOptions) {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const form = useForm({ resolver: zodResolver(manualFormSchema), defaultValues: initial });
  const [formError, setFormError] = useState<string | undefined>(undefined);

  function showServerError(error: unknown) {
    const rejected = manualFields.flatMap((field) => {
      const key = fieldErrorOf(error, field);
      return key === undefined ? [] : [{ field, key }];
    });
    for (const { field, key } of rejected) {
      form.setError(field, { message: key });
    }
    setFormError(rejected.length > 0 ? undefined : serverMessageOf(error));
  }

  const saving = useMutation({
    mutationFn: (manual: ManualForm) => save(subscriptions, manualInputOf(manual)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
      onSaved();
    },
    onError: showServerError,
  });

  function send(manual: ManualForm) {
    if (saving.isPending) {
      return;
    }
    setFormError(undefined);
    saving.mutate(manual);
  }

  return {
    fields: {
      name: form.register("name"),
      amount: form.register("amount"),
      billingDay: form.register("billingDay"),
    },
    currency: {
      value: form.watch("currency"),
      choose: (currency: ManualCurrency) => form.setValue("currency", currency),
    },
    errors: translateFieldErrors(form.formState.errors),
    formError,
    isSubmitting: saving.isPending,
    submit: form.handleSubmit(send),
  };
}

/** Agregar: a new manual line. */
export function useAddManual({ onAdded }: { readonly onAdded: () => void }) {
  return useManualForm({
    initial: emptyManualForm,
    save: (gateway, input) => gateway.createManual(input),
    onSaved: onAdded,
  });
}

export interface UseEditManualOptions {
  readonly publicId: string;
  readonly initial: ManualForm;
  readonly onSaved: () => void;
}

/** Editar of a manual line: the same form, sent with PUT. */
export function useEditManual({ publicId, initial, onSaved }: UseEditManualOptions) {
  return useManualForm({
    initial,
    save: (gateway, input) => gateway.editManual({ publicId, input }),
    onSaved,
  });
}
