import { Button, Card, Form, Input, message } from 'antd';
import { useForm, useWatch } from 'antd/lib/form/Form';
import { startCase } from 'lodash';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { useEffect, useState } from 'react';
import { Bus } from '../../bus';
import { NBTDataNode } from '../../lib/NBTDataNode';
import NBTSheetIcon from '../NBTSheetIcon';

interface CompoundTypePanelProps {
  bus: Bus;
  node: NBTDataNode;
}

function CompoundPanel({
  bus,
  node,
}: CompoundTypePanelProps) {
  const [ form ] = useForm<{
    keyInParent: string | number,
    type: string,
  }>();
  const [ initValues, setInitValues ] = useState<{
    keyInParent: string | number,
    type: string,
  }>({
    keyInParent: node.keyInParent,
    type: startCase(node.valueType),
  });
  const currentKey = useWatch('keyInParent', form);
  const modified = (currentKey !== initValues.keyInParent);
  const [ submitting, setSubmitting ] = useState(false);

  useEffect(() => {
    const values = {
      keyInParent: node.keyInParent,
      type: startCase(node.valueType),
    };

    setInitValues(values);
    form.setFieldsValue(values);
  }, [ node.key, bus.currentFileUUID, bus.currentModifyVersion ]);

  const keyInput = (
    <Form.Item
      label={typeof node.keyInParent === 'string' ? 'Key' : 'Index'}
      name="keyInParent"
      rules={[{
        validator: (_, value) => {
          let parent = node.parentStructedTag;
          if (!Array.isArray(parent)) {
            parent = parent.value as StructedNBTTag[];
          }

          for (const tag of parent) {
            if (`${tag.key}` === `${value}` && tag !== node.structedTag) {
              return Promise.reject('Key already exists.');
            }
          }

          return Promise.resolve();
        }
      }]}
    >
      <Input disabled={typeof node.keyInParent === 'number'} />
    </Form.Item>
  );

  const submit = () => {
    setSubmitting(true);
    form.validateFields().then(values => {
      node.structedTag.key = values.keyInParent as string;
      node.keyInParent = values.keyInParent;
      delete node.width;

      bus.currentModifyVersion++;
      setSubmitting(false);
    }).catch((err: ValidateErrorEntity) => {
      setSubmitting(false);
      if (err instanceof Error) {
        console.error(err);
        message.error(err.message);
        return;
      }

      message.error(err.errorFields[0].errors[0]);
      console.error(err);
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initValues}
      disabled={submitting}
    >
      <Form.Item label="Type" name="type">
        <Input addonBefore={<NBTSheetIcon type={node.valueType} />} disabled />
      </Form.Item>

      {keyInput}

      {
        (typeof node.keyInParent === 'string') ?
          (
            <Form.Item>
              <Button
                disabled={!modified}
                type="primary"
                style={{ marginRight: '5px' }}
                htmlType="submit"
                onClick={submit}
              >
                Apply
              </Button>
              <Button
                disabled={!modified}
                onClick={() => {
                  form.resetFields();
                }}
              >
                Reset
              </Button>
            </Form.Item>
          ) :
          (
            <Card style={{ color: '#ccc' }}>
              Please edit children node by node.
            </Card>
          )
      }
    </Form>
  );
}

export default CompoundPanel;
