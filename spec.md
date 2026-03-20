# CricManage Pro

## Current State
Version 8 is live with:
- Full role-based access (6 roles)
- Live scoring with action-level permissions
- Ball-by-ball commentary (Scorecard + Comms tabs)
- Over-by-over bar chart and CRR/RRR run rate tracker in the Live tab
- LiveAnalytics component in src/components/match/LiveAnalytics.tsx
- ScorecardTab with innings batting/bowling tables
- AppContext with BallEntry[], InningsScorecard, seed data for match-1

## Requested Changes (Diff)

### Add
- **Wagon Wheel** component: SVG-based circular field diagram showing shot directions for a selected batsman. Each ball entry maps to an angle/zone (covers, mid-on, square leg, etc.) derived from runs value. Displayed in the Live tab or as a new sub-section in LiveAnalytics.
- **Partnership Tracker** component: Table/card listing each batting partnership with partner names, partnership runs, balls faced, and run rate. Computed from ScorecardTab innings batting data. Displayed in the Scorecard tab or Live tab.
- **UI Polish pass**: Improve visual quality across the app - better spacing, typography hierarchy, refined cards, hover states, and overall dark-theme polish.

### Modify
- LiveAnalytics.tsx: Add WagonWheel and PartnershipTracker sections below existing charts.
- ScorecardTab.tsx: Add PartnershipTracker below bowling table for each innings.
- AppContext: No structural changes needed.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/components/match/WagonWheel.tsx` - SVG field diagram with zone-mapped dots per batsman ball entry.
2. Create `src/frontend/src/components/match/PartnershipTracker.tsx` - computes partnerships from BatterRows and renders table.
3. Update `LiveAnalytics.tsx` to include WagonWheel section with batsman selector.
4. Update `ScorecardTab.tsx` to include PartnershipTracker below bowling table per innings.
5. Apply UI polish: refine card styles, typography, spacing in Dashboard, Matches, Players, Sidebar.
6. Validate and build.
