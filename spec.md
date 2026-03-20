# CricManage Pro

## Current State
Version 6 is live with:
- Six roles with RBAC, dark analytics dashboard
- Match detail tabs: Info, Live, Scorecard, Comms, Squads
- Live scoring: Scorers/Organisers can enter scores; others see read-only banner
- Scorecard and Comms tabs exist but are not wired for data entry
- CricHeroes importer, Suggestions system, Points Table all functional

## Requested Changes (Diff)

### Add
- Ball-by-ball commentary entry form in Comms tab (Scorer/Organiser only)
- Commentary log display in Comms tab (all roles can read)
- Scorecard tab: detailed batting and bowling scorecard per innings
- Scorer/Organiser can log each delivery: bowler, batsman, runs, wicket type, extras
- Auto-update scorecard totals from ball-by-ball entries
- Read-only banner for non-scoring roles in Comms entry area

### Modify
- Comms tab: replace placeholder with live commentary feed + entry form
- Scorecard tab: replace placeholder with structured innings scorecard table

### Remove
- Placeholder/empty state content in Comms and Scorecard tabs

## Implementation Plan
1. Extend AppContext with commentary entries and scorecard data structures per match
2. Build BallEntry form component (bowler, batsman, runs, extras, wicket)
3. Build CommsTab component with feed and entry form (role-gated)
4. Build ScorecardTab component with batting/bowling tables per innings
5. Wire both into match detail view tabs
