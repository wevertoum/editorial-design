#!/usr/bin/env python3
"""Copy canonical Mapeamento JSON into content/mapeamento/ for self-contained builds."""

from __future__ import annotations

import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

from import_organizacoes_lib import DEFAULT_MAPEAMENTO_CONTENT, MAPEAMENTO_SNAPSHOT

README = """# Mapeamento content snapshot

Versioned copies of the Mapeamento publicação inventory used by `npm run import:mapeamento`.

## Canonical source

```
{source}
```

| File | Role |
| --- | --- |
| `inventory.json` | Flat block list (`sections` + `blocks`) from the Organizações DOCX |
| `findings.json` | Resumo executivo findings (optional reference; flow MDX comes from inventory) |

Last snapshot: {timestamp} UTC.

Re-copy with:

```bash
npm run snapshot:mapeamento
```
"""


def main() -> None:
    source = Path(os.environ.get("MAPEAMENTO_CONTENT_DIR", str(DEFAULT_MAPEAMENTO_CONTENT)))
    if not source.is_dir():
        raise SystemExit(f"Missing Mapeamento content dir: {source}")

    MAPEAMENTO_SNAPSHOT.mkdir(parents=True, exist_ok=True)

    for name in ("inventory.json", "findings.json"):
        src = source / name
        if not src.is_file():
            if name == "findings.json":
                continue
            raise SystemExit(f"Missing {src}")
        shutil.copy2(src, MAPEAMENTO_SNAPSHOT / name)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    (MAPEAMENTO_SNAPSHOT / "README.md").write_text(
        README.format(source=source.resolve(), timestamp=ts),
        encoding="utf-8",
    )
    print(f"Snapshotted Mapeamento content from {source} → {MAPEAMENTO_SNAPSHOT}")


if __name__ == "__main__":
    main()
