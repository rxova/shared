import { CONFIG_FILES } from '@/internal/hooks/config-file-patterns';

/** Whether a file name is one of the configs that decide what passes a check. */
export const isConfigFile = (name: string): boolean => CONFIG_FILES.some((file) => file.test(name));
