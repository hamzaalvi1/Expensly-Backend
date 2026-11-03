ALTER TABLE "transactions" ADD COLUMN "budget_id" uuid;--> statement-breakpoint
WITH matching_budgets AS (
  SELECT
    t."id" AS transaction_id,
    (array_agg(b."id"))[1] AS budget_id
  FROM "transactions" t
  INNER JOIN "budgets" b
    ON b."user_id" = t."user_id"
   AND b."category_id" = t."category_id"
   AND t."transaction_date" >= b."start_date"
   AND t."transaction_date" <= b."end_date"
  WHERE t."type" = 'EXPENSE'
  GROUP BY t."id"
  HAVING COUNT(*) = 1
)
UPDATE "transactions" t
SET "budget_id" = matching_budgets.budget_id
FROM matching_budgets
WHERE t."id" = matching_budgets.transaction_id;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_txn_budget_id" ON "transactions" USING btree ("budget_id");
