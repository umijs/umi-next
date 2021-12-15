// @ts-ignore
import { FormattedMessage, SelectLang, useIntl } from '@@/plugin-locale';
// @ts-ignore
import { Button, DatePicker, Input } from 'antd';
import React from 'react';

export default function HomePage() {
  const intl = useIntl();
  return (
    <div>
      <h2>index page</h2>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
      <FormattedMessage id={`HELLO`} />
      <div>{intl.formatMessage({ id: 'HELLO' })}</div>
      <SelectLang />
    </div>
  );
}
