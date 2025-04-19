import fs from "fs";
import path from "path";

export interface SSEClient {
  name: string;
  url: string;
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
 * Gets a specific SSE client by name
 * @param clientName The name of the client to retrieve
 * @returns The SSE client with the specified name or undefined if not found
 * @throws Error when clientName is not provided and no clients are available
 */
export function getSSEClientByName(clientName: string): SSEClient | undefined {
  const config = getSSEClientConfig();

  if (!clientName) {
    throw new Error("Client name must be provided");
  }

  return config?.clients.find((client) => client.name === clientName);
}

/**
 * Gets all available SSE clients
 * @returns Array of all SSE clients
 */
export function getAllSSEClients(): SSEClient[] {
  const config = getSSEClientConfig();
  return config?.clients || [];
}
