# CricManage Pro

## Current State
- Full cricket tournament management app with 6 roles: Organiser, Franchisee, Viewer, Player, Umpire, Scorer
- Backend: tournaments, teams, players, matches, innings, batting/bowling entries
- Player model has: id, teamId, name, role, jerseyNumber — no CricHeroes or historical stats fields
- No feedback/suggestion system exists
- Frontend has role-based dashboards, match schedule, scorecard widgets, points table

## Requested Changes (Diff)

### Add
- **Player historical stats fields:** cricHeroesUrl, totalRuns, totalWickets, battingAverage, strikeRate, cricHeroesVerified (Bool)
- **createPlayerWithStats** backend function: accepts above fields along with base player fields
- **updatePlayerStats** backend function: Organiser can update a player's historical stats
- **Feedback system:** FeedbackMessage type with id, authorPrincipal, authorRole, category, message, timestamp
- **submitFeedback** function: any logged-in user can submit feedback
- **getFeedback** function: Organiser-only, returns all feedback messages

### Modify
- **createPlayer** or add overload to accept optional cricHeroesUrl and stats for self-registration
- **Player type** extended with cricHeroesUrl, totalRuns, totalWickets, battingAverage, strikeRate, cricHeroesVerified

### Remove
- Nothing removed

## Implementation Plan
1. Extend Player type with historicalStats fields (cricHeroesUrl, totalRuns, totalWickets, battingAverage, strikeRate, cricHeroesVerified)
2. Update createPlayer to accept the extended fields
3. Add updatePlayerStats function (Organiser only)
4. Add FeedbackMessage type and persistent store
5. Add submitFeedback (any user) and getFeedback (Organiser only) functions
6. Frontend: Add CricHeroes URL + stats form fields during player registration
7. Frontend: Show "Verified by CricHeroes" badge on player profile/auction card when cricHeroesVerified = true
8. Frontend: Add "Suggestions" page/section in sidebar for all roles to submit feedback
9. Frontend: Add "Feedback Inbox" page for Organiser role to view all submissions
