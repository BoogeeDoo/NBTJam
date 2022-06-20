import { Bus } from '../bus';
import { Resize, ResizeHorizon } from 'react-resize-layout';
import { useEffect } from 'react';

import EditorPageLeftPanel from './NBTEditorPageLeftPanel';
import EditorPageRightPanel from './NBTEditorPageRightPanel';

function NBTEditorPage({
  bus,
  currentModifyVersion,
  currentFileUUID,
}: {
  bus: Bus,
  currentFileUUID: string | null,
  currentModifyVersion: number,
}) {
  const bodyWidth = document.getElementsByTagName('body')[0].clientWidth;
  const initLeftWidth = bodyWidth - 305;

  useEffect(() => {
    if (!bus.currentFilename) {
      document.title = `NBT Jam!`;
    } else {
      document.title = `NBT Jam! - ${bus.currentFilename}${currentModifyVersion ? '*' : ''}`;
    }
  }, [ currentFileUUID, currentModifyVersion ]);

  return (
    <Resize>
      <ResizeHorizon overflow="scroll" width={`${initLeftWidth}px`} minWidth="200px">
        <EditorPageLeftPanel bus={bus} currentFileUUID={currentFileUUID} currentModifyVersion={currentModifyVersion} />
      </ResizeHorizon>
      <ResizeHorizon minWidth="10px" overflow="scroll">
        <EditorPageRightPanel bus={bus} currentFileUUID={currentFileUUID} currentModifyVersion={currentModifyVersion} />
      </ResizeHorizon>
    </Resize>
  );
}

export default NBTEditorPage;
