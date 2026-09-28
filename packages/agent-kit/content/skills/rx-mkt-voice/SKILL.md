---
name: rx-mkt-voice
description: Sets the language inside an app with a voice and tone guide, microcopy patterns for buttons, errors, empty states, confirmations, onboarding, notifications and emails, plain and inclusive wording, a terminology glossary and i18n-safe strings, then finds and fixes every UI string in the repository. Use when in-app copy feels inconsistent, before translating an app, or when reviewing copy in a diff.
---

# rx-mkt-voice

Users read the app more than they read the landing page. Buttons, errors and empty states are
where they decide whether it is clear and trustworthy. Write the rules down once, then apply
them to every string the code shows.

## When to use

- The same thing is called three names in three screens, or errors read like stack traces.
- The app is about to be translated, or strings are built by concatenation.
- A pull request adds or changes user-facing text.

## Steps

1. **Write the voice guide** in `docs/voice.md`: three principles, each with a do and a
   don't, and a tone table by moment. Voice stays the same; tone shifts with the user's mood.
2. **Build the glossary.** One term per concept, the words not to use, and a note for
   translators. Take terms from the data model (`Trip`, `Expense`, `Member`) so code and copy
   agree. Put it in the same file.
3. **Find every UI string.** Check for an i18n setup first (`messages/*.json`, `locales/`,
   `i18n`, `t(`, `useTranslations`, `FormattedMessage`). If strings are inline, grep JSX text,
   `placeholder=`, `aria-label=`, `title=`, `alt=`, toast and error helpers, email templates
   and push-notification payloads. List them in `docs/voice-audit.md` with file and line.
4. **Apply the microcopy patterns:**
   - **Buttons**: a verb plus the object, saying what happens ("Add expense", "Delete trip").
     The confirm button repeats the action, never "OK" or "Yes".
   - **Errors**: what happened, in plain words, and what to do next. No blame, no codes up
     front ("We could not read that receipt. Try a clearer photo or enter the total.").
   - **Empty states**: what will appear here, why it is empty, and the action to fill it.
   - **Confirmations**: name the thing and the consequence ("Delete 'Lisbon'? This removes 23
     expenses for everyone."). Prefer undo over confirm for reversible actions.
   - **Onboarding**: one idea per screen, show rather than tell, let people skip.
   - **Notifications and emails**: who did what, and why it matters to this reader, in the
     first line; one action.
5. **Keep it plain and inclusive.** Short sentences, everyday words, second person, active
   voice. No idioms that do not translate, no gendered defaults, no ability-based metaphors,
   no "simply" or "just". Aim for a reading age of about 12.
6. **Make strings i18n-ready.** Whole sentences as one key with named placeholders; never
   join fragments. Plurals and gender through ICU MessageFormat. Dates, numbers and money
   through `Intl`, not string templates. Leave room for 30% longer text in layouts.
7. **Fix in batches** by screen, touching only strings, then run the repository's checks
   (the `rx-verify` skill), since snapshot and end-to-end tests often match on text.
8. **Review copy in diffs.** For each changed user-facing string: does it follow the
   patterns, use glossary terms, avoid concatenation, and have a key in every locale file?

## Rules

- One concept, one word, everywhere, including emails and notifications.
- Never change logic, keys consumed by other code, or analytics event names while fixing copy.
- Error messages never expose internals or blame the user.
- Every new string goes through the i18n layer if the repo has one.

## Example

`docs/voice.md` extract and a fix, for Kitty, a split-the-bill app for group trips:

```markdown
Principles: clear over clever; calm about money; on the organiser's side.

| Moment      | Tone                 | Example                                                                    |
| ----------- | -------------------- | -------------------------------------------------------------------------- |
| Success     | Brief, warm          | Expense added. Sam owes you 24.50 EUR.                                     |
| Error       | Calm, specific       | We could not reach the bank. Your expense is saved; try again in a minute. |
| Owing money | Neutral, never shame | You owe Priya 18.00 GBP. [Pay Priya]                                       |

Glossary: Trip (not group, event); Expense (not cost, bill); Member (not friend, user);
Settle up (not pay off, clear).
```

```diff
- "You have " + count + " unpaid bills"
+ t('trip.unsettled', { count })
+ // en.json: "trip.unsettled": "{count, plural, one {# expense to settle} other {# expenses to settle}}"
```
