import { HOME_ID } from "@/internal/pages/home-id";

/** The canonical HTML route for an entry id, which the twin cites as its source. */
export const htmlRoute = (id: string): string => (id === "" || id === HOME_ID ? "/" : `/${id}/`);
