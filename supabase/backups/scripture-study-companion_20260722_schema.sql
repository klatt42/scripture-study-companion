


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_user_settings"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        INSERT INTO user_settings (user_id)
        VALUES (NEW.id);
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."create_user_settings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_group_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
$$;


ALTER FUNCTION "public"."get_user_group_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_group_admin"("check_group_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM study_group_members
    WHERE group_id = check_group_id AND user_id = auth.uid() AND role = 'admin'
  )
$$;


ALTER FUNCTION "public"."is_group_admin"("check_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_group_member"("check_group_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM study_group_members
    WHERE group_id = check_group_id AND user_id = auth.uid()
  )
$$;


ALTER FUNCTION "public"."is_group_member"("check_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "event_type" "text" NOT NULL,
    "location" "text",
    "recurrence_rule" "text",
    "reminder_minutes" integer DEFAULT 1440,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "calendar_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['study'::"text", 'group-meeting'::"text", 'reminder'::"text", 'reading-plan'::"text"])))
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "post_id" "uuid",
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "group_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "community_posts_category_check" CHECK (("category" = ANY (ARRAY['discussion'::"text", 'question'::"text", 'prayer'::"text", 'resource'::"text", 'testimony'::"text"])))
);


ALTER TABLE "public"."community_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hymns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "source_hymnal" "text",
    "seasons" "text"[],
    "themes" "text"[],
    "lyrics" "text" NOT NULL,
    "sheet_music_url" "text",
    "copyright_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "hymns_type_check" CHECK (("type" = ANY (ARRAY['traditional'::"text", 'contemporary'::"text", 'gospel'::"text", 'worship'::"text"])))
);


ALTER TABLE "public"."hymns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."memory_verses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "reference" "text" NOT NULL,
    "verse_text" "text" NOT NULL,
    "translation" "text" DEFAULT 'NIV'::"text",
    "status" "text" DEFAULT 'new'::"text",
    "ease_factor" numeric(3,2) DEFAULT 2.50,
    "interval_days" integer DEFAULT 1,
    "repetitions" integer DEFAULT 0,
    "next_review" "date" DEFAULT CURRENT_DATE,
    "last_reviewed" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "memory_verses_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'learning'::"text", 'review'::"text", 'mastered'::"text"])))
);


ALTER TABLE "public"."memory_verses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "content" "text" NOT NULL,
    "tags" "text"[],
    "scripture_reference" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "full_name" "text",
    "study_group" "text",
    "denomination" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_plan_days" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "plan_id" "uuid",
    "day_number" integer NOT NULL,
    "passages" "text"[] NOT NULL,
    "reflection_prompt" "text"
);


ALTER TABLE "public"."reading_plan_days" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "duration_days" integer NOT NULL,
    "category" "text" NOT NULL,
    "is_public" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reading_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."research_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "topic" "text" NOT NULL,
    "question" "text",
    "content" "jsonb" NOT NULL,
    "sources" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."research_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_group_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid",
    "user_id" "uuid",
    "role" "text" DEFAULT 'member'::"text",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "study_group_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'leader'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."study_group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_public" boolean DEFAULT false,
    "current_study" "text",
    "meeting_schedule" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."study_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_guides" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "theme" "text" NOT NULL,
    "scripture_reference" "text",
    "content" "jsonb" NOT NULL,
    "study_type" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "study_guides_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'completed'::"text", 'archived'::"text"]))),
    CONSTRAINT "study_guides_study_type_check" CHECK (("study_type" = ANY (ARRAY['individual'::"text", 'small-group'::"text", 'family'::"text", 'academic'::"text"])))
);


ALTER TABLE "public"."study_guides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "session_date" "date" DEFAULT CURRENT_DATE,
    "duration_minutes" integer NOT NULL,
    "passage" "text",
    "notes" "text",
    "session_type" "text" DEFAULT 'reading'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "study_sessions_session_type_check" CHECK (("session_type" = ANY (ARRAY['reading'::"text", 'study'::"text", 'memory'::"text", 'prayer'::"text"])))
);


