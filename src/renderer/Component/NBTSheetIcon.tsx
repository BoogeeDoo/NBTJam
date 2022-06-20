import { useEffect, useState } from "react";
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import imgUrl from '../assets/Nbtsheet.webp';
console.log(imgUrl);

let dummy: StructedNBTTag;

const positionMap = {
  'byte': [ '0', '0' ],
  'short': [ '-100%', '-100%' ],
  'int': [ '-300%', '0' ],
  'long': [ '0', '-100%' ],
  'float': [ '-200%', '0' ],
  'double': [ '-100%', '0' ],
  'string': [ '-200%', '-100%' ],
  'byte_array': [ '0', '-200%' ],
  'int_array': [ '-100%', '-200%' ],
  'compound': [ '-300%', '-100%' ],
  'list': [ '-200%', '-200%' ],
  'end': [ '-100%', '-300%' ],
};

function sevGenerator(type: typeof dummy.type) {
  return (props: CustomIconComponentProps) => {
    return (
      <div
        style={{
          width: props.width,
          height: props.height,
          backgroundImage: `url("${imgUrl}")`,
          backgroundSize: '400%',
          backgroundPositionX: positionMap[type][0],
          backgroundPositionY: positionMap[type][1],
        }}
      />
    );
  };
}

function NBTSheetIcon(props: {
  type: typeof dummy.type;
} & Partial<CustomIconComponentProps>) {
  const [ iconProps, setIconProps ] = useState<CustomIconComponentProps>(props as CustomIconComponentProps);
  useEffect(() => {
    const newProps = { ...props } as CustomIconComponentProps;
    delete (newProps as any).type;
    setIconProps(newProps);
  }, [ props.type ]);

  return (
    <Icon component={sevGenerator(props.type)} {...iconProps} />
  );
}

export default NBTSheetIcon;
