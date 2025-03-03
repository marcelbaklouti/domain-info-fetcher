import { fetchDomainInfo } from "../index";

/**
 * Example showing how to use the WHOIS data functionality
 * (Available since v2.3.0)
 */
async function main(): Promise<void> {
  console.log("Domain-Info-Fetcher WHOIS Example");
  console.log("==================================");

  // Replace with the domain you want to check
  const domainToCheck = "google.com";

  console.log(`Fetching WHOIS data for ${domainToCheck}...`);

  try {
    const info = await fetchDomainInfo(domainToCheck);

    if (!info || !info.whoisData) {
      console.log(`No WHOIS data available for ${domainToCheck}`);
      return;
    }

    console.log("\nRegistration Information:");
    console.log(`Registrar: ${info.whoisData.registrar || "Not available"}`);
    if (info.whoisData.registrarUrl) {
      console.log(`Registrar URL: ${info.whoisData.registrarUrl}`);
    }

    console.log("\nImportant Dates:");
    if (info.whoisData.creationDate) {
      console.log(
        `Creation Date: ${info.whoisData.creationDate.toLocaleDateString()}`
      );
    }
    if (info.whoisData.updatedDate) {
      console.log(
        `Updated Date: ${info.whoisData.updatedDate.toLocaleDateString()}`
      );
    }
    if (info.whoisData.expirationDate) {
      console.log(
        `Expiration Date: ${info.whoisData.expirationDate.toLocaleDateString()}`
      );
    }

    console.log("\nRegistrant Information:");
    if (info.whoisData.registrant?.organization) {
      console.log(`Organization: ${info.whoisData.registrant.organization}`);
    }
    if (info.whoisData.registrant?.country) {
      console.log(`Country: ${info.whoisData.registrant.country}`);
    }

    if (info.whoisData.statusCodes && info.whoisData.statusCodes.length > 0) {
      console.log("\nDomain Status:");
      info.whoisData.statusCodes.forEach((status) =>
        console.log(`- ${status}`)
      );
    }

    if (info.whoisData.nameServers && info.whoisData.nameServers.length > 0) {
      console.log("\nNameservers:");
      info.whoisData.nameServers.forEach((ns) => console.log(`- ${ns}`));
    }

    console.log("\nRaw WHOIS Data Sample:");
    if (info.whoisData.rawText) {
      // Show first few lines of raw text
      const rawTextSample = info.whoisData.rawText
        .split("\n")
        .slice(0, 10)
        .join("\n");
      console.log(rawTextSample + "\n...");
    }

    console.log("\nExample Completed Successfully!");
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

main().catch(console.error);
