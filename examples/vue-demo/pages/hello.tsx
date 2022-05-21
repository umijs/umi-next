// @ts-nocheck
import { Cell, CellGroup, ContactCard, Field, Toast } from 'vant';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Hello',
  setup() {
    const value = ref('');

    const onAdd = () => {
      Toast('hello add');
    };

    return () => (
      <div>
        <h1>hello page</h1>
        <ContactCard type="add" onClick={onAdd} />
        <CellGroup inset>
          <Field
            v-model={value.value}
            label="输入框"
            placeholder="请输入用户名"
          />
          <Cell title="输入的内容" value={value.value} />
        </CellGroup>
      </div>
    );
  },
});
