import { Button, Form, FormInstance, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { startCase } from 'lodash';
import { useForm } from 'antd/lib/form/Form';

import { Bus } from '../../bus';
import { NBTDataNode } from '../../lib/NBTDataNode';
import NBTSheetIcon from '../NBTSheetIcon';

interface MetaTypePanelValueInputProps {
  form: FormInstance;
}

export type MetaTypePanelValueInputFun = (props: MetaTypePanelValueInputProps) => JSX.Element;

interface GenMetaTypePanelParameter {
  valueInput?: MetaTypePanelValueInputFun;
  valueInputTooltip?: string | undefined;
}

interface MetaTypePanelProps {
  bus: Bus;
  node: NBTDataNode;
}

function metaTypePanel({
  valueInput = () => <Input />,
  valueInputTooltip = undefined,
}: GenMetaTypePanelParameter = {}) {
  return ({ bus, node }: MetaTypePanelProps) => {
    const [ form ] = useForm<{
      keyInParent: string | number,
      value: string | number,
      type: string,
    }>();

    const [ submitting, setSubmitting ] = useState(false);
    const [ initValues, setInitValues ] = useState<{
      keyInParent: string | number,
      value: string | number,
      type: string,
    }>({
      keyInParent: '',
      value: '',
      type: '',
    });

    const currentKey = Form.useWatch('keyInParent', form);
    const currentValue = Form.useWatch('value', form);

    useEffect(() => {
      let array: StructedNBTTag[] | StructedNBTTag | number[] = node.parentStructedTag;
      if (!Array.isArray(array)) {
        array = array.value as StructedNBTTag[] | number[];
      }

      let value: string | number | StructedNBTTag;
      if (typeof node.keyInParent === 'number') {
        value = array[node.keyInParent];
      } else {
        for (const tag of array) {
          if ((tag as StructedNBTTag).key === node.keyInParent) {
            value = tag;
            break;
          }
        }
      }

      if (typeof value === 'object') {
        value = value.value as string | number;
      }

      const values = {
        keyInParent: node.keyInParent,
        value,
        type: startCase(node.valueType),
      };

      setInitValues(values);
      form.setFieldsValue(values);
    }, [ node.key, bus.currentFileUUID, bus.currentModifyVersion ]);

    const modified = (currentKey !== initValues.keyInParent) || (`${currentValue}` !== `${initValues.value}`);

    const keyInput = (
      <Form.Item
        label={typeof node.keyInParent === 'string' ? 'Key' : 'Index'}
        name="keyInParent"
      >
        <Input disabled={typeof node.keyInParent === 'number'} />
      </Form.Item>
    );

    const submit = () => {
      setSubmitting(true);
      form.validateFields().then(({
        keyInParent,
        value,
      }) => {
        if (typeof keyInParent === 'string' && keyInParent !== initValues.keyInParent) {
          let array = node.parentStructedTag;
          if (!Array.isArray(array)) {
            array = array.value as StructedNBTTag[];
          }

          for (const tag of array) {
            if (tag.key === keyInParent) {
              message.error(`Key ${keyInParent} already exists.`);
              setSubmitting(false);
              return;
            }
          }
          node.structedTag.key = keyInParent;
        }

        if (`${value}` !== `${initValues.value}`) {
          if (node.structedTag) {
            node.structedTag.value = value;
          } else {
            ((node.parentStructedTag as StructedNBTTag).value as number[])[keyInParent as number] = value as number;
          }
        }

        bus.currentModifyVersion++;
        setSubmitting(false);
      }).catch(e => {
        setSubmitting(false);
        message.error(e.message);
        console.error(e);
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

        <Form.Item label="Value" name="value" tooltip={valueInputTooltip}>
          {valueInput({ form })}
        </Form.Item>

        <Form.Item>
          <Button
            disabled={!modified}
            type="primary"
            style={{ marginRight: '5px' }}
            onClick={submit}
            htmlType="submit"
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
  };
}

export default metaTypePanel;
