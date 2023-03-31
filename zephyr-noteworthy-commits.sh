#!/bin/bash

git_repo="./repos/Zephyr"

pushd "$git_repo" > /dev/null

git fetch origin

os_type="$(uname)"


if [[ $# -eq 1 ]] || ( [[ $# -eq 2 ]] && [[ -z "$2" ]] ); then
  commit_range="--since=\"$1\""
elif [[ $# -eq 2 ]]; then
  commit_range="${1}..${2}"
else
  echo "Usage: $0 [since] or $0 [commit1] [commit2]"
  exit 1
fi

eval "git log $commit_range --shortstat --oneline" \
| awk '/^ [0-9]/ {insertions = $4} insertions >= 200 {print prev_line} {prev_line = $0}' \
| grep -E "[0-9a-f]{10}" | grep -v -E "test(s?)(:?) " \
| sort -k2 \
| {
  if [[ "$os_type" == "Darwin" ]]; then
    tee >(pbcopy)
  elif [[ "$os_type" == "Linux" ]] && grep -q microsoft /proc/version; then
    tee >(clip.exe)
  else
    cat
  fi
}

git ls-remote origin main | awk '{ print "Latest commit taken into account:", $1 }'

popd > /dev/null
