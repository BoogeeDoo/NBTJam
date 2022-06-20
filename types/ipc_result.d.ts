import { OpenDialogReturnValue } from 'electron';

declare interface OpenNBTReturnValue extends OpenDialogReturnValue {
  root?: StructedNBTRoot;
}
