# Security policy

## Supported version

Security fixes target the current `main` branch and the production deployment
generated from it. Experimental training runs and unmerged branches are not
supported releases.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting feature for this repository when it
is available. If it is unavailable, contact the repository owner privately. Do
not open a public issue containing credentials, personal data, exploitable URLs,
uploaded field images, database exports or step-by-step exploit details.

Include the affected commit, endpoint/component, impact, safe reproduction steps
and any suggested mitigation. Remove secrets and personal data from all evidence.

## Public deployment warning

The current demonstration release sets `AUTH_REQUIRED=false`. Anyone who can
reach the URL can use the shared application context. Do not store personal,
confidential, regulated or customer data in that deployment. Enable authentication,
record-level authorization and an appropriate retention policy before real
multi-user or multi-organization use.

AI results are review-only decision support. A model-quality problem or unsafe
agricultural recommendation should also be reported, even when it is not a
traditional software vulnerability.
