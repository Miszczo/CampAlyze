

## Firecrawl MCP

Opis: Zaawansowany web-scraping i crawling z retry i rate-limitingiem.

**Konfiguracja**

- Otwórz plik `~/.cursor/mcp.json`.
- Dodaj blok:

```json
"firecrawl-mcp": {
  "command": "npx",
  "args": ["-y", "firecrawl-mcp"],
  "env": {
    "FIRECRAWL_API_KEY": "<YOUR_FIRECRAWL_API_KEY>"
  }
}
```

- Zapisz plik i zrestartuj Cursor.

**Użycie**

- W promptach poprzedź zapytanie frazą `use firecrawl-mcp`.
- Przykład:
> „Pobierz listę nagłówków z https://example.com use firecrawl-mcp”


## Context7 MCP

Opis: Dostarcza zawsze aktualną, wersjonowaną dokumentację i przykłady kodu.

**Konfiguracja**

- W `~/.cursor/mcp.json` wklej:

```json
"context7": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"]
}
```

- Zapisz i uruchom ponownie Cursor.

**Użycie**

- Dodaj `use context7` w treści prompta.
- Przykład:
> „Jak zainicjalizować klienta Redis w Pythonie? use context7”


## GitHub MCP

Opis: Integracja z GitHub API do automatyzacji i analizy repozytoriów.

**Konfiguracja**

- W `~/.cursor/mcp.json` umieść:

```json
"github": {
  "command": "docker",
  "args": ["run","-i","--rm","-e","GITHUB_PERSONAL_ACCESS_TOKEN","ghcr.io/github/github-mcp-server"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_GITHUB_TOKEN>"
  }
}
```

- Zrestartuj Cursor.

**Użycie**

- W promptach dodaj `use github`.
- Przykład:
> „Znajdź wszystkie otwarte issue w repozytorium user/proj use github”


## Supabase MCP

Opis: Pozwala AI na zapytania i operacje na bazie Supabase.

**Konfiguracja**

- W `~/.cursor/mcp.json` dodaj:

```json
"supabase": {
  "command": "npx",
  "args": ["-y","@supabase/mcp-server-supabase@latest","--access-token","<YOUR_SUPABASE_PAT>"]
}
```

- Odśwież Cursor.

**Użycie**

- W promptach użyj `use supabase`.
- Przykład:
> „Pobierz listę użytkowników z tabeli users use supabase”


## Sequential Thinking MCP

Opis: Strukturyzuje sekwencyjne myślenie agenta, zapisując kroki w Recall.

**Konfiguracja**

- W pliku `~/.cursor/mcp.json` wklej:

```json
"sequential-thinking": {
  "command": "npx",
  "args": ["-y","@recallnet/sequential-thinking-recall"],
  "env": {
    "RECALL_PRIVATE_KEY": "<YOUR_RECALL_PRIVATE_KEY>"
  }
}
```

- Zapisz i zrestartuj Cursor.

**Użycie**

- Dołącz `use sequential-thinking` do prompta.
- Przykład:
> „Rozwiąż ten problem w krokach use sequential-thinking”


## Playwright MCP

Opis: Automatyzuje interakcje z przeglądarką i API testy.

**Konfiguracja**

- W `~/.cursor/mcp.json` umieść:

```json
"playwright": {
  "command": "npx",
  "args": ["-y","@executeautomation/playwright-mcp-server"]
}
```

- Restart Cursor.

**Użycie**

- W promptach dodaj `use playwright`.
- Przykład:
> „Odwiedź stronę example.com i zrób zrzut ekranu use playwright”


## Memory Bank MCP

Opis: Zdalny dostęp do plików pamięci projektu z operacjami read/write.

**Konfiguracja**

- W `~/.cursor/mcp.json` dodaj:

```json
"memory-bank": {
  "command": "npx",
  "args": ["-y","@allpepper/memory-bank-mcp"],
  "env": {
    "MEMORY_BANK_ROOT": "<PATH_TO_MEMORY_BANK>"
  }
}
```

- Zrestartuj Cursor.

**Użycie**

- W promptach użyj `use memory-bank`.
- Przykład:
> „Zapisz notatkę „Spotkanie z klientem” do pamięci use memory-bank”


## Knowledge Graph Memory MCP

