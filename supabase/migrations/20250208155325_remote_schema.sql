

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


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






CREATE SCHEMA IF NOT EXISTS "postgis";


ALTER SCHEMA "postgis" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "postgis";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."blog" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "github_repo_url" "text" NOT NULL,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."blog" OWNER TO "postgres";


COMMENT ON COLUMN "public"."blog"."id" IS 'Primary Identifier';



ALTER TABLE "public"."blog" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."blogs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."feed" (
    "id" bigint NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "feed_url" "text" NOT NULL,
    "feed_title" "text" NOT NULL,
    "feed_description" "text",
    "topic_id" bigint
);


ALTER TABLE "public"."feed" OWNER TO "postgres";


COMMENT ON TABLE "public"."feed" IS 'Info about rss / other feeds';



COMMENT ON COLUMN "public"."feed"."topic_id" IS 'Is this feed associated to a topic';



ALTER TABLE "public"."feed" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rss_feeds_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."topic" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."topic" OWNER TO "postgres";


COMMENT ON TABLE "public"."topic" IS 'A list of topics users can subscribe to';



COMMENT ON COLUMN "public"."topic"."id" IS 'Identifier';



COMMENT ON COLUMN "public"."topic"."title" IS 'Title of the topic';



COMMENT ON COLUMN "public"."topic"."description" IS 'A description of this topic and the kind of content and articles it will have';



COMMENT ON COLUMN "public"."topic"."updated_at" IS 'Data last updated at';



ALTER TABLE "public"."topic" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."topics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "email" "text" NOT NULL,
    "profile_pic_url" "text",
    "primary_blog_url" "text",
    "primary_blog_rss_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_location" "text" DEFAULT 'Earth'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user"."id" IS 'id of the user';



COMMENT ON COLUMN "public"."user"."profile_pic_url" IS 'Profile picture url';



COMMENT ON COLUMN "public"."user"."primary_blog_url" IS 'This is the github pages url of their primary blog that they have set up via the app. To be shown on their profile page.';



COMMENT ON COLUMN "public"."user"."primary_blog_rss_url" IS 'This is the public facing rss feed url of their primary blog that other user''s can subscribe to';



COMMENT ON COLUMN "public"."user"."created_at" IS 'When was this user created';



COMMENT ON COLUMN "public"."user"."user_location" IS 'The city or country the user is located in so we can recommend relevant articles / events in their geography.';



CREATE TABLE IF NOT EXISTS "public"."user_feed_subscription" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "id" bigint NOT NULL,
    "rss_feed_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_feed_subscription" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_feed_subscription" IS 'Feeds a user is subscribed to';



COMMENT ON COLUMN "public"."user_feed_subscription"."user_id" IS 'ID of the user subscribing to the feed';



COMMENT ON COLUMN "public"."user_feed_subscription"."rss_feed_id" IS 'Id of the subscribed feed';



CREATE TABLE IF NOT EXISTS "public"."user_interest" (
    "id" bigint NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "topic_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."user_interest" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_interest" IS 'User interests, topics they are associated to';



ALTER TABLE "public"."user_interest" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_interests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."user_feed_subscription" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_rss_subscriptions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."blog"
    ADD CONSTRAINT "blogs_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."blog"
    ADD CONSTRAINT "blogs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feed"
    ADD CONSTRAINT "rss_feeds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topic"
    ADD CONSTRAINT "topics_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."topic"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topic"
    ADD CONSTRAINT "topics_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."user_interest"
    ADD CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_feed_subscription"
    ADD CONSTRAINT "user_rss_subscriptions_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."user_feed_subscription"
    ADD CONSTRAINT "user_rss_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "users_primary_blog_repo_url_key" UNIQUE ("primary_blog_url");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "users_primary_blog_rss_url_key" UNIQUE ("primary_blog_rss_url");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "users_user_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."blog"
    ADD CONSTRAINT "blogs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."user_interest"
    ADD CONSTRAINT "user_interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interest"
    ADD CONSTRAINT "user_interests_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_feed_subscription"
    ADD CONSTRAINT "user_rss_subscriptions_rss_feed_id_fkey" FOREIGN KEY ("rss_feed_id") REFERENCES "public"."feed"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_feed_subscription"
    ADD CONSTRAINT "user_rss_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."blog" TO "anon";
GRANT ALL ON TABLE "public"."blog" TO "authenticated";
GRANT ALL ON TABLE "public"."blog" TO "service_role";



GRANT ALL ON SEQUENCE "public"."blogs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."blogs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."blogs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."feed" TO "anon";
GRANT ALL ON TABLE "public"."feed" TO "authenticated";
GRANT ALL ON TABLE "public"."feed" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rss_feeds_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rss_feeds_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rss_feeds_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."topic" TO "anon";
GRANT ALL ON TABLE "public"."topic" TO "authenticated";
GRANT ALL ON TABLE "public"."topic" TO "service_role";



GRANT ALL ON SEQUENCE "public"."topics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."topics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."topics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."user_feed_subscription" TO "anon";
GRANT ALL ON TABLE "public"."user_feed_subscription" TO "authenticated";
GRANT ALL ON TABLE "public"."user_feed_subscription" TO "service_role";



GRANT ALL ON TABLE "public"."user_interest" TO "anon";
GRANT ALL ON TABLE "public"."user_interest" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interest" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_interests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_interests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_interests_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_rss_subscriptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_rss_subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_rss_subscriptions_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
