import { Bus } from '../../bus';
import { NBTDataNode } from '../../lib/NBTDataNode';
import CompoundPanel from './CompoundPanel';
import ListPanel from './ListPanel';
import panels from './MetaTypePanels';
import XArrayPanel from './XArrayPanel';

export default {
  ...panels,

  byte_array: XArrayPanel,
  int_array: XArrayPanel,

  compound: CompoundPanel,
  list: ListPanel,
} as {
  [key: string]: (props: { bus: Bus, node: NBTDataNode }) => JSX.Element;
};
