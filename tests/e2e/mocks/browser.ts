import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Initialize the mock service worker
export const worker = setupWorker(...handlers);
