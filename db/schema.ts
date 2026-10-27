import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
export const cases = pgTable(
  "transition_cases",
  {
    id: text().primaryKey(),
    ownerId: text("owner_id").notNull().unique(),
    ownerEmail: text("owner_email").notNull(),
    advisorEmail: text("advisor_email").notNull().default(""),
    revision: integer().notNull().default(1),
    data: jsonb().$type<any>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("cases_advisor_idx").on(t.advisorEmail)],
);
export const events = pgTable(
  "transition_events",
  {
    id: text().primaryKey(),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id),
    actorId: text("actor_id").notNull(),
    label: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("events_case_idx").on(t.caseId)],
);
export const messages = pgTable(
  "transition_messages",
  {
    id: text().primaryKey(),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id),
    actorId: text("actor_id").notNull(),
    question: text().notNull(),
    answer: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("messages_actor_idx").on(t.actorId, t.createdAt)],
);
