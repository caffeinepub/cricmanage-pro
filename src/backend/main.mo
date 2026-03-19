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
  let matches = Map.empty<Nat, Match>();
  let innings = Map.empty<Nat, Innings>();
  let innRuns = Map.empty<Nat, Nat>();
  let battingEntries = Map.empty<Nat, BattingEntry>();
  let bowlingEntries = Map.empty<Nat, BowlingEntry>();

  var nextTournamentId = 1;
  var nextTeamId = 1;
  var nextPlayerId = 1;
  var nextMatchId = 1;
  var nextInningsId = 1;
  var nextBattingEntryId = 1;
  var nextBowlingEntryId = 1;

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

  type Player = {
    id : Nat;
    teamId : Nat;
    name : Text;
    role : PlayerRole;
    jerseyNumber : Nat;
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

  // Trending stats
  let trendingPlayers = [
    {
      playerId = 1;
      tournamentId = 1;
      runs = 1050;
      wickets = 35;
    },
    {
      playerId = 2;
      tournamentId = 2;
      runs = 980;
      wickets = 28;
    },
    {
      playerId = 3;
      tournamentId = 1;
      runs = 1120;
      wickets = 40;
    },
  ];

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
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
    userProfiles.add(caller, profile);
  };

  // Tournament CRUD
  public shared ({ caller }) func createTournament(name : Text) : async Nat {
    checkIsAdmin(caller);
    let id = getNextTournamentId();
    let tournament : Tournament = {
      id;
      name;
      createdAt = Time.now();
      status = #active;
    };
    tournaments.add(id, tournament);
    id;
  };

  public query ({ caller }) func getTournament(id : Nat) : async ?Tournament {
    tournaments.get(id);
  };

  public shared ({ caller }) func updateTournamentName(id : Nat, name : Text) : async () {
    checkIsAdmin(caller);
    let tournament = switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?t) { t };
    };
    let updatedTournament : Tournament = {
      id = tournament.id;
      name;
      createdAt = tournament.createdAt;
      status = tournament.status;
    };
    tournaments.add(id, updatedTournament);
  };

  public shared ({ caller }) func updateTournamentStatus(id : Nat, status : TournamentStatus) : async () {
    checkIsAdmin(caller);
    let tournament = switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?t) { t };
    };
    let updatedTournament : Tournament = {
      id = tournament.id;
      name = tournament.name;
      createdAt = tournament.createdAt;
      status;
    };
    tournaments.add(id, updatedTournament);
  };

  // Team CRUD
  public shared ({ caller }) func createTeam(tournamentId : Nat, name : Text, logoUrl : Text) : async Nat {
    checkIsAdmin(caller);
    let id = getNextTeamId();
    let team : Team = {
      id;
      tournamentId;
      name;
      logoUrl;
    };
    teams.add(id, team);
    id;
  };

  // Player CRUD
  public shared ({ caller }) func createPlayer(teamId : Nat, name : Text, role : PlayerRole, jerseyNumber : Nat) : async Nat {
    checkIsAdmin(caller);
    let id = getNextPlayerId();
    let player : Player = {
      id;
      teamId;
      name;
      role;
      jerseyNumber;
    };
    players.add(id, player);
    id;
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
    let match : Match = {
      id;
      tournamentId;
      team1Id;
      team2Id;
      scheduledAt;
      venue;
      status = #scheduled;
      winnerId = null;
    };
    matches.add(id, match);
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
    let entry : Innings = {
      id;
      matchId;
      battingTeamId;
      totalRuns;
      totalWickets;
      totalOvers;
    };
    innings.add(id, entry);
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
    let entry : BattingEntry = {
      id;
      inningsId;
      playerId;
      runs;
      balls;
      fours;
      sixes;
      isOut;
      dismissalType;
    };
    battingEntries.add(id, entry);
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
    let entry : BowlingEntry = {
      id;
      inningsId;
      playerId;
      overs;
      maidens;
      runs;
      wickets;
    };
    bowlingEntries.add(id, entry);
    id;
  };

  // Public Getters
  public query ({ caller }) func getTournaments() : async [Tournament] {
    getAllFromMap(tournaments);
  };

  public query ({ caller }) func getTeamsForTournament(tournamentId : Nat) : async [Team] {
    getAllFromMap(teams).filter(func(t) { t.tournamentId == tournamentId });
  };

  public query ({ caller }) func getPlayersForTeam(teamId : Nat) : async [Player] {
    getAllFromMap(players).filter(func(p) { p.teamId == teamId });
  };

  public query ({ caller }) func getMatchesForTournament(tournamentId : Nat) : async [Match] {
    getAllFromMap(matches).filter(func(m) { m.tournamentId == tournamentId });
  };

  // Added static trending players "widget" as a pure backend demo
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
      scorecard = {
        team1Id = match.team1Id;
        team2Id = match.team2Id;
        team1Score;
        team2Score;
      };
    };
  };

  // Calculations

  public query ({ caller }) func getPointsTable(tournamentId : Nat) : async [PointsTableEntry] {
    let teamsForTournament = getAllFromMap(teams).filter(func(t) { t.tournamentId == tournamentId });
    let teamsMap = Map.empty<Nat, PointsTableEntry>();

    for (team in teamsForTournament.values()) {
      let initialStats : PointsTableEntry = {
        teamId = team.id;
        matchesPlayed = 0;
        wins = 0;
        losses = 0;
        ties = 0;
        points = 0;
        netRunRate = 0.0;
      };
      teamsMap.add(team.id, initialStats);
    };

    let matchesForTournament = getAllFromMap(matches).filter(func(m) { m.tournamentId == tournamentId });

    for (m in matchesForTournament.values()) {
      let team1 = teamsMap.get(m.team1Id);
      let team2 = teamsMap.get(m.team2Id);

      switch (team1) {
        case (?t1) {
          let updatedTeam1 = {
            t1 with
            matchesPlayed = t1.matchesPlayed + 1;
          };
          teamsMap.add(m.team1Id, updatedTeam1);
        };
        case (null) {};
      };

      switch (team2) {
        case (?t2) {
          let updatedTeam2 = {
            t2 with
            matchesPlayed = t2.matchesPlayed + 1;
          };
          teamsMap.add(m.team2Id, updatedTeam2);
        };
        case (null) {};
      };

      switch (m.winnerId) {
        case (?winner) {
          let winnerStats = teamsMap.get(winner);
          let loser = if (winner == m.team1Id) { m.team2Id } else {
            m.team1Id;
          };
          let loserStats = teamsMap.get(loser);

          switch (winnerStats) {
            case (?w) {
              let updatedWinner = {
                w with
                wins = w.wins + 1;
                points = w.points + 2;
              };
              teamsMap.add(winner, updatedWinner);
            };
            case (null) {};
          };

          switch (loserStats) {
            case (?l) {
              let updatedLoser = {
                l with
                losses = l.losses + 1;
              };
              teamsMap.add(loser, updatedLoser);
            };
            case (null) {};
          };
        };
        case (null) {};
      };
    };

    teamsMap.values().toArray().sort();
  };

  // Helper Functions

  func getNextTournamentId() : Nat {
    let id = nextTournamentId;
    nextTournamentId += 1;
    id;
  };

  func getNextTeamId() : Nat {
    let id = nextTeamId;
    nextTeamId += 1;
    id;
  };

  func getNextPlayerId() : Nat {
    let id = nextPlayerId;
    nextPlayerId += 1;
    id;
  };

  func getNextMatchId() : Nat {
    let id = nextMatchId;
    nextMatchId += 1;
    id;
  };

  func getNextInningsId() : Nat {
    let id = nextInningsId;
    nextInningsId += 1;
    id;
  };

  func getNextBattingEntryId() : Nat {
    let id = nextBattingEntryId;
    nextBattingEntryId += 1;
    id;
  };

  func getNextBowlingEntryId() : Nat {
    let id = nextBowlingEntryId;
    nextBowlingEntryId += 1;
    id;
  };

  // Helper function for persistent Map data
  func getAllFromMap<V>(map : Map.Map<Nat, V>) : [V] {
    map.values().toArray();
  };

  func checkIsAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
