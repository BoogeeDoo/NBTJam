import { Form, FormInstance, Input } from 'antd';
import { startCase } from 'lodash';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

import { Bus } from '../../bus';
import { NBTDataNode } from '../../lib/NBTDataNode';
import NBTSheetIcon from '../NBTSheetIcon';

function metaTypePanel({
  valueInput = () => <Input />,
  valueInputTooltip = undefined,
}: {
  valueInput?: ({ form }: { form: FormInstance }) => JSX.Element,
  valueInputTooltip?: string | undefined,
} = {}) {
  return ({
    bus,
    node,
  }: {
    bus: Bus,
    node: NBTDataNode,
  }) => {
    const [ form ] = useForm<{
      keyInParent: string | number,
      value: string | number,
      type: string,
    }>();

    useEffect(() => {
      let value: string | number | StructedNBTTag = node.parentStructedTag.value[node.keyInParent];
      if (typeof value === 'object') {
        value = value.value as string | number;
      }

      form.setFieldsValue({
        keyInParent: node.keyInParent,
        value,
        type: startCase(node.valueType),
      });
    }, [ node ]);

    const keyInput = (
      <Form.Item
        label={typeof node.keyInParent === 'string' ? 'Key' : 'Index'}
        name="keyInParent"
      >
        <Input disabled={typeof node.keyInParent === 'number'} />
      </Form.Item>
    );

    return (
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item label="Type" name="type">
          <Input addonBefore={<NBTSheetIcon type={node.valueType} />} disabled />
        </Form.Item>

        {keyInput}

        <Form.Item label="Value" name="value" tooltip={valueInputTooltip}>
          {valueInput({ form })}
        </Form.Item>
      </Form>
    );
  };
}

export default metaTypePanel;
