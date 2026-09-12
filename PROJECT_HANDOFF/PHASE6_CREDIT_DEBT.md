# Everthread — Phase 6 Credit / Debt

Phase 6 now builds from certified Run #100 expanded source `819d223aa9a0d5f9109c705f16213c43ddcaeb31`. Phase 6A Credit & Banking and Phase 6B1 Asset Financing are CI Green on save schema 11.

## Product intent

Credit/debt must be a playable life system. Material financial processes should be visible, understandable, and actionable where the protagonist reasonably has agency. UI previews and status surfaces must read the same authorities that apply the result. Cash and borrowed capacity are never the same thing.

## Phase 6A — Credit & Banking Foundation — CI Green Run #99

- `CreditSystem` owns bounded revolving accounts, available credit, secured deposits, statements/minimums, payments, interest/fees, formal inquiries, derogatories, compact positive history, derived creditworthiness, offers, closure, bankruptcy discharge, and credit-state normalization.
- Six fictional card products span age-16 secured starter credit through established/premium unsecured products. Browsing is deterministic/read-only; formal applications are bounded and persist understandable results.
- Life exposes **Cash** and **Credit Available** separately plus the mobile **Credit & Banking** hub. Credit Available never counts as cash, income, net worth, or estate wealth.
- Credit & Banking regression remains 74/74.

## Phase 6B1 — Asset Financing Foundation — CI Green Run #100

### Authority

- `AssetFinancingSystem` is the reusable lender/quote/signing authority for appropriate vehicles and homes. It consumes `CreditSystem.getCreditUnderwritingSnapshot()` rather than calculating a second score inside property/vehicle code.
- Six fictional financing programs are data definitions: three vehicle and three home programs with distinct score/income/down-payment/payment-burden/term/rate/recovery requirements.
- Quote generation is deterministic and read-only. Opening/reopening the same offer surface consumes no RNG/IDs and cannot reroll approval.
- Signing re-runs underwriting, consumes shared formal-credit application limits, records the financing inquiry, deducts the exact down payment, and creates the real `Loan.kind='car'|'mortgage'` liability with the previewed principal/APR/payment/term.

### Player experience

- Property and vehicle markets use a mobile **Buy Outright | Finance** sheet.
- Outright mode uses Cash and creates no lender inquiry/debt.
- Finance mode exposes lender/program, approval/decline reason, APR, term, down payment, amount financed, annual payment, monthly equivalent, finance charge, total held-to-term cost, and projected burden before commitment.
- Revolving **Credit Available is not purchase cash**.
- Asset Financing regression is 77/77; Run #100 passed the full canonical preflight and Pages deployment.

## Phase 6B2 — Secured Delinquency & Collateral Consequences — current candidate

### Authoritative state

- Existing `Loan` remains the only player installment-liability authority.
- Secured car/mortgage loans may persist optional `delinquency` state directly on the loan: `status`, `arrears`, `missedPayments`, and `lastMissedPaymentAge`.
- Pre-6B2 schema-11 loans have no required migration. Read-only status projection treats missing delinquency fields as current and does not mutate the loan merely because UI inspected it.
- No second collateral/debt balance database exists.

### Annual finance behavior

- A secured payment is no longer treated as paid when annual cash flow cannot fund it. If a secured payment must be skipped, the loan balance keeps the accrued interest, the scheduled principal reduction is reversed, and the contractual year is not consumed.
- The full skipped annual payment becomes arrears and CreditSystem records an existing `missed_payment` derogatory.
- Same-year secured shortfall selection protects housing by allowing car financing to miss before a mortgage when one released payment is enough to close the cash gap. Larger shortfalls may make both delinquent.
- Any remaining uncovered annual costs continue through the existing unsecured-debt / bankruptcy authorities.

### Player agency and UI

- The first secured miss creates a one-Age-Up cure window rather than instantly removing the asset.
- Assets → Money shows the loan, collateral, balance, annual payment, term, past-due amount, and explicit consequence: repossession for a car or foreclosure for a home.
- Owned financed home/vehicle cards show their outstanding financed balance and visibly switch to an at-risk state when delinquent.
- **Cure** is a real `GameEngine` action. It requires enough Cash for the full arrears amount, reduces the real loan balance, restores the consumed term year, resets the delinquency state, and creates durable timeline history.
- Credit Available is never used as cure cash.

### Collateral consequences

- Aging again with unresolved car delinquency can repossess the linked vehicle.
- Aging again with unresolved mortgage delinquency can foreclose the linked property.
- Collateral recovery applies against the secured balance. If recovery exceeds the balance, represented surplus/equity can return to the player; if recovery is insufficient, the unrecovered amount becomes ordinary personal unsecured deficiency debt instead of disappearing.
- Foreclosure residual equity first reconciles existing unsecured shortfall debt before any remainder returns as cash, preserving the established insolvency behavior.
- Repossession records a major credit default; foreclosure uses the existing foreclosure derogatory authority. Both consequences create durable timeline history and emotional/reputation consequences.
- Voluntarily selling an underwater financed home also preserves the mortgage deficiency as unsecured debt, closing the previous sell-to-erase-debt exploit.

### Saves and accounting

- Save schema remains 11. The new delinquency object is optional, backward-compatible state attached to existing loans; existing schema-11 saves load without churn.
- Wealth/net-worth continues to count each loan balance exactly once. Arrears are a status/amount-due view of that same balance and are not double-counted as a second liability.
- Existing estate and bankruptcy behavior remains authoritative. Secured loans are not silently discharged by the unsecured bankruptcy path; deficiency debt becomes unsecured only after collateral settlement.
- Paid-off cured mortgages clear stale property mortgage links.

### QA status

- Added `assetDelinquencyRegression.ts` with 82 targeted checks covering legacy/current status projection, correct amortization, missed-payment accounting, cure failure/success/payoff, car repossession, foreclosure, surplus/deficiency handling, default/foreclosure credit history, multiple secured-loan priority, underwater voluntary sales, accounting identity, and schema-11 persistence.
- Local canonical preflight was run from the exact certified Run #100 source + dependency artifact and is GREEN **4/4**: engine TypeScript, test TypeScript, complete regression wall, production build.
- Core 82/82, Credit & Banking 74/74, Asset Financing 77/77, Asset Delinquency 82/82, Dynasty Transition 63/63, Family Topology 40/40, NPC Asset Ownership 82/82, Timeline Scaling 11/11, Action VFX 46/46, Integrated Long-Life 105/105, and every established dedicated suite are green locally.
- Production build succeeds at 151 transformed modules. The existing >700 kB main-chunk warning is still nonblocking.
- GitHub Actions is the certification authority. Run #100 remains the certified baseline until this exact 6B2 overlay is reproduced green.

## Phase 6C — Personal borrowing / bankruptcy / recovery

Only after Phase 6B2 is CI Green: deepen personal-loan offers where useful, voluntary bankruptcy/player decision flow, hardship events, default/recovery consequences, and longer-lived credit rehabilitation. Do not make bankruptcy a silent score reset.

## Compatibility rules

- Never treat credit limit/available credit as cash, income, net worth, or estate wealth.
- Never let opening/reopening a marketplace reroll approval.
- Never duplicate creditworthiness logic inside vehicle/property screens.
- Never let UI contract/status math diverge from the liability actually stored.
- Never reduce a loan as if a payment cleared when the simulation could not fund that payment.
- Never erase secured debt merely because collateral was sold, seized, the player died, or the screen changed.
- Never double-count arrears and principal as separate liabilities.
- Keep major approval, delinquency, cure, default, repossession, foreclosure, bankruptcy, and estate consequences visible and durable.
