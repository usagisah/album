#!/usr/bin/env node

import { cac } from "@albumjs/tools/lib/cac"
import { resolveNodeArgs } from "@albumjs/tools/node"
import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import buildCommand from "./build/build.js"
import createCommand from "./create/create.js"
import devCommand from "./dev/dev.js"
import registryCommand from "./registry/registry.js"
import startCommand from "./start/start.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"))
const args = resolveNodeArgs()
const cli = cac("album")

await Promise.all([buildCommand(cli, args), devCommand(cli, args), startCommand(cli, args), registryCommand(cli, args), createCommand(cli, args, __dirname)])
cli.help().version(version)
cli.parse()
