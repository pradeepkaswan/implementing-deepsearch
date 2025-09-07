// import { google } from "@ai-sdk/google";

// export const model = google("gemini-2.0-flash-001");
// export const factualityModel = google("gemini-2.0-flash-001");
// export const summarizationModel = google("gemini-2.0-flash");
// export const guardrailModel = google("gemini-2.0-flash-001");

import { ollama } from "ai-sdk-ollama";

export const model = ollama("gemma3");
export const factualityModel = ollama("gemma3");
export const summarizationModel = ollama("gemma3");
export const guardrailModel = ollama("gemma3");
