/**
 * Whether the text holds a JWT whose payload grants `service_role`: a Supabase key that
 * bypasses row-level security and must stay on the server.
 */
export const hasServiceRoleJwt = (text: string): boolean =>
  [...text.matchAll(/eyJ[A-Za-z0-9_-]{8,}\.(eyJ[A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]{8,}/g)].some(
    (match) =>
      /"role"\s*:\s*"service_role"/.test(
        Buffer.from(String(match[1]), "base64url").toString("utf8"),
      ),
  );
