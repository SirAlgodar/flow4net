import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

export async function GET() {
  const start = Date.now();
  try {
    // Tenta localizar binário no PATH
    const cmd = process.env.FLOW4_AGENT_BIN || "flow4-net-agent";

    const { stdout } = await execFileAsync(cmd, ["-json", "-timeout-ms", "5000"], {
      timeout: 6000
    });

    let parsed: any = null;
    try {
      parsed = JSON.parse(stdout);
    } catch (e) {
      console.error("[agent/network] Failed to parse agent JSON:", e);
      return NextResponse.json(
        {
          error: "Invalid agent output",
          raw: stdout?.slice(0, 2000) || "",
        },
        { status: 502 }
      );
    }

    const duration = Date.now() - start;
    return NextResponse.json({
      ok: true,
      durationMs: duration,
      agent: parsed,
    });
  } catch (error: any) {
    console.error("[agent/network] Failed to execute flow4-net-agent:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Agent execution failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

