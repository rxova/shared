#!/usr/bin/env bash
# rx-ai status line for Claude Code — powerline-style segments, two lines.
# Installed by `rxova-agent-kit install --statusline`.
# Line 1: model │ context bar │ project │ git
# Line 2: cost · duration │ lines changed │ usage limits │ style · version
# Cross-OS: Linux, macOS (bash 3.2), Windows Git Bash / WSL.
# Requires: jq, git, awk, grep, sed, tail, basename, dirname.
# Requires a Powerline or Nerd Font in the terminal for the  separator glyph.

input=$(cat)

model_display=$(printf '%s' "$input" | jq -r '.model.display_name // .model.id // "unknown"')
model_id=$(printf '%s' "$input" | jq -r '.model.id // ""')
cwd=$(printf '%s' "$input" | jq -r '.workspace.current_dir // .cwd // ""')
transcript=$(printf '%s' "$input" | jq -r '.transcript_path // ""')
ctx_window=$(printf '%s' "$input" | jq -r '.context_window.context_window_size // 200000')
used_pct_raw=$(printf '%s' "$input" | jq -r '.context_window.used_percentage // empty')

# Session / plan metadata — every field is optional
cost_usd=$(printf '%s' "$input"    | jq -r '.cost.total_cost_usd // empty')
duration_ms=$(printf '%s' "$input" | jq -r '.cost.total_duration_ms // empty')
lines_add=$(printf '%s' "$input"   | jq -r '.cost.total_lines_added // 0')
lines_del=$(printf '%s' "$input"   | jq -r '.cost.total_lines_removed // 0')
rl_5h=$(printf '%s' "$input"       | jq -r '.rate_limits.five_hour.used_percentage // empty')
rl_5h_reset=$(printf '%s' "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')
rl_7d=$(printf '%s' "$input"       | jq -r '.rate_limits.seven_day.used_percentage // empty')
out_style=$(printf '%s' "$input"   | jq -r '.output_style.name // empty')
cc_version=$(printf '%s' "$input"  | jq -r '.version // empty')

# 1M context detection via model id suffix
context_suffix=""
case "$model_id" in
  *"[1m]"*) ctx_window=1000000; context_suffix=" (1M context)" ;;
esac

# Shorten "Claude Opus 4.7" -> "Opus 4.7"
model_short=$(printf '%s' "$model_display" | sed 's/^Claude //')

# Token usage from transcript tail
used_tokens=0
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  usage_json=$(tail -200 "$transcript" 2>/dev/null | grep -o '"usage":{[^}]*}' | tail -1)
  if [ -n "$usage_json" ]; then
    input_tok=$(printf '%s' "$usage_json"    | grep -o '"input_tokens":[0-9]*'                | grep -o '[0-9]*$')
    cache_read=$(printf '%s' "$usage_json"   | grep -o '"cache_read_input_tokens":[0-9]*'     | grep -o '[0-9]*$')
    cache_create=$(printf '%s' "$usage_json" | grep -o '"cache_creation_input_tokens":[0-9]*' | grep -o '[0-9]*$')
    output_tok=$(printf '%s' "$usage_json"   | grep -o '"output_tokens":[0-9]*'               | grep -o '[0-9]*$')
    used_tokens=$(( ${input_tok:-0} + ${cache_read:-0} + ${cache_create:-0} + ${output_tok:-0} ))
  fi
fi

# Fallback to pre-calculated percentage
if [ "$used_tokens" -eq 0 ] && [ -n "$used_pct_raw" ] && [ "$used_pct_raw" != "null" ]; then
  used_tokens=$(awk -v p="$used_pct_raw" -v w="$ctx_window" 'BEGIN{printf "%d", p/100*w}')
fi

fmt_k() {
  n=$1
  if [ -z "$n" ] || [ "$n" -eq 0 ] 2>/dev/null; then echo "0"; return; fi
  if [ "$n" -ge 1000 ]; then
    awk -v n="$n" 'BEGIN{printf "%.1fk", n/1000}'
  else
    echo "$n"
  fi
}

used_fmt=$(fmt_k "$used_tokens")

if [ "$used_tokens" -gt 0 ] && [ "$ctx_window" -gt 0 ] 2>/dev/null; then
  pct=$(awk -v u="$used_tokens" -v w="$ctx_window" 'BEGIN{printf "%d", u/w*100}')
else
  pct=0
fi
[ "$pct" -gt 100 ] && pct=100

