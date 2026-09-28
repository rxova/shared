---
name: rx-expo
description: Builds a React Native app with Expo and Expo Router, runs it on a real phone, connects it to a local API, adds Supabase auth, and ships with EAS. Use when a hackathon project needs a mobile app, or when a phone cannot reach the dev server or local backend.
---

# rx-expo

Get the app on a real phone in the first hour. Most mobile demo failures are networking and
native-module surprises, not React code.

## When to use

- The project needs an iOS or Android app.
- The phone cannot load the bundle, or the app cannot reach `localhost` API calls.
- Deciding between Expo Go and a development build, or preparing a build for judges.

## Expo Go or development build

| Situation                                             | Use                                             |
| ----------------------------------------------------- | ----------------------------------------------- |
| Only Expo SDK modules, fastest start                  | Expo Go (scan the QR code)                      |
| A library with custom native code not in Expo Go      | Development build (`expo-dev-client`)           |
| Push notifications, custom app icon or scheme testing | Development build                               |
| Giving judges an installable app                      | EAS Build (internal distribution or TestFlight) |

Expo Go supports one SDK version at a time; if the store version is newer than your project,
use a development build or upgrade the SDK.

## Steps

1. **Create:** `npx create-expo-app@latest my-app` (the default template uses Expo Router
   and TypeScript). `cd my-app && npx expo start`.
2. **Routes** are files in `app/`: `app/index.tsx`, `app/(tabs)/_layout.tsx`,
   `app/note/[id].tsx`. Navigate with `<Link href="/note/1">` or `router.push`.
3. **Install native-aware packages with** `npx expo install <pkg>` so versions match the SDK.
4. **Env vars:** `EXPO_PUBLIC_*` in `.env`, read as `process.env.EXPO_PUBLIC_API_URL`
   (dot notation only; no destructuring). They are inlined into the bundle: never put a
   secret there. Keys that must stay secret live on your server.
5. **Reach a local API from the phone:**
   - Phone and laptop on the same Wi-Fi: use the laptop's LAN IP
     (`EXPO_PUBLIC_API_URL=http://192.168.1.23:3000`), and bind the API to `0.0.0.0`.
   - Venue Wi-Fi blocks device-to-device traffic: `npx expo start --tunnel` for the bundle,
     and a tunnel (cloudflared, ngrok) or a deployed API for the backend.
   - Android emulator reaches the host as `10.0.2.2`; iOS simulator can use `localhost`.
6. **Auth with Supabase:** `npx expo install @supabase/supabase-js
@react-native-async-storage/async-storage`, create the client with AsyncStorage for the
   session and `detectSessionInUrl: false`. Email + password or OTP is the fastest demo path;
   OAuth needs a redirect scheme (see Gotchas). Follow the Expo quickstart on
   supabase.com/docs for any polyfills your SDK version still needs.
7. **Dev build (when needed):** `npx expo install expo-dev-client`, then
   `npx eas-cli build --profile development --platform android` (or `ios`).
8. **Ship:** `eas build` for installable binaries, `eas update` to push JS-only fixes to
   builds that already exist. Check docs.expo.dev for current EAS commands and quotas.

## Example

```ts
// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

```ts
// lib/api.ts
import { supabase } from './supabase';

const base = process.env.EXPO_PUBLIC_API_URL;
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(data.session && { authorization: `Bearer ${data.session.access_token}` }),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
```

```bash
# .env.example
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Gotchas

- `localhost` on a phone is the phone. Use the LAN IP, a tunnel, or a deployed URL.
- Plain `http://` to a LAN IP can be blocked on iOS release builds (App Transport Security);
  use HTTPS for anything beyond dev.
- Changed `.env`? Restart with `npx expo start --clear`.
- OAuth redirects need an app `scheme` in `app.json` and the redirect URL added in the auth
  provider; Expo Go uses an `exp://` URL that differs from your build's scheme.
- A package that says "native module not found" in Expo Go needs a development build.
- iOS builds for real devices need an Apple Developer account; budget time for it or demo on
  Android.

## Verify it works

- The app loads on a physical phone over the venue network, not only on the simulator.
- A request to the API from the phone succeeds and shows data.
- Sign in, kill the app, reopen: the session persists.
