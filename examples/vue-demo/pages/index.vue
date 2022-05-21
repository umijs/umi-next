<template>
  <div>
    <h1>Home Page</h1>
    <h2>ref: {{ hello }}</h2>
    <h3>inject data: {{ umiHello }}</h3>
    <Button type="primary" @click="onTo">to hello</Button>
    <VantDemo/>
    <div>
      <h4>useAppData</h4>
      <pre>{{ app }}</pre>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject } from 'vue';
import { useAppData, useRouter } from 'umi';
import VantDemo from '@/components/VantDemo.vue'
import { Button } from 'vant'

const hello = ref<string>('hello vue');
const app = useAppData();

const umiHello = inject('umi-hello')

const routes = useRouter()

const onTo = () => {
  routes.push('/hello')
}

</script>
<style lang="less" scoped>
div {
  font-size: 24px;
}
</style>
