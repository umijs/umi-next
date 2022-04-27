# 使用Vue

本文介绍如何在 Umi.js 使用Vue, Umi Vue大部分配置, 同React 这里只列出一些 Vue 独有的配置

## 启动方式

### 安装

```sh
pnpm add  @umijs/preset-vue -D
```

### 配置预设

```sh
# .umirc.ts or config/config.ts 中
export default {
  presets: [require.resolve('@umijs/preset-vue')],
};

```

## 路由

### 配置式路由

在配置文件中 通过 `routes` 进行配置, 格式为路由信息的数组。
比如: 

```ts
export default {
  routes: [
    {
      path: '/',
      component: 'index'
    },
    {
      path: '/users',
      component: 'users',
      routes: [
        {
          path: 'foo',
          component: 'users/foo'
        }
      ]
    }
  ]
}
```

#### path

路由匹配用法[详见](https://router.vuejs.org/guide/essentials/route-matching-syntax.html)

#### component 

配置 location 和 path 匹配后用于渲染的 Vue 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。

如果指向 src 目录的文件，可以用 @，也可以用 ../。比如 component: '@/layouts/basic'，或者 component: '../layouts/basic'，推荐用前者。

#### routes
配置子路由，通常在需要为多个路径增加 layout 组件时使用。

比如

```ts
export default {
  routes: [
    {
      path: '/users',
      component: 'users',
      routes: [
        {
          path: 'foo',
          component: 'users/foo'
        }
      ]
    }
  ]
}
```

然后在 `src/pages/users.vue` 中通过 `<router-view></router-view>` 渲染子路由

这样，访问 `/users/foo` 就会带上 `src/pages/users.vue` 这个 layout 组件。

#### name

命名路由

除了 path 之外，你还可以为任何路由提供 name

```ts
export default {
  routes: [
    {
      path: '/user/:username',
      name: 'user',
      component: 'index'
    }
  ]
}
```

要链接到一个命名的路由，可以向 router-link 组件的 to 属性传递一个对象：

```html
<router-link :to="{ name: 'user', params: { username: 'erina' }}">
  User
</router-link>
```

这跟代码调用 router.push() 是一回事：

```ts
router.push({ name: 'user', params: { username: 'erina' } })
```

在这两种情况下，路由将导航到路径 /user/erina。


#### redirect

重定向也是通过 routes 配置来完成，下面例子是从 /home 重定向到 /：

```ts
export default {
  routes: [
    {
      path: '/home',
      redirect: '/'
    }
  ]
}
```

重定向的目标也可以是一个命名的路由：

```ts
export default {
  routes: [
    {
      path: '/home',
      redirect: {
        name: 'homepage'
      }
    }
  ]
}
```

#### alias

重定向是指当用户访问 `/home` 时，URL 会被 `/` 替换，然后匹配成 `/`。那么什么是别名呢？

将 `/` 别名为 `/home`，意味着当用户访问 `/home` 时，URL 仍然是 `/home`，但会被匹配为用户正在访问 `/`。

上面对应的路由配置为：
```ts
export default {
  routes: [
    {
      path: '/',
      component: 'index',
      alias: '/home'
    }
  ]
}
```

通过别名，你可以自由地将 UI 结构映射到一个任意的 URL，而不受配置的嵌套结构的限制。使别名以 `/` 开头，以使嵌套路径中的路径成为绝对路径。你甚至可以将两者结合起来，用一个数组提供多个别名：

```ts
export default {
  routes: [
    {
      path: '/users',
      component: 'users',
      routes: [
        // 为这 3 个 URL 呈现 UserList
        // - /users
        // - /users/list
        // - /people
        { path: '', component: '/users/UserList', alias: ['/people', 'list'] },
      ]
    }
  ]
}
```

### 约定式路由

除配置式路由外，Umi 也支持约定式路由。约定式路由也叫文件路由，就是不需要手写配置，文件系统即路由，通过目录和文件及其命名分析出路由配置。

如果没有 routes 配置，Umi 会进入约定式路由模式，然后分析 src/pages 目录拿到路由配置。

### 页面跳转

```html
<script lang="ts" setup>
import { useRouter, useRoute } from 'umi';

const router = useRouter()
const route = useRoute()

const onHello = () => {
  router.push({
    name: 'search',
    query: {
      ...route.query,
    },
  })
}
</script>
```

更多[详见](https://router.vuejs.org/guide/advanced/composition-api.html#accessing-the-router-and-current-route-inside-setup)

### router-link

[详见](https://router.vuejs.org/guide/#router-link)

### router-view

[详见](https://router.vuejs.org/guide/#router-view)

## 运行时配置

可以通过在约定的 `src/app.tsx` 通过 export 配置来控制 vue vue-router 相关的配置


### router

配置路由配置

```ts
// src/app.tsx
export const router: RouterConfig = {
  // @ts-ignore
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
```

### onMounted(\{app, router\})

vue app mount 成功, 这里可以拿到app 的实例及 router 的实例, 可以进行 全局组件注册, 路由拦截器等

```ts
export function onMounted({ app, router }: any) {
  console.log('onMounted', app, router);
  app.provide('umi-hello', {
    h: 'hello',
    w: 'word',
  });
}
```

### rootContainer(container)

修改交给 vue-router 渲染时的根组件。

比如用于在外面包一个 父组件

```ts
import { h } from 'vue'

export function rootContainer(container) {
  return h(ThemeProvider, null, container);
}
```
