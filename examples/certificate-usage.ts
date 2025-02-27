import { fetchDomainInfo } from "../index";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Example demonstrating how to work with certificate data
 * including PEM certificates and human-readable details
 */
async function main(): Promise<void> {
  try {
    // Replace with your domain
    const domain = "example.com";
    console.log(`Fetching SSL certificate information for ${domain}...`);

    const domainInfo = await fetchDomainInfo(domain);

    if (!domainInfo?.sslData) {
      console.error("No SSL data returned");
      return;
    }

    // Display human-readable certificate details
    console.log("\n🔒 Certificate Details (human-readable):");
    if (domainInfo.sslData.details) {
      console.log(`  - Subject: ${domainInfo.sslData.details.subject}`);
      console.log(`  - Issuer: ${domainInfo.sslData.details.issuer}`);
      console.log(
        `  - Valid from: ${domainInfo.sslData.details.validFrom.toLocaleString()}`
      );
      console.log(
        `  - Valid until: ${domainInfo.sslData.details.validTo.toLocaleString()}`
      );
      console.log(
        `  - Days until expiration: ${Math.floor(
          (domainInfo.sslData.details.validTo.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )}`
      );
    } else {
      console.log("  Human-readable details not available");
    }

    // Create a directory for saving certificates
    const certDir = path.join(__dirname, "certificates");
    try {
      await fs.mkdir(certDir, { recursive: true });
      console.log(`\nSaving certificates to directory: ${certDir}`);
    } catch (err) {
      console.error(
        `Error creating directory: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return;
    }

    // Save certificates if available
    const certStatus = [];

    if (domainInfo.sslData.certificate) {
      const serverCertPath = path.join(certDir, `${domain}-server.pem`);
      await fs.writeFile(serverCertPath, domainInfo.sslData.certificate);
      certStatus.push(`✅ Server certificate saved to: ${serverCertPath}`);
    } else {
      certStatus.push("❌ Server certificate not available");
    }

    if (domainInfo.sslData.intermediateCertificate) {
      const intermediateCertPath = path.join(
        certDir,
        `${domain}-intermediate.pem`
      );
      await fs.writeFile(
        intermediateCertPath,
        domainInfo.sslData.intermediateCertificate
      );
      certStatus.push(
        `✅ Intermediate certificate saved to: ${intermediateCertPath}`
      );
    } else {
      certStatus.push("❌ Intermediate certificate not available");
    }

    if (domainInfo.sslData.rootCertificate) {
      const rootCertPath = path.join(certDir, `${domain}-root.pem`);
      await fs.writeFile(rootCertPath, domainInfo.sslData.rootCertificate);
      certStatus.push(`✅ Root certificate saved to: ${rootCertPath}`);
    } else {
      certStatus.push("❌ Root certificate not available");
    }

    // Display certificate status
    console.log("\n📄 Certificate Files:");
    certStatus.forEach((status) => console.log(`  ${status}`));

    console.log("\n💡 Tip: You can use these certificates for:");
    console.log("  - SSL pinning in mobile or web applications");
    console.log("  - Certificate validation in custom TLS implementations");
    console.log("  - Analysis or verification of the certificate chain");
    console.log("  - Implementing mutual TLS authentication");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

main().catch(console.error);
