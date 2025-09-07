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
import { queryRewriter } from "./query-rewriter";
import { searchSerper } from "./serper";
import { getNextAction } from "./get-next-action";
import { bulkCrawlWebsites } from "./server/scraper";
import { checkIsSafe } from "./guardrails";
import { summarizeURL } from "./summarize-url";

export async function runAgentLoop(
  messages: UIMessage[],
  opts: {
    langfuseTraceId?: string;
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

  while (!ctx.shouldStop()) {
    const { plan, queries } = await queryRewriter(ctx, opts);

    const searchResultsPromises = queries.map(async (query) => {
      const searchResults = await searchSerper({ q: query, num: 5 }, undefined);

      return {
        query,
        results: searchResults.organic,
      };
    });

    const allSearchResults = await Promise.all(searchResultsPromises);

    const uniqueSources = Array.from(
      new Map(
        allSearchResults
          .flatMap((sr) => sr.results)
          .map((result) => [
            result.link,
            {
              title: result.title,
              url: result.link,
              snippet: result.snippet,
              favicon: `https://www.google.com/s2/favicons?domain=${
                new URL(result.link).hostname
              }`,
            },
          ])
      ).values()
    );

    if (opts.writeMessagePart) {
      opts.writeMessagePart({
        type: "data-sources",
        data: uniqueSources,
      });
    }

    const processPromises = allSearchResults.map(async ({ query, results }) => {
      const searchResultUrls = results.map((r) => r.link);

      // Scrape the results
      const crawlResults = await bulkCrawlWebsites({ urls: searchResultUrls });

      // Summarize each scraped result in parallel
      const summaries = await Promise.all(
        results.map(async (result) => {
          const crawlData = crawlResults.success
            ? crawlResults.results.find((cr) => cr.url === result.link)
            : undefined;

          const scrapedContent = crawlData?.result.success
            ? crawlData.result.data
            : "Failed to scrape.";

          if (scrapedContent === "Failed to scrape.") {
            return {
              ...result,
              summary: "Failed to scrape, so no summary could be generated.",
            };
          }

          const summary = await summarizeURL({
            conversation: ctx.getMessageHistory(),
            scrapedContent,
            searchMetadata: {
              date: result.date || new Date().toISOString(),
              title: result.title,
              url: result.link,
            },
            query,
            langfuseTraceId: opts.langfuseTraceId,
            ctx,
          });

          return {
            ...result,
            summary,
          };
        })
      );
      ctx.reportSearch({
        query,
        results: summaries.map((summaryResult) => ({
          date: summaryResult.date || new Date().toISOString(),
          title: summaryResult.title,
          url: summaryResult.link,
          snippet: summaryResult.snippet,
          summary: summaryResult.summary,
        })),
      });
    });

    await Promise.all(processPromises);

    const nextAction = await getNextAction(ctx, opts);

    if (nextAction.feedback) {
      ctx.setLastFeedback(nextAction.feedback);
    }

    if (opts.writeMessagePart) {
      opts.writeMessagePart({
        type: "data-new-action",
        data: nextAction,
      });
      // Send token usage annotation
      const usages = ctx.getUsages();
      if (usages.length > 0) {
        const totalTokens = usages.reduce(
          (sum, u) => sum + (u.totalTokens || 0),
          0
        );
        opts.writeMessagePart({
          id: usageDataPartId,
          type: "data-usage",
          data: {
            totalTokens,
          },
        });
      }
    }

    if (nextAction.type === "answer") {
      return answerQuestion(ctx, { isFinal: false, ...opts });
    }

    // We increment the step counter
    ctx.incrementStep();
  }

  return answerQuestion(ctx, { isFinal: true, ...opts });
}
