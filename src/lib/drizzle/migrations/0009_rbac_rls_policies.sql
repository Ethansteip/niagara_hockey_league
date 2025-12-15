-- =====================================================
-- RBAC Migration: Role-Based Access Control with RLS
-- =====================================================

-- 1. Create the profile role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "public"."profile_role_enum" AS ENUM('player', 'captain', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "role" "public"."profile_role_enum" NOT NULL DEFAULT 'player';

-- =====================================================
-- HELPER FUNCTIONS FOR RLS POLICIES (in public schema)
-- =====================================================

-- Function to get current user's profile ID
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS integer AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role::text FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if current user is captain of a specific team (via roster)
CREATE OR REPLACE FUNCTION public.is_captain_of_team_season(team_season_id_param integer)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM rosters r
    JOIN players p ON r.player_id = p.id
    JOIN profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
      AND r.team_season_id = team_season_id_param
      AND r.is_captain = true
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is captain/admin (has elevated permissions)
CREATE OR REPLACE FUNCTION public.is_captain_or_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('captain', 'admin')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get team_season_ids where user is captain
CREATE OR REPLACE FUNCTION public.get_my_captain_team_ids()
RETURNS integer[] AS $$
  SELECT COALESCE(ARRAY_AGG(r.team_season_id), '{}')
  FROM rosters r
  JOIN players p ON r.player_id = p.id
  JOIN profiles pr ON p.profile_id = pr.id
  WHERE pr.user_id = auth.uid()
    AND r.is_captain = true
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leagues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seasons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "divisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_seasons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "arenas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rosters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "games" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "player_game_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "goalie_game_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_standings" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================
-- Everyone can view profiles
CREATE POLICY "profiles_select_all" ON "profiles"
  FOR SELECT USING (true);

-- Players can only update their own profile
CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can insert/update/delete any profile
CREATE POLICY "profiles_admin_insert" ON "profiles"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "profiles_admin_update" ON "profiles"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "profiles_admin_delete" ON "profiles"
  FOR DELETE USING (public.is_admin());

-- Allow initial profile creation for new users
CREATE POLICY "profiles_insert_own" ON "profiles"
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- PLAYERS TABLE POLICIES  
-- =====================================================
-- Everyone can view players
CREATE POLICY "players_select_all" ON "players"
  FOR SELECT USING (true);

-- Only admins can modify players
CREATE POLICY "players_admin_insert" ON "players"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "players_admin_update" ON "players"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "players_admin_delete" ON "players"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- GAMES TABLE POLICIES (publicly accessible)
-- =====================================================
-- Anyone can view games
CREATE POLICY "games_select_all" ON "games"
  FOR SELECT USING (true);

-- Captains can update games their team plays in
CREATE POLICY "games_captain_update" ON "games"
  FOR UPDATE USING (
    public.is_admin() OR (
      public.is_captain_or_admin() AND (
        public.is_captain_of_team_season(home_team_season_id) OR
        public.is_captain_of_team_season(away_team_season_id)
      )
    )
  );

-- Only admins can insert/delete games
CREATE POLICY "games_admin_insert" ON "games"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "games_admin_delete" ON "games"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- TEAM STANDINGS POLICIES (publicly accessible)
-- =====================================================
-- Anyone can view standings
CREATE POLICY "team_standings_select_all" ON "team_standings"
  FOR SELECT USING (true);

-- Only admins can modify standings
CREATE POLICY "team_standings_admin_insert" ON "team_standings"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "team_standings_admin_update" ON "team_standings"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "team_standings_admin_delete" ON "team_standings"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- PLAYER_GAME_STATS POLICIES
-- =====================================================
-- Anyone can view stats
CREATE POLICY "player_game_stats_select_all" ON "player_game_stats"
  FOR SELECT USING (true);

-- Captains can update stats for their team's players
CREATE POLICY "player_game_stats_captain_update" ON "player_game_stats"
  FOR UPDATE USING (
    public.is_admin() OR (
      public.is_captain_or_admin() AND
      public.is_captain_of_team_season(team_season_id)
    )
  );

-- Captains can insert stats for their team's players
CREATE POLICY "player_game_stats_captain_insert" ON "player_game_stats"
  FOR INSERT WITH CHECK (
    public.is_admin() OR (
      public.is_captain_or_admin() AND
      public.is_captain_of_team_season(team_season_id)
    )
  );

-- Only admins can delete stats
CREATE POLICY "player_game_stats_admin_delete" ON "player_game_stats"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- GOALIE_GAME_STATS POLICIES
-- =====================================================
-- Anyone can view goalie stats
CREATE POLICY "goalie_game_stats_select_all" ON "goalie_game_stats"
  FOR SELECT USING (true);

-- Captains can update goalie stats for their team
CREATE POLICY "goalie_game_stats_captain_update" ON "goalie_game_stats"
  FOR UPDATE USING (
    public.is_admin() OR (
      public.is_captain_or_admin() AND
      public.is_captain_of_team_season(team_season_id)
    )
  );

-- Captains can insert goalie stats for their team
CREATE POLICY "goalie_game_stats_captain_insert" ON "goalie_game_stats"
  FOR INSERT WITH CHECK (
    public.is_admin() OR (
      public.is_captain_or_admin() AND
      public.is_captain_of_team_season(team_season_id)
    )
  );

-- Only admins can delete goalie stats
CREATE POLICY "goalie_game_stats_admin_delete" ON "goalie_game_stats"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- ROSTERS TABLE POLICIES
-- =====================================================
-- Anyone can view rosters
CREATE POLICY "rosters_select_all" ON "rosters"
  FOR SELECT USING (true);

-- Captains can update their team's roster
CREATE POLICY "rosters_captain_update" ON "rosters"
  FOR UPDATE USING (
    public.is_admin() OR (
      public.is_captain_or_admin() AND
      public.is_captain_of_team_season(team_season_id)
    )
  );

-- Only admins can add/remove roster entries
CREATE POLICY "rosters_admin_insert" ON "rosters"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "rosters_admin_delete" ON "rosters"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- LEAGUES TABLE POLICIES
-- =====================================================
CREATE POLICY "leagues_select_all" ON "leagues"
  FOR SELECT USING (true);

CREATE POLICY "leagues_admin_insert" ON "leagues"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "leagues_admin_update" ON "leagues"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "leagues_admin_delete" ON "leagues"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- SEASONS TABLE POLICIES
-- =====================================================
CREATE POLICY "seasons_select_all" ON "seasons"
  FOR SELECT USING (true);

CREATE POLICY "seasons_admin_insert" ON "seasons"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "seasons_admin_update" ON "seasons"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "seasons_admin_delete" ON "seasons"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- DIVISIONS TABLE POLICIES
-- =====================================================
CREATE POLICY "divisions_select_all" ON "divisions"
  FOR SELECT USING (true);

CREATE POLICY "divisions_admin_insert" ON "divisions"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "divisions_admin_update" ON "divisions"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "divisions_admin_delete" ON "divisions"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- TEAMS TABLE POLICIES
-- =====================================================
CREATE POLICY "teams_select_all" ON "teams"
  FOR SELECT USING (true);

CREATE POLICY "teams_admin_insert" ON "teams"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "teams_admin_update" ON "teams"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "teams_admin_delete" ON "teams"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- TEAM_SEASONS TABLE POLICIES
-- =====================================================
CREATE POLICY "team_seasons_select_all" ON "team_seasons"
  FOR SELECT USING (true);

CREATE POLICY "team_seasons_admin_insert" ON "team_seasons"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "team_seasons_admin_update" ON "team_seasons"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "team_seasons_admin_delete" ON "team_seasons"
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- ARENAS TABLE POLICIES
-- =====================================================
CREATE POLICY "arenas_select_all" ON "arenas"
  FOR SELECT USING (true);

CREATE POLICY "arenas_admin_insert" ON "arenas"
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "arenas_admin_update" ON "arenas"
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "arenas_admin_delete" ON "arenas"
  FOR DELETE USING (public.is_admin());

