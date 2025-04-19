import { experimental_createMCPClient } from "ai";
import { getAllSSEClients, SSEClient } from "@/lib/sse-client-config";
import { NextResponse } from "next/server";

/**
 * Represents a tool provided by an MCP server
 */
export interface MCPTool {
  description?: string;
  parameters?: unknown;
}

/**
 * Represents the status of an MCP server
 */
export interface MCPServerStatus {
  id: string;
  name: string;
  url: string;
  description: string;
  status: "active" | "error";
  error?: string;
  tools?: Record<string, MCPTool>; // Tools will be available if status is active
}

/**
 * GET endpoint to retrieve MCP server status and tools
 */
export async function GET() {
  // Get all SSE clients from the JSON file
  const sseClients = getAllSSEClients();
  const serverStatus: MCPServerStatus[] = [];

  // Check each SSE server status and collect their tools
  await Promise.all(
    sseClients.map(async (client: SSEClient) => {
      const statusEntry: MCPServerStatus = {
        ...client,
        status: "error", // Default to error until we confirm connection
      };

      try {
        // Try to connect to MCP server
        const clientClock = await experimental_createMCPClient({
          transport: {
            type: "sse",
            url: client.url,
          },
        });

        // Get tools from this client
        const clientTools = await clientClock.tools();

        // Update status to active and add tools
        statusEntry.status = "active";
        statusEntry.tools = clientTools;

        // Close the connection since we just needed to check status
        await clientClock.close();
      } catch (error) {
        // Update status with error message
        statusEntry.error =
          error instanceof Error ? error.message : String(error);
      }

      // Add to our results array
      serverStatus.push(statusEntry);
    })
  );

  // Return the status of all MCP servers
  return NextResponse.json({ servers: serverStatus });
}
