# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-02-27

### Fixed

- ESM compatibility issue with chalk package by downgrading to a CommonJS compatible version
- Error `ERR_REQUIRE_ESM` when running CLI with ts-node due to chalk v5+ being ESM-only while project uses CommonJS

## [2.0.0] - 2025-02-27

### Added

- CLI interface for running queries directly from the command line
- Support for custom request options (timeout, headers, redirects)
- Comprehensive documentation with advanced usage examples
- Improved test coverage with real network tests

### Changed

- Enhanced error handling with specific error messages for different failure scenarios
- Improved TypeScript typings for better IDE support
- Updated all dependencies to their latest versions
- Restructured the codebase for better maintainability

### Fixed

- Issues with DNS resolution error handling
- Performance bottlenecks in HTTPS requests
- Reliability issues when fetching data from servers with non-standard configurations

### Security

- Fixed high severity vulnerability in braces package (GHSA-grv7-fg5c-xmjg) related to uncontrolled resource consumption
- Fixed moderate severity vulnerability in micromatch package (GHSA-952p-6rrq-rcjv) related to ReDoS
- Updated multiple dependencies to address potential security issues

## [1.2.0] - 2023-06-22

### Fixed

- Bug that caused the `fetchDomainInfo` function to not return the correct data
- Typescript errors

## [1.1.1] - 2023-06-21

### Fixed

- Bug that caused circular json objects to not return the correct data

### Updated

- Updated the README.md
- Updated dependencies to the latest version
- Tests

### Added

- New functions to format and validate data returned by the `fetchDomainInfo` function
- New tests for the new functions

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

## [1.0.1] - 2023-03-19

### Fixed

- Bugfix in Workflow

## [1.0.0] - 2023-03-18

### Added

- Initial release features
