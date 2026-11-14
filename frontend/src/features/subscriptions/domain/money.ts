import { z } from "zod";

/** Amounts as the back sends them: hundredths with their currency. */
export const moneySchema = z.object({ amount: z.number(), currency: z.string() });

export type Money = Readonly<z.infer<typeof moneySchema>>;
