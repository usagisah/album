import { setupProject } from "../../helpers/project"

const pId = "react/server"
await setupProject(pId, "dev")

it("controller", async () => {
  const getRes = await fetch("http://localhost:5411/oo").then(r => r.json())
  expect(getRes).toEqual({ msg: "AppController-get" })

  const postRes = await fetch("http://localhost:5411/oo", { method: "post" }).then(r => r.json())
  expect(postRes).toEqual({ msg: "AppController-post" })
})
