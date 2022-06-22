import { DataNode } from "antd/lib/tree";

import NBTSheetIcon from "../Component/NBTSheetIcon";

export const MAX_CHILDREN_COUNT: number = -1;

let dummy: StructedNBTTag;

export interface NBTDataNode extends DataNode {
  idx: number;

  parentNode?: NBTDataNode;

  structedTag?: StructedNBTTag;
  parentStructedTag?: StructedNBTTag | StructedNBTRoot;

  keyInParent?: string | number;

  valueType?: typeof dummy.type;
  childrenType?: typeof dummy.type;

  realChildrenCount?: number;
  dummyMoreNode?: boolean;

  width?: number;
}

export function findDataNodeByKey(node: NBTDataNode | NBTDataNode[], key: string): NBTDataNode | null {
  if (Array.isArray(node)) {
    for (const n of node) {
      const ret = findDataNodeByKey(n, key);
      if (ret) {
        return ret;
      }
    }
    return null;
  }

  if (node.key === key) {
    return node;
  }

  for (const child of node.children || []) {
    const result = findDataNodeByKey(child as NBTDataNode, key);
    if (result) return result;
  }

  return null;
}

export function buildDataNodeKey(node: NBTDataNode): string {
  let key = node.keyInParent;
  let parent = node.parentNode;

  while (parent) {
    key = `${parent.keyInParent}-${key}`;
    parent = parent.parentNode;
  }

  return `t--${key}`;
}

function createDummyNoMoreNode(
  parentNode: StructedNBTTag,
  path: string,
  idx: number,
): NBTDataNode {
  const icon = <NBTSheetIcon type="end" />;
  return {
    icon,
    key: `t-${path}-${idx}`,
    idx,
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
  idx: number,
  node: StructedNBTListTag,
): NBTDataNode[] {
  const children: NBTDataNode[] = [];
  for (let i = 0; i < node.value.length; i++) {
    if (MAX_CHILDREN_COUNT === -1 || i < MAX_CHILDREN_COUNT - 1) {
      children.push(buildTreeData(i, i, node, node.value[i], `${path}-${idx}`));
    } else {
      children.push(createDummyNoMoreNode(node, `${path}-${idx}`, i));
      break;
    }
  }
  return children;
}

function createXArrayChildrenNodes(
  path: string,
  idx: number,
  node: StructedNBTByteArrayTag | StructedNBTIntArrayTag,
): NBTDataNode[] {
  const children: NBTDataNode[] = [];
  const valueType = node.type.replace(/_.*$/, '') as typeof dummy.type;
  const icon = <NBTSheetIcon type={valueType} />;
  for (let i = 0; i < node.value.length; i++) {
    if (MAX_CHILDREN_COUNT === -1 || i < MAX_CHILDREN_COUNT - 1) {
      children.push({
        icon,
        idx: i,
        key: `t-${path}-${idx}-${i}`,
        title: node.value[i],

        parentStructedTag: node,
        keyInParent: i,

        valueType,

        isLeaf: true,
      });
    } else {
      children.push(createDummyNoMoreNode(node, `${path}-${idx}`, i));
      break;
    }
  }

  return children;
}

function createCompoundChildrenNodes(
  path: string,
  idx: number,
  node: StructedNBTCompoundTag,
): NBTDataNode[] {
  const children: NBTDataNode[] = [];
  const nextPath = `${path}-${idx}`;
  let i = 0;
  for (const tag of node.value) {
    if (MAX_CHILDREN_COUNT === -1 || children.length < MAX_CHILDREN_COUNT - 1) {
      children.push(buildTreeData(tag.key, i, node, tag, nextPath));
    } else {
      children.push(createDummyNoMoreNode(node, path, i));
      break;
    }

    i++;
  }

  return children;
}

function createDataNode(
  parentNode: NBTDataNode | null,
  path: string,
  parentStructedTag: StructedNBTTag | StructedNBTRoot,
  key: string | number,
  idx: number,
  valueType: typeof dummy.type,
  content: string,
  isLeaf: boolean,
  children?: NBTDataNode[],
  realChildrenCount?: number,
  childType?: typeof dummy.type,
): NBTDataNode {
  let structedTag: StructedNBTTag | null = null;
  const parentArray = Array.isArray(parentStructedTag) ?
    parentStructedTag :
    Array.isArray(parentStructedTag.value) ?
      parentStructedTag.value :
      [];
  if (typeof key === 'number') {
    structedTag = parentArray[key];
  } else {
    for (const tag of parentArray) {
      if (tag.key === key) {
        structedTag = tag;
        break;
      }
    }
  }

  const ret: Partial<NBTDataNode> = {
    idx,
    key: `t-${path}-${idx}`,
    title: content,
    icon: <NBTSheetIcon type={valueType} />,
    isLeaf,
    parentStructedTag: parentStructedTag,
    keyInParent: key,
    valueType,
    structedTag,
    parentNode,
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
  idx: number,
  parent: StructedNBTTag | StructedNBTRoot,
  node: StructedNBTTag,
  path: string,
  parentNode: NBTDataNode | null = null,
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
        parentNode,
        path,
        parent,
        key,
        idx,
        node.type,
        node.value.toString(),
        true);

    case 'byte_array':
    case 'int_array': {
      const ret = createDataNode(
        parentNode,
        path,
        parent,
        key,
        idx,
        node.type,
        '',
        false,
        createXArrayChildrenNodes(path, idx, node),
        node.value.length);

      for (const child of ret.children) {
        (child as NBTDataNode).parentNode = ret;
      }

      return ret;
    }

    case 'compound': {
      const ret = createDataNode(
        parentNode,
        path,
        parent,
        key,
        idx,
        node.type,
        '',
        false,
        createCompoundChildrenNodes(path, idx, node),
        Object.keys(node.value).length);

      for (const child of ret.children) {
        (child as NBTDataNode).parentNode = ret;
      }

      return ret;
    }

    case 'list': {
      const ret = createDataNode(
        parentNode,
        path,
        parent,
        key,
        idx,
        node.type,
        '',
        false,
        createListChildrenNodes(path, idx, node),
        node.value.length,
        node.childrenType);

      for (const child of ret.children) {
        (child as NBTDataNode).parentNode = ret;
      }

      return ret;
    }

    default:
      throw new Error(`Unknown type: ${(node as StructedNBTTag).type}`);
  }
}
