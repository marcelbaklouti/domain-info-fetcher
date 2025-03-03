import * as net from "net";
import { formatDomain, getRootDomain } from "../index";

/**
 * Interface for WHOIS data
 */
export interface WhoisData {
  // Registration information
  registrar?: string;
  registrarUrl?: string;
  registrarIanaId?: string;

  // Dates
  creationDate?: Date;
  updatedDate?: Date;
  expirationDate?: Date;

  // Contact information (redacted in many cases due to privacy)
  registrant?: {
    organization?: string;
    country?: string;
    email?: string;
  };

  // Status codes
  statusCodes?: string[];

  // Name servers
  nameServers?: string[];

  // Raw WHOIS response
  rawText: string;
}

/**
 * Map of TLDs to their WHOIS servers
 */
const WHOIS_SERVERS: { [key: string]: string } = {
  // Generic Top-Level Domains (gTLDs)
  com: "whois.verisign-grs.com",
  net: "whois.verisign-grs.com",
  org: "whois.pir.org",
  info: "whois.afilias.net",
  biz: "whois.neulevel.biz",
  io: "whois.nic.io",
  co: "whois.nic.co",
  app: "whois.nic.google",
  dev: "whois.nic.google",
  page: "whois.nic.google",
  cloud: "whois.nic.cloud",
  xyz: "whois.nic.xyz",
  site: "whois.nic.site",
  online: "whois.nic.online",
  top: "whois.nic.top",
  store: "whois.nic.store",
  shop: "whois.nic.shop",
  blog: "whois.nic.blog",
  tech: "whois.nic.tech",
  design: "whois.nic.design",
  money: "whois.nic.money",
  email: "whois.nic.email",
  live: "whois.nic.live",
  club: "whois.nic.club",
  news: "whois.nic.news",
  wiki: "whois.nic.wiki",
  global: "whois.nic.global",
  digital: "whois.nic.digital",

  // Country Code Top-Level Domains (ccTLDs)
  us: "whois.nic.us",
  uk: "whois.nic.uk",
  de: "whois.denic.de",
  fr: "whois.nic.fr",
  ca: "whois.cira.ca",
  au: "whois.auda.org.au",
  nl: "whois.domain-registry.nl",
  ru: "whois.tcinet.ru",
  ch: "whois.nic.ch",
  es: "whois.nic.es",
  it: "whois.nic.it",
  jp: "whois.jprs.jp",
  cn: "whois.cnnic.cn",
  in: "whois.registry.in",
  br: "whois.registro.br",
  mx: "whois.mx",
  nz: "whois.nic.nz",
  se: "whois.iis.se",
  no: "whois.norid.no",
  dk: "whois.dk-hostmaster.dk",
  fi: "whois.fi",
  kr: "whois.kr",
  pl: "whois.dns.pl",
  be: "whois.dns.be",
  at: "whois.nic.at",
  hk: "whois.hkirc.hk",
  sg: "whois.sgnic.sg",
  tw: "whois.twnic.net.tw",
  ie: "whois.iedr.ie",
  za: "whois.registry.net.za",
  tr: "whois.nic.tr",
  il: "whois.isoc.org.il",
  ua: "whois.ua",
  gr: "whois.nic.gr",
  ro: "whois.rotld.ro",
  th: "whois.thnic.co.th",
  my: "whois.mynic.my",
  pt: "whois.dns.pt",
  hu: "whois.nic.hu",
  cz: "whois.nic.cz",
  sk: "whois.sk-nic.sk",
  ar: "whois.nic.ar",
  cl: "whois.nic.cl",
  pe: "kero.yachay.pe",
  ec: "whois.nic.ec",
  uy: "whois.nic.org.uy",
  ve: "whois.nic.ve",
  ac: "whois.nic.ac",
  ae: "whois.aeda.net.ae",
  af: "whois.nic.af",
  ag: "whois.nic.ag",
  ai: "whois.nic.ai",
  al: "whois.ripe.net",
  am: "whois.amnic.net",
  as: "whois.nic.as",
  asia: "whois.nic.asia",
  az: "whois.ripe.net",
  ba: "whois.ripe.net",
  bg: "whois.register.bg",
  bi: "whois.nic.bi",
  bj: "whois.nic.bj",
  bm: "whois.afilias-srs.net",
  bn: "whois.bn",
  bo: "whois.nic.bo",
  by: "whois.cctld.by",
  bz: "whois.afilias-grs.info",
  cat: "whois.nic.cat",
  cc: "whois.nic.cc",
  cd: "whois.nic.cd",
  cf: "whois.dot.cf",
  ci: "whois.nic.ci",
  cm: "whois.netcom.cm",
  cr: "whois.nic.cr",
  cu: "whois.nic.cu",
  cx: "whois.nic.cx",
  cy: "whois.ripe.net",
  dz: "whois.nic.dz",
  ee: "whois.tld.ee",
  eu: "whois.eu",
  fm: "whois.nic.fm",
  fo: "whois.nic.fo",
  ga: "whois.dot.ga",
  gd: "whois.nic.gd",
  gf: "whois.mediaserv.net",
  gg: "whois.gg",
  gi: "whois2.afilias-grs.net",
  gl: "whois.nic.gl",
  gp: "whois.nic.gp",
  gs: "whois.nic.gs",
  gt: "whois.nic.gt",
  gy: "whois.registry.gy",
  hm: "whois.registry.hm",
  hn: "whois.nic.hn",
  hr: "whois.dns.hr",
  ht: "whois.nic.ht",
  im: "whois.nic.im",
  iq: "whois.cmc.iq",
  ir: "whois.nic.ir",
  is: "whois.isnic.is",
  je: "whois.je",
  jo: "whois.nic.jo",
  ke: "whois.kenic.or.ke",
  kg: "whois.domain.kg",
  ki: "whois.nic.ki",
  kn: "whois.nic.kn",
  kz: "whois.nic.kz",
  la: "whois.nic.la",
  lc: "whois.nic.lc",
  li: "whois.nic.li",
  lk: "whois.nic.lk",
  lt: "whois.domreg.lt",
  lu: "whois.dns.lu",
  lv: "whois.nic.lv",
  ly: "whois.nic.ly",
  ma: "whois.registre.ma",
  mc: "whois.ripe.net",
  md: "whois.nic.md",
  me: "whois.nic.me",
  mg: "whois.nic.mg",
  mk: "whois.marnet.mk",
  ml: "whois.dot.ml",
  mm: "whois.nic.mm",
  mn: "whois.nic.mn",
  mo: "whois.monic.mo",
  mp: "whois.nic.mp",
  ms: "whois.nic.ms",
  mu: "whois.nic.mu",
  mw: "whois.nic.mw",
  mz: "whois.nic.mz",
  na: "whois.na-nic.com.na",
  nc: "whois.nc",
  nf: "whois.nic.nf",
  ng: "whois.nic.net.ng",
  nu: "whois.iis.nu",
  om: "whois.registry.om",
  pr: "whois.nic.pr",
  ps: "whois.pnina.ps",
  qa: "whois.registry.qa",
  re: "whois.nic.re",
  rs: "whois.rnids.rs",
  sa: "whois.nic.net.sa",
  sb: "whois.nic.sb",
  sc: "whois.nic.sc",
  sd: "whois.sd",
  si: "whois.register.si",
  sl: "whois.nic.sl",
  sm: "whois.nic.sm",
  sn: "whois.nic.sn",
  so: "whois.nic.so",
  sr: "whois.nic.sr",
  st: "whois.nic.st",
  su: "whois.tcinet.ru",
  sx: "whois.sx",
  sy: "whois.tld.sy",
  tc: "whois.nic.tc",
  tf: "whois.nic.tf",
  tg: "whois.nic.tg",
  tj: "whois.nic.tj",
  tk: "whois.dot.tk",
  tl: "whois.nic.tl",
  tm: "whois.nic.tm",
  tn: "whois.ati.tn",
  to: "whois.tonic.to",
  tv: "whois.nic.tv",
  tz: "whois.tznic.or.tz",
  ug: "whois.co.ug",
  vc: "whois.nic.vc",
  vg: "whois.nic.vg",
  vu: "whois.nic.vu",
  wf: "whois.nic.wf",
  ws: "whois.website.ws",
  yt: "whois.nic.yt",

  // New Generic TLDs
  academy: "whois.nic.academy",
  accountant: "whois.nic.accountant",
  actor: "whois.nic.actor",
  agency: "whois.nic.agency",
  airforce: "whois.nic.airforce",
  apartments: "whois.nic.apartments",
  army: "whois.nic.army",
  art: "whois.nic.art",
  associates: "whois.nic.associates",
  attorney: "whois.nic.attorney",
  auction: "whois.nic.auction",
  audio: "whois.nic.audio",
  auto: "whois.nic.auto",
  band: "whois.nic.band",
  bar: "whois.nic.bar",
  bargains: "whois.nic.bargains",
  beer: "whois.nic.beer",
  best: "whois.nic.best",
  bid: "whois.nic.bid",
  bike: "whois.nic.bike",
  bingo: "whois.nic.bingo",
  black: "whois.nic.black",
  blue: "whois.nic.blue",
  boutique: "whois.nic.boutique",
  builders: "whois.nic.builders",
  business: "whois.nic.business",
  buzz: "whois.nic.buzz",
  cab: "whois.nic.cab",
  cafe: "whois.nic.cafe",
  camera: "whois.nic.camera",
  camp: "whois.nic.camp",
  capital: "whois.nic.capital",
  cards: "whois.nic.cards",
  care: "whois.nic.care",
  careers: "whois.nic.careers",
  cash: "whois.nic.cash",
  casino: "whois.nic.casino",
  catering: "whois.nic.catering",
  center: "whois.nic.center",
  ceo: "whois.nic.ceo",
  chat: "whois.nic.chat",
  cheap: "whois.nic.cheap",
  christmas: "whois.nic.christmas",
  church: "whois.nic.church",
  city: "whois.nic.city",
  claims: "whois.nic.claims",
  cleaning: "whois.nic.cleaning",
  click: "whois.nic.click",
  clinic: "whois.nic.clinic",
  clothing: "whois.nic.clothing",
  coach: "whois.nic.coach",
  codes: "whois.nic.codes",
  coffee: "whois.nic.coffee",
  community: "whois.nic.community",
  company: "whois.nic.company",
  computer: "whois.nic.computer",
  condos: "whois.nic.condos",
  construction: "whois.nic.construction",
  consulting: "whois.nic.consulting",
  contractors: "whois.nic.contractors",
  cool: "whois.nic.cool",
  coupons: "whois.nic.coupons",
  credit: "whois.nic.credit",
  creditcard: "whois.nic.creditcard",
  cruises: "whois.nic.cruises",
  dance: "whois.nic.dance",
  dating: "whois.nic.dating",
  deals: "whois.nic.deals",
  degree: "whois.nic.degree",
  delivery: "whois.nic.delivery",
  democrat: "whois.nic.democrat",
  dental: "whois.nic.dental",
  dentist: "whois.nic.dentist",
  diamonds: "whois.nic.diamonds",
  diet: "whois.nic.diet",
  direct: "whois.nic.direct",
  directory: "whois.nic.directory",
  discount: "whois.nic.discount",
  doctor: "whois.nic.doctor",
  dog: "whois.nic.dog",
  domains: "whois.nic.domains",
  education: "whois.nic.education",
  energy: "whois.nic.energy",
  engineer: "whois.nic.engineer",
  engineering: "whois.nic.engineering",
  enterprises: "whois.nic.enterprises",
  equipment: "whois.nic.equipment",
  estate: "whois.nic.estate",
  events: "whois.nic.events",
  exchange: "whois.nic.exchange",
  expert: "whois.nic.expert",
  exposed: "whois.nic.exposed",
  express: "whois.nic.express",
  fail: "whois.nic.fail",
  faith: "whois.nic.faith",
  family: "whois.nic.family",
  fans: "whois.nic.fans",
  farm: "whois.nic.farm",
  fashion: "whois.nic.fashion",
  film: "whois.nic.film",
  finance: "whois.nic.finance",
  financial: "whois.nic.financial",
  fish: "whois.nic.fish",
  fishing: "whois.nic.fishing",
  fit: "whois.nic.fit",
  fitness: "whois.nic.fitness",
  flights: "whois.nic.flights",
  florist: "whois.nic.florist",
  football: "whois.nic.football",
  forex: "whois.nic.forex",
  forsale: "whois.nic.forsale",
  foundation: "whois.nic.foundation",
  fund: "whois.nic.fund",
  furniture: "whois.nic.furniture",
  futbol: "whois.nic.futbol",
  fyi: "whois.nic.fyi",
  gallery: "whois.nic.gallery",
  games: "whois.nic.games",
  garden: "whois.nic.garden",
  gift: "whois.nic.gift",
  gifts: "whois.nic.gifts",
  gives: "whois.nic.gives",
  glass: "whois.nic.glass",
  golf: "whois.nic.golf",
  graphics: "whois.nic.graphics",
  gratis: "whois.nic.gratis",
  green: "whois.nic.green",
  gripe: "whois.nic.gripe",
  group: "whois.nic.group",
  guide: "whois.nic.guide",
  guitars: "whois.nic.guitars",
  guru: "whois.nic.guru",
  haus: "whois.nic.haus",
  healthcare: "whois.nic.healthcare",
  help: "whois.nic.help",
  hiphop: "whois.nic.hiphop",
  hockey: "whois.nic.hockey",
  holdings: "whois.nic.holdings",
  holiday: "whois.nic.holiday",
  homes: "whois.nic.homes",
  horse: "whois.nic.horse",
  hospital: "whois.nic.hospital",
  host: "whois.nic.host",
  hosting: "whois.nic.hosting",
  house: "whois.nic.house",
  how: "whois.nic.how",
  ink: "whois.nic.ink",
  institute: "whois.nic.institute",
  insurance: "whois.nic.insurance",
  international: "whois.nic.international",
  investments: "whois.nic.investments",
  jetzt: "whois.nic.jetzt",
  jewelry: "whois.nic.jewelry",
  jobs: "whois.nic.jobs",
  juegos: "whois.nic.juegos",
  kaufen: "whois.nic.kaufen",
  kim: "whois.nic.kim",
  kitchen: "whois.nic.kitchen",
  land: "whois.nic.land",
  lawyer: "whois.nic.lawyer",
  lease: "whois.nic.lease",
  legal: "whois.nic.legal",
  lgbt: "whois.nic.lgbt",
  life: "whois.nic.life",
  lighting: "whois.nic.lighting",
  limited: "whois.nic.limited",
  limo: "whois.nic.limo",
  link: "whois.nic.link",
  loan: "whois.nic.loan",
  loans: "whois.nic.loans",
  lol: "whois.nic.lol",
  love: "whois.nic.love",
  ltd: "whois.nic.ltd",
  luxe: "whois.nic.luxe",
  luxury: "whois.nic.luxury",
  maison: "whois.nic.maison",
  management: "whois.nic.management",
  market: "whois.nic.market",
  marketing: "whois.nic.marketing",
  mba: "whois.nic.mba",
  media: "whois.nic.media",
  memorial: "whois.nic.memorial",
  men: "whois.nic.men",
  menu: "whois.nic.menu",
  mobi: "whois.nic.mobi",
  moda: "whois.nic.moda",
  mom: "whois.nic.mom",
  mortgage: "whois.nic.mortgage",
  motorcycles: "whois.nic.motorcycles",
  movie: "whois.nic.movie",
  navy: "whois.nic.navy",
  network: "whois.nic.network",
  ninja: "whois.nic.ninja",
  one: "whois.nic.one",
  onl: "whois.nic.onl",
  ooo: "whois.nic.ooo",
  partners: "whois.nic.partners",
  parts: "whois.nic.parts",
  party: "whois.nic.party",
  pet: "whois.nic.pet",
  photo: "whois.nic.photo",
  photography: "whois.nic.photography",
  photos: "whois.nic.photos",
  pics: "whois.nic.pics",
  pictures: "whois.nic.pictures",
  pink: "whois.nic.pink",
  pizza: "whois.nic.pizza",
  place: "whois.nic.place",
  plumbing: "whois.nic.plumbing",
  plus: "whois.nic.plus",
  poker: "whois.nic.poker",
  porn: "whois.nic.porn",
  press: "whois.nic.press",
  productions: "whois.nic.productions",
  promo: "whois.nic.promo",
  properties: "whois.nic.properties",
  property: "whois.nic.property",
  pub: "whois.nic.pub",
  racing: "whois.nic.racing",
  recipes: "whois.nic.recipes",
  red: "whois.nic.red",
  rehab: "whois.nic.rehab",
  reisen: "whois.nic.reisen",
  rentals: "whois.nic.rentals",
  repair: "whois.nic.repair",
  report: "whois.nic.report",
  republican: "whois.nic.republican",
  rest: "whois.nic.rest",
  restaurant: "whois.nic.restaurant",
  review: "whois.nic.review",
  reviews: "whois.nic.reviews",
  rip: "whois.nic.rip",
  rocks: "whois.nic.rocks",
  run: "whois.nic.run",
  sale: "whois.nic.sale",
  salon: "whois.nic.salon",
  sarl: "whois.nic.sarl",
  school: "whois.nic.school",
  science: "whois.nic.science",
  security: "whois.nic.security",
  services: "whois.nic.services",
  sex: "whois.nic.sex",
  sexy: "whois.nic.sexy",
  shoes: "whois.nic.shoes",
  show: "whois.nic.show",
  singles: "whois.nic.singles",
  ski: "whois.nic.ski",
  soccer: "whois.nic.soccer",
  social: "whois.nic.social",
  software: "whois.nic.software",
  solar: "whois.nic.solar",
  solutions: "whois.nic.solutions",
  space: "whois.nic.space",
  storage: "whois.nic.storage",
  studio: "whois.nic.studio",
  style: "whois.nic.style",
  sucks: "whois.nic.sucks",
  supplies: "whois.nic.supplies",
  supply: "whois.nic.supply",
  support: "whois.nic.support",
  surgery: "whois.nic.surgery",
  systems: "whois.nic.systems",
  tattoo: "whois.nic.tattoo",
  tax: "whois.nic.tax",
  taxi: "whois.nic.taxi",
  team: "whois.nic.team",
  tennis: "whois.nic.tennis",
  theater: "whois.nic.theater",
  theatre: "whois.nic.theatre",
  tickets: "whois.nic.tickets",
  tienda: "whois.nic.tienda",
  tips: "whois.nic.tips",
  tires: "whois.nic.tires",
  today: "whois.nic.today",
  tools: "whois.nic.tools",
  tours: "whois.nic.tours",
  town: "whois.nic.town",
  toys: "whois.nic.toys",
  trade: "whois.nic.trade",
  trading: "whois.nic.trading",
  training: "whois.nic.training",
  tube: "whois.nic.tube",
  university: "whois.nic.university",
  uno: "whois.nic.uno",
  vacations: "whois.nic.vacations",
  vegas: "whois.nic.vegas",
  ventures: "whois.nic.ventures",
  vet: "whois.nic.vet",
  viajes: "whois.nic.viajes",
  video: "whois.nic.video",
  villas: "whois.nic.villas",
  vision: "whois.nic.vision",
  voyage: "whois.nic.voyage",
  watch: "whois.nic.watch",
  webcam: "whois.nic.webcam",
  website: "whois.nic.website",
  wedding: "whois.nic.wedding",
  whoswho: "whois.nic.whoswho",
  win: "whois.nic.win",
  wine: "whois.nic.wine",
  work: "whois.nic.work",
  works: "whois.nic.works",
  world: "whois.nic.world",
  wtf: "whois.nic.wtf",
  zone: "whois.nic.zone",

  // Fallback server
  default: "whois.iana.org",
};

