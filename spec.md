# CricManage Pro

## Current State
Empty scaffold with no implemented features.

## Requested Changes (Diff)

### Add
- Tournament management: Admin creates tournaments with manually entered names (e.g. "Patidar Premier League"), editable at any time via inline edit
- Team management: Create and manage teams within a tournament
- Player management: Add players to teams with basic details (name, role, jersey number)
- Match scheduling: Schedule matches between teams in a tournament with date, venue, time
- Scorecard entry: Live score entry during a match (runs, wickets, overs, individual batting/bowling stats)
- Points table: Auto-calculated standings based on match results (wins, losses, NRR)
- Match results: Record final scores and outcomes
- Admin authentication: Only authenticated admins can manage data
- Public view: Anyone can view tournaments, teams, standings, and match schedules

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend: Tournament CRUD (with editable name), Team CRUD, Player CRUD, Match scheduling and score entry, Points table calculation
2. Frontend: Admin login, Dashboard with tournament selector, Tournament detail page (teams, schedule, points table), Match scorecard, Inline name editing
3. Authorization component for admin role-based access
