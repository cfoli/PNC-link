CREATE TABLE "transition_cases" (
	"id" text PRIMARY KEY,
	"owner_id" text NOT NULL UNIQUE,
	"owner_email" text NOT NULL,
	"advisor_email" text DEFAULT '' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transition_events" (
	"id" text PRIMARY KEY,
	"case_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transition_messages" (
	"id" text PRIMARY KEY,
	"case_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cases_advisor_idx" ON "transition_cases" ("advisor_email");--> statement-breakpoint
CREATE INDEX "events_case_idx" ON "transition_events" ("case_id");--> statement-breakpoint
CREATE INDEX "messages_actor_idx" ON "transition_messages" ("actor_id","created_at");--> statement-breakpoint
ALTER TABLE "transition_events" ADD CONSTRAINT "transition_events_case_id_transition_cases_id_fkey" FOREIGN KEY ("case_id") REFERENCES "transition_cases"("id");--> statement-breakpoint
ALTER TABLE "transition_messages" ADD CONSTRAINT "transition_messages_case_id_transition_cases_id_fkey" FOREIGN KEY ("case_id") REFERENCES "transition_cases"("id");