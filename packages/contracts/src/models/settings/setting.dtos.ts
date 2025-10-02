import type { Setting } from './schemas';

export type CreateSettingDto = Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSettingDto = Partial<CreateSettingDto>;
