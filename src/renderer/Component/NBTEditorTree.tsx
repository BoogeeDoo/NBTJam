import { Divider, Tag, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import { ReactNode, useEffect, useState } from "react";

import { buildTreeData, findDataNodeByKey, MAX_CHILDREN_COUNT, NBTDataNode } from "../lib/NBTDataNode";
import { Bus } from "../bus";

import './NBTEditorTree.css';
import NBTSheetIcon from "./NBTSheetIcon";

function pad3(num: number): string {
  return num < 10 ? `00${num}` : num < 100 ? `0${num}` : num.toString();
}

function ellipsisMiddle(text: ReactNode, maxLength: number): ReactNode {
  if (typeof text !== 'string') return text;

  if (text.length <= maxLength) {
    return text;
  }

  return (
    <>
      {text.substr(0, maxLength / 2)}
      <span className="nbt-tree-ellipsis">...</span>
      {text.substr(text.length - maxLength / 2)}
    </>
  );
}

const renderNode = (node: NBTDataNode) => {
  let keyInParent = node.keyInParent;
  if (node.dummyMoreNode) keyInParent = '...';
  const prefixStr = ellipsisMiddle(
    (typeof node.keyInParent === 'string') ? keyInParent as string : pad3(keyInParent as number),
    20);
  const prefix = typeof node.keyInParent === 'string' ?
    (<>{prefixStr}: </>) :
    (<Tag color="purple">{prefixStr}</Tag>);
  let title: typeof node.title | string;

  if (node.dummyMoreNode) {
    title = `We shows at most ${MAX_CHILDREN_COUNT} children.`;
  } else if (node.isLeaf) {
    if (node.valueType === 'string') {
      const temp = ellipsisMiddle(node.title as ReactNode, 20);
      title = (
        <>
          <span className="nbt-tree-quote nbt-tree-left-quote">"</span>{temp}<span className="nbt-tree-quote nbt-tree-right-quote">"</span>
        </>
      );
    } else {
      title = node.title;
    }
  } else {
    switch (node.valueType) {
      case 'compound':
      case 'byte_array':
      case 'int_array': {
        const unit = node.valueType === 'compound' ?
          (`entr${node.realChildrenCount !== 1 ? 'ies' : 'y'}`) :
          (`element${node.realChildrenCount !== 1 ? 's' : ''}`);

        title = (<Tag color="lime">{node.realChildrenCount} {unit}</Tag>);
        break;
      }

      case 'list': {
        const unit = `element${node.realChildrenCount !== 1 ? 's' : ''}`;
        title = (
          <>
            <Tag color="lime" style={{ marginRight: '0' }}>{node.realChildrenCount} {unit}</Tag>
            <Divider type="vertical" />
            <NBTSheetIcon type={node.childrenType} />
          </>
        );
        break;
      }

      default: return 'Unknown';
    }
  }

  return (
    <>
      {prefix}{title}
    </>
  );
};

function NBTEditorTree({
  bus,
  currentFileUUID,
  currentModifyVersion,
}: {
  bus: Bus;
  currentFileUUID: string | null;
  currentModifyVersion: number;
}) {
  const [ treeData, setTreeData ] = useState<DataNode[]>([]);

  useEffect(() => {
    const data: DataNode[] = [];
    const { root } = bus;
    for (let i = 0; i < root.length; i++) {
      data.push(buildTreeData(root[i].key, i, root, root[i], ''));
    }

    const selectedKey = bus.selectedNode?.key;
    if (!selectedKey) {
      bus.selectedNode = null;
    } else {
      bus.selectedNode = null;
      for (let i = 0; i < data.length; i++) {
        const node = findDataNodeByKey(data[i] as NBTDataNode, selectedKey as string);
        if (node) {
          bus.selectedNode = node;
          break;
        }
      }
    }

    setTreeData(data);
  }, [ currentFileUUID, currentModifyVersion ]);

  return (
    <>
      <Tree
        showLine={{ showLeafIcon: false }}
        showIcon={true}
        treeData={treeData}
        virtual={true}
        titleRender={renderNode}
        onSelect={(selectedKeys, info) => {
          if (!info.selected) {
            bus.selectedNode = null;
          } else {
            bus.selectedNode = info.node as any as NBTDataNode;
          }
        }}
      />
      <div style={{ display: 'none' }}>{currentModifyVersion}</div>
    </>
  );
}

export default NBTEditorTree;
