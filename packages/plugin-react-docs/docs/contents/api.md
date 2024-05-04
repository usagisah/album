
（自定义容器）

:::
content
:::

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warn
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

::: raw
Wraps in a 
:::


# 一级标题
## 二级标题
### 三级标题
#### 四级标题
# 一级标题 {#xx}
## 二级标题 {#xx}
### 三级标题 {#xx}
#### 四级标题 {#xx}


<br/><br/>
（分割线）

---


<br/><br/>
（列表）
1. 有序列表
- 无序列表
+ 无序列表


<br/><br/>
`行内代码块`
**强调**
*斜体*
[链接](http://baidu.com)
![链接](https://srv.carbonads.net/static/30242/d73f1601fd4c38caa238b885f3c610c8cbee3169)


<br/><br/>
（表格）
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |




<br/><br/>

(代码块)

```js
console.log(1)
console.log(2)
console.log(3)
```

```js {pure, 0, 2, 4}
console.log(1)
console.log(2)
console.log(3)
```

```js {2-3}
console.log(1, "连续范围 2-3")
console.log(2)
console.log(3)
console.log(4)
```

```tsx{render}
export default function Button() {
  return <button>hello album.js</button>
}
```



<br/><br/>
(jsx 代码)
{1+1}




<br/><br/>
(代码组，tab显示)


:::tabs{render}
```tsx {Component.tsx}
export default function Button() {
  return <button>hello album.js</button>
}
```

```css {Component.css}
div {
  color: red;
}
```
:::



::: tabs
```js {config.js}
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts {config.ts}
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```
:::
