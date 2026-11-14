import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "../features/auth/presentation/screens/LegalScreen";

export const Route = createFileRoute("/privacidad")({ component: () => <LegalScreen document="privacy" /> });
