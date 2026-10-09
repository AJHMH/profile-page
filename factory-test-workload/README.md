# Isolated Factory test workload

This built-in-only Node 24 module supplies the initial reviewed baseline for
Factory consumer certification (AJHMH/software-factory#49). It does not change
the SvelteKit application, its Node 22 runtime, or deployment.

Run `npm ci --ignore-scripts`, `npm run validate`, `npm test`, and `npm run build`
from this directory with Node 24. Unit tests live under `tests/` and integration
tests under `tests/integration/`, matching the pinned Factory coverage adapter.

The workload must land before the separate adoption PR: Factory compares both
candidate and main baseline coverage, so introducing the workload and certification
in one PR cannot supply genuine baseline test evidence. This seed does not claim
certification or add privileged automation. The follow-up adoption proposal is
https://github.com/AJHMH/profile-page/pull/106.
