import { setupWorker } from "msw/browser";
import { handlers } from "./mocks/handlers";

// Eksportujemy worker do użycia w setupie testów
export const worker = setupWorker(...handlers);
