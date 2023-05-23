# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2023-05-23

### Breaking

- The `IDomainInfo` interface has been renamed to `DomainInfo` so the `fetchDomainInfo` function now returns a `DomainInfo` object instead of an `IDomainInfo` object.

### Updated

- Updated the README.md
- Updated the package.json keywords
- Updated the package.json description
- Updated the installed packages to the latest version

### Added

- New HTTP Status Codes to the DomainInfo Object
- Domains will now be formatted to lowercase before fetching the information
- Domains that start with `http://`, `https://` or `www` will now be stripped of the protocol before fetching the information
- New Tests for the new HTTP Status Codes

## [1.0.8] - 2023-03-19

### Updated

- Sorting of the Badges in the README.md

## [1.0.7] - 2023-03-19

### Added

- More Badges to the README.md

## [1.0.6] - 2023-03-19

### Fixed

- Bug that generated double workflow runs

## [1.0.5] - 2023-03-19

### Fixed

- Bug that caused the workflow to not generate a new release with the correct version

## [1.0.4] - 2023-03-19

### Fixed

- Bug that caused the workflow to skip the release

## [1.0.3] - 2023-03-19

### Added

- New Tokens for Workflow in the README.md

- Changelog

## [1.0.1] - 2023-03-19

### Fixed

- Bugfix in Workflow

## [1.0.0] - 2023-03-18

### Added

- Initial release features
