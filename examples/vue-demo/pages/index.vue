<template>
  <div>
    <h1>umi & vue</h1>
    <h2>{{ hello }}</h2>
    <h3>{{ umiHello }}</h3>

    <div>
       <router-link to="/users">Go to Users</router-link>
    </div>
    <div>
       <router-link to="/users/foo">Go to Users Foo</router-link>
    </div>
    <VantDemo/>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject } from 'vue';
import { useAppData, useRouter } from 'umi';
import VantDemo from '@/components/VantDemo.vue'

const hello = ref<string>('hello vue');
const app = useAppData();

const umiHello = inject('umi-hello')

console.log('appData', app);
</script>
<style lang="less" scoped>
div {
  font-size: 24px;
}
</style>
