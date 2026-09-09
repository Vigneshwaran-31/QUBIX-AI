---
name: Administrative Rigor
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#43474d'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#49607c'
  primary: '#001428'
  on-primary: '#ffffff'
  primary-container: '#0f2942'
  on-primary-container: '#7991af'
  inverse-primary: '#b0c9e8'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#00170d'
  on-tertiary: '#ffffff'
  tertiary-container: '#002e1d'
  on-tertiary-container: '#21a173'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b0c9e8'
  on-primary-fixed: '#011d35'
  on-primary-fixed-variant: '#314863'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: IBM Plex Serif
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: IBM Plex Serif
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: IBM Plex Serif
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: IBM Plex Serif
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: IBM Plex Serif
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: IBM Plex Serif
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-lg:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
spacing:
  space-3xs: 0.125rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-compact: 0.5rem
  gutter-default: 1rem
  margin-screen: 1.5rem
---

## Brand & Style

The design system projects institutional authority, uncompromising integrity, and administrative permanence. Tailored for land registry, forensic title verification, and statutory land administration, the visual language draws inspiration from official state gazettes, legal deeds, and surveyor records, executed with contemporary high-density digital precision. 

The aesthetic strategy merges classical administrative gravity with modern enterprise compliance:
- **Tone:** Authoritative, forensic, definitive, and unyielding. The interface must communicate state-backed authenticity and zero tolerance for ambiguity.
- **Visual Stance:** Monolithic, architectural, and razor-sharp. It avoids frivolous ornamentation, neon synthetic accents, or playful rounded forms, relying instead on disciplined typographic scale, precise 1px rule boundaries, and ink-on-parchment contrast.
- **Emotional Impact:** Conveys infallible legal certainty to revenue officers, district collectors, surveyors, and institutional stakeholders inspecting survey numbers, patta transfers, and boundary demarcations.

## Colors

The color palette establishes an uncompromising institutional baseline anchored by deep deep indigo `#0F2942`, representing sovereign legal authority and structural stability. Accent and semantic tones correspond strictly to state seal insignia and land risk auditing states:

- **Primary (`#0F2942`):** Structural navy grounding header masts, primary state-level actions, structural division rules, and primary emphasis.
- **Secondary (`#D97706`):** Institutional gold/amber drawn from ceremonial emblem trims and verification badges; signals pending gazette approvals, administrative alerts, and caution states.
- **Tertiary (`#059669`):** Emerald green designating unencumbered title deeds, certified patta records, low risk assessments, and cryptographic state verification.
- **Critical / Fraud (`#DC2626`):** Crimson red strictly reserved for survey discrepancies, encroached boundaries, pending litigation flags, and fraudulent deed attempts.
- **Neutral Palette:** Crisp slate backgrounds (`#F8FAFC`, `#FFFFFF`) framed by precise mechanical division borders (`#CBD5E1`, `#E2E8F0`) with deep slate typography (`#0F172A`, `#334155`) for unyielding high-contrast legibility in full sunlight or legacy monitors.

## Typography

Typography pairs the historic authority of `IBM Plex Serif` with the technical clarity of `IBM Plex Sans`. 

- **IBM Plex Serif** is reserved strictly for document banners, title headers, administrative acts, and formal verification dossiers. Its sturdy serifs evoke statutory deeds, formal gazettes, and judicial decrees.
- **IBM Plex Sans** serves all analytical surfaces: tabular datasets, revenue survey parcel listings, GIS coordinates, and interactive form controls. It ensures effortless scanning across high-density tables containing survey codes, sub-registrar document hashes, and taluk references.
- **Numeric & Code Data:** Data cells containing Survey Numbers, Extents (Hectares/Ares), Patta IDs, and Transaction Hashes enforce tabular figures (`font-variant-numeric: tabular-nums`) to preserve columnar scanability.

## Layout & Spacing

The layout model prioritizes administrative density, institutional hierarchy, and high information bandwidth. Content structures utilize a strict 12-column grid system bounded by crisp 1px division rules.

- **Density Architecture:** Spacing is compact to accommodate multi-tiered administrative data (land parcels, GIS boundary overlays, ownership lineages) without unnecessary scrolling. Margins are set to 24px on desktop and 16px on mobile.
- **Grid Calibration:**
  - **Desktop (≥1280px):** 12 columns with 16px gutters. Structural layout splits into a 280px persistent navigational sidebar (administrative hierarchy), an expandable 400px verification drawer, and a central forensic canvas.
  - **Tablet (768px - 1279px):** 8 columns with 12px gutters; secondary metadata docks into bottom inspection sheets.
  - **Mobile (<768px):** 4 columns with 8px gutters; dense stacking with sticky administrative status anchors.
