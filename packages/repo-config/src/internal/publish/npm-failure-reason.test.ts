import { describe, expect, it } from "vitest";
import { npmFailureReason } from "@/internal/publish/npm-failure-reason";

describe("npmFailureReason", () => {
  it("prefers the captured stderr", () => {
    expect(npmFailureReason(Object.assign(new Error("exit 1"), { stderr: " E404 \n" }))).toBe(
      "E404",
    );
    expect(npmFailureReason({ stderr: Buffer.from("E403") })).toBe("E403");
  });

  it("falls back to the message, or the value", () => {
    expect(npmFailureReason(Object.assign(new Error("exit 1"), { stderr: "" }))).toBe("exit 1");
    expect(npmFailureReason(new Error("boom"))).toBe("boom");
    expect(npmFailureReason("odd")).toBe("odd");
    expect(npmFailureReason({ stderr: 3 })).toBe("[object Object]");
  });
});
