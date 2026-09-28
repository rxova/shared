// Credentials recognisable by shape alone, each with the name used in the message.
export const SECRET_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: 'an AWS access key', pattern: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/ },
  {
    name: 'a private key',
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----/,
  },
  { name: 'an Anthropic API key', pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'an OpenAI API key', pattern: /\bsk-(proj-)?[A-Za-z0-9_-]{32,}/ },
  { name: 'a Stripe live key', pattern: /\b(sk|rk)_live_[0-9A-Za-z]{20,}/ },
  {
    name: 'a GitHub token',
    pattern: /\b(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})/,
  },
  { name: 'a Slack token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'a Supabase secret key', pattern: /\bsb_secret_[A-Za-z0-9_-]{20,}/ },
  {
    name: 'a Datadog API or application key',
    pattern: /\bDD_(API|APP)_KEY\s*[=:]\s*["']?[0-9a-f]{32}([0-9a-f]{8})?\b/i,
  },
  { name: 'an Azure storage account key', pattern: /\bAccountKey=[A-Za-z0-9+/]{86}==/ },
  { name: 'a Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
];