- **Visual Separators:** Sections are demarcated by solid 1px structural hairpins (`#E2E8F0` and `#0F2942`) rather than loose air or exaggerated spacing.

## Elevation & Depth

This design system avoids soft, floating, or amorphous shadows. Depth is communicated strictly through architectural tiering, solid contrast borders, and structural backing tones:

- **Bordered Tonal Stratification:** Surfaces are layered using calibrated fills (`#FFFFFF` resting over `#F8FAFC`, accented with `#F1F5F9` sub-headers) surrounded by uniform 1px solid borders in `#CBD5E1`.
- **Zero Diffuse Elevation:** Floating drop shadows are rejected. Elevation changes occur via flat 1px to 2px offset solid drop-keys or crisp border shifts:
  - **Resting Level 0 (Base Canvas):** Background `#F8FAFC`.
  - **Resting Level 1 (Data Cards & Deeds):** `#FFFFFF` fill with `1px solid #CBD5E1`.
  - **Active / Focused Layer (Modals & Overlays):** `#FFFFFF` fill framed by `2px solid #0F2942`, casting a stark, structural offset edge (`0 4px 0 0 #0F2942`).
- **Modal Backdrops:** Fixed dimming using an authoritative deep indigo scrim (`rgba(15, 41, 66, 0.72)`) preserving visual focus on legal signing and document audit panels.

## Shapes

Shape geometry follows absolute zero-radius (`0px`) angularity. Every corner across cards, buttons, status tokens, inputs, modal containers, and table cells remains razor-sharp. 

This strict right-angle construction emphasizes:
- Institutional gravity and official archival document heritage.
- Seamless interlocking alignment in high-density multi-pane data grids and map inspection splits.
- Elimination of frivolous or consumer-grade design motifs, establishing an authoritative environment suited for regulatory compliance.

## Components

### Buttons
- **Primary Action:** Solid `#0F2942` fill, white `#FFFFFF` text in `label-lg`, 0px border radius, padding 10px 20px. On hover, shifts to `#1E3A8A`; on active, inverts with a 2px interior border.
- **Secondary / Verification Action:** Transparent background, 2px solid `#0F2942` stroke, `#0F2942` text.
- **Critical / Reject Action:** Solid `#DC2626` background, `#FFFFFF` text, paired with 0px sharp corners.
- **State Embellishment:** Primary administrative triggers (e.g., "Verify Gazette Record", "Issue Certified Patta") display a 2px left border accent in `#D97706` (State Gold).

### Status Badges & Compliance Chips
- Compact rectangular badges (`padding: 2px 8px`, 0px radius, uppercase `label-sm`, letter spacing `0.06em`).
- **Verified / Clear Title:** `#ECFDF5` fill, `#059669` text, `1px solid #A7F3D0`.
- **Discrepancy / Encumbrance Flagged:** `#FEF2F2` fill, `#DC2626` text, `1px solid #FECACA`.
- **Under Review / Revenue Hearing:** `#FFFBEB` fill, `#D97706` text, `1px solid #FDE68A`.
- **State Gazette / Official Archive:** `#F0FDF4` or `#F8FAFC` fill, `#0F2942` text, `1px solid #0F2942`.

### High-Density Data Tables
- Header cells: `#0F2942` background with `#FFFFFF` text (`label-md`), sharp vertical grid lines in `rgba(255, 255, 255, 0.15)`.
- Alternating rows: Pure white `#FFFFFF` and subtle `#F8FAFC` slate bands.
- Cell borders: Structural 1px border (`#E2E8F0`) with 8px vertical and 12px horizontal padding.
- Numerical alignment: Survey Numbers, Area Extents, and Patta IDs align right with monospace/tabular numeric rendering.

### Form Inputs & Registry Selectors
- Background `#FFFFFF`, 1px solid `#94A3B8` perimeter, 0px corner radius, padding 8px 12px.
- Focus state: Replaced by a 2px high-contrast `#0F2942` perimeter with 0px outline ring.
- Error state: 2px solid `#DC2626` stroke with trailing exclamation icon and legal citation text underneath.

### Verification Cards & Deed Containers
- Solid `#FFFFFF` surface with a continuous 1px `#CBD5E1` border and an administrative top border: 4px solid `#0F2942`.
- Headers feature `IBM Plex Serif` headline-sm accompanied by the official taluk or village settlement reference code.
- Dossier split-views divide data symmetrically using 1px interior `#E2E8F0` vertical rules.