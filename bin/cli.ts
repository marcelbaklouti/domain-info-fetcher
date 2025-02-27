#!/usr/bin/env node
import { fetchDomainInfo, RequestOptions } from "../index";
import chalk from "chalk";

const args = process.argv.slice(2);
const helpText = `
${chalk.bold("domain-info-fetcher CLI")}

A command-line tool to fetch information about a domain.

${chalk.bold("Usage:")}
  domain-info-fetcher <domain> [options]

${chalk.bold("Options:")}
  --timeout <ms>        Set request timeout in milliseconds (default: 10000)
  --json                Output as JSON
  --help                Show this help message

${chalk.bold("Example:")}
  domain-info-fetcher example.com
  domain-info-fetcher example.com --timeout 5000 --json
`;

// Show help if requested or no domain provided
if (args.includes("--help") || args.length === 0) {
  console.log(helpText);
  process.exit(0);
}

// Parse arguments
const domain = args[0];
const jsonOutput = args.includes("--json");
const timeoutIndex = args.indexOf("--timeout");
const options: RequestOptions = {};

if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
  const timeout = parseInt(args[timeoutIndex + 1], 10);
  if (!isNaN(timeout)) {
    options.timeout = timeout;
  }
}

async function main() {
  try {
    console.log(chalk.blue(`Fetching information for ${domain}...`));

    const domainInfo = await fetchDomainInfo(domain, options);

    if (jsonOutput) {
      console.log(JSON.stringify(domainInfo, null, 2));
      return;
    }

    if (!domainInfo) {
      console.error(chalk.red("No domain information returned"));
      return;
    }

    // SSL Certificate Information
    console.log("\n" + chalk.green.bold("🔒 SSL Certificate:"));
    console.log(`  - Issued to: ${JSON.stringify(domainInfo.sslData.subject)}`);
    console.log(`  - Issued by: ${JSON.stringify(domainInfo.sslData.issuer)}`);
    console.log(
      `  - Valid: ${
        domainInfo.sslData.valid ? chalk.green("✅ Yes") : chalk.red("❌ No")
      }`
    );
    console.log(
      `  - Valid from: ${new Date(
        domainInfo.sslData.validFrom
      ).toLocaleDateString()}`
    );
    console.log(
      `  - Valid until: ${new Date(
        domainInfo.sslData.validTo
      ).toLocaleDateString()}`
    );

    // Server Information
    console.log("\n" + chalk.cyan.bold("🖥️ Server:"));
    console.log(
      `  - Server software: ${
        domainInfo.serverData || chalk.gray("Not available")
      }`
    );
    console.log(
      `  - HTTP Status: ${
        domainInfo.httpStatus
          ? domainInfo.httpStatus >= 200 && domainInfo.httpStatus < 300
            ? chalk.green(domainInfo.httpStatus)
            : chalk.yellow(domainInfo.httpStatus)
          : chalk.gray("Not available")
      }`
    );

    // DNS Information
    if (domainInfo.dnsData) {
      console.log("\n" + chalk.yellow.bold("🌐 DNS Records:"));
      console.log(`  - A Records: ${domainInfo.dnsData.A.join(", ")}`);
      console.log(
        `  - CNAME: ${domainInfo.dnsData.CNAME || chalk.gray("None")}`
      );

      if (domainInfo.dnsData.MX.length) {
        console.log("  - MX Records:");
        domainInfo.dnsData.MX.forEach((mx) => {
          console.log(`    * ${mx.exchange} (priority: ${mx.priority})`);
        });
      }

      if (domainInfo.dnsData.TXT.length) {
        console.log("  - TXT Records:");
        domainInfo.dnsData.TXT.forEach((txt) => {
          console.log(`    * ${txt}`);
        });
      }

      if (domainInfo.dnsData.NS.length) {
        console.log("  - NS Records:");
        domainInfo.dnsData.NS.forEach((ns) => {
          console.log(`    * ${ns}`);
        });
      }
    } else {
      console.log("\n" + chalk.red("🌐 DNS Records: Not available"));
    }
  } catch (error) {
    console.error(chalk.red("❌ Error fetching domain information:"));
    if (error instanceof Error) {
      console.error(chalk.red(`   ${error.message}`));
    } else {
      console.error(chalk.red(`   ${String(error)}`));
    }
    forceExit(1);
  }
}

// Helper function to ensure process terminates
function forceExit(code: number = 0): void {
  // Force exit after a short delay to allow console output to complete
  setTimeout(() => {
    process.exit(code);
  }, 100);
}

main()
  .catch((error) => {
    console.error(chalk.red("Unexpected error:"), error);
    forceExit(1);
  })
  .finally(() => {
    // Ensure process terminates even on success
    forceExit(0);
  });
