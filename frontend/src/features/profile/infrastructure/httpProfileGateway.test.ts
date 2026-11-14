import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../../lib/api/client";
import { createHttpProfileGateway } from "./httpProfileGateway";

describe("http profile gateway", () => {
  it("logs out with POST /api/auth/logout", async () => {
    const fetchFunction = vi.fn(
      async (_input: string, _init: RequestInit) => new Response(null, { status: 204 }),
    );

    await createHttpProfileGateway(createApiClient(fetchFunction)).logout();

    expect(fetchFunction).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("http profile gateway, your data", () => {
  it("asks for the copy in the chosen format", async () => {
    const headers = { "Content-Disposition": 'attachment; filename="fokko-copia.json"' };
    const fetchFunction = vi.fn(
      async (_input: string, _init: RequestInit) => new Response("{}", { status: 200, headers }),
    );

    const file = await createHttpProfileGateway(createApiClient(fetchFunction)).exportCopy("json");

    expect(fetchFunction.mock.calls[0]?.[0]).toBe("/api/export?format=json");
    expect(file.filename).toBe("fokko-copia.json");
  });

  it("deletes everything with DELETE /api/me", async () => {
    const fetchFunction = vi.fn(
      async (_input: string, _init: RequestInit) => new Response(null, { status: 204 }),
    );

    await createHttpProfileGateway(createApiClient(fetchFunction)).deleteAccount();

    expect(fetchFunction).toHaveBeenCalledWith("/api/me", expect.objectContaining({ method: "DELETE" }));
  });
});