Opis: Trwała pamięć jako graf wiedzy z relacjami i encjami.

**Konfiguracja**

- W `~/.cursor/mcp.json` wklej:

```json
"knowledge-graph-memory": {
  "command": "npx",
  "args": ["-y","@modelcontextprotocol/server-memory"],
  "env": {
    "MEMORY_FILE_PATH": "<PATH_TO_MEMORY.json>"
  }
}
```

- Restart Cursor.

**Użycie**

- Dodaj `use knowledge-graph-memory` w promptach.
- Przykład:
> „Dodaj encję „Projekt X” z opisem use knowledge-graph-memory”


## DuckDuckGo MCP

Opis: Wyszukiwanie i pobieranie treści przez DuckDuckGo z rate-limitingiem.

**Konfiguracja**

- W pliku `~/.cursor/mcp.json` dodaj:

```json
"ddg-search": {
  "command": "uvx",
  "args": ["duckduckgo-mcp-server"]
}
```

- Zrestartuj Cursor.

**Użycie**

- W promptach dołącz `use ddg-search`.
- Przykład:
> „Znajdź najnowsze wiadomości o AI use ddg-search”

---

Po skonfigurowaniu każdego MCP Servera, agent Cursor rozpozna odpowiednie narzędzie na podstawie frazy `use <nazwa-serwera>` w Twoim promptcie i automatycznie wykorzysta odpowiedni serwer do wykonania zadania.

<div style="text-align: center">⁂</div>

[^1]: https://docs.firecrawl.dev/mcp

[^2]: https://dev.to/mehmetakar/context7-mcp-tutorial-3he2

[^3]: https://github.com/github/github-mcp-server

[^4]: https://supabase.com/docs/guides/getting-started/mcp

[^5]: https://www.youtube.com/watch?v=R-5ucM-5P5o

[^6]: https://executeautomation.github.io/mcp-playwright/docs/intro

[^7]: https://github.com/alioshr/memory-bank-mcp

[^8]: https://www.youtube.com/watch?v=qeru0ZdudD4

[^9]: https://github.com/nickclyde/duckduckgo-mcp-server

[^10]: https://cursor.directory/mcp/firecrawl

[^11]: https://www.magicslides.app/mcps/vrknetha-firecrawl

[^12]: https://www.youtube.com/watch?v=-ls0D-rtET4

[^13]: https://docs.anthropic.com/en/docs/agents-and-tools/mcp

[^14]: https://www.youtube.com/watch?v=d3QpQO6Paeg

[^15]: https://github.com/PicardRaphael/mcp-server-documentation

[^16]: https://www.youtube.com/watch?v=smmpJtAztjs

[^17]: https://pypi.org/project/supabase-mcp-server/

[^18]: https://smithery.ai/server/@smithery-ai/server-sequential-thinking

[^19]: https://playbooks.com/mcp/anthropic-sequential-thinking

[^20]: https://executeautomation.github.io/mcp-playwright/docs/testing-videos/Bdd

[^21]: https://github.com/executeautomation/mcp-playwright

[^22]: https://www.youtube.com/watch?v=M2RFKs8Bnr8

[^23]: https://modelcontextprotocol.io/introduction

[^24]: https://forum.cursor.com/t/mcp-add-persistent-memory-in-cursor/57497

[^25]: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/pr-instructions.md

[^26]: https://playbooks.com/mcp/ashdevfr-duckduckgo

[^27]: https://www.pulsemcp.com/servers/nickclyde-duckduckgo-search

[^28]: https://www.firecrawl.dev/blog/fastmcp-tutorial-building-mcp-servers-python

[^29]: https://docs.firecrawl.dev/introduction

[^30]: https://www.youtube.com/watch?v=Ejd11WE6qaw

[^31]: https://www.youtube.com/watch?v=V-DVEFIM5n8

[^32]: https://mcp.pipedream.com/app/firecrawl

[^33]: https://github.com/mendableai/firecrawl-mcp-server

[^34]: https://onedollarvps.com/blogs/how-to-install-and-use-firecrawl-mcp

[^35]: https://apidog.com/blog/context7-mcp-server/

[^36]: https://huggingface.co/blog/lynn-mikami/context7-mcp-server

