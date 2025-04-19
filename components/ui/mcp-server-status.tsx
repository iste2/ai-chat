"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Wrench } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { MCPServerStatus } from "@/app/api/mcp-status/route";

interface MCPServerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for displaying MCP server status and tools
 */
export function MCPServerStatusModal({ isOpen, onClose }: MCPServerStatusModalProps) {
  const [servers, setServers] = useState<MCPServerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch MCP server status when the modal is opened
  useEffect(() => {
    if (!isOpen) return;
    
    async function fetchMCPStatus() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/mcp-status');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch MCP status: ${response.status}`);
        }
        
        const data = await response.json();
        setServers(data.servers);
      } catch (err) {
        console.error('Error fetching MCP server status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch MCP server status');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMCPStatus();
  }, [isOpen]);

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            MCP Server Status
          </CardTitle>
          <CardDescription>
            View the status of connected MCP servers and their available tools
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          ) : servers.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No MCP servers configured
            </div>
          ) : (
            <div className="space-y-4">
              {servers.map((server) => (
                <ServerStatusCard key={server.id} server={server} />
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end border-t pt-4">
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Card component to display a single MCP server status
 */
function ServerStatusCard({ server }: { server: MCPServerStatus }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {server.status === 'active' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <div>
            <h3 className="font-medium">{server.name}</h3>
            <p className="text-sm text-muted-foreground">{server.description}</p>
          </div>
        </div>
        <div className="text-sm">
          {server.status === 'active' ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">Active</span>
          ) : (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md">Error</span>
          )}
        </div>
      </div>
      
      {server.status === 'error' && server.error && (
        <div className="bg-red-50 p-3 text-sm text-red-800 border-t">
          {server.error}
        </div>
      )}
      
      {server.status === 'active' && server.tools && Object.keys(server.tools).length > 0 && (
        <Collapsible className="border-t">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm hover:bg-muted/50">
            <span>Available Tools ({Object.keys(server.tools).length})</span>
            <span className="text-muted-foreground">Click to expand</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-muted/20">
              <ul className="space-y-2">
                {Object.entries(server.tools).map(([toolName, tool]) => (
                  <li key={toolName} className="text-sm">
                    <div className="mb-1">
                      <code className="bg-muted px-1.5 py-0.5 rounded font-medium">{toolName}</code>
                    </div>
                    {tool.description && (
                      <p className="text-muted-foreground pl-2 border-l-2 border-muted mb-1">
                        {tool.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}