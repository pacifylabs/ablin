import type { BlockData, BlockType } from '@/cms/blocks';

export interface Option {
  value: string;
  label: string;
}

/** Collections a form may reference by id, loaded once by the editor page. */
export interface BlockRefs {
  services: Option[];
  frameworks: Option[];
  topics: Option[];
}

export interface FormProps<T extends BlockType> {
  data: BlockData<T>;
  onChange: (data: BlockData<T>) => void;
  refs: BlockRefs;
}
