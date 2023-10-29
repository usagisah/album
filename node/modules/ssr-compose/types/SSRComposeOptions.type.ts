import { SSRComposeCoordinateValue } from "../../../context/AlbumContext.type.js"

export type SSRComposeOptions = {
  viteComponentBuild: (props: { input: string; outDir: string }) => Promise<void>
  existsProject: (prefix: string, sourcePath: string) => SSRComposeCoordinateValue | null
}
