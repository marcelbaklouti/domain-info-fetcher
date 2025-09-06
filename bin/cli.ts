#!/usr/bin/env node
import {
  fetchDomainInfo,
  RequestOptions,
  extractSubdomain,
  getRootDomain,
} from "../index";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

type CliFormat = "json" | "csv" | "table";

const args = process.argv.slice(2);

const helpText = `
${chalk.bold("domain-info-fetcher CLI")}

A command-line tool to fetch information about domains (single or batch).

${chalk.bold("Usage:")}
  domain-info-fetcher <domain> [options]
  domain-info-fetcher --file domains.txt [options]

${chalk.bold("Options:")}
  --timeout <ms>        Set request timeout in milliseconds (default: 10000)
  --format <fmt>        Output format: json | csv | table (default: table)
  --out <file>          Write output to file (JSON/CSV/table text)
  --file <path>         Read domains from file (one per line)
  --concurrency <n>     Concurrent lookups when using --file (default: 5)
  --include <parts>     Only include sections (csv/json and printed sections). Comma-separated of: ssl,server,dns,http,whois
  --exclude <parts>     Exclude sections (takes precedence if both set)
  --json                Shortcut for --format json
  --help                Show this help message

${chalk.bold("Examples:")}
  domain-info-fetcher example.com
  domain-info-fetcher blog.example.com --timeout 5000 --format json
  domain-info-fetcher --file domains.txt --concurrency 10 --format csv --out results.csv
  domain-info-fetcher example.com --include ssl,whois

${chalk.bold("Notes:")}
  - Subdomains are fully supported. For subdomains, A and CNAME records are fetched
    for the subdomain, while MX, TXT, NS, and SOA are fetched from the root domain.
`;

function parseListFlag(name: string): Set<string> | null {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) {
    return new Set(
      args[idx + 1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
  }
  return null;
}

function getArgValue(name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx !== -1) {
    return args[idx + 1];
  }
  return undefined;
}

function printHelpAndExit(): never {
  console.log(helpText);
  process.exit(0);
}

function pickSections<T extends Record<string, unknown>>(
  obj: T,
  include: Set<string> | null,
  exclude: Set<string> | null
): Partial<T> {
  const map: Record<string, string> = {
    ssl: "sslData",
    server: "serverData",
    dns: "dnsData",
    http: "httpStatus",
    whois: "whoisData",
  };
  const result: Partial<T> = {};
  const keys = Object.keys(map);
  for (const k of keys) {
    const key = map[k];
    const shouldInclude =
      (include === null || include.has(k)) && !(exclude && exclude.has(k));
    if (shouldInclude && key in obj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = (obj as any)[key];
    }
  }
  return result;
}

function sanitizeDomainList(domains: string[]): string[] {
  return domains
    .map((d) => d.trim())
    .filter((d) => d.length > 0 && !d.startsWith("#"));
}

async function readDomainsFromFile(filePath: string): Promise<string[]> {
  const abs = path.resolve(process.cwd(), filePath);
  const content = await fs.promises.readFile(abs, "utf8");
  return sanitizeDomainList(content.split(/\r?\n/));
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (str.includes(",") || str.includes("\n") || str.includes("\"")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildCsv(
  rows: Array<Record<string, unknown>>,
  headers: string[]
): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    const line = headers.map((h) => toCsvValue(row[h])).join(",");
    lines.push(line);
  }
  return lines.join("\n");
}