ALTER TABLE "public"."study_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_topics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "scripture_passages" "text"[],
    "category" "text",
    "is_favorite" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."study_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_hymns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "hymn_id" "uuid",
    "playlist_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_hymns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_reading_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "plan_id" "uuid",
    "current_day" integer DEFAULT 1,
    "completed_days" integer[] DEFAULT '{}'::integer[],
    "current_streak" integer DEFAULT 0,
    "longest_streak" integer DEFAULT 0,
    "last_read_date" "date",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."user_reading_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "theme" "text" DEFAULT 'light'::"text",
    "bible_version" "text" DEFAULT 'NIV'::"text",
    "email_notifications" boolean DEFAULT true,
    "calendar_reminders" boolean DEFAULT true,
    "community_notifications" boolean DEFAULT true,
    "font_size" "text" DEFAULT 'medium'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_settings_bible_version_check" CHECK (("bible_version" = ANY (ARRAY['NIV'::"text", 'ESV'::"text", 'KJV'::"text", 'NRSV'::"text", 'NASB'::"text", 'NLT'::"text"]))),
    CONSTRAINT "user_settings_font_size_check" CHECK (("font_size" = ANY (ARRAY['small'::"text", 'medium'::"text", 'large'::"text"]))),
    CONSTRAINT "user_settings_theme_check" CHECK (("theme" = ANY (ARRAY['light'::"text", 'dark'::"text", 'auto'::"text"])))
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_comments"
    ADD CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hymns"
    ADD CONSTRAINT "hymns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memory_verses"
    ADD CONSTRAINT "memory_verses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."reading_plan_days"
    ADD CONSTRAINT "reading_plan_days_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_plan_days"
    ADD CONSTRAINT "reading_plan_days_plan_id_day_number_key" UNIQUE ("plan_id", "day_number");



ALTER TABLE ONLY "public"."reading_plans"
    ADD CONSTRAINT "reading_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."research_notes"
    ADD CONSTRAINT "research_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_group_members"
    ADD CONSTRAINT "study_group_members_group_id_user_id_key" UNIQUE ("group_id", "user_id");



ALTER TABLE ONLY "public"."study_group_members"
    ADD CONSTRAINT "study_group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_groups"
    ADD CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_sessions"
    ADD CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_topics"
    ADD CONSTRAINT "study_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_hymns"
    ADD CONSTRAINT "user_hymns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_hymns"
    ADD CONSTRAINT "user_hymns_user_id_hymn_id_key" UNIQUE ("user_id", "hymn_id");



