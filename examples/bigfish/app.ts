// @ts-ignore
import { RequestConfig } from '@@/plugin-request';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInitialState() {
  await delay(1000);
  return {
    name: 'Big Fish',
    size: 'big',
    color: 'blue',
    mood: 'happy',
    food: 'fish',
    location: 'sea',
  };
}

export const request: RequestConfig = {
  timeout: 100,
  errorConfig: {
    adaptor: (res: any) => {
      console.log(123);
      return res;
    },
  },
};
