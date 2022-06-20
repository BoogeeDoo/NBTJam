import { Input, InputNumber } from 'antd';
import { useEffect, useState } from 'react';

import { Bus } from '../../bus';
import metaTypePanel from './MetaTypePanel';
import { NBTDataNode } from '../../lib/NBTDataNode';

const encoder = new TextEncoder();

const e: {
  [key: string]: (props: { bus: Bus, node: NBTDataNode }) => JSX.Element;
} = {};

function integerInputNumber(type: 'byte' | 'short' | 'int', min: number, max: number) {
  return () => (
    <InputNumber
      min={min}
      max={max}
      style={{ width: '100%' }}
      formatter={(value: number | string) => {
        return `${value}`.replace(/\..*/, '');
      }}
      parser={(value: string) => {
        return parseInt(value, 10);
      }}
    />
  );
}

function floatInputNumber(type: 'float' | 'double', min: number, max: number) {
  return () => (
    <InputNumber
      min={min}
      max={max}
      style={{ width: '100%' }}
    />
  );
}

function metaTypePanelOptions(type: string) {
  switch (type) {
    case 'byte':
      return {
        valueInput: integerInputNumber(type, -128, 127),
        valueInputTooltip: 'A signed integral type. Sometimes used for booleans. Between -128 and 127.',
      };

    case 'short':
      return {
        valueInput: integerInputNumber(type, -32768, 32767),
        valueInputTooltip: 'A signed integral type. Between -32,768 and 32,767.',
      };

    case 'int':
      return {
        valueInput: integerInputNumber(type, -2147483648, 2147483647),
        valueInputTooltip: 'A signed integral type. Between -2,147,483,648 and 2,147,483,647.',
      };

    case 'double':
      return {
        valueInput: floatInputNumber(type, -1.7976931348623157e+308, 1.7976931348623157e+308),
        valueInputTooltip: 'A signed floating point type.	Between -1.7976931348623157e+308 and 1.7976931348623157e+308.',
      };

    case 'float':
      return {
        valueInput: floatInputNumber(type, -3.4028234663852886e+38, 3.4028234663852886e+38),
        valueInputTooltip: 'A signed floating point type.	Between -3.4028234663852886e+38 and 3.4028234663852886e+38.',
      };

    default:
      return {
        valueInput: () => <Input />,
        valueInputTooltip: '',
      };
  }
}

e.byte = metaTypePanel(metaTypePanelOptions('byte'));
e.short = metaTypePanel(metaTypePanelOptions('short'));
e.int = metaTypePanel(metaTypePanelOptions('int'));
e.double = metaTypePanel(metaTypePanelOptions('double'));
e.float = metaTypePanel(metaTypePanelOptions('float'));

e.long = metaTypePanel({
  valueInputTooltip: 'A signed integral type. Between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807.',
  valueInput: ({ form }) => {
    const [ value, setValue ] = useState('');
    useEffect(() => {
      setValue(form.getFieldValue('value'));
    }, [ form.getFieldValue('value') ]);

    return (
      <Input
        onChange={e => {
          const inputValue = e.target.value;
          if (!inputValue.length) {
            setValue('');
            return;
          }

          if (inputValue === '-') {
            setValue('-');
            return;
          }

          if (!/^-?\d*$/.test(inputValue)) {
            form.setFieldsValue({ value });
            return;
          }

          let b: bigint;
          try {
            b = BigInt(inputValue);
          } catch (e) {
            form.setFieldsValue({ value });
            return;
          }

          // -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
          if (b < BigInt('-9223372036854775808') || b > BigInt('9223372036854775807')) {
            form.setFieldsValue({ value });
            return;
          }

          setValue(e.target.value);
          form.setFieldsValue({ value: e.target.value });
        }}
      />
    );
  },
});

e.string = metaTypePanel({
  valueInputTooltip: 'A UTF-8 string. It has a size, rather than being null terminated.	65,535 bytes interpretable as UTF-8.',
  valueInput: ({ form }) => {
    const [ value, setValue ] = useState(form.getFieldValue('value'));
    return (
      <Input.TextArea
        showCount={{
          formatter: ({ maxLength }) => {
            const byteLength = encoder.encode(form.getFieldValue('value')).length;
            return `${byteLength} / ${maxLength}`;
          }
        }}
        allowClear={true}
        maxLength={65535}
        autoSize={{ maxRows: 10 }}
        onChange={e => {
          const byteLength = encoder.encode(e.target.value).length;
          if (byteLength > 65535) {
            form.setFieldsValue({ value });
            return;
          }

          setValue(e.target.value);
          form.setFieldsValue({ value: e.target.value });
        }}
      />
    );
  },
});

export default e;
