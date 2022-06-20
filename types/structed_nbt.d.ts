declare interface StructedNBTByteTag {
  tag: 1;
  type: 'byte';
  value: number;
}

declare interface StructedNBTShortTag {
  tag: 2;
  type: 'short';
  value: number;
}

declare interface StructedNBTIntTag {
  tag: 3;
  type: 'int';
  value: number;
}

declare interface StructedNBTLongTag {
  tag: 4;
  type: 'long';
  value: string;
}

declare interface StructedNBTFloatTag {
  tag: 5;
  type: 'float';
  value: number;
}

declare interface StructedNBTDoubleTag {
  tag: 6;
  type: 'double';
  value: number;
}

declare interface StructedNBTByteArrayTag {
  tag: 7;
  type: 'byte_array';
  value: number[];
}

declare interface StructedNBTStringTag {
  tag: 8;
  type: 'string';
  value: string;
}

declare interface StructedNBTListTag {
  tag: 9;
  type: 'list';
  childrenType: 'byte' | 'short' | 'int' | 'long' | 'float' | 'double' | 'byte_array' | 'string' | 'list' | 'compound' | 'int_array' | 'end';
  value: StructNBTTag[];
}

declare interface StructedNBTCompoundTag {
  tag: 10;
  type: 'compound';
  value: {
    [key: string]: StructNBTTag;
  }
}

declare interface StructedNBTIntArrayTag {
  tag: 11;
  type: 'int_array';
  value: number[];
}

declare interface StructedNBTEndTag {
  tag: 0,
  type: 'end';
  value: null;
}

declare type StructedNBTTag = StructedNBTByteTag | StructedNBTShortTag |
  StructedNBTIntTag | StructedNBTLongTag | StructedNBTFloatTag |
  StructedNBTDoubleTag | StructedNBTByteArrayTag | StructedNBTStringTag |
  StructedNBTListTag | StructedNBTCompoundTag | StructedNBTIntArrayTag |
  StructedNBTEndTag;

declare interface StructedNBTRoot {
  [key: string]: StructNBTTag;
}
