#!/bin/bash

# TAG1 is first argument, defaulting to v3.4.0
TAG1=${1:-v3.4.0}
# TAG2 is second argument, defaulting to HEAD
TAG2=${2:-HEAD}

# Retrieve the timestamp for the two tags
tag1_time=$(git log -1 --format=%ct $TAG1)
tag2_time=$(git log -1 --format=%ct $TAG2)

# Find the difference in seconds
diff=$(($tag2_time-$tag1_time))

# Convert the difference to hours
hours=$(($diff / 3600))

number_of_commits=$(git rev-list --count $TAG1..$TAG2)

# Print the difference in hours
echo "Between $TAG1 and $TAG2, there were $number_of_commits commits made."
# show velocity as a float
echo "The velocity of commits is $(echo "scale=2; $number_of_commits / $hours" | bc) commits per hour."
