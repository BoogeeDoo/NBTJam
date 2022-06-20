import { Bus } from '../lib/bus';

import OpenNBT from './handler/open_nbt';

async function registerIPC(bus: Bus) {
  new OpenNBT(bus);
}

export { registerIPC };
