import type { OpencodeSession, StatusFacts, TuiCell } from "@/internal/statusline/statusline.types";
import { opencodeInput } from "@/internal/statusline/opencode-input";
import { statuslineRows } from "@/statusline/statusline-rows";

/**
 * The status line rows for one OpenCode session. The layout, the order and what a narrow terminal
 * drops are decided by the same segments the Claude Code script renders; this only says where
 * OpenCode's numbers go.
 */
export const opencodeRows = (session: OpencodeSession, facts: StatusFacts): TuiCell[][] =>
  statuslineRows(opencodeInput(session, facts.now), facts);
