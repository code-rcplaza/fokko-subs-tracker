import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { ApiError } from "../../../../lib/api/client";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { StatementsGateway } from "../../application/ports";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };
const pdf = new File(["%PDF"], "cartola.pdf", { type: "application/pdf" });
const uploaded = { id: "s1", filename: "cartola.pdf", months: ["2026-10"], charges: 12, badLines: 0 };

function statementsWith(overrides: Partial<StatementsGateway>): StatementsGateway {
  return {
    listBanks: vi.fn(async () => [{ id: "bci" }]),
    upload: vi.fn(async () => uploaded),
    readFound: vi.fn(async () => ({
      sure: 0,
      possible: 0,
      monthly: { amount: 0, currency: "CLP", isApproximate: false },
    })),
    ...overrides,
  };
}

function renderUpload(statements: StatementsGateway) {
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp("/fuente", { auth, statements });
}

async function chooseFile(file: File) {
  await userEvent.upload(await screen.findByLabelText("Archivo de la cartola"), file);
}

describe("Upload screen", () => {
  it("uploads the PDF with automatic bank detection and goes to Análisis", async () => {
    const statements = statementsWith({});
    const { router, queryClient } = renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/analisis/s1"));
    expect(statements.upload).toHaveBeenCalledWith({ file: pdf });
    expect(queryClient.getQueryData(["statements", "uploaded", "s1"])).toEqual(uploaded);
  });

  it("sends the bank chosen by hand", async () => {
    const statements = statementsWith({});
    renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.selectOptions(await screen.findByLabelText("Banco"), "bci");
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    await waitFor(() => expect(statements.upload).toHaveBeenCalledWith({ file: pdf, bank: "bci" }));
  });

  it("rejects a file that is not a PDF before sending", async () => {
    const statements = statementsWith({});
    renderUpload(statements);

    await userEvent.upload(
      await screen.findByLabelText("Archivo de la cartola"),
      new File(["x"], "foto.png", { type: "image/png" }),
      {
        applyAccept: false,
      },
    );

    expect(screen.getByText("Sube la cartola en PDF.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analizar cartola" })).toBeDisabled();
    expect(statements.upload).not.toHaveBeenCalled();
  });

  it("keeps automatic detection and lets the upload go when the bank list fails", async () => {
    const statements = statementsWith({ listBanks: vi.fn(async () => Promise.reject(new Error("down"))) });
    renderUpload(statements);

    await chooseFile(pdf);
    expect(screen.getByLabelText("Banco")).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    await waitFor(() => expect(statements.upload).toHaveBeenCalledWith({ file: pdf }));
  });

  it("asks for the billing date when the statement has none, and sends it as unix seconds", async () => {
    const upload = vi
      .fn()
      .mockRejectedValueOnce(new ApiError({ status: 400, key: "statements.billing_date_required" }))
      .mockResolvedValue(uploaded);
    const statements = statementsWith({ upload });
    renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));
    const date = await screen.findByLabelText("Fecha de facturación");
    expect(screen.getByText("Indica la fecha de facturación de la cartola.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analizar cartola" })).toBeDisabled();

    await userEvent.type(date, "2026-10-15");
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    await waitFor(() =>
      expect(upload).toHaveBeenLastCalledWith({ file: pdf, billingDate: Date.UTC(2026, 9, 15, 12) / 1000 }),
    );
  });

  it("shows the key of a failed upload", async () => {
    const statements = statementsWith({
      upload: vi.fn(async () =>
        Promise.reject(new ApiError({ status: 409, key: "statements.already_imported" })),
      ),
    });
    renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    expect(await screen.findByText("Esta cartola ya estaba cargada.")).toBeInTheDocument();
  });

  it("shows Cargando while the upload is on its way, with nothing to send again, then goes to Análisis", async () => {
    let finish: (result: typeof uploaded) => void = () => {};
    const statements = statementsWith({
      upload: vi.fn(() => new Promise<typeof uploaded>((resolve) => (finish = resolve))),
    });
    const { router } = renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    expect(await screen.findByText("Paso 2 de 3 · Análisis")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Analizar cartola/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Archivo de la cartola")).not.toBeInTheDocument();

    finish(uploaded);
    await waitFor(() => expect(router.state.location.pathname).toBe("/analisis/s1"));
    expect(statements.upload).toHaveBeenCalledOnce();
  });

  it.each([
    [
      "statements.already_imported",
      409,
      "Ya teníamos esta cartola",
      "Esta cartola ya estaba cargada.",
      "Elegir otro archivo",
    ],
    [
      "statements.bank_not_detected",
      422,
      "No reconocimos el banco",
      "No reconocimos el banco de la cartola. Elígelo tú.",
      "Elegir el banco",
    ],
    [
      "statements.file_too_large",
      413,
      "No pudimos leer este archivo",
      "El archivo supera el máximo de 10 MB.",
      "Elegir otro archivo",
    ],
    [
      "statements.file_kind_unknown",
      415,
      "No pudimos leer este archivo",
      "Sube la cartola en PDF.",
      "Elegir otro archivo",
    ],
    [
      "algo.desconocido",
      400,
      "No pudimos leer este archivo",
      "Algo salió mal. Inténtalo de nuevo en un momento.",
      "Elegir otro archivo",
    ],
  ])("shows the error screen for %s", async (key, status, title, message, action) => {
    const statements = statementsWith({
      upload: vi.fn(async () => Promise.reject(new ApiError({ status, key }))),
    });
    renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: action })).toBeInTheDocument();
    expect(screen.getByText("Tu archivo no se guardó.")).toBeInTheDocument();
    expect(screen.queryByText(/cartola\.pdf/)).not.toBeInTheDocument();
  });

  it("goes back to Elegir fuente with the file kept when the bank is what is missing", async () => {
    const statements = statementsWith({
      upload: vi
        .fn()
        .mockRejectedValueOnce(new ApiError({ status: 422, key: "statements.bank_not_detected" }))
        .mockResolvedValue(uploaded),
    });
    renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));
    await userEvent.click(await screen.findByRole("button", { name: "Elegir el banco" }));

    expect(screen.getByText("cartola.pdf")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Banco"), "bci");
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));
    await waitFor(() => expect(statements.upload).toHaveBeenLastCalledWith({ file: pdf, bank: "bci" }));
  });

  it("goes from the error back to an empty form with Elegir otro archivo", async () => {
    const statements = statementsWith({
      upload: vi.fn(async () => Promise.reject(new ApiError({ status: 422, key: "statements.no_charges" }))),
    });
    renderUpload(statements);

    await chooseFile(pdf);
    await userEvent.click(screen.getByRole("button", { name: "Analizar cartola" }));

    expect(await screen.findByText("No encontramos cobros en esta cartola.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Elegir otro archivo" }));
    expect(screen.getByLabelText("Archivo de la cartola")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analizar cartola" })).toBeDisabled();
  });
});