function summarizeRow(domain: string, info: any): Record<string, unknown> {
  const sslValid = info?.sslData?.valid ?? null;
  const sslValidTo = info?.sslData?.validTo
    ? new Date(info.sslData.validTo).toISOString()
    : null;
  const http = info?.httpStatus ?? null;
  const server = info?.serverData ?? null;
  const aCount = Array.isArray(info?.dnsData?.A) ? info.dnsData.A.length : 0;
  const cname = info?.dnsData?.CNAME ?? null;
  const mxCount = Array.isArray(info?.dnsData?.MX) ? info.dnsData.MX.length : 0;
  const nsCount = Array.isArray(info?.dnsData?.NS) ? info.dnsData.NS.length : 0;
  const txtCount = Array.isArray(info?.dnsData?.TXT)
    ? info.dnsData.TXT.length
    : 0;
  const registrar = info?.whoisData?.registrar ?? null;
  const creation = info?.whoisData?.creationDate
    ? new Date(info.whoisData.creationDate).toISOString()
    : null;
  const expiration = info?.whoisData?.expirationDate
    ? new Date(info.whoisData.expirationDate).toISOString()
    : null;
  let daysToExpiry: number | null = null;
  if (info?.whoisData?.expirationDate) {
    const now = Date.now();
    const exp = new Date(info.whoisData.expirationDate).getTime();
    daysToExpiry = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
  }
  return {
    domain,
    http_status: http,
    server,
    ssl_valid: sslValid,
    ssl_valid_to: sslValidTo,
    a_count: aCount,
    cname,
    mx_count: mxCount,
    ns_count: nsCount,
    txt_count: txtCount,
    whois_registrar: registrar,
    whois_creation: creation,
    whois_expiration: expiration,
    whois_days_to_expiry: daysToExpiry,
  };
}

async function fetchOne(domain: string, options: RequestOptions) {
  try {
    const info = await fetchDomainInfo(domain, options);
    return { domain, info } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { domain, error: message } as const;
  }
}