# 10-cell context bar
bar_filled=$(( pct / 10 ))
bar=""
i=0
while [ $i -lt 10 ]; do
  if [ $i -lt $bar_filled ]; then bar="${bar}▓"; else bar="${bar}░"; fi
  i=$((i + 1))
done

# Git branch + clean/dirty + detail + project name (follows worktrees to the main repo root)
branch=""
git_mark=""
git_detail=""
project=""
if [ -n "$cwd" ] && [ -d "$cwd" ]; then
  branch=$(git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null)
  # Detached HEAD: show short sha instead
  [ -z "$branch" ] && branch=$(git -C "$cwd" rev-parse --short HEAD 2>/dev/null | sed 's/^/@/')
  if [ -n "$branch" ]; then
    porcelain=$(git -C "$cwd" status --porcelain 2>/dev/null)
    if [ -z "$porcelain" ]; then
      git_mark="✓"
    else
      git_mark="●"
      # X = index (staged), Y = worktree (modified), ?? = untracked
      n_staged=$(printf '%s\n' "$porcelain"    | grep -c '^[MADRCU]')
      n_modified=$(printf '%s\n' "$porcelain"  | grep -c '^.[MDU]')
      n_untracked=$(printf '%s\n' "$porcelain" | grep -c '^??')
      [ "$n_staged" -gt 0 ]    && git_detail="${git_detail} +${n_staged}"
      [ "$n_modified" -gt 0 ]  && git_detail="${git_detail} ~${n_modified}"
      [ "$n_untracked" -gt 0 ] && git_detail="${git_detail} ?${n_untracked}"
    fi

    # Ahead/behind upstream
    counts=$(git -C "$cwd" rev-list --left-right --count '@{upstream}...HEAD' 2>/dev/null)
    if [ -n "$counts" ]; then
      behind=$(printf '%s' "$counts" | awk '{print $1}')
      ahead=$(printf '%s' "$counts"  | awk '{print $2}')
      [ "$ahead" -gt 0 ]  && git_detail="${git_detail} ↑${ahead}"
      [ "$behind" -gt 0 ] && git_detail="${git_detail} ↓${behind}"
    fi

    # --git-common-dir points at the main repo's .git even inside a worktree.
    # It may be relative; resolve against cwd if so. Avoids needing git 2.31+ (--path-format=absolute).
    common_dir=$(git -C "$cwd" rev-parse --git-common-dir 2>/dev/null)
    git_dir=$(git -C "$cwd" rev-parse --git-dir 2>/dev/null)
    if [ -n "$common_dir" ]; then
      case "$common_dir" in
        /*|[A-Za-z]:[\\/]*) ;;          # already absolute (unix or windows drive)
        *) common_dir="$cwd/$common_dir" ;;
      esac
      project=$(basename "$(dirname "$common_dir")")
      # Linked worktree: git-dir lives under <common>/worktrees/<name>
      case "$git_dir" in
        */worktrees/*) project="${project} ⎇ $(basename "$git_dir")" ;;
      esac
    fi
  fi
fi

# Fallback: if not in a git repo, use cwd basename for the project slot
if [ -z "$project" ]; then
  project=$(basename "$cwd")
  [ -z "$project" ] && project="."
fi

# Line 2 values
cost_fmt=""
if [ -n "$cost_usd" ]; then
  cost_fmt=$(awk -v c="$cost_usd" 'BEGIN{printf "$%.2f", c}')
fi
dur_fmt=""
if [ -n "$duration_ms" ]; then
  dur_fmt=$(awk -v ms="$duration_ms" 'BEGIN{
    s=int(ms/1000); h=int(s/3600); m=int((s%3600)/60);
    if (h>0) printf "%dh%02dm", h, m; else if (m>0) printf "%dm", m; else printf "%ds", s }')
fi
session_txt=""
[ -n "$cost_fmt" ] && session_txt="$cost_fmt"
[ -n "$dur_fmt" ]  && session_txt="${session_txt:+$session_txt · }$dur_fmt"

limits_txt=""
max_limit=0
if [ -n "$rl_5h" ]; then
  p5=$(printf '%.0f' "$rl_5h")
  reset_txt=""
  if [ -n "$rl_5h_reset" ]; then
    left=$(( rl_5h_reset - $(date +%s) ))
    if [ "$left" -gt 0 ]; then
      reset_txt=$(awk -v s="$left" 'BEGIN{h=int(s/3600); m=int((s%3600)/60); if (h>0) printf " (%dh%02dm)", h, m; else printf " (%dm)", m}')
    fi
  fi
  limits_txt="5h ${p5}%${reset_txt}"
  max_limit=$p5
fi
if [ -n "$rl_7d" ]; then
  p7=$(printf '%.0f' "$rl_7d")
  limits_txt="${limits_txt:+$limits_txt · }7d ${p7}%"
  [ "$p7" -gt "$max_limit" ] && max_limit=$p7
fi

meta_txt=""
[ -n "$out_style" ] && [ "$out_style" != "default" ] && meta_txt="$out_style"
[ -n "$cc_version" ] && meta_txt="${meta_txt:+$meta_txt · }v${cc_version}"

# 256-color palette
model_bg=203   # coral/red
if [ "$pct" -lt 50 ]; then
  ctx_bg=220   # yellow
elif [ "$pct" -lt 75 ]; then
  ctx_bg=214   # orange-yellow
elif [ "$pct" -lt 90 ]; then
  ctx_bg=208   # orange
else
  ctx_bg=196   # red
fi
project_bg=238 # dark gray
branch_bg=34   # green
[ "$git_mark" = "●" ] && branch_bg=172  # amber when dirty
cost_bg=67     # steel blue
lines_bg=60    # muted purple
if [ "$max_limit" -lt 50 ]; then
  limit_bg=72  # sea green
elif [ "$max_limit" -lt 80 ]; then
  limit_bg=214 # orange-yellow
else
  limit_bg=196 # red
fi
meta_bg=236   # darker gray
fg_dark=16     # black
fg_light=252   # light gray

# Powerline glyphs as literal UTF-8 bytes — works in bash 3.2 (macOS) where $'\uNNNN' isn't supported.
SEP=""       # U+E0B0 right-pointing arrow (between segments)
CAP_L=""     # U+E0B6 left rounded cap (pill start)
CAP_R=""     # U+E0B4 right rounded cap (pill end)

seg() {
  # bg, fg, text
  printf '\033[48;5;%sm\033[38;5;%sm %s \033[0m' "$1" "$2" "$3"
}
sep_mid() {
  # from_bg (becomes fg of arrow), to_bg (becomes bg of arrow)
  printf '\033[48;5;%sm\033[38;5;%sm%s\033[0m' "$2" "$1" "$SEP"
}
cap_left() {
  # bg of first segment, drawn as fg on default bg so the curve blends in
  printf '\033[38;5;%sm%s\033[0m' "$1" "$CAP_L"
}
cap_right() {
  # bg of last segment, drawn as fg on default bg
  printf '\033[38;5;%sm%s\033[0m' "$1" "$CAP_R"
}

# Builds a pill from "bg|fg|text" args, skipping entries with empty text
pill() {
  line=""
  prev=""
  for spec in "$@"; do
    bg=${spec%%|*}; rest=${spec#*|}
    fg=${rest%%|*}; text=${rest#*|}
    [ -z "$text" ] && continue
    if [ -z "$prev" ]; then
      line=${line}$(cap_left "$bg")
    else
      line=${line}$(sep_mid "$prev" "$bg")
    fi
    line=${line}$(seg "$bg" "$fg" "$text")
    prev=$bg
  done
  [ -n "$prev" ] && line=${line}$(cap_right "$prev")
  printf '%s' "$line"
}

git_txt=""
[ -n "$branch" ] && git_txt="${git_mark} ${branch}${git_detail}"

lines_txt=""
if [ "$lines_add" -gt 0 ] || [ "$lines_del" -gt 0 ]; then
  lines_txt="+${lines_add} −${lines_del}"
fi

line1=$(pill \
  "$model_bg|$fg_dark|${model_short}${context_suffix}" \
  "$ctx_bg|$fg_dark|${bar} ${used_fmt} (${pct}%)" \
  "$project_bg|$fg_light|${project}" \
  "$branch_bg|$fg_dark|${git_txt}")

line2=$(pill \
  "$cost_bg|$fg_light|${session_txt}" \
  "$lines_bg|$fg_light|${lines_txt}" \
  "$limit_bg|$fg_dark|${limits_txt}" \
  "$meta_bg|$fg_light|${meta_txt}")

printf '%s\n' "$line1"
if [ -n "$line2" ]; then printf '%s\n' "$line2"; fi
