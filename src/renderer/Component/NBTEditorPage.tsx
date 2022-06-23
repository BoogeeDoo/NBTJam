import { Bus } from '../bus';
import { Resize, ResizeHorizon } from 'react-resize-layout';
import { useEffect } from 'react';

import EditorPageLeftPanel from './NBTEditorPageLeftPanel';
import EditorPageRightPanel from './NBTEditorPageRightPanel';
import useResizeObserver from 'use-resize-observer';

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
  }, [ currentFileUUID, bus.currentFilename, currentModifyVersion ]);

  const { ref, height = document.getElementsByTagName('body')[0].clientHeight } = useResizeObserver<HTMLDivElement>();

  return (
    <div ref={ref} style={{ height: '100%', width: '100%' }}>
      <Resize>
        <ResizeHorizon overflow="hidden" width={`${initLeftWidth}px`} minWidth="200px">
            <EditorPageLeftPanel bus={bus} height={height} currentFileUUID={currentFileUUID} currentModifyVersion={currentModifyVersion} />
        </ResizeHorizon>
        <ResizeHorizon minWidth="10px" overflow="auto">
          <EditorPageRightPanel bus={bus} currentFileUUID={currentFileUUID} currentModifyVersion={currentModifyVersion} />
        </ResizeHorizon>
      </Resize>
    </div>
  );
}

export default NBTEditorPage;