ALTER TABLE ONLY "public"."user_reading_progress"
    ADD CONSTRAINT "user_reading_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_reading_progress"
    ADD CONSTRAINT "user_reading_progress_user_id_plan_id_key" UNIQUE ("user_id", "plan_id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_calendar_start_time" ON "public"."calendar_events" USING "btree" ("start_time");



CREATE INDEX "idx_calendar_user_id" ON "public"."calendar_events" USING "btree" ("user_id");



CREATE INDEX "idx_community_comments_post_id" ON "public"."community_comments" USING "btree" ("post_id");



CREATE INDEX "idx_community_posts_group_id" ON "public"."community_posts" USING "btree" ("group_id");



CREATE INDEX "idx_community_posts_user_id" ON "public"."community_posts" USING "btree" ("user_id");



CREATE INDEX "idx_hymns_seasons" ON "public"."hymns" USING "gin" ("seasons");



CREATE INDEX "idx_hymns_themes" ON "public"."hymns" USING "gin" ("themes");



CREATE INDEX "idx_hymns_title_trgm" ON "public"."hymns" USING "gin" ("title" "public"."gin_trgm_ops");



CREATE INDEX "idx_memory_verses_next_review" ON "public"."memory_verses" USING "btree" ("next_review");



CREATE INDEX "idx_memory_verses_status" ON "public"."memory_verses" USING "btree" ("status");



CREATE INDEX "idx_memory_verses_user_id" ON "public"."memory_verses" USING "btree" ("user_id");



CREATE INDEX "idx_notes_tags" ON "public"."notes" USING "gin" ("tags");



CREATE INDEX "idx_notes_user_id" ON "public"."notes" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_study_group" ON "public"."profiles" USING "btree" ("study_group");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_reading_plans_category" ON "public"."reading_plans" USING "btree" ("category");



CREATE INDEX "idx_study_group_members_group" ON "public"."study_group_members" USING "btree" ("group_id");



CREATE INDEX "idx_study_group_members_user" ON "public"."study_group_members" USING "btree" ("user_id");



CREATE INDEX "idx_study_groups_public" ON "public"."study_groups" USING "btree" ("is_public");



CREATE INDEX "idx_study_guides_created_at" ON "public"."study_guides" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_study_guides_status" ON "public"."study_guides" USING "btree" ("status");



CREATE INDEX "idx_study_guides_user_id" ON "public"."study_guides" USING "btree" ("user_id");



CREATE INDEX "idx_study_sessions_date" ON "public"."study_sessions" USING "btree" ("session_date" DESC);



CREATE INDEX "idx_study_sessions_user_id" ON "public"."study_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_study_topics_category" ON "public"."study_topics" USING "btree" ("category");



CREATE INDEX "idx_study_topics_favorite" ON "public"."study_topics" USING "btree" ("user_id", "is_favorite");



CREATE INDEX "idx_study_topics_user_id" ON "public"."study_topics" USING "btree" ("user_id");



CREATE INDEX "idx_user_reading_progress_plan_id" ON "public"."user_reading_progress" USING "btree" ("plan_id");



CREATE INDEX "idx_user_reading_progress_user_id" ON "public"."user_reading_progress" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "create_settings_on_profile_insert" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_user_settings"();



CREATE OR REPLACE TRIGGER "update_calendar_events_updated_at" BEFORE UPDATE ON "public"."calendar_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_community_posts_updated_at" BEFORE UPDATE ON "public"."community_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notes_updated_at" BEFORE UPDATE ON "public"."notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_study_groups_updated_at" BEFORE UPDATE ON "public"."study_groups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_study_guides_updated_at" BEFORE UPDATE ON "public"."study_guides" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_comments"
    ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_comments"
    ADD CONSTRAINT "community_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memory_verses"
    ADD CONSTRAINT "memory_verses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_plan_days"
    ADD CONSTRAINT "reading_plan_days_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_plans"
    ADD CONSTRAINT "reading_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."research_notes"
    ADD CONSTRAINT "research_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."study_group_members"
    ADD CONSTRAINT "study_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."study_group_members"
    ADD CONSTRAINT "study_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."study_groups"
    ADD CONSTRAINT "study_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."study_sessions"
    ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."study_topics"
    ADD CONSTRAINT "study_topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_hymns"
    ADD CONSTRAINT "user_hymns_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "public"."hymns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_hymns"
    ADD CONSTRAINT "user_hymns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_reading_progress"
    ADD CONSTRAINT "user_reading_progress_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_reading_progress"
    ADD CONSTRAINT "user_reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete groups" ON "public"."study_groups" FOR DELETE USING ("public"."is_group_admin"("id"));



CREATE POLICY "Admins can update groups" ON "public"."study_groups" FOR UPDATE USING ("public"."is_group_admin"("id"));



CREATE POLICY "Anyone can view comments on global posts" ON "public"."community_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."community_posts"
  WHERE (("community_posts"."id" = "community_comments"."post_id") AND ("community_posts"."group_id" IS NULL)))));



CREATE POLICY "Anyone can view global posts" ON "public"."community_posts" FOR SELECT USING (("group_id" IS NULL));



CREATE POLICY "Anyone can view hymns" ON "public"."hymns" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view plan days" ON "public"."reading_plan_days" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view public groups" ON "public"."study_groups" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Anyone can view public plans" ON "public"."reading_plans" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Members can comment on group posts" ON "public"."community_comments" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."community_posts"
  WHERE (("community_posts"."id" = "community_comments"."post_id") AND ("community_posts"."group_id" IS NOT NULL) AND "public"."is_group_member"("community_posts"."group_id"))))));



CREATE POLICY "Members can create group posts" ON "public"."community_posts" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ("group_id" IS NOT NULL) AND "public"."is_group_member"("group_id")));



CREATE POLICY "Members can view comments on group posts" ON "public"."community_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."community_posts"
  WHERE (("community_posts"."id" = "community_comments"."post_id") AND ("community_posts"."group_id" IS NOT NULL) AND "public"."is_group_member"("community_posts"."group_id")))));



CREATE POLICY "Members can view group posts" ON "public"."community_posts" FOR SELECT USING ((("group_id" IS NOT NULL) AND "public"."is_group_member"("group_id")));



CREATE POLICY "Members can view private groups" ON "public"."study_groups" FOR SELECT USING ("public"."is_group_member"("id"));



CREATE POLICY "Users can comment on global posts" ON "public"."community_comments" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."community_posts"
  WHERE (("community_posts"."id" = "community_comments"."post_id") AND ("community_posts"."group_id" IS NULL))))));



CREATE POLICY "Users can create events" ON "public"."calendar_events" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create favorites" ON "public"."user_hymns" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create global posts" ON "public"."community_posts" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ("group_id" IS NULL)));



