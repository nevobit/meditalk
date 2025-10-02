#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# install-cli.sh
# Build, pack y luego instalar el CLI globalmente usando **npm** (no pnpm).
#
# Uso:
#   ./scripts/install-cli.sh                 # build + pack + npm i -g <tarball>
#   ./scripts/install-cli.sh --link          # build + npm link (global)
#   ./scripts/install-cli.sh --uninstall     # npm rm -g {{packageName}}/cli
#   ./scripts/install-cli.sh --dry-run       # solo mostrar acciones
#   ./scripts/install-cli.sh --force         # sin confirmaciones
# ------------------------------------------------------------------------------

CLI_PKG_DIR="packages/cli"
PKG_NAME="@mdi/cli"  

DO_LINK="false"
DO_UNINSTALL="false"
DRY_RUN="false"
FORCE="false"
MODE="global"         

for arg in "$@"; do
  case "$arg" in
    --link) DO_LINK="true"; MODE="link";;
    --uninstall) DO_UNINSTALL="true";;
    --dry-run) DRY_RUN="true";;
    --force) FORCE="true";;
    -h|--help)
      cat <<EOF
Usage:
  $0 [--link] [--uninstall] [--dry-run] [--force]

Options:
  --link        npm link (global) en lugar de instalar desde tarball.
  --uninstall   Desinstalar global: npm rm -g $PKG_NAME
  --dry-run     Muestra lo que haría sin ejecutar.
  --force       Omite confirmaciones.
EOF
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1;;
  esac
done

# ---- helpers ------------------------------------------------------------------
say() { echo -e "▶️  $*"; }
warn() { echo -e "🟡 $*" >&2; }
err() { echo -e "🛑 $*" >&2; exit 1; }
run() { if [ "$DRY_RUN" = "true" ]; then echo "DRY: $*"; else eval "$@"; fi; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || err "Missing '$1'. Please install it."; }

confirm() {
  if [ "$FORCE" = "true" ]; then return 0; fi
  read -r -p "$1 [y/N] " ans
  case "$ans" in [yY][eE][sS]|[yY]) return 0;; *) return 1;; esac
}

repo_root() {
  local dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/pnpm-workspace.yaml" ] || [ -f "$dir/turbo.json" ] || [ -f "$dir/package.json" ]; then
      echo "$dir"; return 0
    fi
    dir="$(dirname "$dir")"
  done
  echo "$PWD"
}

need_cmd node
need_cmd npm
need_cmd pnpm  

ROOT="$(repo_root)"
cd "$ROOT" || exit 1

[ -d "$CLI_PKG_DIR" ] || err "CLI package not found at '$CLI_PKG_DIR'."

if [ "$DO_UNINSTALL" = "true" ]; then
  say "Uninstalling global package $PKG_NAME (npm rm -g) ..."
  run "npm rm -g \"$PKG_NAME\" || true"
  say "Done."
  exit 0
fi

# ---- build --------------------------------------------------------------------
say "Installing workspace deps with pnpm -w ..."
run "pnpm install -w"

say "Building CLI at $CLI_PKG_DIR ..."
run "pnpm --filter \"$PKG_NAME\" build || (cd \"$CLI_PKG_DIR\" && pnpm build)"

# ---- install modes ------------------------------------------------------------
if [ "$MODE" = "link" ] || [ "$DO_LINK" = "true" ]; then
  say "Linking CLI globally using npm link ..."
  if confirm "Proceed with 'npm link' inside $CLI_PKG_DIR?"; then
    run "cd \"$CLI_PKG_DIR\" && npm link"
    say "✅ Linked globally. Prueba:  {{packageName}} --help   (o: {{packageName}} --help, {{packageName}} --help)"
  else
    warn "Aborted."
  fi
  exit 0
fi

say "Packing CLI tarball with pnpm pack ..."
pushd "$CLI_PKG_DIR" >/dev/null
PACK_OUT="$(pnpm pack --pack-destination . 2>/dev/null || true)"
TARBALL_PATH="$(echo "$PACK_OUT" | grep -Eo '[^[:space:]]+\.tgz' | tail -n1)"
if [ -z "$TARBALL_PATH" ]; then
  TARBALL_PATH="$(ls -t ./*.tgz 2>/dev/null | head -n1)"
fi
popd >/dev/null
[ -n "$TARBALL_PATH" ] || err "Tarball not found after pnpm pack."
ABS_TARBALL="$CLI_PKG_DIR/$(basename "$TARBALL_PATH")"
[ -f "$ABS_TARBALL" ] || err "Tarball not found at $ABS_TARBALL"

say "Installing tarball globally with npm i -g ..."
if confirm "Install $ABS_TARBALL globally via npm?"; then
  run "npm i -g \"$ABS_TARBALL\""
  say "✅ Installed globally. try:  mdi --help"
  rm -f "$ABS_TARBALL"
  say "🧹 Tarball $ABS_TARBALL deleted"

else
  warn "Skipped global install."
fi