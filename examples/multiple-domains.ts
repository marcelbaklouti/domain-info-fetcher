import { fetchDomainInfo, RequestOptions } from "../index";

/**
 * Advanced usage example processing multiple domains
 * and summarizing certificate expiration information
 */
async function checkMultipleDomains(): Promise<void> {
  // List of domains to check
  const domains = [
    "google.com",
    "github.com",
    "example.com",
    "microsoft.com",
    "apple.com",
  ];

  console.log(
    `Checking ${domains.length} domains for SSL and server information...\n`
  );

  // Custom request options
  const options: RequestOptions = {
    timeout: 10000,
    headers: {
      "User-Agent": "domain-info-fetcher-example/1.0",
    },
  };

  try {
    // Process all domains in parallel
    const results = await Promise.allSettled(
      domains.map((domain) => fetchDomainInfo(domain, options))
    );

    // Group domains by certificate validity status
    const validCerts: { domain: string; daysLeft: number }[] = [];
    const invalidCerts: { domain: string; reason: string }[] = [];
    const errors: { domain: string; error: string }[] = [];

    results.forEach((result, index) => {
      const domain = domains[index];

      if (result.status === "fulfilled" && result.value) {
        const sslData = result.value.sslData;

        if (sslData.valid) {
          // Calculate days left until expiration
          const now = Date.now();
          const daysLeft = Math.floor(
            (sslData.validTo - now) / (1000 * 60 * 60 * 24)
          );
          validCerts.push({ domain, daysLeft });
        } else {
          invalidCerts.push({
            domain,
            reason: "Certificate expired or not valid",
          });
        }
      } else if (result.status === "rejected") {
        errors.push({
          domain,
          error: result.reason.message || "Unknown error",
        });
      }
    });

    // Sort valid certificates by days left
    validCerts.sort((a, b) => a.daysLeft - b.daysLeft);

    // Display results
    console.log("=== SSL CERTIFICATE SUMMARY ===");
    console.log(`\n✅ Valid certificates (${validCerts.length}):`);
    if (validCerts.length > 0) {
      console.log("\nDomain               | Days Left Until Expiration");
      console.log("---------------------|-------------------------");
      validCerts.forEach((cert) => {
        console.log(
          `${cert.domain.padEnd(20)} | ${cert.daysLeft
            .toString()
            .padStart(5)} days`
        );
      });
    }

    if (invalidCerts.length > 0) {
      console.log(`\n❌ Invalid certificates (${invalidCerts.length}):`);
      invalidCerts.forEach((cert) => {
        console.log(`  - ${cert.domain}: ${cert.reason}`);
      });
    }

    if (errors.length > 0) {
      console.log(`\n❌ Errors (${errors.length}):`);
      errors.forEach((err) => {
        console.log(`  - ${err.domain}: ${err.error}`);
      });
    }
  } catch (error) {
    console.error("Global error occurred:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${String(error)}`);
    }
  }
}

// Run the example
checkMultipleDomains().catch(console.error);
