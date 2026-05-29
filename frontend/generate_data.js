const fs = require('fs');
const cg = require('cambodia-gazetteer').cambodia_gazetterr;

const mapNames = {
  'Phnom Penh Capital': 'Phnom Penh',
  'Mondul Kiri': 'Mondulkiri',
  'Ratanak Kiri': 'Ratanakiri',
  'Siemreap': 'Siem Reap',
  'Tboung Khmum': 'Tbong Khmum'
};

const districts = {};
const communes = {};
const villages = {};

for (const prov of cg) {
  let pName = prov.latin.replace(' Province', '').replace(' Municipality', '');
  if (mapNames[pName]) pName = mapNames[pName];
  
  districts[pName] = (prov.districts||[]).map(d => ({ code: d.code, name: d.latin, khmer: d.khmer }));
  
  for (const dist of (prov.districts||[])) {
    const dName = dist.latin;
    communes[dName] = (dist.communes||[]).map(c => ({ code: c.code, name: c.latin, khmer: c.khmer }));
    
    for (const comm of (dist.communes||[])) {
      const cName = comm.latin;
      villages[`${dName}_${cName}`] = (comm.villages||[]).map(v => ({ code: v.code, name: v.latin, khmer: v.khmer }));
    }
  }
}

const content = `
export const CAMBODIA_DISTRICTS: Record<string, { code: string; name: string; khmer: string }[]> = ${JSON.stringify(districts, null, 2)};
export const CAMBODIA_COMMUNES: Record<string, { code: string; name: string; khmer: string }[]> = ${JSON.stringify(communes, null, 2)};
export const CAMBODIA_VILLAGES: Record<string, { code: string; name: string; khmer: string }[]> = ${JSON.stringify(villages, null, 2)};
`;

fs.writeFileSync('d:/Test/frontend/app/cambodia-data.ts', content);
