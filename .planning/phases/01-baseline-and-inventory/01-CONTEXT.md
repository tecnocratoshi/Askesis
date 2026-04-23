# Phase 1: Baseline and Inventory - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a complete and reproducible audit baseline for the repository. This phase covers inventory, criticality tagging, minimum validation baseline, and evidence capture structure. It does not classify findings by severity root cause yet and does not define remediation waves.

</domain>

<decisions>
## Implementation Decisions

### Inventory model
- **D-01:** The inventory should be organized primarily by criticality, not by directory tree alone.
- **D-02:** Criticality taxonomy for Phase 1 is: core, high risk, support, peripheral.
- **D-03:** Inventory output should still preserve source area references so later phases can map back to frontend, services, api, scripts, and supporting docs.

### Baseline validation
- **D-04:** Phase 1 uses a minimum baseline rather than a full gate stack.
- **D-05:** The minimum baseline must include typecheck and tests.
- **D-06:** Build and extra coverage checks are deferred unless planning identifies a clear dependency for Phase 1 deliverables.

### Evidence format
- **D-07:** Evidence should be stored as a single consolidated report rather than split files.
- **D-08:** The consolidated report should be organized by risk level.
- **D-09:** Evidence entries should remain reproducible and link back to concrete files, scripts, and test artifacts.

### the agent's Discretion
- Exact document names for inventory and evidence outputs.
- Whether the consolidated report uses tables, sections, or hybrid formatting.
- How much metadata to store per evidence item, as long as reproducibility is preserved.

</decisions>

<specifics>
## Specific Ideas

- Inventory should optimize for fast identification of what is most dangerous to change first.
- The first pass should stay pragmatic and avoid heavy process overhead.
- Evidence should be easy to read in one place before the project moves into severity analysis.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and constraints
- `.planning/PROJECT.md` - Project purpose, constraints, and non-negotiables for the audit initiative.
- `.planning/REQUIREMENTS.md` - Phase 1 requirement set (BASE-01, BASE-02, BASE-03) and traceability.
- `.planning/ROADMAP.md` - Phase boundary, success criteria, and current milestone sequencing.
- `.planning/STATE.md` - Current project position and execution starting point.

### Existing codebase understanding
- `.planning/codebase/ARCHITECTURE.md` - Current system architecture and major code paths.
- `.planning/codebase/STRUCTURE.md` - Repository organization and domain layout.
- `.planning/codebase/TESTING.md` - Existing testing structure and patterns.
- `.planning/codebase/CONCERNS.md` - Known risk hotspots that may influence criticality tagging.

### Existing quality references
- `tests/README.md` - Current test suite status and execution conventions.
- `docs/MATURITY_ASSESSMENT.md` - Existing quality scoring perspective and file-level maturity framing.
- `package.json` - Baseline scripts for typecheck, tests, and guardrails.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json`: already defines `typecheck`, `test`, `guardrail:all`, and related verification scripts.
- `tests/README.md`: provides the current authoritative test-suite health snapshot and execution guidance.
- `docs/MATURITY_ASSESSMENT.md`: useful prior art for criticality and maturity framing during inventory.
- `scripts/guardrail-audit.js`: example of an existing automated quality gate with explicit policy.

### Established Patterns
- Quality checks are already script-driven via npm scripts rather than ad-hoc manual steps.
- Repository quality documentation already mixes executive summary with file-level detail.
- Existing planning artifacts favor traceability between requirements, roadmap phases, and outputs.

### Integration Points
- Phase 1 outputs need to plug into Phase 2 findings classification without redefining inventory categories.
- Baseline commands should reuse current npm scripts rather than inventing parallel validation paths.
- Evidence structure must support later prioritization and remediation batching in Phases 2 and 3.

</code_context>

<deferred>
## Deferred Ideas

- Build as a mandatory part of baseline - deferred to planning unless Phase 1 dependencies require it.
- Coverage expansion for critical areas - deferred to later planning or Phase 2 if needed for evidence quality.
- Full findings severity modeling - explicitly out of scope for Phase 1 and belongs to Phase 2.

</deferred>

---
*Phase: 01-baseline-and-inventory*
*Context gathered: 2026-04-23*
