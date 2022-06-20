import { Card, Empty } from 'antd';
import { useEffect, useState } from 'react';

import { Bus } from '../bus';
import NBTSheetIcon from './NBTSheetIcon';
import NodeDataPanels from './NodeDataPanel';

function NBTEditorPageRightPanel({
  bus,
  currentFileUUID,
  currentModifyVersion,
}: {
  bus: Bus,
  currentFileUUID: string | null,
  currentModifyVersion: number,
}) {
  const [ inner, setInner ] = useState<JSX.Element | null>(<>-</>);
  useEffect(() => {
    if (!bus.selectedNode) {
      setInner(<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="">No node selected.</Empty>);
      return;
    }

    const type = bus.selectedNode.valueType;
    const Mod = NodeDataPanels[type];
    if (!Mod) {
      setInner(<div>Not supported yet</div>);
      return;
    }

    setInner(<Mod bus={bus} node={bus.selectedNode} />);
  }, [ currentFileUUID, currentModifyVersion, bus.selectedNode ]);

  return (
    <div style={{ minWidth: '300px', padding: '10px' }}>
      <Card title={<>{<NBTSheetIcon type={bus.selectedNode?.valueType || 'end'} />} Node Data</>}>
        {inner}
      </Card>
    </div>
  );
}

export default NBTEditorPageRightPanel;
