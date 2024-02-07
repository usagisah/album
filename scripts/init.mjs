import { execa } from "execa";
import { buildCore } from "./build.tsc.mjs";

await buildCore()
await execa("pnpm", ["install"])