/**
 * Cache for WHOIS queries to respect rate limits
 */
const whoisCache = new Map<string, { data: WhoisData; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour cache

/**
 * Gets the appropriate WHOIS server for a domain
 * @param domain The domain to get the WHOIS server for
 * @returns The WHOIS server hostname
 */
function getWhoisServer(domain: string): string {
  const rootDomain = getRootDomain(domain);
  const tld = rootDomain.split(".").pop()?.toLowerCase();

  if (tld && WHOIS_SERVERS[tld]) {
    return WHOIS_SERVERS[tld];
  }

  return WHOIS_SERVERS.default;
}

/**
 * Parses a raw WHOIS response into structured data
 * @param rawData The raw WHOIS response
 * @returns Parsed WHOIS data
 */
function parseWhoisData(rawData: string): WhoisData {
  const result: WhoisData = {
    rawText: rawData,
  };

  // Try multiple patterns for registrar info
  const registrarPatterns = [
    /Registrar:\s*(.+?)(?:\n|$)/i,
    /Registrar Name:\s*(.+?)(?:\n|$)/i,
    /Sponsoring Registrar:\s*(.+?)(?:\n|$)/i,
    /Registration Service Provider:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of registrarPatterns) {
    const match = rawData.match(pattern);
    if (match && match[1].trim()) {
      result.registrar = match[1].trim();
      break;
    }
  }

  // If we still don't have a registrar, look for specific patterns in the response
  if (!result.registrar && rawData.includes("MarkMonitor")) {
    result.registrar = "MarkMonitor Inc.";
  } else if (!result.registrar) {
    // Try to extract from any line that has "Registrar:" followed by text on the same line
    const lines = rawData.split("\n");
    for (const line of lines) {
      if (
        line.includes("Registrar:") &&
        !line.includes("WHOIS Server") &&
        !line.includes("URL") &&
        !line.includes("IANA ID")
      ) {
        const parts = line.split("Registrar:");
        if (parts.length > 1 && parts[1].trim()) {
          result.registrar = parts[1].trim();
          break;
        }
      }
    }
  }

  // Try multiple patterns for URL
  const urlPatterns = [
    /Registrar URL:\s*(.+?)(?:\n|$)/i,
    /URL:\s*(.+?)(?:\n|$)/i,
    /Registrar Website:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of urlPatterns) {
    const match = rawData.match(pattern);
    if (match && match[1].trim()) {
      result.registrarUrl = match[1].trim();
      break;
    }
  }

  // Parse IANA ID
  const ianaMatch = rawData.match(/Registrar IANA ID:\s*(.+?)(?:\n|$)/i);
  if (ianaMatch && ianaMatch[1].trim()) {
    result.registrarIanaId = ianaMatch[1].trim();
  }

  // Parse dates with multiple possible formats
  const creationPatterns = [
    /Creation Date:\s*(.+?)(?:\n|$)/i,
    /Created on:\s*(.+?)(?:\n|$)/i,
    /Domain Registration Date:\s*(.+?)(?:\n|$)/i,
    /Domain Create Date:\s*(.+?)(?:\n|$)/i,
    /Created Date:\s*(.+?)(?:\n|$)/i,
    /Registered on:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of creationPatterns) {
    const match = rawData.match(pattern);
    if (match && match[1].trim()) {
      try {
        const date = new Date(match[1].trim());
        if (!isNaN(date.getTime())) {
          result.creationDate = date;
          break;
        }
      } catch {
        // Continue to next pattern if date parsing fails
      }
    }
  }

  const updatedPatterns = [
    /Updated Date:\s*(.+?)(?:\n|$)/i,
    /Last Modified:\s*(.+?)(?:\n|$)/i,
    /Last updated on:\s*(.+?)(?:\n|$)/i,
    /Domain Last Updated Date:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of updatedPatterns) {
    const match = rawData.match(pattern);
    if (match && match[1].trim()) {
      try {
        const date = new Date(match[1].trim());
        if (!isNaN(date.getTime())) {
          result.updatedDate = date;
          break;
        }
      } catch {
        // Continue to next pattern if date parsing fails
      }
    }
  }

  const expirationPatterns = [
    /(?:Registry Expiry Date|Expiration Date):\s*(.+?)(?:\n|$)/i,
    /Registrar Registration Expiration Date:\s*(.+?)(?:\n|$)/i,
    /Domain Expiration Date:\s*(.+?)(?:\n|$)/i,
    /Expiry date:\s*(.+?)(?:\n|$)/i,
    /Expiry Date:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of expirationPatterns) {
    const match = rawData.match(pattern);
    if (match && match[1].trim()) {
      try {
        const date = new Date(match[1].trim());
        if (!isNaN(date.getTime())) {
          result.expirationDate = date;
          break;
        }
      } catch {
        // Continue to next pattern if date parsing fails
      }
    }
  }

  // Parse registrant info
  result.registrant = {};

  const registrantOrgPatterns = [
    /Registrant Organization:\s*(.+?)(?:\n|$)/i,
    /Registrant:\s*(.+?)(?:\n|$)/i,
    /Organization:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of registrantOrgPatterns) {
    const match = rawData.match(pattern);
    if (
      match &&
      match[1].trim() &&
      !match[1].includes("REDACTED FOR PRIVACY")
    ) {
      result.registrant.organization = match[1].trim();
      break;
    }
  }

  const registrantCountryPatterns = [
    /Registrant Country:\s*(.+?)(?:\n|$)/i,
    /Country:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of registrantCountryPatterns) {
    const match = rawData.match(pattern);
    if (match && match[1].trim()) {
      result.registrant.country = match[1].trim();
      break;
    }
  }

  // Don't extract email if GDPR protected
  if (!rawData.includes("GDPR") && !rawData.includes("REDACTED FOR PRIVACY")) {
    const emailPatterns = [
      /Registrant Email:\s*(.+?)(?:\n|$)/i,
      /Email:\s*(.+?)(?:\n|$)/i,
    ];

    for (const pattern of emailPatterns) {
      const match = rawData.match(pattern);
      if (match && match[1].trim() && match[1].includes("@")) {
        result.registrant.email = match[1].trim();
        break;
      }
    }
  }

  // Status codes
  const statusCodes: string[] = [];
  const statusRegex = /Domain Status:\s*(.+?)(?:\n|$)/gi;
  let statusMatch: RegExpExecArray | null;

  while ((statusMatch = statusRegex.exec(rawData)) !== null) {
    const status = statusMatch[1].trim();
    if (status && !statusCodes.includes(status)) {
      statusCodes.push(status);
    }
  }

  if (statusCodes.length === 0) {
    // Try alternative status patterns
    const altStatusRegex = /Status:\s*(.+?)(?:\n|$)/gi;
    while ((statusMatch = altStatusRegex.exec(rawData)) !== null) {
      const status = statusMatch[1].trim();
      if (status && !statusCodes.includes(status)) {
        statusCodes.push(status);
      }
    }
  }

  if (statusCodes.length > 0) {
    result.statusCodes = statusCodes;
  }

  // Name servers
  const nameServers: string[] = [];
  const nsPatterns = [
    /Name Server:\s*(.+?)(?:\n|$)/gi,
    /Nameserver:\s*(.+?)(?:\n|$)/gi,
    /nserver:\s*(.+?)(?:\n|$)/gi,
  ];

  for (const pattern of nsPatterns) {
    let nsMatch: RegExpExecArray | null;
    while ((nsMatch = pattern.exec(rawData)) !== null) {
      const server = nsMatch[1].trim().toLowerCase();
      if (server && !nameServers.includes(server)) {
        nameServers.push(server);
      }
    }
  }

  if (nameServers.length > 0) {
    result.nameServers = nameServers;
  }

  // Special handling for reserved domains like example.com
  if (rawData.includes("IANA") && rawData.includes("RESERVED")) {
    result.registrar = "IANA (Reserved Domain)";
    if (!result.statusCodes) {
      result.statusCodes = ["RESERVED-IANA"];
    }
  }

  return result;
}

/**
 * Queries a WHOIS server for domain information
 * @param domain The domain to query
 * @param server The WHOIS server to query
 * @returns Promise resolving to the WHOIS response
 */
function queryWhoisServer(domain: string, server: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = "";

    // Set timeout for 10 seconds
    socket.setTimeout(10000);

    socket.connect(43, server, () => {
      socket.write(domain + "\r\n");
    });

    socket.on("data", (chunk) => {
      data += chunk.toString();
    });

    socket.on("close", () => {
      resolve(data);
    });

    socket.on("error", (error) => {
      reject(new Error(`WHOIS query failed: ${error.message}`));
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("WHOIS query timed out"));
    });
  });
}

