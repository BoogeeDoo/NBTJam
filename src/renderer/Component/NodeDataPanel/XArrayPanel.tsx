import { Button, Form, Input, message } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'antd/lib/form/Form';
import useResizeObserver from 'use-resize-observer';

import './XArrayPanel.css';
import { Bus } from '../../bus';
import { NBTDataNode } from '../../lib/NBTDataNode';
import NBTSheetIcon from '../NBTSheetIcon';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

interface XArrayPanelProps {
  bus: Bus;
  node: NBTDataNode;
}

function XArrayPanel({
  bus,
  node,
}: XArrayPanelProps) {
  const [ form ] = useForm<{
    keyInParent: string | number,
    value: string,
    type: string,
  }>();

  const currentKey = useWatch('keyInParent', form);
  const currentValue = useWatch('value', form);

  const { ref, width, height } = useResizeObserver();

  const [ buttonPos, setButtonPos ] = useState<{ left?: string, top: string }>({ top: '0' });
  const [ minMax, setMinMax ] = useState<[ number, number ]>([ 0, 0 ]);
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

  const modified = (currentKey !== initValues.keyInParent) || (`${currentValue}` !== `${initValues.value}`);

  useEffect(() => {
    const values = {
      keyInParent: node.keyInParent,
      value: (node.structedTag as StructedNBTByteArrayTag | StructedNBTIntArrayTag).value.join('\n') + '\n',
      type: startCase(node.valueType),
    };
    setInitValues(values);
    form.setFieldsValue(values);

    if (node.valueType === 'byte_array') {
      setMinMax([ -128, 127 ]);
    } else if (node.valueType === 'int_array') {
      setMinMax([ -2147483648, 2147483647 ]);
    } else {
      setMinMax([ 0, 0 ]);
      message.error('Unknown value type');
    }
  }, [ node.key, node.valueType, bus.currentFileUUID, bus.currentModifyVersion ]);

  const [ formHeight, setFormHeight ] = useState<number>(0);
  function updateHeight() {
    const f = document.getElementById('xarray-panel-form');
    const temp = document.getElementById('monaco-form-wrapper');
    const item = temp.getElementsByClassName('ant-form-item')[0];

    const top = item.clientHeight + item.getBoundingClientRect().top + 10;
    setButtonPos({
      top: `${top}px`,
    });
    setFormHeight(top - f.getBoundingClientRect().top + 40);
    console.log(item.clientHeight, item.getBoundingClientRect().top);
  }

  useEffect(() => {
    updateHeight();
  }, [ height ]);

  const keyInput = (
    <Form.Item
      label={typeof node.keyInParent === 'string' ? 'Key' : 'Index'}
      name="keyInParent"
      rules={[{
        validator: (_, value) => {
          if (typeof node.keyInParent === 'number') {
            return Promise.resolve();
          }

          for (let i = 0; i < node.parentNode.children.length; i++) {
            const child = node.parentNode.children[i] as NBTDataNode;
            if (child.key === node.key) continue;
            if (child.keyInParent === value) {
              return Promise.reject('Key already exists');
            }
          }

          return Promise.resolve();
        },
      }]}
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
        const splited = value.trimEnd().split('\n').map(v => v.trim()).map(n => {
          return Number(n);
        });
        node.structedTag.value = splited;
      }

      bus.currentModifyVersion++;
      setSubmitting(false);

      console.log(keyInParent, value);
    }).catch((e: ValidateErrorEntity) => {
      if (e.errorFields) {
        message.error(e.errorFields[0].errors[0]);
      } else {
        const err = e as any as Error;
        message.error(err.message);
        console.error(err);
      }

      setSubmitting(false);
    });
  };

  return (
    <Form
      id="xarray-panel-form"
      form={form}
      layout="vertical"
      initialValues={initValues}
      disabled={submitting}
      style={{ height: `${formHeight}px` }}
    >
      <Form.Item label="Type" name="type">
        <Input addonBefore={<NBTSheetIcon type={node.valueType} />} disabled />
      </Form.Item>

      {keyInput}

      <div id="monaco-form-wrapper" ref={ref} style={{ height: 'calc(100vh - 420px)' }}>
        <Form.Item
          id="monaco-form-wrapper-item"
          label="Raw Value"
          name="value"
          rules={[{
            validator: (_, value: string) => {
              const splited = value.trimEnd().split('\n').map(v => v.trim());
              for (let i = 0; i < splited.length; i++) {
                const v = splited[i];
                if (!/^-?\d+$/.test(v)) {
                  return Promise.reject(new Error(`Invalid value at line ${i + 1}: "${v}".`));
                }

                let n;
                try {
                  n = BigInt(v);
                } catch (e) {
                  return Promise.reject(new Error(`Invalid value at line ${i + 1}: "${v}".`));
                }

                if (n < minMax[0] || n > minMax[1]) {
                  return Promise.reject(new Error(`Invalid value at line ${i + 1}: "${v}". (Should be between ${minMax[0]} and ${minMax[1]}.)`));
                }
              }

              return Promise.resolve();
            },
          }]}
        >
          <MonacoEditor onChange={() => { updateHeight(); }} theme="vs-dark" width={width - 2} height={height - 35} />
        </Form.Item>
      </div>

      <Form.Item style={{ position: 'absolute', ...buttonPos }}>
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

export default XArrayPanel;
