CREATE TABLE "common_fund_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"requester_user_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resolved_by_user_id" uuid,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "common_fund_claims" ADD CONSTRAINT "common_fund_claims_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "common_fund_claims" ADD CONSTRAINT "common_fund_claims_requester_user_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "common_fund_claims" ADD CONSTRAINT "common_fund_claims_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "common_fund_claims_game_id_idx" ON "common_fund_claims" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "common_fund_claims_requester_user_id_idx" ON "common_fund_claims" USING btree ("requester_user_id");--> statement-breakpoint
CREATE INDEX "common_fund_claims_status_idx" ON "common_fund_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "common_fund_claims_created_at_idx" ON "common_fund_claims" USING btree ("created_at");