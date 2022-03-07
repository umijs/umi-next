import { inject, observer } from 'mobx-react';
import React from 'react';
import '../style.less';

export default inject('counter')(
  observer(function HomePage(props) {
    return (
      <div className="container">
        <div>
          <p className="title">UmiJS x mobx</p>
          <div>
            <p className="count">count: {props.counter.count}</p>
            <button onClick={() => props.counter.increase()}>+</button>
            <button onClick={() => props.counter.decrease()}>-</button>
          </div>
        </div>
      </div>
    );
  }),
);
