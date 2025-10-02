import type { Template } from './schemas';

export type CreateTemplateDto = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplateDto = Partial<CreateTemplateDto>;
