import { describe, expect, it } from "vitest";
import { renameText } from "@/internal/init/rename-text";

describe("renameText", () => {
  it("applies each rename to every occurrence, in order", () => {
    expect(
      renameText("rxova/template-oss is template-oss, template-oss", [
        ["rxova/template-oss", "ada/idea"],
        ["template-oss", "idea"],
      ]),
    ).toBe("ada/idea is idea, idea");
  });

  it("leaves text without a match alone", () => {
    expect(renameText("nothing here", [["x-y", "z"]])).toBe("nothing here");
  });
});
