import { z } from 'zod';
import { optionalTextSchema, titleTextSchema } from './common';

export const missionVisionData = z.object({
  eyebrow: optionalTextSchema,
  mission: titleTextSchema,
  vision: titleTextSchema,
});
export type MissionVisionData = z.infer<typeof missionVisionData>;
export const createMissionVision = (): MissionVisionData => ({
  eyebrow: '',
  mission: { title: '', text: '' },
  vision: { title: '', text: '' },
});
