<template>
  <div>
    <h1>umi & vue</h1>
    {{ hello }}

    <div>
       <router-link to="/users">Go to Users</router-link>
    </div>
    <div>
       <router-link to="/users/foo">Go to Users Foo</router-link>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useAppData, useRouter } from 'umi';

const hello = ref<string>('hello vue');
const app = useAppData();

console.log('appData', app);
</script>
<style lang="less" scoped>
div {
  font-size: 24px;
}
</style>
