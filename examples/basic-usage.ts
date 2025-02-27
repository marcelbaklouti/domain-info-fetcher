import { fetchDomainInfo } from "../index";

/**
 * Basic usage example for the domain-info-fetcher package
 */
async function main(): Promise<void> {
  try {
    // Replace with your domain
    const domain = "baklouti.de";
    console.log(`Fetching information for ${domain}...`);

    const domainInfo = await fetchDomainInfo(domain);

    if (!domainInfo) {
      console.error("No domain information returned");
      return;
    }

    // SSL Certificate Information
    console.log("\n🔒 SSL Certificate:");
    console.log(`  - Issued to: ${JSON.stringify(domainInfo.sslData.subject)}`);
    console.log(`  - Issued by: ${JSON.stringify(domainInfo.sslData.issuer)}`);
    console.log(`  - Valid: ${domainInfo.sslData.valid ? "✅ Yes" : "❌ No"}`);
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
    console.log("\n🖥️ Server:");
    console.log(
      `  - Server software: ${domainInfo.serverData || "Not available"}`
    );
    console.log(`  - HTTP Status: ${domainInfo.httpStatus || "Not available"}`);

    // DNS Information
    if (domainInfo.dnsData) {
      console.log("\n🌐 DNS Records:");
      console.log(`  - A Records: ${domainInfo.dnsData.A.join(", ")}`);
      console.log(`  - CNAME: ${domainInfo.dnsData.CNAME || "None"}`);

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
    } else {
      console.log("\n🌐 DNS Records: Not available");
    }
  } catch (error) {
    console.error("❌ Error fetching domain information:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${String(error)}`);
    }
  }
}

// Run the example
main().catch(console.error);
