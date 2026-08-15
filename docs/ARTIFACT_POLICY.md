# Model artifact policy

This repository keeps the currently published runtime and model-registry
artifacts because CI loads and smoke-tests every registered model. Removing only
the large files would make the registry misleading and break reproducibility.

## Rules for new artifacts

1. Commit an artifact only when the application or reproducibility tests require it.
2. Every published artifact must have a metrics/manifest record with SHA-256,
   model ID, labels, preprocessing, source dataset and evaluation scope.
3. Candidate checkpoints, training caches and datasets stay outside Git.
4. Do not add a new binary larger than 25 MB directly to normal Git history.
   Publish it in a versioned release/object store and verify its checksum during build.
5. Never replace a binary without updating its contract and rerunning artifact,
   quality, runtime and API tests.
6. Keep experimental models explicitly ineligible for production serving.

## Existing large files

Several legacy classical/fusion artifacts are retained because the public model
registry and self-test currently verify every comparison model. A future size
migration should be atomic:

1. design a versioned artifact manifest and authenticated download path;
2. update Render build and CI to download/cache exact hashes;
3. verify cold-start, availability and rollback behavior;
4. remove large binaries from the current tree;
5. rewrite historical Git objects only as a separately reviewed maintenance task.

Do not use Git history rewriting as part of an ordinary feature or documentation PR.
