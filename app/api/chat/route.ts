import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createMCPClient, streamText, ToolSet } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Initialize variables
  let sseClientClock = null;
  let tools: ToolSet = {};

  try {
    // Try to connect to MCP server
    sseClientClock = await experimental_createMCPClient({
      transport: {
        type: "sse",
        url: "http://localhost:5027",
      },
    });

    // Only add tools if the client was created successfully
    tools = await sseClientClock.tools();
  } catch (error) {
    console.error("Failed to connect to MCP server:", error);
  }

  const result = streamText({
    model: anthropic("claude-3-5-haiku-latest"),
    tools, // This will be an empty object if there was an error
    messages,
    onFinish: async () => {
      // Only close the client if it was successfully created
      if (sseClientClock) {
        try {
          await sseClientClock.close();
          console.log("Stream closed successfully.");
        } catch (closeError) {
          console.error("Error closing MCP client:", closeError);
        }
      }
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
