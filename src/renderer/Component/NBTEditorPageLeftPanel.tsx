import { Button, Empty } from 'antd';

import { Bus } from '../bus';
import NBTEditorTree from './NBTEditorTree';

function EditorPageLeftPanel({
  bus,
  currentFileUUID,
  currentModifyVersion,
  height,
}: {
  bus: Bus,
  currentFileUUID: string | null,
  currentModifyVersion: number,
  height: number,
}) {
  if (currentFileUUID === null) {
    return (
      <Empty style={{ userSelect: 'none', position: 'relative', top: 'calc(50% - 80px)' }} description="">
        <Button type="primary" onClick={async () => {
          return bus.openFile();
        }}>Open NBT File</Button>
      </Empty>
    );
  }

  return (
    <NBTEditorTree
      height={height}
      currentFileUUID={currentFileUUID}
      currentModifyVersion={currentModifyVersion}
      bus={bus}
    />
  );
}

export default EditorPageLeftPanel;
