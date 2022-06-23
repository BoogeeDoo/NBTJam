import { Spin } from 'antd';
import { useState } from 'react';

import { Bus } from "./bus";
import NBTEditorPage from "./Component/NBTEditorPage";
import { NBTDataNode } from './lib/NBTDataNode';

function App({ bus }: { bus: Bus }) {
  const [ currentFileUUID, setCurrentFileUUID ] = useState<null | string>(null);
  const [ currentFilename, setCurrentFilename ] = useState<null | string>(null);
  const [ currentModifyVersion, setCurrentModifyVersion ] = useState<number>(0);
  const [ selectedNode, setSelectedNode ] = useState<null | NBTDataNode>(null);
  const [ loading, setLoading ] = useState<string>('');

  bus.updateCurrentFileUUIDSetter([ currentFileUUID, setCurrentFileUUID ]);
  bus.updateCurrentFilenameSetter([ currentFilename, setCurrentFilename ]);
  bus.updateCurrentModifiedSetter([ currentModifyVersion, setCurrentModifyVersion ]);
  bus.updateSelectedNodeSetter([ selectedNode, setSelectedNode ]);
  bus.updateLoadingSetter([ loading, setLoading ]);

  return (
    <Spin spinning={!!loading} tip={loading}>
      <div style={{ height: '100vh' }}>
        <NBTEditorPage bus={bus} currentModifyVersion={currentModifyVersion} currentFileUUID={currentFileUUID} />
      </div>
    </Spin>
  );
}

export default App;
