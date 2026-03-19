import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Persistent Stores
  let tournaments = Map.empty<Nat, Tournament>();
  let teams = Map.empty<Nat, Team>();
  let players = Map.empty<Nat, Player>();
  // Separate stable store for CricHeroes stats — avoids Player type migration error
  let playerStats = Map.empty<Nat, PlayerStats>();
  let matches = Map.empty<Nat, Match>();
  let innings = Map.empty<Nat, Innings>();
  let innRuns = Map.empty<Nat, Nat>();
  let battingEntries = Map.empty<Nat, BattingEntry>();
  let bowlingEntries = Map.empty<Nat, BowlingEntry>();
  let feedbackMessages = Map.empty<Nat, FeedbackMessage>();

  var nextTournamentId = 1;
  var nextTeamId = 1;
  var nextPlayerId = 1;
  var nextMatchId = 1;
  var nextInningsId = 1;
  var nextBattingEntryId = 1;
  var nextBowlingEntryId = 1;
  var nextFeedbackId = 1;

  // Types
  type Timestamp = Time.Time;

  type DismissalType = {
    #caught;
    #bowled;
    #runOut;
    #lbw;
    #stumped;
    #hitWicket;
    #notOut;
  };

  type TournamentStatus = {
    #active;
    #completed;
  };

  type Tournament = {
    id : Nat;
    name : Text;
    createdAt : Timestamp;
    status : TournamentStatus;
  };

  type Team = {
    id : Nat;
    tournamentId : Nat;
    name : Text;
    logoUrl : Text;
  };

  type PlayerRole = {
    #batsman;
    #bowler;
    #allrounder;
    #wicketkeeper;
  };

  // Original Player type — unchanged for stable compatibility
  type Player = {
    id : Nat;
    teamId : Nat;
    name : Text;
    role : PlayerRole;
    jerseyNumber : Nat;
  };

  // Separate type for CricHeroes / historical stats
  type PlayerStats = {
    playerId : Nat;
    cricHeroesUrl : Text;
    totalRuns : Nat;
    totalWickets : Nat;
    battingAverage : Float;
    strikeRate : Float;
    cricHeroesVerified : Bool;
  };

  // Combined view type for frontend
  public type PlayerWithStats = {
    id : Nat;
    teamId : Nat;
    name : Text;
    role : PlayerRole;
    jerseyNumber : Nat;
    cricHeroesUrl : Text;
    totalRuns : Nat;
    totalWickets : Nat;
    battingAverage : Float;
    strikeRate : Float;
    cricHeroesVerified : Bool;
  };

  type MatchStatus = {
    #scheduled;
    #live;
    #completed;
  };

  type Match = {
    id : Nat;
    tournamentId : Nat;
    team1Id : Nat;
    team2Id : Nat;
    scheduledAt : Timestamp;
    venue : Text;
    status : MatchStatus;
    winnerId : ?Nat;
  };

  type Innings = {
    id : Nat;
    matchId : Nat;
    battingTeamId : Nat;
    totalRuns : Nat;
    totalWickets : Nat;
    totalOvers : Float;
  };

  type BattingEntry = {
    id : Nat;
    inningsId : Nat;
    playerId : Nat;
    runs : Nat;
    balls : Nat;
    fours : Nat;
    sixes : Nat;
    isOut : Bool;
    dismissalType : DismissalType;
  };

  type BowlingEntry = {
    id : Nat;
    inningsId : Nat;
    playerId : Nat;
    overs : Float;
    maidens : Nat;
    runs : Nat;
    wickets : Nat;
  };

  type PointsTableEntry = {
    teamId : Nat;
    matchesPlayed : Nat;
    wins : Nat;
    losses : Nat;
    ties : Nat;
    points : Nat;
    netRunRate : Float;
  };

  module PointsTableEntry {
    public func compare(a : PointsTableEntry, b : PointsTableEntry) : Order.Order {
      Nat.compare(b.points, a.points);
    };
  };

  type FeedbackMessage = {
    id : Nat;
    authorPrincipal : Principal;
    authorRole : Text;
    category : Text;
    message : Text;
    timestamp : Timestamp;
  };

  // Trending stats
  let trendingPlayers = [
    { playerId = 1; tournamentId = 1; runs = 1050; wickets = 35 },
    { playerId = 2; tournamentId = 2; runs = 980;  wickets = 28 },
    { playerId = 3; tournamentId = 1; runs = 1120; wickets = 40 },
  ];

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
    role : Role;
  };

  public type Role = {
    #organiser;
    #franchisee;
    #viewer;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let existingRole = switch (userProfiles.get(caller)) {
      case (?existing) { existing.role };
      case (null) { #viewer };
    };
    let profileToSave : UserProfile = {
      name = profile.name;
      role = existingRole;
    };
    userProfiles.add(caller, profileToSave);
    syncRoleToAccessControl(caller, existingRole);
  };

  public shared ({ caller }) func setUserRole(role : Role) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set user roles");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };
    userProfiles.add(caller, { name = profile.name; role });
    syncRoleToAccessControl(caller, role);
  };

  public query ({ caller }) func getCallerRole() : async ?Role {
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile.role };
      case (null) { null };
    };
  };

  func syncRoleToAccessControl(_user : Principal, _role : Role) {};

  func checkIsAdmin(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // Tournament CRUD
  public shared ({ caller }) func createTournament(name : Text) : async Nat {
    checkIsAdmin(caller);
    let id = getNextTournamentId();
    tournaments.add(id, { id; name; createdAt = Time.now(); status = #active });
    id;
  };

  public query ({ caller }) func getTournament(id : Nat) : async ?Tournament {
    tournaments.get(id);
  };

  public shared ({ caller }) func updateTournamentName(id : Nat, name : Text) : async () {
    checkIsAdmin(caller);
    let t = switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?t) { t };
    };
    tournaments.add(id, { t with name });
  };

  public shared ({ caller }) func updateTournamentStatus(id : Nat, status : TournamentStatus) : async () {
    checkIsAdmin(caller);
    let t = switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?t) { t };
    };
    tournaments.add(id, { t with status });
  };

  // Team CRUD
  public shared ({ caller }) func createTeam(tournamentId : Nat, name : Text, logoUrl : Text) : async Nat {
    checkIsAdmin(caller);
    let id = getNextTeamId();
    teams.add(id, { id; tournamentId; name; logoUrl });
    id;
  };

  // Player CRUD
  public shared ({ caller }) func createPlayer(
    teamId : Nat,
    name : Text,
    role : PlayerRole,
    jerseyNumber : Nat,
  ) : async Nat {
    checkIsAdmin(caller);
    let id = getNextPlayerId();
    players.add(id, { id; teamId; name; role; jerseyNumber });
    id;
  };

  public shared ({ caller }) func updatePlayerStats(
    playerId : Nat,
    cricHeroesUrl : Text,
    totalRuns : Nat,
    totalWickets : Nat,
    battingAverage : Float,
    strikeRate : Float,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (players.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?_) {};
    };
    let stats : PlayerStats = {
      playerId;
      cricHeroesUrl;
      totalRuns;
      totalWickets;
      battingAverage;
      strikeRate;
      cricHeroesVerified = cricHeroesUrl != "";
    };
    playerStats.add(playerId, stats);
  };

  // Match CRUD
  public shared ({ caller }) func createMatch(
    tournamentId : Nat,
    team1Id : Nat,
    team2Id : Nat,
    scheduledAt : Timestamp,
    venue : Text,
  ) : async Nat {
    checkIsAdmin(caller);
    let id = getNextMatchId();
    matches.add(id, { id; tournamentId; team1Id; team2Id; scheduledAt; venue; status = #scheduled; winnerId = null });
    id;
  };

  // Innings CRUD
  public shared ({ caller }) func createInnings(
    matchId : Nat,
    battingTeamId : Nat,
    totalRuns : Nat,
    totalWickets : Nat,
    totalOvers : Float,
  ) : async Nat {
    checkIsAdmin(caller);
    let id = getNextInningsId();
    innings.add(id, { id; matchId; battingTeamId; totalRuns; totalWickets; totalOvers });
    id;
  };

  // Batting Entry CRUD
  public shared ({ caller }) func createBattingEntry(
    inningsId : Nat,
    playerId : Nat,
    runs : Nat,
    balls : Nat,
    fours : Nat,
    sixes : Nat,
    isOut : Bool,
    dismissalType : DismissalType,
  ) : async Nat {
    checkIsAdmin(caller);
    let id = getNextBattingEntryId();
    battingEntries.add(id, { id; inningsId; playerId; runs; balls; fours; sixes; isOut; dismissalType });
    id;
  };

  // Bowling Entry CRUD
  public shared ({ caller }) func createBowlingEntry(
    inningsId : Nat,
    playerId : Nat,
    overs : Float,
    maidens : Nat,
    runs : Nat,
    wickets : Nat,
  ) : async Nat {
    checkIsAdmin(caller);
    let id = getNextBowlingEntryId();
    bowlingEntries.add(id, { id; inningsId; playerId; overs; maidens; runs; wickets });
    id;
  };

  // Feedback
  public shared ({ caller }) func submitFeedback(category : Text, message : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to submit feedback");
    };
    let roleText = switch (userProfiles.get(caller)) {
      case (?p) {
        switch (p.role) {
          case (#organiser) { "Organiser" };
          case (#franchisee) { "Franchisee" };
          case (#viewer) { "Viewer" };
        };
      };
      case (null) { "Unknown" };
    };
    let id = getNextFeedbackId();
    feedbackMessages.add(id, { id; authorPrincipal = caller; authorRole = roleText; category; message; timestamp = Time.now() });
    id;
  };

  public query ({ caller }) func getFeedback() : async [FeedbackMessage] {
    checkIsAdmin(caller);
    getAllFromMap(feedbackMessages);
  };

  // Public Getters
  public query ({ caller }) func getTournaments() : async [Tournament] {
    getAllFromMap(tournaments);
  };

  public query ({ caller }) func getTeamsForTournament(tournamentId : Nat) : async [Team] {
    getAllFromMap(teams).filter(func(t) { t.tournamentId == tournamentId });
  };

  public query ({ caller }) func getPlayersForTeam(teamId : Nat) : async [PlayerWithStats] {
    getAllFromMap(players)
      .filter(func(p) { p.teamId == teamId })
      .map(func(p : Player) : PlayerWithStats { mergePlayerStats(p) });
  };

  public query ({ caller }) func getMatchesForTournament(tournamentId : Nat) : async [Match] {
    getAllFromMap(matches).filter(func(m) { m.tournamentId == tournamentId });
  };

  public query ({ caller }) func getTrendingPlayers() : async [TrendingPlayer] {
    trendingPlayers;
  };

  public query ({ caller }) func getMatchDetails(matchId : Nat) : async MatchDetails {
    let match = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?m) { m };
    };
    let matchInnings = getAllFromMap(innings).filter(func(i) { i.matchId == matchId });
    var team1Score = 0;
    var team2Score = 0;
    for (inn in matchInnings.values()) {
      if (inn.battingTeamId == match.team1Id) { team1Score := inn.totalRuns };
      if (inn.battingTeamId == match.team2Id) { team2Score := inn.totalRuns };
    };
    {
      match;
      scorecard = { team1Id = match.team1Id; team2Id = match.team2Id; team1Score; team2Score };
    };
  };

  public query ({ caller }) func getPointsTable(tournamentId : Nat) : async [PointsTableEntry] {
    let teamsForTournament = getAllFromMap(teams).filter(func(t) { t.tournamentId == tournamentId });
    let teamsMap = Map.empty<Nat, PointsTableEntry>();
    for (team in teamsForTournament.values()) {
      teamsMap.add(team.id, { teamId = team.id; matchesPlayed = 0; wins = 0; losses = 0; ties = 0; points = 0; netRunRate = 0.0 });
    };
    let matchesForTournament = getAllFromMap(matches).filter(func(m) { m.tournamentId == tournamentId });
    for (m in matchesForTournament.values()) {
      switch (teamsMap.get(m.team1Id)) {
        case (?t1) { teamsMap.add(m.team1Id, { t1 with matchesPlayed = t1.matchesPlayed + 1 }) };
        case (null) {};
      };
      switch (teamsMap.get(m.team2Id)) {
        case (?t2) { teamsMap.add(m.team2Id, { t2 with matchesPlayed = t2.matchesPlayed + 1 }) };
        case (null) {};
      };
      switch (m.winnerId) {
        case (?winner) {
          let loser = if (winner == m.team1Id) { m.team2Id } else { m.team1Id };
          switch (teamsMap.get(winner)) {
            case (?w) { teamsMap.add(winner, { w with wins = w.wins + 1; points = w.points + 2 }) };
            case (null) {};
          };
          switch (teamsMap.get(loser)) {
            case (?l) { teamsMap.add(loser, { l with losses = l.losses + 1 }) };
            case (null) {};
          };
        };
        case (null) {};
      };
    };
    teamsMap.values().toArray().sort();
  };

  // Helper: merge Player with its optional PlayerStats
  func mergePlayerStats(p : Player) : PlayerWithStats {
    switch (playerStats.get(p.id)) {
      case (?s) {
        {
          id = p.id;
          teamId = p.teamId;
          name = p.name;
          role = p.role;
          jerseyNumber = p.jerseyNumber;
          cricHeroesUrl = s.cricHeroesUrl;
          totalRuns = s.totalRuns;
          totalWickets = s.totalWickets;
          battingAverage = s.battingAverage;
          strikeRate = s.strikeRate;
          cricHeroesVerified = s.cricHeroesVerified;
        };
      };
      case (null) {
        {
          id = p.id;
          teamId = p.teamId;
          name = p.name;
          role = p.role;
          jerseyNumber = p.jerseyNumber;
          cricHeroesUrl = "";
          totalRuns = 0;
          totalWickets = 0;
          battingAverage = 0.0;
          strikeRate = 0.0;
          cricHeroesVerified = false;
        };
      };
    };
  };

  // Helper Functions
  func getNextTournamentId() : Nat { let id = nextTournamentId; nextTournamentId += 1; id };
  func getNextTeamId() : Nat { let id = nextTeamId; nextTeamId += 1; id };
  func getNextPlayerId() : Nat { let id = nextPlayerId; nextPlayerId += 1; id };
  func getNextMatchId() : Nat { let id = nextMatchId; nextMatchId += 1; id };
  func getNextInningsId() : Nat { let id = nextInningsId; nextInningsId += 1; id };
  func getNextBattingEntryId() : Nat { let id = nextBattingEntryId; nextBattingEntryId += 1; id };
  func getNextBowlingEntryId() : Nat { let id = nextBowlingEntryId; nextBowlingEntryId += 1; id };
  func getNextFeedbackId() : Nat { let id = nextFeedbackId; nextFeedbackId += 1; id };

  func getAllFromMap<V>(map : Map.Map<Nat, V>) : [V] {
    map.values().toArray();
  };

  public type MatchScorecard = {
    team1Id : Nat;
    team2Id : Nat;
    team1Score : Nat;
    team2Score : Nat;
  };

  public type MatchDetails = {
    match : Match;
    scorecard : MatchScorecard;
  };

  public type TrendingPlayer = {
    playerId : Nat;
    tournamentId : Nat;
    runs : Nat;
    wickets : Nat;
  };
};
