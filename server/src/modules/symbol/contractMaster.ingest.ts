/**
 * Fetch Alice Blue contract master CSVs and upsert into Symbol table.
 * Run via: npm run symbols:ingest
 * Ensure Symbol table exists first: npm run prisma:migrate (or npx prisma migrate deploy)
 */
import "dotenv/config";
import { Exchange, InstrumentType } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { CONTRACT_MASTER_URLS } from "../../config/contractMaster";

const INSTRUMENT_MAP: Record<string, InstrumentType> = {
  EQ: "EQ",
  FUT: "FUT",
  OPT: "OPT",
  CE: "CE",
  PE: "PE",
  FUTIDX: "FUT",
  FUTSTK: "FUT",
  OPTIDX: "OPT",
  OPTSTK: "OPT",
  FUTCOM: "FUT",
  OPTFUT: "OPT",
  OPTCOM: "OPT",
  OPTCUR: "OPT",
  FUTCUR: "FUT",
  IDX: "EQ",
  STK: "EQ",
};

/** Per-exchange filters: only insert symbols that match these rules (same as frontend filters). */
function shouldIncludeRow(
  exchange: Exchange,
  row: {
    instrumentType: string;
    name: string;
    symbol: string;
    exchSeg: string;
  },
): boolean {
  const inst = (row.instrumentType || "").trim().toUpperCase();
  const name = (row.name || "").trim();
  const symbol = (row.symbol || "").trim();
  const seg = (row.exchSeg || "").trim().toUpperCase();
  if (name === "") return false;

  switch (exchange) {
    case "NSE":
      return symbol.slice(-3) === "-EQ" || inst === "0" || inst === "EQ";
    case "NFO":
      return (
        seg === "NFO" &&
        (inst === "OPTIDX" ||
          inst === "OPTSTK" ||
          inst === "FUTSTK" ||
          inst === "FUTIDX")
      );
    case "BFO":
      return (
        seg === "BFO" &&
        (inst === "OPTIDX" ||
          inst === "OPTSTK" ||
          inst === "FUTSTK" ||
          inst === "FUTIDX")
      );
    case "MCX":
      return inst === "FUTCOM" || inst === "OPTFUT" || inst === "OPTCOM";
    case "CDS":
      return inst === "OPTCUR" || inst === "FUTCUR";
    case "BSE":
      return inst === "" && (seg === "BSE" || seg === ""); // BSE cash: empty instrumenttype; seg may be empty when column missing
    default:
      return true;
  }
}

function parseCSV(text: string): string[][] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') inQuotes = !inQuotes;
    else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = "";
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else current += c;
  }
  if (current.trim()) lines.push(current);
  return lines.map((line) => {
    const row: string[] = [];
    let cell = "";
    inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if ((c === "," || c === "\t") && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else cell += c;
    }
    row.push(cell.trim());
    return row;
  });
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, "").toLowerCase();
}

