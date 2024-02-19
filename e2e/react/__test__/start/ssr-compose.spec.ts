import { setupProject } from "../../../helpers/project"
import { setupPuppeteer } from "../../../helpers/puppeteer"

const pId = "react/ssr-compose"
const { page, html, text } = await setupPuppeteer(pId)
const { port } = await setupProject(pId, "start", ["dist"])

it("remote", async () => {
  const p = page()
  await p.goto(`http://localhost:${port}/remote1`)
  await p.waitForSelector("#remote3")

  expect(await html("#remote1")).toBe(`page remote1`)
  expect(await html("#remote2")).toBe(`page remote2`)
  expect(await html("#remote3")).toBe(`page remote3`)

  expect(await html("#remote2-lazy")).toBe(`<span>0</span><button>++</button>`)
  expect(await html("#remote3-lazy")).toBe(`<span>0</span><button>++</button>`)

  expect(JSON.parse(await text("#server-data-remote2"))).toEqual({ "remote2-lazy": "remote2" })
  expect(JSON.parse(await text("#server-data-remote3"))).toEqual({ remote3: "remote3" })
})

it("local", async () => {
  const p = page()
  await p.goto(`http://localhost:${port}/local1`)
  await p.waitForSelector("#local3")

  expect(await html("#local1")).toBe(`page local1`)
  expect(await html("#local2")).toBe(`page local2`)
  expect(await html("#local3")).toBe(`page local3`)

  expect(await html("#local2-lazy")).toBe(`<span>0</span><button>++</button>`)
  expect(await html("#local3-lazy")).toBe(`<span>0</span><button>++</button>`)

  expect(JSON.parse(await text("#server-data-local2"))).toEqual({ local2: "local2" })
  expect(JSON.parse(await text("#server-data-local3"))).toEqual({ "local3-lazy": 10 })
})

it("nest", async () => {
  const p = page()
  await p.goto(`http://localhost:${port}/nest1`)
  await p.waitForSelector("#nest4")

  expect(await html("#nest1")).toBe(`page nest1`)
  expect(await html("#nest2")).toBe(`page nest2`)
  expect(await html("#nest3")).toBe(`page nest3`)
  expect(await html("#nest4")).toBe(`page nest4`)
})

it("home", async () => {
  const p = page()
  await p.goto(`http://localhost:${port}`)
  await p.waitForSelector("#home")
  expect(await html("#home")).toBe(`page home`)
})

it("error", async () => {
  const p = page()
  await p.goto(`http://localhost:${port}/xx`)
  await p.waitForSelector("#error")
  expect(await html("#error")).toBe(`page error`)
})
