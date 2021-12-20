// @ts-ignore

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
