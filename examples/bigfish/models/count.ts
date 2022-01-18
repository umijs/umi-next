import { DvaModel } from 'umi';

export type CountModelState = number;
const CountModel: DvaModel<CountModelState> = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state: number) {
      return state + 1;
    },
  },
  subscriptions: {
    setup(opts: any) {
      console.log('dva model setup', opts);
    },
  },
};
export default CountModel;
