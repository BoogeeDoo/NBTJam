declare interface BaseStructedNBTByteTag {
  key?: string;
  tag: number;
  type: string;
  value: any;
}

declare interface StructedNBTByteTag extends BaseStructedNBTByteTag {
  tag: 1;
  type: 'byte';
  value: number;
}

declare interface StructedNBTShortTag extends BaseStructedNBTByteTag {
  tag: 2;
  type: 'short';
  value: number;
}

declare interface StructedNBTIntTag extends BaseStructedNBTByteTag {
  tag: 3;
  type: 'int';
  value: number;
}

declare interface StructedNBTLongTag extends BaseStructedNBTByteTag {
  tag: 4;
  type: 'long';
  value: string;
}

declare interface StructedNBTFloatTag extends BaseStructedNBTByteTag {
  tag: 5;
  type: 'float';
  value: number;
}

declare interface StructedNBTDoubleTag extends BaseStructedNBTByteTag {
  tag: 6;
  type: 'double';
  value: number;
}

declare interface StructedNBTByteArrayTag extends BaseStructedNBTByteTag {
  tag: 7;
  type: 'byte_array';
  value: number[];
}

declare interface StructedNBTStringTag extends BaseStructedNBTByteTag {
  tag: 8;
  type: 'string';
  value: string;
}

declare interface StructedNBTListTag extends BaseStructedNBTByteTag {
  tag: 9;
  type: 'list';
  childrenType: 'byte' | 'short' | 'int' | 'long' | 'float' | 'double' | 'byte_array' | 'string' | 'list' | 'compound' | 'int_array' | 'end';
  value: StructNBTTag[];
}

declare interface StructedNBTCompoundTag extends BaseStructedNBTByteTag {
  tag: 10;
  type: 'compound';
  value: StructNBTTag[];
}

declare interface StructedNBTIntArrayTag extends BaseStructedNBTByteTag {
  tag: 11;
  type: 'int_array';
  value: number[];
}

declare interface StructedNBTEndTag extends BaseStructedNBTByteTag {
  tag: 0,
  type: 'end';
  value: null;
}

declare type StructedNBTTag = StructedNBTByteTag | StructedNBTShortTag |
  StructedNBTIntTag | StructedNBTLongTag | StructedNBTFloatTag |
  StructedNBTDoubleTag | StructedNBTByteArrayTag | StructedNBTStringTag |
  StructedNBTListTag | StructedNBTCompoundTag | StructedNBTIntArrayTag |
  StructedNBTEndTag;

declare type StructedNBTRoot = StructedNBTTag[];
