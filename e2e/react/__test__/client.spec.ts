import { setupProject } from "../../helpers/project"
import { setupPuppeteer } from "../../helpers/puppeteer"

const pId = "react/client"
await setupProject(pId, "dev")
const { page, html, text } = await setupPuppeteer(pId)

it("env", async () => {
  const p = page()
  await p.goto("http://localhost:5211")
  await p.waitForSelector("div")
  expect(html("#env")).resolves.toBe("<p>config-common-a</p><p>config-dev-b</p><p>file-common-p</p><p>file-dev-z</p>")
})

it("switch router", async () => {
  const p = page()

  await p.goto("http://localhost:5211")
  await p.waitForSelector("div")
  expect(await text("#router")).toBe("page home")

  await p.goto("http://localhost:5211/order")
  await p.waitForSelector("#order")
  expect(await html("#router")).toBe(`<h1 id="home">page home</h1><h1 id="order">page order</h1>`)

  await p.goto("http://localhost:5211/car")
  await p.waitForSelector("#car")
  expect(await html("#router")).toBe(`<h1 id="home">page home</h1><h1 id="car">page car--{"car":"car"}</h1>`)

  await p.goto("http://localhost:5211/about")
  await p.waitForSelector("#about")
  expect(await html("#router")).toBe(`<h1 id="about">page about</h1>`)

  await p.goto("http://localhost:5211/xx/xx")
  await p.waitForSelector("#error")
  expect(await html("#router")).toBe(`<h1 id="error">page error</h1>`)
})
