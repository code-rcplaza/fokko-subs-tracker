/** The formats of `GET /api/export`; CSV is the default. */
export const copyFormats = ["csv", "json"] as const;
export type CopyFormat = (typeof copyFormats)[number];
