# eclipse-repo-metrics

A very simple set of Node.js scripts that can be used to compute the number of lines of code across a given list of Eclipse projects.
The main script uses the Eclipse Project Management Infrastructure (PMI) API to retrieve the list of Git repositories for the requested projects, and then proceeds to clone the repos and run the [cloc](https://github.com/AlDanial/cloc) command-line tool against each repo. The script allows to perform the counting on a given time period, effectively looking at the state of the repos at the beginning of each month of that period.

Once the main script has completed (and it can obviously take quite some time), the csv-concat.js script can be used to consolidate all the produced metric files into one single CSV file that will contain the detailed breakout of lines of code per project and per programming language, affiliation of the project to a particular top-level projects, number of blanks, number of comments… 
It is pretty easy to then feed this CSV into Excel or Google Spreadsheet, and use it as the source for building pivot tables for specific breakouts.