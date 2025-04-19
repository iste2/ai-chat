import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createMCPClient, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // mcp servers
  const sseClientClock = await experimental_createMCPClient({
    transport: {
      type: "sse",
      url: "http://localhost:5027",
    },
  });
  const tools = await sseClientClock.tools();

  const result = streamText({
    model: anthropic("claude-3-5-haiku-latest"),
    tools,
    messages,
    onFinish: async () => {
      await sseClientClock.close();
      console.log("Stream closed successfully.");
    },
  });

  return result.toDataStreamResponse();
}
