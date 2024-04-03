import { setupProject } from "../../../helpers/project"
import { setupPuppeteer, timeout } from "../../../helpers/puppeteer"
import { replacePlaceholder } from "../../../helpers/ssr"

const pId = "react/ssr"
await setupProject(pId, "start", ["dist"])
const { page, html, text, click, count } = await setupPuppeteer(pId)

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

it("use react-router-dom switch router", async () => {
  const p = page()

  await p.goto("http://localhost:5311/push")
  await p.waitForSelector("#push")

  await click("#btn1")
  await timeout(100)
  expect(await count("#p1")).toBe(1)

  await click("#btn2")
  await timeout(100)
  expect(await count("#p2")).toBe(1)

  await click("#btn3")
  await timeout(100)
  expect(await count("#home")).toBe(1)
})

it("main.ssr props.query & props.params", async () => {
  const p = page()

  await p.goto("http://localhost:5311")
  await p.waitForSelector("#router")
  expect(JSON.parse((await text("#server-params"))!)).toEqual({})
  expect(JSON.parse((await text("#server-query"))!)).toEqual({})

  await p.goto("http://localhost:5311/about/car111/?a=1&b&=c&d=4")
  await timeout(50)
  expect(JSON.parse((await text("#server-params"))!)).toEqual({ car: "car111" })
  expect(JSON.parse((await text("#server-query"))!)).toEqual({ a: "1", b: "", d: "4" })
})

it("server router data", async () => {
  const p = page()
  await p.goto("http://localhost:5311/action")
  await p.waitForSelector("#server-router-data")
  expect(JSON.parse((await text("#server-router-data"))!)).toEqual({ action: "from page action", mainSSR: "server-router-mainSSR" })
})

it("server hooks useServer, useServerRouteData", async () => {
  const p = page()
  await p.goto("http://localhost:5311/hooks")
  await p.waitForSelector("#hooks")
  expect(JSON.parse((await text("#useServerRouteData"))!)).toEqual({ mainSSR: "server-router-mainSSR" })
  expect(JSON.parse((await text("#useServer-data"))!)).toEqual({ hooksPage: "from hooks page" })
})
