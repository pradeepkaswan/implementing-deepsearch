import type { StreamTextResult, UIMessage, UIMessageStreamWriter } from "ai";
import type { OurMessage } from "./types.ts";
import { runAgentLoop } from "./run-agent-loop.ts";

export const streamFromDeepSearch = async (opts: {
  messages: UIMessage[];
  langfuseTraceId?: string;
  writeMessagePart?: UIMessageStreamWriter<OurMessage>["write"];
}): Promise<StreamTextResult<{}, string>> => {
  return runAgentLoop(opts.messages, {
    langfuseTraceId: opts.langfuseTraceId,
    writeMessagePart: opts.writeMessagePart,
  });
};

export async function askDeepSearch(messages: UIMessage[]) {
  const result = await streamFromDeepSearch({
    messages,
    langfuseTraceId: undefined,
  });

  await result.consumeStream();

  return await result.text;
}
