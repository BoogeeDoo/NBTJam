import { DataNode } from "antd/lib/tree";

import NBTSheetIcon from "../Component/NBTSheetIcon";

export const MAX_CHILDREN_COUNT = -1;

let dummy: StructedNBTTag;

export interface NBTDataNode extends DataNode {
  structedTag?: StructedNBTByteTag;
  parentStructedTag?: StructedNBTByteTag | StructedNBTRoot;
  keyInParent?: string | number;
  valueType?: typeof dummy.type;
  childrenType?: typeof dummy.type;
  realChildrenCount?: number;
  dummyMoreNode?: boolean;
}

function createDummyNoMoreNode(
  parentNode: StructedNBTTag,
  path: string,
  key: string | number,
  leafKey: string | number,
): NBTDataNode {
  const icon = <NBTSheetIcon type="end" />;
  return {
    icon,
    key: `t-${path}-${key}-${leafKey}`,
    title: '',
    structedTag: null,
    parentStructedTag: parentNode,
    valueType: 'end',
    dummyMoreNode: true,
    isLeaf: true,
  };
}

function createListChildrenNodes(
  path: string,
  key: string | number,
  node: StructedNBTListTag,
): NBTDataNode[] {
  const children: NBTDataNode[] = [];
  for (let i = 0; i < node.value.length; i++) {
    if (MAX_CHILDREN_COUNT === -1 || i < MAX_CHILDREN_COUNT - 1) {
      children.push(buildTreeData(i, node, node.value[i], `${path}-${key}`));
    } else {
      children.push(createDummyNoMoreNode(node, path, key, i));
      break;
    }
  }
  return children;
}

function createXArrayChildrenNodes(
  path: string,
  key: string | number,
  node: StructedNBTByteArrayTag | StructedNBTIntArrayTag,
): NBTDataNode[] {
  const children: NBTDataNode[] = [];
  const valueType = node.type.replace(/_.*$/, '') as typeof dummy.type;
  const icon = <NBTSheetIcon type={valueType} />;
  for (let i = 0; i < node.value.length; i++) {
    if (MAX_CHILDREN_COUNT === -1 || i < MAX_CHILDREN_COUNT - 1) {
      children.push({
        icon,
        key: `t-${path}-${key}-${i}`,
        title: node.value[i],

        parentStructedTag: node,
        keyInParent: i,

        valueType,

        isLeaf: true,
      });
    } else {
      children.push(createDummyNoMoreNode(node, path, key, i));
      break;
    }
  }

  return children;
}

function createCompoundChildrenNodes(
  path: string,
  key: string | number,
  node: StructedNBTCompoundTag,
): NBTDataNode[] {
  const children: NBTDataNode[] = [];
  const nextPath = `${path}-${key}`;
  for (const [k, v] of Object.entries(node.value)) {
    if (MAX_CHILDREN_COUNT === -1 || children.length < MAX_CHILDREN_COUNT - 1) {
      children.push(buildTreeData(k, node, v, nextPath));
    } else {
      children.push(createDummyNoMoreNode(node, path, key, k));
      break;
    }
  }
  return children;
}

function createDataNode(
  path: string,
  parentStructedTag: StructedNBTByteTag | StructedNBTRoot,
  key: string | number,
  valueType: typeof dummy.type,
  content: string,
  isLeaf: boolean,
  children?: NBTDataNode[],
  realChildrenCount?: number,
  childType?: typeof dummy.type,
): NBTDataNode {
  const ret: Partial<NBTDataNode> = {
    key: `t-${path}-${key}`,
    title: content,
    icon: <NBTSheetIcon type={valueType} />,
    isLeaf,
    parentStructedTag: parentStructedTag,
    keyInParent: key,
    valueType,
  };

  if (childType) {
    ret.childrenType = childType;
  }

  if (children) {
    ret.realChildrenCount = realChildrenCount;
    ret.children = children;
  }

  return ret as NBTDataNode;
}

export function buildTreeData(
  key: string | number,
  parent: StructedNBTTag | StructedNBTRoot,
  node: StructedNBTTag,
  path: string,
): NBTDataNode {
  switch (node.type) {
    case 'byte':
    case 'short':
    case 'int':
    case 'long':
    case 'float':
    case 'double':
    case 'string':
    case 'end':
      return createDataNode(
        path,
        parent,
        key,
        node.type,
        node.value.toString(),
        true);

    case 'byte_array':
    case 'int_array':
      return createDataNode(
        path,
        parent,
        key,
        node.type,
        '',
        false,
        createXArrayChildrenNodes(path, key, node),
        node.value.length);

    case 'compound':
      return createDataNode(
        path,
        parent,
        key,
        node.type,
        '',
        false,
        createCompoundChildrenNodes(path, key, node),
        Object.keys(node.value).length);

    case 'list': {
      return createDataNode(
        path,
        parent,
        key,
        node.type,
        '',
        false,
        createListChildrenNodes(path, key, node),
        node.value.length,
        node.childrenType);
      break;
    }

    default:
      throw new Error(`Unknown type: ${(node as StructedNBTTag).type}`);
  }
}
