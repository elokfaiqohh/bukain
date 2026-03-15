import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let mcpClient = null;

// Initialize and reuse the MCP Client connection
async function getMcpClient() {
  if (mcpClient) return mcpClient;

  const apiKey = process.env.MAYAR_API_KEY || process.env["payment-api"];
  if (!apiKey) {
    throw new Error("MAYAR_API_KEY is missing in backend .env file");
  }

  // Mapping the configuration provided by Mayar to the Stdio Transport
  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "-y",
      "mcp-remote",
      "https://mcp.mayar.id/sse",
      "--header",
      `Authorization: ${apiKey}`,
    ],
  });

  mcpClient = new Client(
    { name: "bukain-backend", version: "1.0.0" },
    { capabilities: {} },
  );
  console.log("[MCP] Connecting to Mayar MCP Server...");
  await mcpClient.connect(transport);

  return mcpClient;
}

console.log("MAYAR_API_KEY:", process.env.MAYAR_API_KEY);
console.log("MAYAR_TOKEN:", process.env.MAYAR_TOKEN);

export async function createPayment(payload) {
  try {
    const client = await getMcpClient();

    // 1. LIST TOOLS: Fetch available tools from the server
    const { tools } = await client.listTools();
    console.log(
      "[MCP] Available Tools on Mayar Server:",
      tools.map((t) => t.name),
    );

    // 2. CONFIGURE TOOL NAME:
    const toolName = "create_invoice";

    // 3. VALIDATE: Ensure the tool exists before calling
    const toolExists = tools.some((t) => t.name === toolName);
    if (!toolExists) {
      const available = tools.map((t) => t.name).join(", ");
      throw new Error(
        `Tool '${toolName}' not found. Available tools: ${available}`,
      );
    }

    console.log(
      `[MCP] Calling '${toolName}' with args:`,
      JSON.stringify(payload, null, 2),
    );

    // 4. EXECUTE: Call the tool safely
    const result = await client.callTool({
      name: toolName,
      arguments: payload,
    });

    console.log("[MCP] Tool Response:", JSON.stringify(result, null, 2));

    if (result.isError) {
      throw new Error(
        "MCP Tool returned an error: " + JSON.stringify(result.content),
      );
    }

    // 5. EXTRACT: Mayar returns either a direct URL string or a JSON payload containing the link
    let textResponse = result.content.find((c) => c.type === "text")?.text;
    if (!textResponse) {
      throw new Error("No text response found from MCP tool.");
    }

    let paymentUrl = textResponse;
    try {
      // Attempt to parse if Mayar returned a JSON string like {"link": "..."}
      // const parsed = JSON.parse(textResponse);
      // paymentUrl = parsed.link || parsed.invoice_url || parsed.url || textResponse;
      const parsed = JSON.parse(textResponse);

      paymentUrl =
        parsed.link ||
        parsed.invoice_url ||
        parsed.url ||
        parsed.data?.link ||
        textResponse;
    } catch (e) {
      console.log(e);
      // Fallback: the text is already a plain URL
    }

    if (!paymentUrl || !paymentUrl.startsWith("http")) {
      throw new Error(
        "Could not extract a valid payment URL. Response was: " + textResponse,
      );
    }

    return { success: true, url: paymentUrl };
  } catch (error) {
    console.error("MCP Payment Error:", error);
    return { success: false, error: error.message };
  }
}
