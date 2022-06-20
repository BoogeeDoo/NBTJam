import { useState } from 'react';

import { Bus } from "./bus";
import NBTEditorPage from "./Component/NBTEditorPage";
import { NBTDataNode } from './lib/NBTDataNode';

function App({ bus }: { bus: Bus }) {
  const [ currentFileUUID, setCurrentFileUUID ] = useState<null | string>(null);
  const [ currentFilename, setCurrentFilename ] = useState<null | string>(null);
  const [ currentModifyVersion, setCurrentModifyVersion ] = useState<number>(0);
  const [ selectedNode, setSelectedNode ] = useState<null | NBTDataNode>(null);

  bus.updateCurrentFileUUIDSetter([ currentFileUUID, setCurrentFileUUID ]);
  bus.updateCurrentFilenameSetter([ currentFilename, setCurrentFilename ]);
  bus.updateCurrentModifiedSetter([ currentModifyVersion, setCurrentModifyVersion ]);
  bus.updateSelectedNodeSetter([ selectedNode, setSelectedNode ]);

  return (
    <>
      <NBTEditorPage bus={bus} currentModifyVersion={currentModifyVersion} currentFileUUID={currentFileUUID} />
    </>
  );
}

export default App;
