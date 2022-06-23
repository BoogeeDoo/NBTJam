import { Divider, Tag, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import { ReactNode, useEffect, useRef, useState } from "react";
import { uniq } from 'lodash';

import { buildTreeData, findDataNodeByKey, MAX_CHILDREN_COUNT, NBTDataNode } from "../lib/NBTDataNode";
import { Bus } from "../bus";

import './NBTEditorTree.css';
import NBTSheetIcon from "./NBTSheetIcon";
import { Key } from "antd/lib/table/interface";

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
      {text.substr(0, (maxLength / 2) - 1)}
      <span className="nbt-tree-ellipsis">...</span>
      {text.substr((text.length - maxLength / 2) + 1)}
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
    title = <span style={{ color: '#ccc' }}>We shows at most {MAX_CHILDREN_COUNT} children.</span>;
  } else if (node.isLeaf) {
    if (node.valueType === 'string') {
      const temp = ellipsisMiddle(node.title as ReactNode, 20);
      title = (
        <>
          <span className="nbt-tree-quote nbt-tree-left-quote">"</span>
          <span style={{ color: '#798953' }}>{temp}</span>
          <span className="nbt-tree-quote nbt-tree-right-quote">"</span>
        </>
      );
    } else {
      title = <span style={{ color: '#d28445' }}>{`${node.title}`}</span>;
    }
  } else {
    switch (node.valueType) {
      case 'compound':
      case 'byte_array':
      case 'int_array': {
        const unit = node.valueType === 'compound' ?
          (`entr${node.realChildrenCount !== 1 ? 'ies' : 'y'}`) :
          (`element${node.realChildrenCount !== 1 ? 's' : ''}`);
        const prefix = (
          <span style={{ color: '#b0b0b0' }}>
            {node.valueType === 'compound' ? '{}' : '[]'}
          </span>
        );

        title = (<>{prefix} <Tag color="default">{node.realChildrenCount} {unit}</Tag></>);
        break;
      }

      case 'list': {
        const unit = `element${node.realChildrenCount !== 1 ? 's' : ''}`;
        title = (
          <>
            <span style={{ color: '#b0b0b0' }}>[]</span> <Tag color="default" style={{ marginRight: '0' }}>{node.realChildrenCount} {unit}</Tag>
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
    <span aria-label={node.key as string}>
      {prefix}{title}
    </span>
  );
};

function NBTEditorTree({
  bus,
  currentFileUUID,
  currentModifyVersion,
  height,
}: {
  bus: Bus;
  currentFileUUID: string | null;
  currentModifyVersion: number;
  height: number;
}) {
  const [ treeData, setTreeData ] = useState<DataNode[]>([]);
  const [ expandedNodes, setExpandedNodes ] = useState<NBTDataNode[]>([]);

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

  const ref = useRef<HTMLDivElement>(null);
  if (ref.current) {
    // To solve the issue of the horizontal scrollbar. But it still not perfect.
    ref.current.addEventListener('DOMSubtreeModified', (function () {
      resetTreeWidth(this);
    }).bind(ref.current));
  }

  function resetTreeWidth(wrapper: HTMLDivElement) {
    const holder = wrapper.querySelector('.ant-tree-list-holder > div') as HTMLDivElement;

    // Calculate the children width.
    const children = wrapper.querySelectorAll('.ant-tree-treenode') as NodeListOf<HTMLDivElement>;
    for (const child of children) {
      const includeKeySpan = child.querySelector('.ant-tree-title > span') as HTMLSpanElement;
      if (!includeKeySpan) continue;
      const key = includeKeySpan.ariaLabel;
      const node = findDataNodeByKey(treeData as NBTDataNode[], key);
      if (!node || node.width) continue;

      node.width = child.clientWidth;
    }

    let maxWidth = 0;
    for (const node of expandedNodes) {
      if (node.width && node.width > maxWidth) maxWidth = node.width;
    }

    if (!maxWidth) return;
    holder.style.width = `${maxWidth}px`;
  }

  return (
    <div ref={ref} id="nbt-tree">
      <Tree
        showLine={{ showLeafIcon: false }}
        showIcon={true}
        treeData={treeData}
        virtual={true}
        height={height}
        titleRender={renderNode}
        selectedKeys={[ bus.selectedNode?.key ]}
        onSelect={(selectedKeys, info) => {
          if (!info.selected) {
            bus.selectedNode = null;
          } else {
            bus.selectedNode = info.node as any as NBTDataNode;
          }
        }}
        onExpand={(expandedKeys) => {
          const ret: NBTDataNode[] = [ ...treeData as NBTDataNode[] ];
          for (const key of expandedKeys) {
            const node = findDataNodeByKey(treeData as NBTDataNode[], key as string);
            if (!node || !expandedKeys.includes(node.parentNode?.key)) continue;

            ret.push(node);
            for (let i = 0; i < node.children.length; i++) {
              ret.push(node.children[i] as NBTDataNode);
            }
          }

          setExpandedNodes(uniq(ret));
        }}
      />
      <div style={{ display: 'none' }}>{currentModifyVersion}</div>
    </div>
  );
}

export default NBTEditorTree;
