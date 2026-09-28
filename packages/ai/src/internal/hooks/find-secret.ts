import { SECRET_PATTERNS } from '@/internal/hooks/secret-patterns';
import { hasServiceRoleJwt } from '@/internal/hooks/service-role-jwt';

/** The kind of the first credential found in the text, or undefined when there is none. */
export const findSecret = (text: string): string | undefined =>
  SECRET_PATTERNS.find(({ pattern }) => pattern.test(text))?.name ??
  (hasServiceRoleJwt(text) ? 'a Supabase service-role key' : undefined);