function parseOptionalInt(s: string): number | null {
  if (s == null || s === "") return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function parseOptionalFloat(s: string): number | null {
  if (s == null || s === "") return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseOptionalDate(s: string): Date | null {
  if (s == null || s === "") return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

async function fetchAndIngest(
  url: string,
  exchange: Exchange,
): Promise<{ count: number; errors: number }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TradeLearnPro/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const text = await res.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return { count: 0, errors: 0 };

  const header = rows[0].map(normalizeHeader);
  const col = (name: string) => {
    const i = header.indexOf(name);
    return i >= 0 ? i : header.indexOf(name.replace(/_/g, ""));
  };
  const idx = {
    instrument:
      col("instrument") >= 0
        ? col("instrument")
        : col("instrumenttype") >= 0
          ? col("instrumenttype")
          : col("segment") >= 0
            ? col("segment")
            : 0,
    symbol:
      col("symbol") >= 0
        ? col("symbol")
        : col("tradingsymbol") >= 0
          ? col("tradingsymbol")
          : 1,
    token: col("token") >= 0 ? col("token") : 2,
    tradingSymbol:
      col("tradingsymbol") >= 0
        ? col("tradingsymbol")
        : col("symbol") >= 0
          ? col("symbol")
          : 1,
    name:
      col("name") >= 0 ? col("name") : col("symbol") >= 0 ? col("symbol") : -1,
    exchSeg:
      col("exch_seg") >= 0
        ? col("exch_seg")
        : col("exchange") >= 0
          ? col("exchange")
          : col("exchseg") >= 0
            ? col("exchseg")
            : -1,
    lotSize:
      col("lotsize") >= 0
        ? col("lotsize")
        : col("lot_size") >= 0
          ? col("lot_size")
          : -1,
    tickSize: col("ticksize") >= 0 ? col("ticksize") : -1,
    expiry:
      col("expiry") >= 0
        ? col("expiry")
        : col("expirydate") >= 0
          ? col("expirydate")
          : -1,
    strike:
      col("strike") >= 0
        ? col("strike")
        : col("strikeprice") >= 0
          ? col("strikeprice")
          : -1,
    optionType:
      col("optiontype") >= 0
        ? col("optiontype")
        : col("option_type") >= 0
          ? col("option_type")
          : -1,
    groupname: col("groupname") >= 0 ? col("groupname") : -1,
  };

  let count = 0;
  let errors = 0;
  const BATCH = 500;
  let batch: Array<{
    exchange: Exchange;
    symbol: string;
    tradingSymbol: string;
    token: string;
    lotSize: number | null;
    strike: number | null;
    expiry: Date | null;
    optionType: string | null;
    instrument: InstrumentType;
  }> = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < 3) continue;
    const get = (i: number) => (i >= 0 && i < row.length ? row[i] : "");
    const token = get(idx.token);
    const symbol = get(idx.symbol) || get(idx.tradingSymbol);
    const tradingSymbol = get(idx.tradingSymbol) || symbol;
    if (!token || !symbol) {
      errors++;
      continue;
    }
    const instRaw =
      exchange === "NSE"
        ? get(idx.groupname) || get(idx.instrument)
        : get(idx.instrument);
    const name = idx.name >= 0 ? get(idx.name) : symbol;
    const exchSeg = idx.exchSeg >= 0 ? get(idx.exchSeg) : exchange;

    if (
      !shouldIncludeRow(exchange, {
        instrumentType: instRaw,
        name,
        symbol,
        exchSeg,
      })
    )
      continue;

    const instrument: InstrumentType =
      instRaw && INSTRUMENT_MAP[instRaw.toUpperCase()]
        ? INSTRUMENT_MAP[instRaw.toUpperCase()]
        : "others";
    const optionTypeRaw = get(idx.optionType);
    const optionType =
      optionTypeRaw &&
      (optionTypeRaw.toUpperCase() === "CE" ||
        optionTypeRaw.toUpperCase() === "PE")
        ? optionTypeRaw.toUpperCase()
        : null;

    batch.push({
      exchange,
      symbol: symbol.substring(0, 100),
      tradingSymbol: tradingSymbol.substring(0, 100),
      token,
      lotSize: parseOptionalInt(get(idx.lotSize)),
      strike: parseOptionalFloat(get(idx.strike)),
      expiry: parseOptionalDate(get(idx.expiry)),
      optionType,
      instrument,
    });
    if (batch.length >= BATCH) {
      await upsertBatch(batch);
      count += batch.length;
      batch = [];
    }
  }
  if (batch.length > 0) {
    await upsertBatch(batch);
    count += batch.length;
  }
  return { count, errors };
}

async function upsertBatch(
  batch: Array<{
    exchange: Exchange;
    symbol: string;
    tradingSymbol: string;
    token: string;
    lotSize: number | null;
    strike: number | null;
    expiry: Date | null;
    optionType: string | null;
    instrument: InstrumentType;
  }>,
) {
  await prisma.$transaction(
    batch.map((b) =>
      prisma.symbol.upsert({
        where: {
          exchange_token: { exchange: b.exchange, token: b.token },
        },
        create: b,
        update: {
          symbol: b.symbol,
          tradingSymbol: b.tradingSymbol,
          lotSize: b.lotSize,
          strike: b.strike,
          expiry: b.expiry,
          optionType: b.optionType,
          instrument: b.instrument,
        },
      }),
    ),
  );
}

export async function runIngestion(): Promise<{
  results: { key: string; exchange: string; count: number; errors: number }[];
}> {
  // Ensure Symbol table exists (migration must be applied)
  try {
    await prisma.symbol.count();
  } catch (e: any) {
    if (e?.code === "P2021" || e?.message?.includes("does not exist")) {
      throw new Error(
        "Symbol table not found. Run migration first: npm run prisma:migrate (or npx prisma migrate deploy)",
      );
    }
    throw e;
  }

  const results: {
    key: string;
    exchange: string;
    count: number;
    errors: number;
  }[] = [];
  for (const { url, key, exchange } of CONTRACT_MASTER_URLS) {
    try {
      const { count, errors } = await fetchAndIngest(url, exchange);
      results.push({ key, exchange, count, errors });
    } catch (e) {
      results.push({ key, exchange, count: 0, errors: 0 });
      console.error(`${key} (${exchange}):`, e);
    }
  }
  return { results };
}

async function main() {
  const { results } = await runIngestion();
  results.forEach((r) => {
   });

  await prisma.$disconnect();
}

if (require.main === module) main();
