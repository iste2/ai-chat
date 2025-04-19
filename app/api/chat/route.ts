import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createMCPClient, streamText, ToolSet } from "ai";
import { getAllSSEClients } from "@/lib/sse-client-config";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get all SSE clients from the JSON file
  const sseClients = getAllSSEClients();

  // Initialize variables
  const activeSseClients = new Map();
  let combinedTools: ToolSet = {};

  // Connect to each SSE server and collect their tools
  await Promise.all(
    sseClients.map(async (client) => {
      try {
        // Try to connect to MCP server
        const clientClock = await experimental_createMCPClient({
          transport: {
            type: "sse",
            url: client.url,
          },
        });

        // Store the client connection for later cleanup
        activeSseClients.set(client.id, clientClock);

        // Get tools from this client and add to combined tools
        const clientTools = await clientClock.tools();

        // Merge the client tools into our combined tools
        combinedTools = {
          ...combinedTools,
          ...clientTools,
        };

        console.log(
          `Successfully connected to MCP server ${client.name} and added tools`
        );
      } catch (error) {
        console.error(`Failed to connect to MCP server ${client.name}:`, error);
      }
    })
  );

  const result = streamText({
    model: anthropic("claude-3-5-haiku-latest"),
    tools: combinedTools, // Combined tools from all servers
    messages,
    onFinish: async () => {
      // Close all client connections
      for (const [clientId, clientClock] of activeSseClients.entries()) {
        try {
          await clientClock.close();
          console.log(`Stream closed successfully for client ${clientId}`);
        } catch (closeError) {
          console.error(`Error closing MCP client ${clientId}:`, closeError);
        }
      }
    },
    maxSteps: 10,
  });

  return result.toDataStreamResponse();
}
