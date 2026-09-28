import { z } from 'zod';
import { mediaRefSchema, optionalTextSchema } from './common';

export const IMAGE_RATIOS = ['auto', '16/9', '3/2', '4/3', '1/1', '4/5'] as const;

export const imageBlockData = z.object({
  image: mediaRefSchema,
  caption: optionalTextSchema,
  ratio: z.enum(IMAGE_RATIOS),
});
export type ImageBlockData = z.infer<typeof imageBlockData>;
export const createImageBlock = (): ImageBlockData => ({
  image: { mediaId: 'glass-facade', decorative: false },
  caption: '',
  ratio: 'auto',
});
