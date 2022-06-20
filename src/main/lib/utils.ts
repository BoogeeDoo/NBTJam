import NBT from 'mcnbt';
import BaseTag from 'mcnbt/types/lib/base_tag.d';
import TAGByte from 'mcnbt/types/lib/tags/byte.d';
import TAGByteArray from 'mcnbt/types/lib/tags/byte_array.d';
import TAGCompound from 'mcnbt/types/lib/tags/compound.d';
import TAGDouble from 'mcnbt/types/lib/tags/double.d';
import TAGFloat from 'mcnbt/types/lib/tags/float.d';
import TAGInt from 'mcnbt/types/lib/tags/int.d';
import TAGIntArray from 'mcnbt/types/lib/tags/int_array.d';
import TAGList from 'mcnbt/types/lib/tags/list.d';
import TAGLong from 'mcnbt/types/lib/tags/long.d';
import TAGShort from 'mcnbt/types/lib/tags/short.d';
import TAGString from 'mcnbt/types/lib/tags/string.d';

export function createDeferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

let dummy: StructedNBTListTag;
let dummy2: StructedNBTTag;
function createStructedNode(
  tag: typeof dummy2.tag,
  type: typeof dummy.childrenType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): StructedNBTTag {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tag: tag as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: type as any,
    value,
  };
}

function nbtNodeToStructed(node: BaseTag) {
  switch (node.getTypeId()) {
    case NBT.Tags.TAG_Byte:
      return createStructedNode(
        NBT.Tags.TAG_Byte as typeof dummy2.tag,
        'byte',
        (node as TAGByte).getValue());

    case NBT.Tags.TAG_Short:
      return createStructedNode(
        NBT.Tags.TAG_Short as typeof dummy2.tag,
        'short',
        (node as TAGShort).getValue());

    case NBT.Tags.TAG_Int:
      return createStructedNode(
        NBT.Tags.TAG_Int as typeof dummy2.tag,
        'int',
        (node as TAGInt).getValue());

    case NBT.Tags.TAG_Long:
      return createStructedNode(
        NBT.Tags.TAG_Long as typeof dummy2.tag,
        'long',
        (node as TAGLong).getValue().toString());

    case NBT.Tags.TAG_Float:
      return createStructedNode(
        NBT.Tags.TAG_Float as typeof dummy2.tag,
        'float',
        (node as TAGFloat).getValue());

    case NBT.Tags.TAG_Double:
      return createStructedNode(
        NBT.Tags.TAG_Double as typeof dummy2.tag,
        'double',
        (node as TAGDouble).getValue());

    case NBT.Tags.TAG_Byte_Array:
      return createStructedNode(
        NBT.Tags.TAG_Byte_Array as typeof dummy2.tag,
        'byte_array',
        [ ...(node as TAGByteArray).getValue() ]);

    case NBT.Tags.TAG_String:
      return createStructedNode(
        NBT.Tags.TAG_String as typeof dummy2.tag,
        'string',
        (node as TAGString).getValue());

    case NBT.Tags.TAG_List: {
      const list: StructedNBTTag[] = [];
      const values = (node as TAGList).getValue();
      for (let i = 0; i < values.length; i++) {
        list.push(nbtNodeToStructed(values[i]));
      }

      const s: StructedNBTListTag = createStructedNode(
        NBT.Tags.TAG_List as typeof dummy2.tag,
        'list',
        list) as StructedNBTListTag;

      s.childrenType = (node as TAGList).childType.substr(4).toLocaleLowerCase() as typeof s.childrenType;
      return s;
    }

    case NBT.Tags.TAG_Compound: {
      const compound: {
        [key: string]: StructedNBTTag,
      } = {};
      const keys = (node as TAGCompound).getNames();
      for (const key of keys) {
        compound[key] = nbtNodeToStructed((node as TAGCompound).get(key));
      }

      return createStructedNode(
        NBT.Tags.TAG_Compound as typeof dummy2.tag,
        'compound',
        compound);
    }

    case NBT.Tags.TAG_Int_Array:
      return createStructedNode(
        NBT.Tags.TAG_Int_Array as typeof dummy2.tag,
        'int_array',
        [ ...(node as TAGIntArray).getValue() ]);

    case 0:
      return createStructedNode(
        0 as typeof dummy2.tag,
        'end',
        null);

    default:
      throw new Error(`Unknown tag type: ${node.getTypeId()}`);
  }
}

export function nbtToStructedRoot(nbt: NBT): StructedNBTRoot {
  const root: StructedNBTRoot = {};
  const rootKeys = nbt.keys();

  for (const key of rootKeys) {
    const value = nbt.get(key);
    root[key] = nbtNodeToStructed(value);
  }

  return root;
}
