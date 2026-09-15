#!/bin/zsh
set -eu
SHOWCASE_DIR="${0:A:h}"
SHOWCASE_STATUS="$(/usr/bin/curl -fsS --max-time 1 http://127.0.0.1:4399/api/live/status 2>/dev/null || true)"
SHOWCASE_STATUS_PATTERN='"state"[[:space:]]*:[[:space:]]*"(idle|preparing|starting|ready|stopping|failed)"'
if [[ "$SHOWCASE_STATUS" =~ "$SHOWCASE_STATUS_PATTERN" ]]; then
  /usr/bin/open http://127.0.0.1:4399/live.html
  exit 0
fi
SHOWCASE_NODE="$(command -v node || true)"
if [[ -z "$SHOWCASE_NODE" ]]; then
  for candidate in /opt/homebrew/bin/node /usr/local/bin/node "$HOME"/.nvm/versions/node/*/bin/node(NOn); do
    if [[ -x "$candidate" ]]; then SHOWCASE_NODE="$candidate"; break; fi
  done
fi
if [[ -z "$SHOWCASE_NODE" ]]; then
  print '没有找到 Node.js，请安装 Node.js 20 或更新版本后再打开。'
  read -k 1 '?按任意键关闭。'
  exit 1
fi
cd "$SHOWCASE_DIR"
exec "$SHOWCASE_NODE" "$SHOWCASE_DIR/server.mjs" --open