[^37]: https://www.youtube.com/watch?v=CTZm6fBYisc

[^38]: https://devcenter.upsun.com/posts/context7-mcp/

[^39]: https://github.com/upstash/context7

[^40]: https://github.com/upstash/context7-mcp

[^41]: https://upstash.com/blog/context7-mcp

[^42]: https://apidog.com/blog/github-mcp-server/

[^43]: https://github.com/mcp-use/mcp-use

[^44]: https://dev.to/debs_obrien/setting-up-the-official-github-mcp-server-a-simple-guide-707

[^45]: https://github.com/idosal/git-mcp

[^46]: https://docs.cline.bot/mcp-servers/mcp-server-from-github

[^47]: https://github.com/sammcj/mcp-package-docs

[^48]: https://www.youtube.com/watch?v=yJSX0BeMH28

[^49]: https://supabase.com/blog/mcp-server

[^50]: https://blog.hijabicoder.dev/how-to-use-supabase-mcp-in-vscode-and-cursor

[^51]: https://www.youtube.com/watch?v=wa9-d63velk

[^52]: https://github.com/supabase-community/supabase-mcp

[^53]: https://github.com/alexander-zuev/supabase-mcp-server

[^54]: https://github.com/coleam00/supabase-mcp/blob/main/README.md

[^55]: https://apidog.com/blog/supabase-mcp/

[^56]: https://forum.cursor.com/t/how-to-use-sequential-thinking/50374

[^57]: https://www.youtube.com/watch?v=RCFe1L9qm3E

[^58]: https://www.reddit.com/r/mcp/comments/1jwjagw/how_does_the_sequential_thinking_mcp_work/

[^59]: https://playbooks.com/mcp/sequential-thinking

[^60]: https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking

[^61]: https://ubos.tech/mcp/sequential-thinking-mcp-server-2/

[^62]: https://onedollarvps.com/blogs/how-to-set-up-and-use-sequential-thinking-mcp-server

[^63]: https://huggingface.co/blog/lynn-mikami/microsoft-playwright-mcp

[^64]: https://www.qatouch.com/blog/playwright-mcp-server/

[^65]: https://www.youtube.com/watch?v=CNzg1aPwrKI

[^66]: https://apidog.com/blog/playwright-mcp/

[^67]: https://executeautomation.github.io/mcp-playwright/docs/local-setup/Installation

[^68]: https://executeautomation.github.io/mcp-playwright/

[^69]: https://github.com/microsoft/playwright-mcp

[^70]: https://github.com/alioshr/memory-bank-mcp/blob/main/README.md

[^71]: https://www.youtube.com/watch?v=Uufa6flWid4

[^72]: https://cursor.directory/mcp/memory-bank-mcp-server

[^73]: https://www.youtube.com/watch?v=quxmEXORYto

[^74]: https://www.mcpmarket.com/server/memory-bank

[^75]: https://forum.cursor.com/t/one-shot-memory-bank-for-cursor-that-makes-a-difference/87411

[^76]: https://www.pulsemcp.com/servers/modelcontextprotocol-knowledge-graph-memory

[^77]: https://github.com/shaneholloman/mcp-knowledge-graph

[^78]: https://playbooks.com/mcp/modelcontextprotocol-knowledge-graph-memory

[^79]: https://community.aws/content/2wQNdTanksZytztHxutlGFHq23J/build-a-knowledge-graph-with-mcp-memory-and-amazon-neptune

[^80]: https://www.linkedin.com/pulse/building-your-own-memory-claude-mcp-hassan-raza-miaaf

[^81]: https://mcpmarket.com/server/basic-memory

[^82]: https://block.github.io/goose/docs/tutorials/knowledge-graph-mcp

[^83]: https://cursor.directory/mcp/duckduckgo-search

[^84]: https://playbooks.com/mcp/lowlyocean-duckduckgo-search

[^85]: https://www.pulsemcp.com/servers/lowlyocean-duckduckgo-search

[^86]: https://playbooks.com/mcp/oevortex-ddg-search

[^87]: https://apify.com/epctex/duckduckgo-scraper/api/mcp

[^88]: https://playbooks.com/mcp/zhsama-duckduckgo-search

[^89]: https://github.com/gianlucamazza/mcp-duckduckgo

