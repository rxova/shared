import { HOME_ID } from '@/internal/pages/home-id';

/** The `.md` twin's route for an entry id. The home page is `/index.md`, not `/.md`. */
export const mdRoute = (id: string): string => `/${id === '' ? HOME_ID : id}.md`;
