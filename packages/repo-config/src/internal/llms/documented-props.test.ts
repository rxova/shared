import { describe, expect, it } from "vitest";
import { documentedProps } from "@/internal/llms/documented-props";

describe("documentedProps", () => {
  it("reads the first column of every table under ## Props", () => {
    const body = [
      "## Props",
      "",
      "| Prop | Type |",
      "| --- | --- |",
      "| `value` | string |",
      "| `aria-label` | string |",
      "| plain | x |",
      "",
      "| `onChange` | fn |",
      "## Docs",
      "| `notProp` | x |",
    ].join("\n");
    expect(documentedProps(body)).toEqual(["value", "aria-label", "onChange"]);
  });

  it("is empty without the section, and reads to the end without a next heading", () => {
    expect(documentedProps("## API\n| `a` | x |")).toEqual([]);
    expect(documentedProps("## Props\n| `a` | x |")).toEqual(["a"]);
  });
});
