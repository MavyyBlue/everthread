# Everthread — Phase 6 Credit / Debt

Phase 6 now builds from certified Run #102 expanded source `8b2a49fe76c5429cf55228a00a15b6103211a25b`. Phase 6A Credit & Banking, Phase 6B1 Asset Financing, Phase 6B2 Secured Delinquency/Collateral Consequences, and Phase 6B3 Payments & Asset Management UX are CI Green. Save schema is 12. The current candidate is a bounded post-6B3 Credit History live-reactivity correction before Phase 6C.

## Product intent

Credit/debt must be a playable life system. Material financial processes must be visible, understandable, and actionable where the protagonist has agency. UI projections read the same authorities that apply outcomes. Cash, available revolving credit, asset value, and debt are never interchangeable.

## Phase 6A — Credit & Banking Foundation — CI Green Run #99

- `CreditSystem` owns bounded revolving accounts, available credit, secured deposits, statements/minimums, payments, interest/fees, formal inquiries, derogatories, derived creditworthiness, offers, closure, bankruptcy discharge, and normalization.
- Six fictional card products span age-16 secured starter credit through established/premium unsecured products. Browsing is deterministic/read-only; applications are bounded.
- Life exposes Cash and Credit Available separately plus the mobile Credit & Banking hub. Credit Available never counts as cash, income, net worth, or estate wealth.
- Credit & Banking regression remains 74/74.

## Phase 6B1 — Asset Financing Foundation — CI Green Run #100

- `AssetFinancingSystem` consumes `CreditSystem.getCreditUnderwritingSnapshot()` as the single creditworthiness authority for three vehicle + three home financing programs.
- Quotes are deterministic/read-only and expose lender/program, approval reason, APR, term, down payment, financed amount, annual/monthly-equivalent payment, finance charge, total held-to-term cost, and projected burden.
- Signing re-underwrites and creates the exact real `Loan.kind='car'|'mortgage'` liability; outright purchases create no inquiry/debt. Asset Financing remains 77/77.

## Phase 6B2 — Secured Delinquency & Collateral Consequences — CI Green Run #101

- Existing `Loan` remains the installment-liability authority. Optional delinquency state on car/mortgage loans tracks arrears, missed-payment count, and last-missed age.
- Annual finance never reduces a secured balance when the payment could not be funded. A miss creates real arrears and credit history, followed by a one-Age-Up cure window.
- Uncured car loans can repossess the vehicle; uncured mortgages can foreclose. Recovery settles against the same balance, with surplus/equity represented and unrecovered deficiency becoming unsecured debt.
- Underwater voluntary home sale also preserves deficiency debt. Asset Delinquency is 82/82 and Run #101 certified the complete preflight/Pages deployment.

## Phase 6B3 — Payments & Asset Management UX — CI Green Run #102

### Payment authority

- `PaymentSystem` is a thin projection/action layer, not a new debt ledger. `CreditSystem` still owns revolving balances/history and `FinanceSystem` still owns loan balances/amortization/delinquency.
- `getPaymentObligations()` projects only real currently modeled player-facing bills: open card minimums and secured car/mortgage annual obligations. Student/personal debt and aggregate living expenses remain outside the itemized Bills surface until intentionally modeled as such.
- `payPaymentObligation()` delegates to the authoritative card/secured payment functions. `setPaymentAutoPay()` only changes durable payment preference on the owning account/loan.

### Player experience

- Credit & Banking Overview replaces its former major-history block with a compact **Bills & Payments** entry showing active obligations, total due, past due, and auto-pay count.
- Tapping it opens one mobile payment manager with itemized lender/account/asset, balance, current/past-due amount, annual auto-pay switch, and Cash payment.
- Card auto-pay covers the required minimum only. Extra/full card payments stay on the individual Account screen. Major derogatory history now lives under History.
- Payment controls are intentionally centralized here; Assets/Property shows financing context but does not duplicate payment controls.

### Annual auto-pay and manual secured payments

- New card and asset-financing contracts default `autoPay=true`. Existing v11 obligations migrate to ON, preserving prior automatic-service behavior.
- Auto-pay OFF is a real choice: a required card payment can become late/missed and a secured payment can become delinquent even if Cash exists. Re-enabling auto-pay does not silently cure existing arrears.
- Manually paying a current secured annual bill applies the same interest/payment math once and persists `prepaidThroughAge`; the covered Age Up consumes that marker without another loan debit. Delinquent secured bills reuse the 6B2 cure authority.

### Asset ownership and selling

- Assets → Property contains both homes and vehicles with **Browse | Owned**. Browse shows the home and vehicle markets; Owned shows both asset classes and contextual financed/at-risk status. Vehicles no longer live under More.
- Home selling continues through authoritative payoff/deficiency accounting. Vehicles now have the same class of preview/confirmation: sale value, selling costs, lender payoff, cash proceeds, or deficiency.
- Selling financed collateral removes the exact secured loan. Positive equity returns Cash; underwater residual becomes ordinary unsecured personal debt instead of disappearing.

### Saves and QA

- Save schema advances **11 → 12** because auto-pay preference, card past-due amount, and secured paid-ahead age are durable player decisions/accounting state. Migration is deterministic, RNG-neutral, and idempotent.
- Dedicated Payment & Asset Management regression: 79/79 locally. Existing Core 82/82, Credit & Banking 74/74, Asset Financing 77/77, Asset Delinquency 82/82, Integrated Long-Life 105/105, and all established suites are green locally.
- GitHub Actions Run #102 reproduced Payment & Asset Management 79/79, every established regression, both TypeScript gates, canonical preflight **GREEN 4/4**, the 153-module production build, certified-baseline artifact creation, and Pages deployment. Expanded certified source is `8b2a49fe76c5429cf55228a00a15b6103211a25b`.

## Post-6B3 Credit History live-reactivity correction — current candidate

- Credit & Banking History must derive its bounded current/prior transaction lists fresh on each engine-driven render. Do not memoize them solely against the mutable `finances.credit.transactions` array reference.
- This correction changes presentation reactivity only: no balances, payment behavior, saves, RNG, content, or accounting authority.
- Phase 6C remains gated until this exact correction is CI Green.

## Phase 6C — Personal borrowing / bankruptcy / recovery

Only after the post-6B3 reactivity correction is CI Green: deepen personal-loan offers where useful, voluntary bankruptcy/player decision flow, hardship events, default/recovery consequences, and longer-lived rehabilitation. Do not make bankruptcy a silent score reset.

## Compatibility rules

- Never treat credit limit/available credit as cash, income, net worth, or estate wealth.
- Never let opening/reopening a marketplace reroll approval.
- Never duplicate creditworthiness or payment math inside UI screens.
- Never let a manual secured payment and Age Up charge the same contractual year twice.
- Never mark a debt paid when Cash did not actually fund it.
- Never erase secured debt merely because collateral was sold, seized, inherited, or the screen changed.
- Never double-count arrears and principal as separate liabilities.
- Keep approvals, bills, delinquency, cure, default, repossession, foreclosure, bankruptcy, estate settlement, and asset-sale payoff consequences visible and durable.
