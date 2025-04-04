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

async function main(): Promise<void> {
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
      console.error(
        chalk.yellow(
          "Suggestion: Verify that the domain exists and is accessible."
        )
      );
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

    // WHOIS Information - New in v2.3.0
    if (domainInfo.whoisData) {
      console.log("\n" + chalk.magenta.bold("📋 WHOIS Information:"));

      // Registrar information
      console.log(
        `  - Registrar: ${
          domainInfo.whoisData.registrar || chalk.gray("Not available")
        }`
      );
      if (domainInfo.whoisData.registrarUrl) {
        console.log(`  - Registrar URL: ${domainInfo.whoisData.registrarUrl}`);
      }
      if (domainInfo.whoisData.registrarIanaId) {
        console.log(
          `  - Registrar IANA ID: ${domainInfo.whoisData.registrarIanaId}`
        );
      }

      // Domain dates
      const datesAvailable =
        domainInfo.whoisData.creationDate ||
        domainInfo.whoisData.updatedDate ||
        domainInfo.whoisData.expirationDate;

      if (datesAvailable) {
        console.log("\n  " + chalk.magenta.bold("⏰ Important Dates:"));
      }

      if (domainInfo.whoisData.creationDate) {
        console.log(
          `  - Created: ${domainInfo.whoisData.creationDate.toLocaleDateString()}`
        );
      }

      if (domainInfo.whoisData.updatedDate) {
        console.log(
          `  - Last Updated: ${domainInfo.whoisData.updatedDate.toLocaleDateString()}`
        );
      }

      if (domainInfo.whoisData.expirationDate) {
        const now = new Date();
        const daysUntilExpiration = Math.floor(
          (domainInfo.whoisData.expirationDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const expirationColor =
          daysUntilExpiration < 30
            ? chalk.red
            : daysUntilExpiration < 90
            ? chalk.yellow
            : chalk.green;

        console.log(
          `  - Expires: ${domainInfo.whoisData.expirationDate.toLocaleDateString()} (${expirationColor(
            `${daysUntilExpiration} days`
          )})`
        );
      }

      // Registrant information (if available)
      if (
        domainInfo.whoisData.registrant &&
        (domainInfo.whoisData.registrant.organization ||
          domainInfo.whoisData.registrant.country ||
          domainInfo.whoisData.registrant.email)
      ) {
        console.log("\n  " + chalk.magenta.bold("👤 Registrant Information:"));

        if (domainInfo.whoisData.registrant.organization) {
          console.log(
            `  - Organization: ${domainInfo.whoisData.registrant.organization}`
          );
        }

        if (domainInfo.whoisData.registrant.country) {
          console.log(
            `  - Country: ${domainInfo.whoisData.registrant.country}`
          );
        }

        if (domainInfo.whoisData.registrant.email) {
          console.log(`  - Email: ${domainInfo.whoisData.registrant.email}`);
        }
      }

      // Domain status
      if (
        domainInfo.whoisData.statusCodes &&
        domainInfo.whoisData.statusCodes.length > 0
      ) {
        console.log("\n  " + chalk.magenta.bold("🔒 Domain Status:"));
        domainInfo.whoisData.statusCodes.forEach((status) => {
          // Color code common status values
          let statusDisplay = status;

          if (
            status.includes("clientTransferProhibited") ||
            status.includes("serverTransferProhibited")
          ) {
            statusDisplay =
              chalk.yellow(status) + " " + chalk.dim("(Transfer locked)");
          } else if (
            status.includes("clientDeleteProhibited") ||
            status.includes("serverDeleteProhibited")
          ) {
            statusDisplay =
              chalk.yellow(status) + " " + chalk.dim("(Deletion protected)");
          } else if (
            status.includes("clientUpdateProhibited") ||
            status.includes("serverUpdateProhibited")
          ) {
            statusDisplay =
              chalk.yellow(status) + " " + chalk.dim("(Updates restricted)");
          } else if (
            status.includes("clientHold") ||
            status.includes("serverHold")
          ) {
            statusDisplay =
              chalk.red(status) + " " + chalk.dim("(Domain not in DNS)");
          } else if (status.includes("ok")) {
            statusDisplay = chalk.green(status);
          }

          console.log(`  - ${statusDisplay}`);
        });
      }

      // Name servers from WHOIS
      if (
        domainInfo.whoisData.nameServers &&
        domainInfo.whoisData.nameServers.length > 0
      ) {
        console.log(
          "\n  " + chalk.magenta.bold("🌐 Name Servers (from WHOIS):")
        );
        domainInfo.whoisData.nameServers.forEach((ns) => {
          console.log(`  - ${ns}`);
        });
      }

      // Add a sample of the raw WHOIS text
      if (domainInfo.whoisData.rawText) {
        console.log("\n  " + chalk.magenta.bold("📝 Sample Raw WHOIS Data:"));
        // Get first few lines of raw WHOIS text (limited to 5 lines)
        const rawTextSample = domainInfo.whoisData.rawText
          .split("\n")
          .filter((line) => line.trim() !== "")
          .slice(0, 5)
          .map((line) => `  ${line}`)
          .join("\n");
        console.log(chalk.gray(`${rawTextSample}`));
        console.log(
          chalk.dim("  (Showing first 5 non-empty lines of raw WHOIS data)")
        );
        console.log(
          chalk.cyan(
            "\n  💡 Tip: To view full WHOIS data, use: whois " + domain
          )
        );
      }
    } else {
      console.log(
        "\n" +
          chalk.magenta("📋 WHOIS Information: ") +
          chalk.gray("Not available")
      );
    }
  } catch (error) {
    console.error(chalk.red("❌ Error fetching domain information:"));
    if (error instanceof Error) {
      console.error(chalk.red(`   ${error.message}`));

      // Provide helpful suggestions based on error message
      if (error.message.includes("Invalid domain name")) {
        console.error(
          chalk.yellow(
            "\nSuggestion: The domain format is invalid. Try using a format like 'example.com' without protocol (http://, https://) or trailing paths."
          )
        );
      } else if (error.message.includes("Could not fetch SSL data")) {
        console.error(
          chalk.yellow(
            "\nSuggestion: SSL connection failed. This could be because:"
          )
        );
        console.error(chalk.yellow("  - The domain doesn't support HTTPS"));
        console.error(
          chalk.yellow("  - The SSL certificate is invalid or self-signed")
        );
        console.error(
          chalk.yellow("  - Try using a longer timeout with --timeout option")
        );
      } else if (error.message.includes("Could not fetch DNS data")) {
        console.error(
          chalk.yellow(
            "\nSuggestion: DNS resolution failed. This could be because:"
          )
        );
        console.error(chalk.yellow("  - The domain doesn't exist"));
        console.error(
          chalk.yellow("  - Your network or DNS resolver is having issues")
        );
        console.error(
          chalk.yellow(
            "  - Try checking your internet connection or using a different DNS resolver"
          )
        );
      } else if (error.message.includes("Could not fetch server data")) {
        console.error(
          chalk.yellow(
            "\nSuggestion: Server connection failed. This could be because:"
          )
        );
        console.error(chalk.yellow("  - The server is down or not responding"));
        console.error(
          chalk.yellow("  - A firewall is blocking the connection")
        );
        console.error(
          chalk.yellow("  - Try increasing the timeout with --timeout option")
        );
      } else if (error.message.includes("ENOTFOUND")) {
        console.error(
          chalk.yellow("\nSuggestion: Domain not found. This could be because:")
        );
        console.error(
          chalk.yellow("  - The domain doesn't exist or is misspelled")
        );
        console.error(
          chalk.yellow("  - Your DNS resolver can't resolve this domain")
        );
        console.error(chalk.yellow("  - Check for typos in the domain name"));
      } else if (
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("timeout")
      ) {
        console.error(
          chalk.yellow(
            "\nSuggestion: Connection timed out. This could be because:"
          )
        );
        console.error(chalk.yellow("  - The server is slow to respond"));
        console.error(chalk.yellow("  - Your internet connection is unstable"));
        console.error(
          chalk.yellow("  - Try increasing the timeout with --timeout option")
        );
      } else if (error.message.includes("ECONNREFUSED")) {
        console.error(
          chalk.yellow(
            "\nSuggestion: Connection refused. This could be because:"
          )
        );
        console.error(
          chalk.yellow(
            "  - The server is not accepting connections on port 443 (HTTPS)"
          )
        );
        console.error(chalk.yellow("  - The domain might not support HTTPS"));
      }
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
