import { describe, expect, it } from "vitest";
import { vercelRemoval } from "@/internal/hooks/vercel-removal";

const words = (command: string) => command.split(" ").slice(1);

describe("vercelRemoval", () => {
  it.each([
    "vercel rm my-app",
    "vercel remove my-app --yes",
    "vercel --scope team rm my-app",
    "vercel -t abc remove my-app",
  ])("reads %s as a deployment removal", (command) => {
    expect(vercelRemoval(words(command))).toBe("removes a Vercel deployment");
  });

  it.each(["vercel project rm my-app", "vercel projects remove my-app --scope team"])(
    "reads %s as a project removal",
    (command) => {
      expect(vercelRemoval(words(command))).toBe("removes a Vercel project");
    },
  );

  it.each([
    "vercel env rm OWNER_KEY production --yes --project agent-war --scope team",
    "vercel domains rm example.com",
    "vercel alias rm app.example.com",
    "vercel dns rm rec_123",
    "vercel --scope rm deploy",
    "vercel project ls",
    "vercel",
  ])("leaves %s alone", (command) => {
    expect(vercelRemoval(words(command))).toBeUndefined();
  });
});
