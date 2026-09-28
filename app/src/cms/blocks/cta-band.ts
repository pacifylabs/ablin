import { z } from 'zod';
import { linkSchema, optionalLinkSchema, optionalTextSchema, textSchema } from './common';

export const ctaBandData = z.object({
  title: textSchema,
  text: optionalTextSchema,
  primary: linkSchema,
  secondary: optionalLinkSchema,
});
export type CtaBandData = z.infer<typeof ctaBandData>;
export const createCtaBand = (): CtaBandData => ({
  title: '',
  text: '',
  primary: { label: '', href: '/contact' },
  secondary: null,
});
