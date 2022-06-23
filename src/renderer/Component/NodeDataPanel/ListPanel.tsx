import { Button, Divider, Form, Input, message, Select, SelectProps } from 'antd';
import { useForm, useWatch } from 'antd/lib/form/Form';
import { startCase } from 'lodash';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { useEffect, useState } from 'react';
import { Bus } from '../../bus';
import { NBTDataNode } from '../../lib/NBTDataNode';
import NBTSheetIcon from '../NBTSheetIcon';

interface ListTypePanelProps {
  bus: Bus;
  node: NBTDataNode;
}

let dummyNode: NBTDataNode;

const types = [ 'byte', 'short', 'int', 'long', 'float', 'double', 'byte_array', 'string', 'int_array', 'compound', 'list', 'end' ];

function ChildTypeSelect({
  ...props
}: SelectProps) {
  const items = types.map(type => (
    <Select.Option key={type} value={type}>
      <NBTSheetIcon type={type as typeof dummyNode.valueType} />
      <Divider dashed type="vertical" />
      {startCase(type)}
    </Select.Option>
  ));

  return (
    <Select {...props}>
      {items}
    </Select>
  );
}

function ListPanel({
  bus,
  node,
}: ListTypePanelProps) {
  const [ form ] = useForm<{
    keyInParent: string | number,
    childrenType: typeof dummyNode.valueType,
    type: string,
  }>();
  const [ initValues, setInitValues ] = useState<{
    keyInParent: string | number,
    childrenType: typeof dummyNode.valueType,
    type: string,
  }>({
    keyInParent: node.keyInParent,
    childrenType: node.childrenType,
    type: startCase(node.valueType),
  });
  const currentKey = useWatch('keyInParent', form);
  const currentType = useWatch('childrenType', form);
  const modified = (currentKey !== initValues.keyInParent) || (currentType !== initValues.childrenType);
  const [ submitting, setSubmitting ] = useState(false);

  useEffect(() => {
    const values = {
      keyInParent: node.keyInParent,
      childrenType: node.childrenType,
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
      if (values.keyInParent !== node.keyInParent && typeof values.keyInParent === 'string') {
        node.structedTag.key = values.keyInParent as string;
        node.keyInParent = values.keyInParent;
        delete node.width;
      }

      if (values.childrenType !== node.childrenType && !node.children?.length) {
        (node.structedTag as StructedNBTListTag).childrenType = values.childrenType;
        node.childrenType = values.childrenType;
      }

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

      <Form.Item
        label="Children Type"
        name="childrenType"
        rules={[{
          validator: (_, value) => {
            if (value === initValues.childrenType) {
              return Promise.resolve();
            }

            if (node.children?.length) {
              return Promise.reject('Cannot change children type if this list is not empty.');
            }

            return Promise.resolve();
          },
        }]}
      >
        <ChildTypeSelect />
      </Form.Item>

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
    </Form>
  );
}

export default ListPanel;
