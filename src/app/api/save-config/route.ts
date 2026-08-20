import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const config = await req.json();

    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Cannot write to filesystem in production" }, { status: 403 });
    }

    if (config.branches) {
      // Robust project root detection instead of process.cwd()
      // Walk upwards from the current file (__dirname) to find package.json
      let projectRoot = __dirname;
      while (!fs.existsSync(path.join(projectRoot, "package.json"))) {
        const parent = path.join(projectRoot, "..");
        if (parent === projectRoot) {
          throw new Error("Could not find project root (package.json)");
        }
        projectRoot = parent;
      }

      const branchFilePath = path.join(projectRoot, "src", "data", "branches.ts");
      let content = fs.readFileSync(branchFilePath, "utf8");

      for (const [id, data] of Object.entries(config.branches)) {
        // @ts-ignore
        if (data.mapPosition) {
          // 1. Update mapPosition values
          const posRegex = new RegExp(`(id:\\s*${id},\\s*[\\s\\S]*?mapPosition:\\s*\\{\\s*x:\\s*)[\\d.]+(\\s*,\\s*y:\\s*)[\\d.]+(\\s*\\})`);
          // @ts-ignore
          content = content.replace(posRegex, `$1${data.mapPosition.x.toFixed(2)}$2${data.mapPosition.y.toFixed(2)}$3`);
        }
        
        // @ts-ignore
        if (data.appearance) {
          // 2. Insert or Update appearance block immediately after mapPosition
          // Matches up to the end of mapPosition block, and optionally matches an existing appearance block
          const appRegex = new RegExp(`(id:\\s*${id},[\\s\\S]*?mapPosition:\\s*\\{[^\\}]+\\})(?:,\\s*appearance:\\s*\\{[^\\}]+\\})?`);
          
          // @ts-ignore
          const colorStr = data.appearance.color ? ` color: "${data.appearance.color}",` : '';
          // @ts-ignore
          const sizeStr = data.appearance.size ? ` size: ${data.appearance.size},` : '';
          
          const replacement = `$1, appearance: {${colorStr}${sizeStr} }`;
          content = content.replace(appRegex, replacement);
        }
      }

      fs.writeFileSync(branchFilePath, content, "utf8");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save config:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
