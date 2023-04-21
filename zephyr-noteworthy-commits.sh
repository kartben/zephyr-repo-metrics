#!/bin/bash

git_repo="./repos/Zephyr"

pushd "$git_repo" > /dev/null

git pull origin
git checkout main

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
| sed -E 's/([0-9a-f]{10})/\x1b]8;;https:\/\/github.com\/zephyrproject-rtos\/zephyr\/commit\/\1\x1b\\\1\x1b]8;;\x1b\\/g' \
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

echo
git ls-remote origin main | awk '{ print "Latest commit taken into account:", $1 }'

echo
echo "********************************************"
echo "First time contributors over the last 7 days"
echo "********************************************"

repo_url="https://github.com/zephyrproject-rtos/zephyr/commit"
old_contributors=$(git log --before="7 days ago" --pretty=format:"%an" --all)
all_contributors=$(git log --since="7 days ago" --pretty=format:"%H %an <%ae>" --all)

# ANSI escape sequences for colors
red="\033[31m"
green="\033[32m"
reset="\033[0m"

echo "$all_contributors" | sort -k2,2 -u | while read -r commit_hash author_email; do
    author_name=$(echo "$author_email" | sed 's/ <.*//')
    if ! echo "$old_contributors" | grep -q -F "$author_name"; then
        echo -e "${red}${author_email}${reset}"
        echo "$all_contributors" | grep -F "$author_email" | while read -r commit_info; do
            commit_hash=$(echo "$commit_info" | awk '{print $1}')
            message=$(git log --pretty=format:"%h %s" -n 1 $commit_hash)
            short_hash=$(echo "$message" | awk '{print $1}')
            message=$(echo "$message" | awk '{$1=""; print substr($0, 2)}')
            echo -e "${green}\e]8;;${repo_url}/${short_hash}\a[${short_hash}]\e]8;;\a${reset} $message"
        done
        echo ""
    fi
done




popd > /dev/null
