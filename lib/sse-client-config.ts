import fs from "fs";
import path from "path";

export interface SSEClient {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface SSEClientConfig {
  clients: SSEClient[];
}

/**
 * Reads the SSE client configuration from the JSON file
 * @returns The SSE client configuration object
 */
export function getSSEClientConfig(): SSEClientConfig | undefined {
  try {
    const configFilePath = path.join(
      process.cwd(),
      "lib",
      "config",
      "sse-clients.json"
    );
    const configFileContent = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(configFileContent) as SSEClientConfig;
  } catch (error) {
    console.error("Error reading SSE client configuration:", error);
  }
}

/**
 * Gets a specific SSE client by ID
 * @param clientId The ID of the client to retrieve
 * @returns The SSE client with the specified ID or undefined if not found
 * @throws Error when clientId is not provided and no clients are available
 */
export function getSSEClientById(clientId: string): SSEClient | undefined {
  const config = getSSEClientConfig();

  if (!clientId) {
    throw new Error("Client ID must be provided");
  }

  return config?.clients.find((client) => client.id === clientId);
}

/**
 * Gets all available SSE clients
 * @returns Array of all SSE clients
 */
export function getAllSSEClients(): SSEClient[] {
  const config = getSSEClientConfig();
  return config?.clients || [];
}