async function processWithConcurrency(
  domains: string[],
  options: RequestOptions,
  concurrency: number,
  onProgress?: (done: number, total: number, item: {
    domain: string;
    info?: unknown;
    error?: string;
  }) => void
): Promise<Array<{ domain: string; info?: unknown; error?: string }>> {
  const total = domains.length;
  let done = 0;
  const results: Array<{ domain: string; info?: unknown; error?: string }> = [];
  let index = 0;

  async function worker() {
    while (true) {
      const current = index < domains.length ? domains[index++] : undefined;
      if (!current) break;
      const res = await fetchOne(current, options);
      results.push(res);
      done++;
      if (onProgress) onProgress(done, total, res);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

function renderSingle(domain: string, info: any, include: Set<string> | null, exclude: Set<string> | null) {
  console.log(chalk.blue(`Fetching information for ${domain}...`));

  const subdomain = extractSubdomain(domain);
  if (subdomain) {
    const rootDomain = getRootDomain(domain);
    console.log(chalk.blue(`Detected subdomain: ${subdomain} of ${rootDomain}`));
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

  const allow = (k: string) => (include === null || include.has(k)) && !(exclude && exclude.has(k));

  if (allow("ssl")) {
    console.log("\n" + chalk.green.bold("🔒 SSL Certificate:"));
    if (info.sslData?.details) {
      console.log(`  - Issued to: ${info.sslData.details.subject}`);
      console.log(`  - Issued by: ${info.sslData.details.issuer}`);
      console.log(
        `  - Valid: ${info.sslData.valid ? chalk.green("✅ Yes") : chalk.red("❌ No")}`
      );
      console.log(`  - Valid from: ${new Date(info.sslData.details.validFrom).toLocaleDateString()}`);
      console.log(`  - Valid until: ${new Date(info.sslData.details.validTo).toLocaleDateString()}`);
      console.log(
        `  - Days until expiration: ${Math.floor((new Date(info.sslData.details.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}`
      );
    } else {
      console.log(`  - Issued to: ${JSON.stringify(info.sslData?.subject)}`);
      console.log(`  - Issued by: ${JSON.stringify(info.sslData?.issuer)}`);
      console.log(
        `  - Valid: ${info.sslData?.valid ? chalk.green("✅ Yes") : chalk.red("❌ No")}`
      );
      if (info.sslData) {
        console.log(`  - Valid from: ${new Date(info.sslData.validFrom).toLocaleDateString()}`);
        console.log(`  - Valid until: ${new Date(info.sslData.validTo).toLocaleDateString()}`);
      }
    }
    if (info.sslData?.certificate) {
      console.log(`  - ${chalk.green("✅")} PEM certificate available`);
    }
  }

  if (allow("server") || allow("http")) {
    console.log("\n" + chalk.cyan.bold("🖥️ Server:"));
    if (allow("server")) {
      console.log(
        `  - Server software: ${info.serverData || chalk.gray("Not available")}`
      );
    }
    if (allow("http")) {
      console.log(
        `  - HTTP Status: ${
          info.httpStatus
            ? info.httpStatus >= 200 && info.httpStatus < 300
              ? chalk.green(info.httpStatus)
              : chalk.yellow(info.httpStatus)
            : chalk.gray("Not available")
        }`
      );
    }
  }

  if (allow("dns")) {
    if (info.dnsData) {
      console.log("\n" + chalk.yellow.bold("🌐 DNS Records:"));
      console.log(`  - A Records: ${info.dnsData.A.join(", ")}`);
      console.log(`  - CNAME: ${info.dnsData.CNAME || chalk.gray("None")}`);
      if (info.dnsData.MX.length) {
        console.log("  - MX Records:");
        info.dnsData.MX.forEach((mx: any) => {
          console.log(`    * ${mx.exchange} (priority: ${mx.priority})`);
        });
      }
      if (info.dnsData.TXT.length) {
        console.log("  - TXT Records:");
        info.dnsData.TXT.forEach((txt: string) => {
          console.log(`    * ${txt}`);
        });
      }
      if (info.dnsData.NS.length) {
        console.log("  - NS Records:");
        info.dnsData.NS.forEach((ns: string) => {
          console.log(`    * ${ns}`);
        });
      }
    } else {
      console.log("\n" + chalk.red("🌐 DNS Records: Not available"));
    }
  }

  if (allow("whois")) {
    if (info.whoisData) {
      console.log("\n" + chalk.magenta.bold("📋 WHOIS Information:"));
      console.log(
        `  - Registrar: ${info.whoisData.registrar || chalk.gray("Not available")}`
      );
      if (info.whoisData.registrarUrl) {
        console.log(`  - Registrar URL: ${info.whoisData.registrarUrl}`);
      }
      if (info.whoisData.registrarIanaId) {
        console.log(`  - Registrar IANA ID: ${info.whoisData.registrarIanaId}`);
      }
      const datesAvailable =
        info.whoisData.creationDate || info.whoisData.updatedDate || info.whoisData.expirationDate;
      if (datesAvailable) {
        console.log("\n  " + chalk.magenta.bold("⏰ Important Dates:"));
      }
      if (info.whoisData.creationDate) {
        console.log(`  - Created: ${new Date(info.whoisData.creationDate).toLocaleDateString()}`);
      }
      if (info.whoisData.updatedDate) {
        console.log(`  - Last Updated: ${new Date(info.whoisData.updatedDate).toLocaleDateString()}`);
      }
      if (info.whoisData.expirationDate) {
        const now = new Date();
        const daysUntilExpiration = Math.floor(
          (new Date(info.whoisData.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const expirationColor =
          daysUntilExpiration < 30 ? chalk.red : daysUntilExpiration < 90 ? chalk.yellow : chalk.green;
        console.log(
          `  - Expires: ${new Date(info.whoisData.expirationDate).toLocaleDateString()} (${expirationColor(
            `${daysUntilExpiration} days`
          )})`
        );
      }
      if (
        info.whoisData.statusCodes && info.whoisData.statusCodes.length > 0
      ) {
        console.log("\n  " + chalk.magenta.bold("🔒 Domain Status:"));
        info.whoisData.statusCodes.forEach((status: string) => {
          let statusDisplay = status;
          if (
            status.includes("clientTransferProhibited") ||
            status.includes("serverTransferProhibited")
          ) {
            statusDisplay = chalk.yellow(status) + " " + chalk.dim("(Transfer locked)");
          } else if (
            status.includes("clientDeleteProhibited") ||
            status.includes("serverDeleteProhibited")
          ) {
            statusDisplay = chalk.yellow(status) + " " + chalk.dim("(Deletion protected)");
          } else if (
            status.includes("clientUpdateProhibited") ||
            status.includes("serverUpdateProhibited")
          ) {
            statusDisplay = chalk.yellow(status) + " " + chalk.dim("(Updates restricted)");
          } else if (status.includes("clientHold") || status.includes("serverHold")) {
            statusDisplay = chalk.red(status) + " " + chalk.dim("(Domain not in DNS)");
          } else if (status.includes("ok")) {
            statusDisplay = chalk.green(status);
          }
          console.log(`  - ${statusDisplay}`);
        });
      }
      if (info.whoisData.nameServers && info.whoisData.nameServers.length > 0) {
        console.log("\n  " + chalk.magenta.bold("🌐 Name Servers (from WHOIS):"));
        info.whoisData.nameServers.forEach((ns: string) => {
          console.log(`  - ${ns}`);
        });
      }
      if (info.whoisData.rawText) {
        console.log("\n  " + chalk.magenta.bold("📝 Sample Raw WHOIS Data:"));
        const rawTextSample = info.whoisData.rawText
          .split("\n")
          .filter((line: string) => line.trim() !== "")
          .slice(0, 5)
          .map((line: string) => `  ${line}`)
          .join("\n");
        console.log(chalk.gray(`${rawTextSample}`));
        console.log(chalk.dim("  (Showing first 5 non-empty lines of raw WHOIS data)"));
        console.log(chalk.cyan("\n  💡 Tip: To view full WHOIS data, use: whois " + domain));
      }
    } else {
      console.log("\n" + chalk.magenta("📋 WHOIS Information: ") + chalk.gray("Not available"));
    }
  }
}

function renderSummaryTable(rows: Array<Record<string, unknown>>) {
  const headers = [
    "domain",
    "http_status",
    "server",
    "ssl_valid",
    "ssl_valid_to",
    "a_count",
    "mx_count",
    "ns_count",
    "whois_expiration",
    "whois_days_to_expiry",
  ];
  const widths = headers.map((h) => Math.max(h.length, ...rows.map((r) => String(r[h] ?? "").length)));
  const pad = (s: string, w: number) => (s + " ".repeat(w)).slice(0, w);
  const line = headers.map((h, i) => pad(h, widths[i])).join("  ");
  console.log(chalk.bold(line));
  for (const r of rows) {
    const l = headers.map((h, i) => pad(String(r[h] ?? ""), widths[i])).join("  ");
    console.log(l);
  }
}

async function main(): Promise<void> {
  if (args.includes("--help") || args.length === 0) {
    printHelpAndExit();
  }

  const jsonShortcut = args.includes("--json");
  const formatArg = (getArgValue("--format") || (jsonShortcut ? "json" : "table")) as CliFormat;
  const format: CliFormat = ["json", "csv", "table"].includes(formatArg)
    ? (formatArg as CliFormat)
    : "table";
  const outFile = getArgValue("--out");
  const timeoutStr = getArgValue("--timeout");
  const fileInput = getArgValue("--file");
  const concurrencyStr = getArgValue("--concurrency");
  const include = parseListFlag("--include");
  const exclude = parseListFlag("--exclude");

  const options: RequestOptions = {};
  if (timeoutStr) {
    const t = parseInt(timeoutStr, 10);
    if (!isNaN(t)) options.timeout = t;
  }

  let domains: string[] = [];
  const positionalDomain = !fileInput ? args[0] : undefined;
  if (fileInput) {
    domains = await readDomainsFromFile(fileInput);
  }
  if (positionalDomain) {
    domains.push(positionalDomain);
  }
  domains = sanitizeDomainList(domains);

  if (domains.length === 0) {
    console.error(chalk.red("No domains specified."));
    printHelpAndExit();
  }

  if (domains.length === 1) {
    const domain = domains[0];
    try {
      const info = await fetchDomainInfo(domain, options);
      if (!info) {
        console.error(chalk.red("No domain information returned"));
        console.error(chalk.yellow("Suggestion: Verify that the domain exists and is accessible."));
        return;
      }
      if (format === "json") {
        const output = include || exclude ? pickSections(info as any, include, exclude) : info;
        const text = JSON.stringify(output, null, 2);
        if (outFile) {
          await fs.promises.writeFile(outFile, text, "utf8");
        } else {
          console.log(text);
        }
        return;
      }
      if (format === "csv") {
        const row = summarizeRow(domain, info);
        const headers = Object.keys(row);
        const csv = buildCsv([row], headers);
        if (outFile) {
          await fs.promises.writeFile(outFile, csv, "utf8");
        } else {
          console.log(csv);
        }
        return;
      }
      // table
      renderSingle(domain, info, include, exclude);
      return;
    } catch (error) {
      console.error(chalk.red("❌ Error fetching domain information:"));
      if (error instanceof Error) {
        console.error(chalk.red(`   ${error.message}`));
      } else {
        console.error(chalk.red(`   ${String(error)}`));
      }
      process.exit(1);
    }
  }

  // Batch mode
  const concurrency = Math.max(1, Math.min(50, parseInt(concurrencyStr || "5", 10) || 5));
  console.log(chalk.blue(`Processing ${domains.length} domains with concurrency ${concurrency}...`));
  const results = await processWithConcurrency(domains, options, concurrency, (done, total, item) => {
    const prefix = item.error ? chalk.red("✖") : chalk.green("✔");
    console.log(`${prefix} ${item.domain} (${done}/${total})`);
  });

  const successes = results.filter((r) => r.info);
  const failures = results.filter((r) => r.error);

  if (format === "json") {
    const payload = successes.map((r) => ({
      domain: r.domain,
      data: include || exclude ? pickSections(r.info as any, include, exclude) : r.info,
    }));
    const text = JSON.stringify({ results: payload, failed: failures }, null, 2);
    if (outFile) {
      await fs.promises.writeFile(outFile, text, "utf8");
    } else {
      console.log(text);
    }
  } else if (format === "csv") {
    const rows = successes.map((r) => summarizeRow(r.domain, r.info));
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [
      "domain",
      "http_status",
      "server",
      "ssl_valid",
      "ssl_valid_to",
      "a_count",
      "cname",
      "mx_count",
      "ns_count",
      "txt_count",
      "whois_registrar",
      "whois_creation",
      "whois_expiration",
      "whois_days_to_expiry",
    ];
    const csv = buildCsv(rows, headers);
    if (outFile) {
      await fs.promises.writeFile(outFile, csv, "utf8");
    } else {
      console.log(csv);
    }
  } else {
    // table summary
    const rows = successes.map((r) => summarizeRow(r.domain, r.info));
    if (rows.length > 0) {
      console.log("");
      renderSummaryTable(rows);
    }
  }

  // Diagnostics summary
  console.log("");
  console.log(chalk.bold("Summary:"));
  console.log(chalk.green(`  ✔ Succeeded: ${successes.length}`));
  console.log(chalk.red(`  ✖ Failed:    ${failures.length}`));
  if (failures.length > 0) {
    const buckets: Record<string, number> = {};
    for (const f of failures) {
      const msg = (f.error || "Unknown error").split(".")[0];
      buckets[msg] = (buckets[msg] || 0) + 1;
    }
    console.log("  Error categories:");
    Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`    - ${k}: ${v}`));
  }
}

main().catch((error) => {
  console.error(chalk.red("Unexpected error:"), error);
  process.exit(1);
});
