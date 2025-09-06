import type z from "zod";
import type { SystemContext } from "./system-context";
import { generateObject } from "ai";

export type Action = z.infer<typeof actionSchema>;

export const getNextAction = async (
  context: SystemContext,
  opts: { langfuseTraceId?: string } = {}
) => {
  const result = await generateObject({
    model,
    schema: actionSchema,
    system:
  });

  context.reportUsage("get-next-action", result.usage)

  return result.object;
};
