#!/usr/bin/env node
import {
  fetchDomainInfo,
  RequestOptions,
  extractSubdomain,
  getRootDomain,
} from "../index";
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

${chalk.bold("Examples:")}
  domain-info-fetcher example.com
  domain-info-fetcher blog.example.com     # Subdomains are fully supported
  domain-info-fetcher example.com --timeout 5000 --json

${chalk.bold("Note:")}
  Subdomains (e.g., blog.example.com) are fully supported.
  For subdomains, A and CNAME records are fetched for the subdomain itself,
  while other DNS records (MX, TXT, NS, SOA) are fetched from the root domain.
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

    // Check if the domain is a subdomain
    const subdomain = extractSubdomain(domain);
    if (subdomain) {
      const rootDomain = getRootDomain(domain);
      console.log(
        chalk.blue(`Detected subdomain: ${subdomain} of ${rootDomain}`)
      );
      console.log(
        chalk.blue(
          `For subdomain queries, A and CNAME records are specific to the subdomain,`
        )
      );
      console.log(
        chalk.blue(
          `while other DNS records are from the root domain ${rootDomain}`
        )
      );
    }

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

    // Display human-readable details if available
    if (domainInfo.sslData.details) {
      console.log(`  - Issued to: ${domainInfo.sslData.details.subject}`);
      console.log(`  - Issued by: ${domainInfo.sslData.details.issuer}`);
      console.log(
        `  - Valid: ${
          domainInfo.sslData.valid ? chalk.green("✅ Yes") : chalk.red("❌ No")
        }`
      );
      console.log(
        `  - Valid from: ${domainInfo.sslData.details.validFrom.toLocaleDateString()}`
      );
      console.log(
        `  - Valid until: ${domainInfo.sslData.details.validTo.toLocaleDateString()}`
      );
      console.log(
        `  - Days until expiration: ${Math.floor(
          (domainInfo.sslData.details.validTo.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )}`
      );
    } else {
      // Fallback to original display format
      console.log(
        `  - Issued to: ${JSON.stringify(domainInfo.sslData.subject)}`
      );
      console.log(
        `  - Issued by: ${JSON.stringify(domainInfo.sslData.issuer)}`
      );
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
    }

    // Show certificate availability
    if (domainInfo.sslData.certificate) {
      console.log(`  - ${chalk.green("✅")} PEM certificate available`);
    }

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
