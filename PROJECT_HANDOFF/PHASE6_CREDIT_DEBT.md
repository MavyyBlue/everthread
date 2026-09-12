# Everthread — Phase 6 Credit / Debt

Phase 6 begins from certified Run #98 expanded source `5aa1c4338be4edc934b867f4e5a710d0e116aaa2`. Phase 5 is closed.

## Product intent

Credit/debt must be a playable life system. Material financial processes should be visible, understandable, and actionable where the protagonist reasonably has agency. UI previews must read the same authority that applies the result. Cash and borrowed capacity are never the same thing.

## Phase 6A — Credit & Banking Foundation — predeployment candidate

### Authority and persistence

- Save schema 11 adds bounded `finances.credit` state through deterministic v10→v11 migration.
- `CreditSystem` owns revolving accounts, limits/balances, statement/minimum state, payments, interest/fees, refundable secured deposits, formal inquiries, derogatory history, compact positive-history summaries, derived creditworthiness, marketplace offers, closure, and bankruptcy discharge behavior.
- Credit score/rating is a deterministic gameplay projection from persisted financial behavior; no RNG is used merely to browse offers or calculate the profile.
- Histories are bounded: at most 5 active / 12 stored accounts, 160 transactions, 24 inquiries, and 20 derogatories. Older ordinary activity collapses into compact summary history rather than growing forever.

### Player experience

- Life presents **Cash** and **Credit Available** together but separately. Credit Available is unused revolving capacity and never counts as owned wealth.
- **Credit & Banking** opens an in-Life mobile sheet with Overview, Accounts, Offers, and History.
- Six original fictional institution/product definitions cover age-16 secured starter cards through stronger mature-file offers.
- Offer browsing is harmless/read-only. Contract review exposes starting line, APR, annual fee, late fee, deposit, and minimum-payment terms before the player accepts or returns to offers.
- Formal application attempts are bounded and persist approval/decline plus a human-readable reason.
- Players can make representative card purchases, pay balances from cash, close zero-balance accounts, and inspect current-year/recent transactions.
- Material approval, missed-payment, and closure consequences persist in the Life timeline.

### Accounting integration

- Secured deposits move out of cash but remain refundable represented value.
- Revolving balances are liabilities and reduce net worth; paying them moves cash and liability together rather than creating a second loss.
- Bankruptcy discharges/marks revolving accounts through the same insolvency authority and leaves bounded derogatory history.
- Estate preview/settlement includes revolving balances as obligations and refundable secured deposits as estate value.
- Descendant continuation starts the newly controlled person with their own player credit authority; NPC consumer-credit simulation is intentionally not invented in 6A.

### QA status

- Credit & Banking regression: 74/74 on the final current candidate.
- Core 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; all established specialist suites remain green.
- Both TypeScript gates pass. Production build passes at 148 modules; existing main-chunk warning remains nonblocking.
- 80-year direct credit-use benchmark completed in roughly 5 ms in the hosted workspace, retained 20 recent transactions after pruning, serialized the full fixture at roughly 18 KB, and returned zero validation errors.
- Run #98 remains authoritative until GitHub reproduces this exact candidate.

## Phase 6B — Asset financing — next after 6A CI Green

Add **Buy Outright** and **Finance** options where financing is appropriate, beginning with vehicles and homes. Financing must consume the Phase 6A credit profile/history and use reusable lender/quote/liability APIs.

The player should be able to compare offers and inspect down payment, amount financed, term, APR, recurring payment, total financing cost, and approval/decline reason before signing. The signed quote must become the actual liability. Vehicle repossession and mortgage delinquency/foreclosure must remain integrated with assets, credit history, net worth, timeline, and estate behavior.

## Phase 6C — Personal borrowing / bankruptcy / recovery

Deepen personal loans, voluntary bankruptcy decisions, hardship events, default/recovery consequences, and longer-lived credit rehabilitation. Do not make bankruptcy a silent score reset; the player must understand the immediate tradeoff and future access consequences.

## Compatibility rules

- Never treat credit limit/available credit as cash, income, net worth, or estate wealth.
- Never let opening/reopening the marketplace reroll approval.
- Never duplicate creditworthiness logic inside vehicle/property screens.
- Never let UI contract math diverge from the liability actually created.
- Never erase debt merely because the player dies or changes screens.
- Never preserve unbounded monthly transaction/payment history when compact summaries can support the same simulation.
- Keep major financial consequences visible to the player and durable in history.
