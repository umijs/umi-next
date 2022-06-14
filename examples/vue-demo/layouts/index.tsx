// @ts-nocheck
import { defineComponent } from 'vue';
import styles from './index.less';

export default defineComponent({
  setup() {
    return () => (
      <div>
        <header class={styles.header}>
          <div class={styles.logo}>Umi & Vue</div>
          <div class={styles.nav}>
            <router-link to="/">Home</router-link>
            <router-link to="/users">Users</router-link>
            <router-link to="/users/foo">Users Foo</router-link>
            <router-link to="/hello">Hello Tsx</router-link>
          </div>
        </header>
        <main>
          <router-view></router-view>
        </main>
      </div>
    );
  },
});
