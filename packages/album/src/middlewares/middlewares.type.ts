import { UserConfig } from "vite"
export type AlbumServerViteConfig = { name: string; config: UserConfig }
export type AlbumServerExpressConfig = { enable: boolean; name: string; config: any[]; factory: (...config: any[]) => any }
