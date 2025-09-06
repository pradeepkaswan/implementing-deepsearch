import type { UIMessage } from "ai";
import { evalite } from "evalite";
import { askDeepSearch } from "~/deep-search";

evalite("Deep Search Eval", {
  // A function that returns an array of test data
  data: async (): Promise<{ input: UIMessage[] }[]> => {
    return [
      {
        input: [
          {
            id: "1",
            role: "user",
            content: "What is the latest version of TypeScript?",
          },
        ],
      },
      {
        input: [
          {
            id: "2",
            role: "user",
            content: "What are the main features of Next.js 15?",
          },
        ],
      },
    ];
  },
  // The task to perform
  task: async (input) => {
    return askDeepSearch(input);
  },
  // The scoring methods for the eval
  scorers: [],
});
