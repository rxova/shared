import { atom, read, update } from "claude-code";
import type { Register } from "claude-code";

import { age } from "./age";
import { latestNote } from "./latest-note";

const DIR = ".claude/handoff";
const note = atom({ plugin: "rx-handoff-band", key: "note" } as const, null);
const isHidden = atom({ plugin: "rx-handoff-band", key: "isHidden" } as const, false);

export const register: Register = (on, options) => {
  const maxDays = typeof options.maxDays === "number" ? options.maxDays : 7;

  on("session.start", async ($, e, next) => {
    const names = (await $.fs.exists(DIR))
      ? (await $.fs.list(DIR)).filter((entry) => entry.kind === "file").map((entry) => entry.name)
      : [];
    const latest = latestNote(names, await $.clock.now(), maxDays);
    await update($, note, () => latest);

    return next(e);
  });

  on("prompt.submit", async ($, e, next) => {
    await update($, isHidden, () => true);

    return next(e);
  }).catch(($, e, next) => next(e));

  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    const latest = await read($, note);
    if (e.props.hasSurvey || e.props.isWorking || latest === null || (await read($, isHidden))) {
      return next(e);
    }

    const { Box, Button, Text } = $.ui.resolve(e);

    return (
      <Box flexDirection="row" gap={1}>
        <Text dimColor>
          Handoff {latest.path.slice(DIR.length + 1)} ({age(latest.ageDays)})
        </Text>
        <Button
          key="resume"
          hotkey="h"
          variant="primary"
          label="Resume"
          onPress={() =>
            $.prompt.fill({ text: `Read ${latest.path} and continue the work it describes.` })
          }
        />
        <Button key="dismiss" label="Dismiss" onPress={() => update($, isHidden, () => true)} />
      </Box>
    );
  });
};