/**
 * Gets WHOIS data for a domain
 * @param domain The domain to get WHOIS data for
 * @param useCache Whether to use cached data if available
 * @param maxReferrals Maximum number of referrals to follow (to prevent infinite loops)
 * @returns Promise resolving to WHOIS data
 */
export async function getWhoisData(
  domain: string,
  useCache = true,
  maxReferrals = 3
): Promise<WhoisData> {
  const formattedDomain = formatDomain(domain);

  // Check cache
  if (useCache) {
    const cached = whoisCache.get(formattedDomain);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    // Start with the initial WHOIS server
    const initialServer = getWhoisServer(formattedDomain);
    let response = await queryWhoisServer(formattedDomain, initialServer);
    let currentServer = initialServer;
    let referralCount = 0;
    let finalResponse = response;

    // Check for WHOIS server redirection and follow if found
    while (referralCount < maxReferrals) {
      // Look for patterns that indicate a referral to another WHOIS server
      const referralPatterns = [
        /Registrar WHOIS Server:\s*(.+?)(?:\n|$)/i,
        /WHOIS Server:\s*(.+?)(?:\n|$)/i,
        /Referral URL:\s*(?:https?:\/\/)?(?:www\.)?(.+?)(?:\/|\n|$)/i,
        /refer:\s*(.+?)(?:\n|$)/i,
      ];

      let foundReferral = false;
      let nextServer = "";

      for (const pattern of referralPatterns) {
        const match = response.match(pattern);
        if (
          match &&
          match[1] &&
          match[1].trim() &&
          match[1].includes(".") &&
          match[1] !== currentServer
        ) {
          nextServer = match[1].trim();
          // Clean up the server name (remove http://, www., etc.)
          nextServer = nextServer
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "");

          // Don't follow if we're already at this server
          if (nextServer && nextServer !== currentServer) {
            foundReferral = true;
            break;
          }
        }
      }

      if (foundReferral && nextServer) {
        // Follow the referral
        try {
          console.log(`Following WHOIS referral to ${nextServer}`);
          const nextResponse = await queryWhoisServer(
            formattedDomain,
            nextServer
          );

          // If we get a meaningful response (not just a referral back)
          if (nextResponse && nextResponse.length > 100) {
            response = nextResponse;
            finalResponse += "\n\n# " + nextServer + "\n\n" + nextResponse;
            currentServer = nextServer;
          }
        } catch (error) {
          // If the referral fails, just use what we have
          console.warn(
            `Failed to follow WHOIS referral: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          break;
        }
      } else {
        // No more referrals
        break;
      }

      referralCount++;
    }

    // Parse the combined response data
    const parsedData = parseWhoisData(finalResponse);

    // Cache the result
    whoisCache.set(formattedDomain, {
      data: parsedData,
      timestamp: Date.now(),
    });

    return parsedData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Could not fetch WHOIS data for domain ${formattedDomain}. Details: ${error.message}`
      );
    } else {
      throw new Error(
        `Could not fetch WHOIS data for domain ${formattedDomain}.`
      );
    }
  }
}
