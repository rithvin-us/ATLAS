# Design system

Character: exact, calm, ledger-like. Neutral graphite surfaces, one deep blue-teal accent, used rarely.

## Color

All tokens are HSL variables in `src/app/globals.css`, with a `.dark` override.

| Role | Light | Use |
| --- | --- | --- |
| `--background` | `220 8% 97%` | Page |
| `--card` | `0 0% 100%` | Surfaces |
| `--border` | `220 8% 89%` | Hairlines |
| `--foreground` | `220 12% 10%` | Primary text |
| `--muted-foreground` | `220 6% 40%` | Secondary text |
| `--primary` | `199 78% 26%` | Primary action, selection, the one figure that matters |

Charts: `chart-1` is the accent and leads. `chart-2` and `chart-3` are neutral steps. `chart-4` (amber) and `chart-5` (red) are for meaning only.

Rules: no hue gradients, no glows, no colored shadows. Depth comes from surface steps and hairlines.

## Type

- Inter for the interface, JetBrains Mono for refs, figures and meta.
- Weights 400 and 500. Sentence case everywhere.
- Figures use `tabular-nums`. Money is `$48,210`, no cents.

## Spacing and radius

- 4px grid. Cards pad 20 to 24, page edges 24 to 32.
- Controls 8 to 10 radius, cards 12.
- Sidebar rows are 36 tall with 2 between them.

## Shell

`src/components/app-shell.tsx` provides the 240px sidebar for both roles. Below `lg` it collapses to a top bar and menu.

## Building blocks

Shared classes in `globals.css`:

| Class | Purpose |
| --- | --- |
| `.surface` | Card with hairline border |
| `.surface-link` | Same, with hover border |
| `.status-chip-{success,warning,info,danger}` | Quiet tinted status text |
| `.metric-label`, `.metric-value` | Stat label and figure |
| `.ref-tag` | Mono reference such as `RFQ-A3F9` |

Dashboard helpers in `src/components/dashboard-kit.tsx`: `PageHeader`, `SectionHeader`, `Stat`, `PipelineBar`, `EmptyRow`, `money`, `ref`.

## Signature

Every RFQ, project, auction and invoice carries a mono ref tag (`RFQ-`, `PRJ-`, `AUC-` plus four characters of its id).

## Motion

Color and border transitions only. No looping animation, no hover scale or lift.
