import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { UIMessage } from "ai";
import { auth } from "~/server/auth";
import { messageToString } from "~/utils";
import { upsertChat } from "~/server/db/queries";
import { env } from "~/env";
import { Langfuse } from "langfuse";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";
import type { OurMessage } from "~/types";
import { streamFromDeepSearch } from "~/deep-search";

const langfuse = new Langfuse({
  environment: env.NODE_ENV,
});

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as {
    messages: Array<UIMessage>;
    chatId?: string;
  };

  const { messages, chatId } = body;

  if (!messages.length) {
    return new Response("No messages provided", { status: 400 });
  }

  let currentChatId = chatId;
  if (!currentChatId) {
    const newChatId = crypto.randomUUID();
    await upsertChat({
      userId: session.user.id,
      chatId: newChatId,
      title:
        messageToString(messages[messages.length - 1]!).slice(0, 50) + "...",
      messages: messages,
    });
    currentChatId = newChatId;
  } else {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, currentChatId),
    });
    if (!chat || chat.userId !== session.user.id) {
      return new Response("Chat not found or unauthorized", { status: 404 });
    }
  }

  const trace = langfuse.trace({
    sessionId: currentChatId,
    name: "chat",
    userId: session.user.id,
  });

  const stream = createUIMessageStream<OurMessage>({
    execute: async ({ writer }) => {
      if (!chatId) {
        writer.write({
          type: "data-new-chat-created",
          data: {
            chatId: currentChatId,
          },
          transient: true,
        });
      }

      const result = await streamFromDeepSearch({
        messages,
        langfuseTraceId: trace.id,
        writeMessagePart: writer.write,
      });

      writer.merge(result.toUIMessageStream());
    },
    onError: (e) => {
      console.error(e);
      return "Oops, an error occurred!";
    },
    onFinish: async (response) => {
      const entireConversation = [...messages, ...response.messages];

      const lastMessage = entireConversation[entireConversation.length - 1];
      if (!lastMessage) {
        return;
      }

      await upsertChat({
        userId: session.user.id,
        chatId: currentChatId,
        title: messageToString(lastMessage).slice(0, 50) + "...",
        messages: entireConversation,
      });

      await langfuse.flushAsync();
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
}
