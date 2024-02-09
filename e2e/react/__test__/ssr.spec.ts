import { setupProject } from "../../helpers/project"
import { setupPuppeteer } from "../../helpers/puppeteer"
import { replacePlaceholder } from "../../helpers/ssr"

const pId = "react/ssr"
await setupProject(pId, "dev")
const { page, html, text } = await setupPuppeteer(pId)

it("switch router", async () => {
  const p = page()

  await p.goto("http://localhost:5311")
  await p.waitForSelector("#router")
  expect(await text("#router")).toBe("page home")

  await p.goto("http://localhost:5311/about")
  await p.waitForSelector("#about")
  expect(replacePlaceholder(await html("#router"))).toBe(`<h1 id="about">page about</h1>`)

  await p.goto("http://localhost:5311/about/order")
  await p.waitForSelector("#order")
  expect(replacePlaceholder(await html("#router"))).toBe(`<h1 id="about">page about</h1><h1 id="order">page order</h1>`)

  await p.goto("http://localhost:5311/about/car")
  await p.waitForSelector("#car")
  expect(replacePlaceholder(await html("#router"))).toBe(`<h1 id="about">page about</h1><h1 id="car">page car--{"car":"car"}</h1>`)

  await p.goto("http://localhost:5311/xx/xx")
  await p.waitForSelector("#error")
  expect(replacePlaceholder(await html("#router"))).toBe(`<h1 id="error">page error</h1>`)
})

it("main.ssr props.query & props.params", async () => {
  const p = page()

  await p.goto("http://localhost:5311")
  await p.waitForSelector("#router")
  expect(JSON.parse((await text("#server-params"))!)).toEqual({})
  expect(JSON.parse((await text("#server-query"))!)).toEqual({})

  await p.goto("http://localhost:5311/about/car111/?a=1&b&=c&d=4")
  await p.waitForSelector("#router")
  expect(JSON.parse((await text("#server-params"))!)).toEqual({ car: "car111" })
  expect(JSON.parse((await text("#server-query"))!)).toEqual({ a: "1", b: "", d: "4" })
})
