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

eval "git log $commit_range --pretty=format:\"%h %s\" --numstat" \
| awk '\
  BEGIN \
    { commit = ""; added = 0; deleted = 0; } /^([a-f0-9]{7})/ { if(commit) { print_commit(); } \
      commit = $0; added = 0; deleted = 0; next; } { added += $1; deleted += $2; } \
  END \
  { print_commit(); } \
  function print_commit() { \
            if( (added >= 200 && deleted < 40) || \
                (added >= 30 && deleted < 5)   || \
                (added < 50 && deleted > 100)  || \
                added > 500                    || \
                deleted > 500 \
            ) { print commit ; } }' \
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
