SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict h0Adi0ADLMibx9EJcHvSEdMpWFIbvv5XINjokoCPucnRLpSqDF4Ddc67c9MKdGr

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '72b12a8c-81e4-41f2-b301-8e21e1f80a17', 'authenticated', 'authenticated', 'klatt42@gmail.com', '$2a$10$PDC54.UUm/bxxSp5xXwvj.KJiXXNAOlNAGD/5/3FZ9LFlDgE1ha42', '2026-01-02 21:29:52.90978+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-09 16:07:47.450576+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-01-02 15:40:36.19968+00', '2026-01-09 16:07:47.453041+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('72b12a8c-81e4-41f2-b301-8e21e1f80a17', '72b12a8c-81e4-41f2-b301-8e21e1f80a17', '{"sub": "72b12a8c-81e4-41f2-b301-8e21e1f80a17", "email": "klatt42@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-02 15:40:36.204913+00', '2026-01-02 15:40:36.20498+00', '2026-01-02 15:40:36.20498+00', 'aa8b5bfe-1b61-4bc8-89eb-efa943de85db');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "username", "full_name", "study_group", "denomination", "avatar_url", "created_at", "updated_at") VALUES
	('72b12a8c-81e4-41f2-b301-8e21e1f80a17', 'klatt42', 'Ron Klatt', NULL, NULL, NULL, '2026-01-02 21:34:44.467437+00', '2026-01-02 21:34:44.467437+00');


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: study_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."study_groups" ("id", "name", "description", "is_public", "current_study", "meeting_schedule", "created_by", "created_at", "updated_at") VALUES
	('2bde9f1a-ac94-4ec4-8876-37dcfaf5c3f7', 'E2E Test Group', 'Testing group creation', true, NULL, NULL, '72b12a8c-81e4-41f2-b301-8e21e1f80a17', '2026-01-09 16:07:08.314497+00', '2026-01-09 16:07:08.314497+00'),
	('d28cf804-b1e5-4022-87b4-5408b8fbcd8d', 'E2E Test Group', 'Testing group creation', true, NULL, NULL, '72b12a8c-81e4-41f2-b301-8e21e1f80a17', '2026-01-09 16:07:50.965626+00', '2026-01-09 16:07:50.965626+00');


--
-- Data for Name: community_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: community_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: hymns; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."hymns" ("id", "title", "type", "source_hymnal", "seasons", "themes", "lyrics", "sheet_music_url", "copyright_info", "created_at") VALUES
	('56d46249-95f1-44ba-aa05-27548b858cdd', 'Amazing Grace', 'traditional', 'Baptist Hymnal', '{general}', '{grace,redemption}', 'Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now am found
Was blind, but now I see', NULL, 'Public Domain', '2026-01-02 16:35:22.463236+00'),
	('893cd22e-4428-48cc-88f8-ca9f7e6c3fef', 'How Great Thou Art', 'traditional', 'Lutheran Service Book', '{general}', '{worship,praise}', 'O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made
I see the stars, I hear the rolling thunder
Thy power
    throughout the universe displayed', NULL, 'Public Domain', '2026-01-02 16:35:22.463236+00'),
	('42f3e2cd-9751-461a-9656-ecbb1cb537ec', 'Come Thou Fount', 'traditional', 'Methodist Hymnal', '{general}', '{grace,thanksgiving}', 'Come Thou Fount of every blessing
Tune my heart to sing Thy grace
Streams of mercy, never ceasing
Call for songs of loudest praise', NULL, 'Public Domain', '2026-01-02 16:35:22.463236+00'),
	('6baa2349-a84d-464d-83d7-a14abd3f0ac5', 'O Come, O Come, Emmanuel', 'traditional', 'Advent Hymnal', '{advent}', '{hope,waiting}', 'O come, O come, Emmanuel
And ransom captive Israel
That mourns in lonely exile here
Until the Son of God appear', NULL, 'Public Domain', '2026-01-02 16:35:22.463236+00'),
	('67d1da92-fe74-4b80-a470-fd4d7100b8d1', 'Christ the Lord Is Risen Today', 'traditional', 'Easter Hymnal', '{easter}', '{resurrection,victory}', 'Christ the Lord is risen today, Alleluia!
Earth and heaven in chorus say, Alleluia!
Raise your joys and triumphs high, Alleluia!
Sing, ye
    heavens, and earth reply, Alleluia!', NULL, 'Public Domain', '2026-01-02 16:35:22.463236+00');


--
-- Data for Name: memory_verses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reading_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reading_plans" ("id", "name", "description", "duration_days", "category", "is_public", "created_by", "created_at") VALUES
	('3fca78c0-a277-4978-87a3-c3695f53ab3c', 'Bible in a Year', 'Read through the entire Bible in 365 days with daily Old Testament, New Testament, and Psalms readings.', 365, 'Comprehensive', true, NULL, '2026-01-02 16:35:22.463236+00'),
	('5a46b0a0-d689-4695-a61b-a1f7b1cffc65', 'Gospels Deep Dive', 'Spend 90 days exploring Matthew, Mark, Luke, and John with reflection questions.', 90, 'New Testament', true, NULL, '2026-01-02 16:35:22.463236+00'),
	('3fc07901-8305-4afb-a052-61f56db87bc3', 'Psalms & Proverbs', 'Daily wisdom and worship readings from Psalms and Proverbs over 31 days.', 31, 'Wisdom Literature', true, NULL, '2026-01-02 16:35:22.463236+00'),
	('e3bc605d-97b2-4a69-b41c-1227a9ade513', 'Lenten Journey', '40 days of readings following Jesus from temptation to resurrection.', 40, 'Seasonal', true, NULL, '2026-01-02 16:35:22.463236+00');


--
-- Data for Name: reading_plan_days; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: research_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: study_group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: study_guides; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: study_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: study_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_hymns; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_reading_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_settings" ("id", "user_id", "theme", "bible_version", "email_notifications", "calendar_reminders", "community_notifications", "font_size", "created_at", "updated_at") VALUES
	('628bd656-bb24-4181-8388-b64290fc36dc', '72b12a8c-81e4-41f2-b301-8e21e1f80a17', 'light', 'NIV', true, true, true, 'medium', '2026-01-02 21:34:44.467437+00', '2026-01-02 21:34:44.467437+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 8, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict h0Adi0ADLMibx9EJcHvSEdMpWFIbvv5XINjokoCPucnRLpSqDF4Ddc67c9MKdGr

RESET ALL;
