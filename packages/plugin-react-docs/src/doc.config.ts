export interface AlbumDocsConfig {
  /* 标题 */
  title?: string
  /* 描述 */
  description?: string
  /* 
    主题 ./开头视为本地主题，否则视为外部主题 
    主题文件需要导出一个默认函数，函数里会接收到 配置参数&api 参数，使用 api 来动态注册布局等一些事
  */
  theme?: string[]
  /* 默认语言 */
  lang?: string
  /* 全局头 {meta: { name: "xx" }} */
  head?: Record<string, Record<string, string>>
  /* 注入全局元数据 */
  inject?: {
    /* 
      注入脚本函数文件 <script type="module" src="" /> 
      ./ 开头视为本地文件，其他视为外部文件
    */
    scripts?: string[]
    /* 注入全局变量 window.xxx */
    data?: string[]
    /* 注入约定式路由意外的文章映射 */
    documents: any
  } & Record<string, string>
  /* 静态资源服务器配置 */
  server?: {
    /* 路径重写规则 'packages/:pkg/src/(.*)': ':pkg/index.md' */
    rewrites: Record<string, string>
    /* 其他静态服务器相关的 */
  }
}


/* 
api:
components: {}
layouts: {}
hooks: {}
store: {}
config: {}
lang: {}
*/