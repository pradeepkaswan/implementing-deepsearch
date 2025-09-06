import {
  streamText,
  type StreamTextResult,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import type { OurMessage } from "./types";
import { answerQuestion } from "./answer-question";
import { SystemContext } from "./system-context";
import { model } from "./model";

export async function runAgentLoop(
  messages: UIMessage[],
  opts: {
    langfuseTraceId: string;
    writeMessagePart?: UIMessageStreamWriter<OurMessage>["write"];
  }
): Promise<StreamTextResult<{}, string>> {
  const usageDataPartId = crypto.randomUUID();

  const ctx = new SystemContext(messages);

  const guardrailResult = await checkIsSafe(ctx);
  if (guardrailResult.classification === "refuse") {
    return streamText({
      model,
      system:
        "You are a content safety guardrail. Refuse to answer unsafe questions.",
      prompt:
        guardrailResult.reason || "Sorry, I can't help with that request.",
    });
  }

  return answerQuestion(ctx, { isFinal: true, ...opts });
}
