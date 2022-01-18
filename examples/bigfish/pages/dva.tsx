// @ts-ignore
import dayjs from 'moment';
import React, { FC } from 'react';
import { connect, ConnectProps, CountModelState } from 'umi';

function mapStateToProps(state: { count: CountModelState }) {
  return { count: state.count };
}
interface HomePageProps extends ConnectProps {
  count: CountModelState;
}
const HomePage: FC<HomePageProps> = ({ count, dispatch }) => {
  return (
    <div>
      <h2>dva</h2>
      <p>dayjs: {dayjs().format()}</p>
      <p>count: {count}</p>
      <button onClick={() => dispatch?.({ type: 'count/add' })}>+</button>
    </div>
  );
};
export default connect(mapStateToProps)(HomePage);
