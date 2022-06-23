import { Bus } from '../lib/bus';

import OpenNBT from './handler/open_nbt';
import SaveNBT from './handler/save_nbt';

async function registerIPC(bus: Bus) {
  new OpenNBT(bus);
  new SaveNBT(bus);
}

export { registerIPC };
