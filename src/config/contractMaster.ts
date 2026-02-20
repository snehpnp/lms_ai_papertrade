/**
 * Alice Blue contract master CSV URLs (NSE, NFO, BFO, CDS, MCX, BSE).
 * Used by the symbol ingestion script to fetch and store symbols.
 */
import { Exchange } from '@prisma/client';

export const CONTRACT_MASTER_URLS: { url: string; key: string; exchange: Exchange }[] = [
  { url: 'https://v2api.aliceblueonline.com/restpy/static/contract_master/NFO.csv', key: 'ALICE_NFO', exchange: 'NFO' },
  { url: 'https://v2api.aliceblueonline.com/restpy/static/contract_master/NSE.csv', key: 'ALICE_NSE', exchange: 'NSE' },
  { url: 'https://v2api.aliceblueonline.com/restpy/static/contract_master/MCX.csv', key: 'ALICE_MCX', exchange: 'MCX' },
  { url: 'https://v2api.aliceblueonline.com/restpy/static/contract_master/CDS.csv', key: 'ALICE_CDS', exchange: 'CDS' },
  { url: 'https://v2api.aliceblueonline.com/restpy/static/contract_master/BFO.csv', key: 'ALICE_BFO', exchange: 'BFO' },
  { url: 'https://v2api.aliceblueonline.com/restpy/static/contract_master/BSE.csv', key: 'ALICE_BSE', exchange: 'BSE' },
];
