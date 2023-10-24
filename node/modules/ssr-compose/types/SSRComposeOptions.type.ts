export type SSRComposeOptions = {
  moduleRoot: string
  viteComponentBuild: (props: { input: string; outDir: string }) => Promise<void>
}