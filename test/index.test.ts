import {
  fetchDomainInfo,
  formatDomain,
  checkDomain,
  dateToTimestamp,
  RequestOptions,
} from "../index";

// Using a real domain for testing
const TEST_DOMAIN = "example.com";

describe("fetchDomainInfo", () => {
  // Increase timeout for real network calls
  jest.setTimeout(30000);

  test("should return domain info for example.com", async () => {
    const domainInfo = await fetchDomainInfo(TEST_DOMAIN);

    // Check the structure is correct
    expect(domainInfo).toHaveProperty("sslData");
    expect(domainInfo).toHaveProperty("serverData");
    expect(domainInfo).toHaveProperty("dnsData");
    expect(domainInfo).toHaveProperty("httpStatus");

    // Check general structure without specific values since they can change
    expect(domainInfo?.sslData).toHaveProperty("subject");
    expect(domainInfo?.sslData).toHaveProperty("issuer");
    expect(domainInfo?.sslData).toHaveProperty("valid");
    expect(domainInfo?.sslData).toHaveProperty("validFrom");
    expect(domainInfo?.sslData).toHaveProperty("validTo");

    // Check DNS data
    expect(Array.isArray(domainInfo?.dnsData?.A)).toBe(true);
    expect(domainInfo?.dnsData?.A.length).toBeGreaterThan(0);

    // HTTP status should be valid
    expect(domainInfo?.httpStatus).toBeGreaterThanOrEqual(200);
    expect(domainInfo?.httpStatus).toBeLessThan(400);
  });

  test("should pass custom options to requests", async () => {
    // Custom request options
    const options: RequestOptions = {
      timeout: 5000,
      headers: {
        "User-Agent": "DomainInfoTest/1.0",
      },
    };

    const domainInfo = await fetchDomainInfo(TEST_DOMAIN, options);

    // Just verify call succeeds with custom options
    expect(domainInfo).toHaveProperty("sslData");
  });

  test("should throw error for empty domain", async () => {
    await expect(fetchDomainInfo("")).rejects.toThrow(
      "Domain name cannot be empty"
    );
  });

  test("should throw error for invalid domain", async () => {
    await expect(fetchDomainInfo("invalid")).rejects.toThrow(
      "Invalid domain name"
    );
  });
});

describe("formatDomain", () => {
  test("should return domain without http and www", () => {
    const domain = formatDomain("https://www.google.com");
    expect(domain).toBe("google.com");
  });

  test("should return domain without www", () => {
    const domain = formatDomain("www.google.com");
    expect(domain).toBe("google.com");
  });

  test("should remove trailing slash", () => {
    const domain = formatDomain("example.com/");
    expect(domain).toBe("example.com");
  });

  test("should convert to lowercase", () => {
    const domain = formatDomain("EXAMPLE.COM");
    expect(domain).toBe("example.com");
  });

  test("should handle domains with subdomains", () => {
    const domain = formatDomain("sub.example.com");
    expect(domain).toBe("sub.example.com");
  });
});

describe("checkDomain", () => {
  test("should return true for valid domain", () => {
    expect(checkDomain("google.com")).toBe(true);
  });

  test("should return false for invalid domain", () => {
    expect(checkDomain("invalid")).toBe(false);
  });

  test("should return true for subdomain", () => {
    expect(checkDomain("sub.example.com")).toBe(true);
  });

  test("should return false for empty domain", () => {
    expect(checkDomain("")).toBe(false);
  });

  test("should return false for domain with empty parts", () => {
    expect(checkDomain(".com")).toBe(false);
  });
});

describe("dateToTimestamp", () => {
  test("should convert date string to timestamp", () => {
    const date = new Date("2023-06-21");
    const timestamp = dateToTimestamp(date.toString());
    expect(timestamp).toBe(date.getTime());
  });

  test("should return NaN for invalid date string", () => {
    const timestamp = dateToTimestamp("invalid");
    expect(timestamp).toBeNaN();
  });

  test("should handle different date formats", () => {
    // ISO format
    const isoDate = "2023-01-15T12:30:45.000Z";
    const isoTimestamp = dateToTimestamp(isoDate);
    expect(isoTimestamp).toBe(new Date(isoDate).getTime());

    // US format
    const usDate = "Jan 15, 2023";
    const usTimestamp = dateToTimestamp(usDate);
    expect(usTimestamp).toBe(new Date(usDate).getTime());
  });
});
