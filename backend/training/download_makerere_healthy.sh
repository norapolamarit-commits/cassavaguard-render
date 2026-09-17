#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
incoming="$repo_root/backend/training/data/incoming/makerere_healthy_cc0"
prepared="$repo_root/backend/training/data/makerere_healthy_cc0"
mkdir -p "$incoming" "$prepared/healthy"
download_subset() {
  local file_id="$1"
  local name="$2"
  local expected_md5="$3"
  local archive="$incoming/$name"

  curl --fail --location --retry 3 --continue-at - \
    "https://dataverse.harvard.edu/api/access/datafile/$file_id" \
    --output "$archive"
  local actual_md5
  actual_md5="$(md5 -q "$archive")"
  if [[ "$actual_md5" != "$expected_md5" ]]; then
    echo "Checksum mismatch for $name: expected $expected_md5, got $actual_md5" >&2
    exit 1
  fi
  bsdtar -xf "$archive" -C "$prepared/healthy" --strip-components 1
}

download_subset 6419125 healthy_001.rar 4d7ba4ff37bbd04c94f9ced01d3b93d2
download_subset 6419126 healthy_002.rar 56a3f0c508c05f783602771a86c24786
echo "Downloaded and extracted $(find "$prepared/healthy" -type f | wc -l | tr -d ' ') files."
