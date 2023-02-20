alter table "public"."companies" add column "fts" tsvector generated always as (to_tsvector('english'::regconfig, (((name)::text || ' '::text) || (website)::text))) stored;

alter table "public"."contacts" add column "fts" tsvector generated always as (to_tsvector('english'::regconfig, (((((first_name)::text || ' '::text) || (last_name)::text) || ' '::text) || (email)::text))) stored;

alter table "public"."deals" add column "fts" tsvector generated always as (to_tsvector('english'::regconfig, (((name)::text || ' '::text) || (description)::text))) stored;

CREATE INDEX companies_fts ON public.companies USING gin (fts);

CREATE INDEX contacts_fts ON public.contacts USING gin (fts);

CREATE INDEX deals_fts ON public.deals USING gin (fts);


