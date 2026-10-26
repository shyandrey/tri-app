# 300W Design System v1.0

**OWNER APPROVED — v1.0**

Approval recorded by the DS-01C owner instruction; no separate approval date supplied. Implementation reference: DS-01B, 2026-10-26.
This reference describes the owner-approved implementation. [DS-01A](../ds01-design-system-audit.md) remains the historical audit. Light Theme is a separate post-release project.

## Implemented palette

The application uses one dark palette, independent of OS preference; native controls inherit `color-scheme: dark` from [index.css](../../src/index.css). Rankings no longer changes its surfaces or Done button under a light OS preference. No Telegram theme-driven palette replacement is implemented.

| Role | Existing token / value |
| --- | --- |
| Background | `--tri-bg: #0f1115` |
| Surface / raised | `--tri-surface: #1b1f24`, `--tri-surface-raised: #20252b` |
| Primary / heading | `--tri-text: #f4f4f2`, `--tri-text-heading` aliases primary |
| Secondary / soft-muted | `--tri-muted: #aeb2b7`, `--tri-muted-soft: #7f858d` |
| Disabled | `--tri-text-disabled: #7f858d` |
| Border / strong | `--tri-border: #2d3239`, `--tri-border-strong: #3a414a` |
| Navigation/action yellow | `--tri-accent: #f3b72b`, soft `rgba(243,183,43,.12)` |
| Rankings IRONMAN / T100 | `--series-ironman-accent: #ED174B`, `--series-t100-accent: #43D7D0` |

Global tokens live in [theme-refinements.css](../../src/theme-refinements.css). [Rankings CSS](../../src/pages/OfficialRankingsPage.css) retains its scoped aliases, including distinct border `#303740`. This work does not unify legacy RaceCard brand values.

Rank numerals now use `--rank-text` on `--rank-card`; the first three retain weight 800. Series/gender active indicators retain the series accent. Brand color is not used as small rank-text foreground. This preserves series identity without adding decoration.

## Typography and semantic roles

`--sans` and `--heading`: `system-ui, 'Segoe UI', Roboto, sans-serif`. `--mono`: `ui-monospace, Consolas, monospace`. No external font downloads. Back and Season inherit the application family; Done already inherits it. Intentional Arial/Helvetica gender pictograms are unchanged.

| Existing component role | Implemented treatment |
| --- | --- |
| Back | 15px/650, 14px at narrow breakpoint; glass material preserved |
| Season control | 16px/700 |
| Picker title / Done / wheel | 20px / 15px/650 / 24px with selected weight 750 |
| Rankings gender label | 18px/700, 16px at ≤350px |
| Rankings athlete name | 13px/650/1.3; 12px narrow, 15px at ≥768px |
| Rank / points | 13px (top three 800) / 14px/750; tabular numerals |
| More page title / section | 28px / 14px/600 |
| Athlete title | Existing responsive clamp; not normalized by DS-01B |

Weights 400–900 and intermediate 650/750 remain component-specific requests; actual font faces depend on the OS. Dense results typography is intentionally unchanged.

## Spacing, shape and glass

Existing values form a practical 4/8/12/16/20/24px spacing vocabulary, **not** an enforced global scale. The shared shell is `--tri-shell-width:1126px`, gutter `--tri-page-gutter:20px`. Rankings uses 44px controls and a centered 88px gender-indicator grid column. Safe-area calculations remain component-specific.

Existing radii include Season 12px, table 16px, picker sheet 24px, navigation 22px and pill Back/Done controls. These are semantic roles, not new runtime tokens or universal limits.

- Navigation glass: existing 30px blur / 165% saturation, dark translucent surface and non-blur fallback.
- Back glass: 24px / 160%, dark 52% layer, border and inset highlights; shared fallback preserved.
- Picker Done: 12px / 160%, compact dark glass; distinct material intentionally retained.

## States and responsive behavior

Selected series/gender indicators use the active series accent; inactive indicators use Rankings muted text. Selected wheel year uses primary text/750 and a neutral translucent selection band. Existing focus-visible outlines and wheel keyboard cue remain. Disabled token denotes a semantic role; it does not certify all disabled or muted combinations for contrast. Hover, reduced-motion handling, snap behavior and navigation stacking are unchanged.

Portrait/landscape artwork selection and geometry follow the separately approved [showcase guidelines](300w-showcase-artwork-guidelines-v1.0.md). DS-01B does not change images, crop positions, breakpoints or navigation. Typography is inherited narrowly, not via a global native-control reset.

## Future recommendations — not implemented

Post-release Light Theme, legacy brand-token reconciliation, broader spacing/type aliases and cascade cleanup require separate design decisions. Recommended values in this document are starting points, not mandatory universal limits. No new runtime token architecture is introduced.

## Verification

See [DS-01B implementation and QA](../ds01b-dark-theme-polish.md) for measured contrast, computed typography, screenshots, test results and physical-device limitations.
