# Factory consumer certification

This repository adopts Factory distribution 1.0.1 at reviewed commit
`011e83014d666b782d9eee97c16c6bcf2cecc996` for `factory-test-workload` only.
The supported workload is an isolated Node 24 module. The SvelteKit application,
its Node 22 runtime, application CI, database and deployments are outside this
certificate's scope.

The existing application CI is preserved. The proposed advanced CodeQL workflow
analyzes the entire repository, including application and Factory workload, at
the exact source SHA/ref. The pinned reusable producer requires its explicit
`factory-codeql.yml:analyze` identity. An operator must authorize switching from
native default setup to this advanced setup; do not disable scanning or merge
without genuine exact-head analysis. Factory validation
produces all baseline reports through immutable reusable workflows. Certification
is a separate manual dispatch after a reviewed adoption PR and a successful main
producer; it verifies the retained package without rebuilding.

Operator prerequisites:

1. Select the exact reviewed SHA above in the repository Actions variable
   `FACTORY_DISTRIBUTION_REVISION`.
2. Enter an expiring, repository-scoped read credential directly into GitHub as
   `FACTORY_CERTIFICATION_READ_TOKEN`: Administration, Checks, Issues and Pull
   requests read. Never commit or paste the credential into logs or chat.
3. Review and approve the App-authored PR's exact final head in GitHub. Rerun the
   approval jobs after review if needed. Chat approval cannot replace that review.
4. After gate workflows land, explicitly authorize the separate no-bypass Factory
   ruleset, retaining all existing controls. Require all eight `validation / `
   Factory baseline checks, one current review with stale dismissal, resolved
   threads, signed commits, linear history, deletion and force-push prevention.
5. Collect six passing exact-revision reports from a successful main adoption
   producer; assemble with the pinned Factory `consumer-evidence` public CLI.
6. Dispatch `factory-adoption.yml` with source SHA, producer ID, merged PR and the
   assembled evidence. Retain and link the successful hosted certificate on
   https://github.com/AJHMH/software-factory/issues/49 before claiming completion.

Full procedure and denial/recovery rules:
https://github.com/AJHMH/software-factory/blob/011e83014d666b782d9eee97c16c6bcf2cecc996/docs/consumer-certification.md

No successful certification is claimed by this adoption proposal. A missing pin,
credential, protection, approval, exact analysis or complete report fails closed.
