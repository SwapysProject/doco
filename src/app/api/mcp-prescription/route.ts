import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Interface for MCP prescription request
interface McpPrescriptionRequest {
  patientId: string;
  symptoms: string[];
  diagnosis?: string;
  doctorId: string;
  doctorName: string;
  notes?: string;
}

// Function to communicate with MCP server
async function callMcpServer(
  tool: string,
  args: Record<string, unknown>
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const mcpServerPath = path.join(
      process.cwd(),
      "src",
      "mcp-server",
      "server.ts"
    );

    // Use tsx to run the TypeScript MCP server
    const mcpProcess = spawn("npx", ["tsx", mcpServerPath], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    mcpProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    mcpProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Send MCP request
    const mcpRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: tool,
        arguments: args,
      },
    };

    mcpProcess.stdin.write(JSON.stringify(mcpRequest) + "\n");
    mcpProcess.stdin.end();

    mcpProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`MCP server exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        // Parse the response - look for JSON response
        const lines = stdout.split("\n").filter((line) => line.trim());
        let response = null;

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.jsonrpc === "2.0" && parsed.id === 1) {
              response = parsed;
              break;
            }
          } catch {
            // Continue looking for valid JSON
          }
        }

        if (response && response.result) {
          resolve(response.result);
        } else {
          reject(new Error("No valid response from MCP server"));
        }
      } catch (error) {
        reject(new Error(`Failed to parse MCP response: ${error}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      mcpProcess.kill();
      reject(new Error("MCP server timeout"));
    }, 30000);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    let result;

    switch (action) {
      case "get_patient_history":
        result = await callMcpServer("get_patient_history", {
          patientId: params.patientId,
        });
        break;

      case "create_prescription":
        const prescriptionRequest: McpPrescriptionRequest = {
          patientId: params.patientId,
          symptoms: params.symptoms,
          diagnosis: params.diagnosis,
          doctorId: params.doctorId || "DOC001",
          doctorName: params.doctorName || "Dr. Smith",
          notes: params.notes,
        };

        result = await callMcpServer(
          "create_prescription",
          prescriptionRequest as unknown as Record<string, unknown>
        );
        break;

      case "search_prescriptions":
        result = await callMcpServer("search_prescriptions", {
          patientId: params.patientId,
          status: params.status,
          doctorId: params.doctorId,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("MCP API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
