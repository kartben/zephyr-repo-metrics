# Zephyr Repo Metrics

This repository contains a script that can be used (and extended) to gather stats regarding the activity of some popular open source real-time operating systems.

The main script is written in TypeScript and can be executed using `npm start`.

## Features

* Automatically clones or updates the specified RTOS repositories
* Computes and saves statistics for each repository in JSON and CSV formats
* Generates an aggregated CSV file containing data for all projects
* Uses a progress bar to display the current status of the script

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/kartben/zephyr-repo-metrics.git
cd zephyr-repo-metrics
```

2. Install the required dependencies:

```bash
npm install
```

3. Run the script:

```bash
npm start
```

## How It Works

The script will automatically clone or update the specified repositories and compute the statistics. The results will be saved in the `stats/` directory as separate JSON and CSV files for each project. An aggregated CSV file, `all.csv`, containing data for all projects, will also be generated.

## Customization

You can customize the script by modifying the projects and snippets in the `projects.ts` and `snippets.ts` files. Add or modify the projects and snippets as needed to gather the desired statistics for your projects.

## Ready to use dashboards and charts

The `dashboard-files/` folder contains a Microsoft Excel spreadsheet ([`dashboard.xlsx`](/dashboard-files/dashboard.xlsx)) which you can use to directly access pivot tables and charts that make the data more visual. If you allow Excel to load external content, it will automatically sync-up the data with the latest version of the [`all.csv`](https://github.com/kartben/zephyr-repo-metrics/blob/statistics/stats/all.csv) file that lives in the `statistics` branch of this repository.

Similarly, you may want to play with the Microsoft PowerBI [`dashboard.pbix`](/dashboard-files/dashboard.pbix).

## Contributing

If you find any bugs, have feature requests, or would like to contribute, feel free to open an issue or submit a pull request on the repository.

## License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for more information.