CREATE POLICY "Users can create groups" ON "public"."study_groups" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create notes" ON "public"."notes" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create plans" ON "public"."reading_plans" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create progress" ON "public"."user_reading_progress" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create research" ON "public"."research_notes" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create sessions" ON "public"."study_sessions" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create study guides" ON "public"."study_guides" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create study topics" ON "public"."study_topics" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create verses" ON "public"."memory_verses" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete favorites" ON "public"."user_hymns" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own comments" ON "public"."community_comments" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own events" ON "public"."calendar_events" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own notes" ON "public"."notes" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own posts" ON "public"."community_posts" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own progress" ON "public"."user_reading_progress" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own research" ON "public"."research_notes" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own sessions" ON "public"."study_sessions" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own study guides" ON "public"."study_guides" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own study topics" ON "public"."study_topics" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own verses" ON "public"."memory_verses" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can insert own settings" ON "public"."user_settings" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can join groups" ON "public"."study_group_members" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can leave groups" ON "public"."study_group_members" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own comments" ON "public"."community_comments" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own events" ON "public"."calendar_events" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own notes" ON "public"."notes" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own posts" ON "public"."community_posts" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can update own progress" ON "public"."user_reading_progress" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own settings" ON "public"."user_settings" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own study guides" ON "public"."study_guides" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own study topics" ON "public"."study_topics" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own verses" ON "public"."memory_verses" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view co-member memberships" ON "public"."study_group_members" FOR SELECT USING (("group_id" IN ( SELECT "public"."get_user_group_ids"() AS "get_user_group_ids")));



CREATE POLICY "Users can view own events" ON "public"."calendar_events" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own favorites" ON "public"."user_hymns" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own memberships" ON "public"."study_group_members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own notes" ON "public"."notes" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own plans" ON "public"."reading_plans" FOR SELECT USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view own progress" ON "public"."user_reading_progress" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own research" ON "public"."research_notes" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own sessions" ON "public"."study_sessions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own settings" ON "public"."user_settings" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own study guides" ON "public"."study_guides" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own study topics" ON "public"."study_topics" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own verses" ON "public"."memory_verses" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hymns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memory_verses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_plan_days" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."research_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_guides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_hymns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_reading_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."create_user_settings"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_settings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_settings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_group_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_group_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_group_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_group_admin"("check_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_group_admin"("check_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_group_admin"("check_group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_group_member"("check_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_group_member"("check_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_group_member"("check_group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."community_comments" TO "anon";
GRANT ALL ON TABLE "public"."community_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."community_comments" TO "service_role";



GRANT ALL ON TABLE "public"."community_posts" TO "anon";
GRANT ALL ON TABLE "public"."community_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."community_posts" TO "service_role";



GRANT ALL ON TABLE "public"."hymns" TO "anon";
GRANT ALL ON TABLE "public"."hymns" TO "authenticated";
GRANT ALL ON TABLE "public"."hymns" TO "service_role";



GRANT ALL ON TABLE "public"."memory_verses" TO "anon";
GRANT ALL ON TABLE "public"."memory_verses" TO "authenticated";
GRANT ALL ON TABLE "public"."memory_verses" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reading_plan_days" TO "anon";
GRANT ALL ON TABLE "public"."reading_plan_days" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_plan_days" TO "service_role";



GRANT ALL ON TABLE "public"."reading_plans" TO "anon";
GRANT ALL ON TABLE "public"."reading_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_plans" TO "service_role";



GRANT ALL ON TABLE "public"."research_notes" TO "anon";
GRANT ALL ON TABLE "public"."research_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."research_notes" TO "service_role";



GRANT ALL ON TABLE "public"."study_group_members" TO "anon";
GRANT ALL ON TABLE "public"."study_group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."study_group_members" TO "service_role";



GRANT ALL ON TABLE "public"."study_groups" TO "anon";
GRANT ALL ON TABLE "public"."study_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."study_groups" TO "service_role";



GRANT ALL ON TABLE "public"."study_guides" TO "anon";
GRANT ALL ON TABLE "public"."study_guides" TO "authenticated";
GRANT ALL ON TABLE "public"."study_guides" TO "service_role";



GRANT ALL ON TABLE "public"."study_sessions" TO "anon";
GRANT ALL ON TABLE "public"."study_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."study_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."study_topics" TO "anon";
GRANT ALL ON TABLE "public"."study_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."study_topics" TO "service_role";



GRANT ALL ON TABLE "public"."user_hymns" TO "anon";
GRANT ALL ON TABLE "public"."user_hymns" TO "authenticated";
GRANT ALL ON TABLE "public"."user_hymns" TO "service_role";



GRANT ALL ON TABLE "public"."user_reading_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_reading_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_reading_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































