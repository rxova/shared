import type { Tool } from "@/init/init.types";

/**
 * Whether `gh` reports the working directory's repository as `PRIVATE`.
 * `PUBLIC` and `INTERNAL` both read as not private: they keep the open-source setup.
 */
export const isPrivateRepository = (run: Tool): boolean =>
  run("gh", ["repo", "view", "--json", "visibility", "-q", ".visibility"]) === "PRIVATE";
