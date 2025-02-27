import { fetchDomainInfo, extractSubdomain, getRootDomain } from "../index";

/**
 * Example demonstrating subdomain support in the domain-info-fetcher package
 */
async function main(): Promise<void> {
  try {
    // You can replace these with your preferred domains
    const domains = [
      "www.github.com", // Subdomain that is typically stripped by formatDomain
      "blog.github.com", // Regular subdomain
      "github.com", // Root domain for comparison
    ];

    console.log("Demonstrating subdomain support:\n");

    for (const domain of domains) {
      console.log(`\n${"-".repeat(50)}`);
      console.log(`Analyzing domain: ${domain}`);

      // Demonstrate subdomain extraction functions
      const subdomain = extractSubdomain(domain);
      const rootDomain = getRootDomain(domain);

      console.log(`Subdomain: ${subdomain || "None"}`);
      console.log(`Root domain: ${rootDomain}`);

      // Fetch domain info
      console.log(`\nFetching information for ${domain}...`);
      const domainInfo = await fetchDomainInfo(domain);

      if (!domainInfo) {
        console.error(`No domain information returned for ${domain}`);
        continue;
      }

      // SSL Certificate Information
      console.log("\n🔒 SSL Certificate:");
      console.log(
        `  - Issued to: ${JSON.stringify(domainInfo.sslData.subject)}`
      );
      console.log(
        `  - Valid: ${domainInfo.sslData.valid ? "✅ Yes" : "❌ No"}`
      );
      console.log(
        `  - Valid until: ${new Date(
          domainInfo.sslData.validTo
        ).toLocaleDateString()}`
      );

      // DNS Information - Focus on subdomain handling
      if (domainInfo.dnsData) {
        console.log("\n🌐 DNS Records:");
        console.log(`  - A Records: ${domainInfo.dnsData.A.join(", ")}`);
        console.log(`  - CNAME: ${domainInfo.dnsData.CNAME || "None"}`);

        // For subdomains, MX, TXT, NS records are typically from the root domain
        if (subdomain) {
          console.log(`\n  Root domain (${rootDomain}) records:`);
        }

        if (domainInfo.dnsData.MX.length) {
          console.log(
            `  - MX Records: ${domainInfo.dnsData.MX.length} records found`
          );
        }

        if (domainInfo.dnsData.NS.length) {
          console.log(
            `  - NS Records: ${domainInfo.dnsData.NS.length} records found`
          );
        }

        if (domainInfo.dnsData.TXT.length) {
          console.log(
            `  - TXT Records: ${domainInfo.dnsData.TXT.length} records found`
          );
        }
      } else {
        console.log("\n🌐 DNS Records: Not available");
      }
    }
  } catch (error) {
    console.error("❌ Error in example:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${String(error)}`);
    }
  }
}

// Run the example
main().catch(console.error);
