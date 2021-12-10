// @ts-ignore
import { connect } from '@@/plugin-dva';
// @ts-ignore
import { Button, DatePicker, Input } from 'antd';
// @ts-ignore
import dayjs from 'moment';
import React from 'react';

function mapStateToProps(state: any) {
  return { count: state.count };
}

export default connect(mapStateToProps)(function HomePage(props: any) {
  console.log(dayjs().format);

  return (
    <div>
      <h2>antd</h2>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
      <h2>count: {props.count}</h2>
    </div>
  );
});
