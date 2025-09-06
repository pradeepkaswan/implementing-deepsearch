import { generateObject } from "ai";

export const queryRewriter = async () => {
  const result = await generateObject({
    
  })

  if (result.usage) {
    context.reportUsage()
  }

  return result.object
};
