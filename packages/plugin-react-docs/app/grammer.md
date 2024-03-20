# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
# 标题锚点 {#xx}


（分割线）
---

（列表）
1. 有序列表
- 无序列表
+ 无序列表


（其他）
图片
链接
行内代码块


（文档页面元数据 yaml格式 frontmatter）
---
import:
  - import {} from ""
  - import default from ""
title: 
description:
head:
lang:
---

（表格）
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |





（自定义容器）
::: type {a,b,...参数}
content
:::

（内置容器）
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details  折叠显示
This is a details block.
:::

::: raw  原样显示
Wraps in a <div class="vp-raw">
:::

::: tab-code 代码组，tab显示
```js-1
```
```ts-2
```
:::

::: tab 代码组，tab显示
--- 内容 1
---
--- 内容 2
---
:::



（导入md）
<!--@include: ./xxx-->
<!--@include{3-xx范围参数}: ./xxx-->




（大代码块）
```type{参数}
```

type{4} 高亮
多行：例如 {5-8}、{3-10}、{10-17}
多个单行：例如 {4,7,9}
多行与单行：例如 {4,7-13,16,23-27,40}

代码块行内参数
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```
```js
export default {
  data () {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

作为一个组件进行渲染
```type{render}
```