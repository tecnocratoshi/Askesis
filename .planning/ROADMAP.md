# Roadmap: Askesis Audit Quality Initiative

## Overview

This roadmap turns the quality-audit goal into four incremental phases: baseline visibility, risk-classified findings, remediation wave design, and recurring governance. The sequence minimizes regression risk by requiring evidence and validation before correction planning.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Baseline and Inventory** - Establish complete audit visibility and reproducible baseline signals.
- [ ] **Phase 2: Findings and Risk Classification** - Convert evidence into ranked, reproducible technical findings.
- [ ] **Phase 3: Remediation Wave Planning** - Build an execution-ready correction backlog with acceptance gates.
- [ ] **Phase 4: Governance and Continuous Audit Loop** - Operationalize closure criteria, cadence, and ownership.

## Phase Details

### Phase 1: Baseline and Inventory
**Goal**: Build a complete and reproducible quality baseline for the entire repository.
**Depends on**: Nothing (first phase)
**Requirements**: BASE-01, BASE-02, BASE-03
**Success Criteria** (what must be TRUE):
  1. Audit inventory covers frontend, services, api, and script surfaces with clear module criticality.
  2. Baseline execution can be repeated and yields comparable outputs.
  3. Evidence index ties each observed issue to concrete file-level artifacts.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Produce repository inventory and criticality map
- [ ] 01-02: Capture baseline results and evidence index

### Phase 2: Findings and Risk Classification
**Goal**: Produce a reliable, risk-ranked findings set grounded in reproducible evidence.
**Depends on**: Phase 1
**Requirements**: RISK-01, RISK-02, RISK-03, RISK-04
**Success Criteria** (what must be TRUE):
  1. Every high and moderate finding includes severity, impact, evidence, and reproducibility notes.
  2. Risk model is consistently applied across findings.
  3. Prioritization reflects user/data/security impact before implementation convenience.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Build findings catalog with severity and evidence
- [ ] 02-02: Apply risk matrix and produce prioritized backlog

### Phase 3: Remediation Wave Planning
**Goal**: Translate prioritized findings into low-risk, testable correction waves.
**Depends on**: Phase 2
**Requirements**: PLAN-01, PLAN-02, PLAN-03
**Success Criteria** (what must be TRUE):
  1. Correction work is grouped into dependency-aware waves with explicit scope.
  2. Each wave has objective acceptance criteria and validation checks.
  3. High-risk waves include rollback notes and safety checks.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Define remediation batches and dependencies
- [ ] 03-02: Define acceptance, rollback, and verification strategy

### Phase 4: Governance and Continuous Audit Loop
**Goal**: Ensure repeatable progress tracking and reliable closure of quality work.
**Depends on**: Phase 3
**Requirements**: GOV-01, GOV-02, GOV-03
**Success Criteria** (what must be TRUE):
  1. Requirement-to-phase traceability stays current for all v1 requirements.
  2. Findings are only closed when evidence and validation criteria are satisfied.
  3. Recurring audit review cadence runs with ownership and actionable follow-up.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Establish governance workflow and recurring review cadence

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Baseline and Inventory | 0/2 | Not started | - |
| 2. Findings and Risk Classification | 0/2 | Not started | - |
| 3. Remediation Wave Planning | 0/2 | Not started | - |
| 4. Governance and Continuous Audit Loop | 0/1 | Not started | - |

---
*Roadmap created: 2026-04-23*
