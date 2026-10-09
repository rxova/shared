import { expect, test } from "claude-code/testing";

const NOW = Date.parse("2026-10-09T12:00:00Z");

const BAND = {
  component: "AbovePrompt",
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const;

import type { On } from "claude-code";

const withNotes = (on: On, names: string[]) => {
  on("session.start", ($, e) => ({ cwd: e.cwd }));
  on("ui.render", { component: "AbovePrompt" }, ($, e) => {
    const { Text } = $.ui.resolve(e);
    return <Text>engine band</Text>;
  });
  on("clock.now", () => ({ value: NOW }));
  on("fs.exists", () => ({ value: true }));
  on("fs.list", () => ({
    value: names.map((name) => ({ name, kind: "file", size: 1, mtimeMs: 0, isLink: false })),
  }));
};

for (const surface of ["terminal", "desktop"] as const) {
  test(`the band names the newest note and resumes from it on ${surface}`, async ($, on) => {
    const fills: string[] = [];
    withNotes(on, ["2026-10-01-old.md", "2026-10-06-private-template.md", "README.md"]);
    on("prompt.fill", ($, e) => {
      fills.push(e.text);
      return { isFilled: true };
    });

    await $.session.start({ cwd: "/repo", surface: "terminal", isInteractive: true });
    const ui = await $.ui.mount({ plugin: "rx-handoff-band", surface, ...BAND });

    expect(
      await ui.find({ type: "Text", text: /2026-10-06-private-template\.md \(3 days ago\)/ }),
    ).toBeDefined();
    await ui.press({ key: "resume" });
    expect(fills).toEqual([
      "Read .claude/handoff/2026-10-06-private-template.md and continue the work it describes.",
    ]);
    await ui.unmount();
  });
}

test("a note older than maxDays is not shown", { options: { maxDays: 2 } }, async ($, on) => {
  withNotes(on, ["2026-10-06-private-template.md"]);

  await $.session.start({ cwd: "/repo", surface: "terminal", isInteractive: true });
  const ui = await $.ui.mount({ plugin: "rx-handoff-band", surface: "terminal", ...BAND });

  expect(await ui.find({ key: "resume" })).toBeUndefined();
});
