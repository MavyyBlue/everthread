# Everthread — Phase 6 Credit / Debt

Phase 6 now builds from certified Run #99 expanded source `6eb2b7876203d47dcc1ad5c48f1098bf359182cd`. Phase 6A Credit & Banking is CI Green on save schema 11.

## Product intent

Credit/debt must be a playable life system. Material financial processes should be visible, understandable, and actionable where the protagonist reasonably has agency. UI previews must read the same authority that applies the result. Cash and borrowed capacity are never the same thing.

## Phase 6A — Credit & Banking Foundation — CI Green Run #99

- `CreditSystem` owns bounded revolving accounts, available credit, secured deposits, statements/minimums, payments, interest/fees, formal inquiries, derogatories, compact positive history, derived creditworthiness, offers, closure, bankruptcy discharge, and credit-state normalization.
- Six fictional card products span age-16 secured starter credit through established/premium unsecured products. Browsing is deterministic/read-only; formal applications are bounded and persist understandable results.
- Life exposes **Cash** and **Credit Available** separately plus the mobile **Credit & Banking** hub. Credit Available never counts as cash, income, net worth, or estate wealth.
- Secured deposits remain refundable assets; revolving balances are liabilities and participate in wealth, bankruptcy/default history, estate obligations, and descendant handoff rules.
- Credit & Banking regression is 74/74; the user-supplied Run #99 certification confirms the established regression wall is green.

## Phase 6B1 — Asset Financing Foundation — current candidate

### Authority

- `AssetFinancingSystem` is the reusable lender/quote/signing authority for appropriate vehicles and homes. It consumes `CreditSystem.getCreditUnderwritingSnapshot()` rather than calculating a second score inside property/vehicle code.
- Underwriting uses the authoritative credit score/history, existing balance-to-income burden, annual debt-payment burden, income, recent inquiries, bankruptcy recovery, cash down payment, lender minimums, and projected ownership/payment burden.
- Six fictional financing programs are data definitions: three vehicle and three home programs with distinct score/income/down-payment/payment-burden/term/rate/recovery requirements.
- Quote generation is deterministic and read-only. Opening/reopening the same offer surface consumes no RNG/IDs and cannot reroll approval.

### Player experience

- Property and vehicle markets open a mobile **Buy Outright | Finance** sheet instead of immediately committing the purchase.
- Outright mode shows full cash price and cash on hand, and creates no lender debt or inquiry.
- Finance mode lets the player choose a down-payment percentage and compare lender cards before signing. Each card exposes lender/program, APR, term, down payment, amount financed, annual payment, monthly equivalent, finance charge, total paid if held to term, projected annual debt/ownership burden, and a specific approval/decline reason.
- The UI explicitly states that revolving **Credit Available is not purchase cash**. Browsing does not create an inquiry.
- Signing re-runs the same underwriting against current state, then consumes the shared formal-credit application limits, records an approved financing inquiry, deducts the exact down payment, and creates the real liability. A stale quote cannot bypass changed cash/credit/debt conditions.
- Asset liabilities expose APR, annual payment, and remaining term after purchase. Credit & Banking History resolves financing inquiries back to lender/program names. Material financed and outright asset purchases remain visible in durable life history.

### Accounting and persistence

- Signed vehicle contracts create existing `Loan.kind='car'`; signed home contracts create `Loan.kind='mortgage'`. Both use the previewed principal, APR, annual payment, and term exactly.
- `loan.assetId` links the liability to its collateral; financed homes also retain `property.mortgageId`. No second asset-finance balance database exists.
- The existing annual-finance authority services the loans. Wealth/net worth subtracts the liabilities while counting the asset, so financing does not fabricate wealth. Car debt is already included in estate debt obligations; retained property/mortgage handling continues through the estate authority.
- Bankruptcy history continues to affect future financing underwriting. Secured car/mortgage balances are not silently erased by the existing unsecured-debt bankruptcy path; repossession/expanded foreclosure consequences belong to the next 6B slice.
- Save schema remains 11 because the signed contracts use existing persisted `Loan`, asset-link, credit-inquiry, and timeline fields.

### QA status

- Added `assetFinancingRegression.ts` with 77 targeted checks covering deterministic browsing, lender definition integrity, credit/income/cash/bankruptcy declines, down-payment effects, stale-quote revalidation, preview→signed parity, application caps, Credit Available separation, vehicle/home cash and finance paths, collateral links, accounting identity, annual servicing, estate debt, save round-trip, invariants, and direct reuse of CreditSystem underwriting.
- Touched Phase 6B TS/TSX files pass local syntax/transpile checking. Focused strict type checks pass across the CreditSystem underwriting additions, AssetFinancingSystem, and PropertySystem.
- Direct runtime purchase-flow validation confirms deterministic offers, multiple strong-borrower approvals, exact quote→liability terms for financed vehicles and homes, correct collateral/cash/inquiry mutation, clean outright paths, specialized boat-financing deferral without mutation, and bankruptcy-recovery messaging.
- Full repository type gates, complete regression wall, production build, artifact creation, and Pages deployment remain pending GitHub Actions; Run #99 remains authoritative until this exact candidate is reproduced green.

## Phase 6B2 — Delinquency / collateral consequences — only after 6B1 CI Green

Deepen missed secured-loan payments, player-visible hardship choices where appropriate, vehicle repossession, and mortgage foreclosure consequences through the same loan/asset/credit authorities. Do not start this slice before 6B1 is certified.

## Phase 6C — Personal borrowing / bankruptcy / recovery

Deepen personal loans, voluntary bankruptcy decisions, hardship events, default/recovery consequences, and longer-lived credit rehabilitation. Do not make bankruptcy a silent score reset; the player must understand the immediate tradeoff and future access consequences.

## Compatibility rules

- Never treat credit limit/available credit as cash, income, net worth, or estate wealth.
- Never let opening/reopening a marketplace reroll approval.
- Never duplicate creditworthiness logic inside vehicle/property screens.
- Never let UI contract math diverge from the liability actually created.
- Never erase debt merely because the player dies or changes screens.
- Never preserve unbounded transaction/payment history when compact summaries can support the same simulation.
- Keep major financial consequences visible to the player and durable in history.
