import Papa from 'papaparse';

let cachedData = null;

export const BRANCH_OPTIONS = [
  { label: 'All Branches (Any Discipline)', value: '' },
  { label: 'Computer Science, AI & IT', value: 'cs_it' },
  { label: 'Electronics & Communication (ECE / EEE)', value: 'ece' },
  { label: 'Electrical Engineering', value: 'ee' },
  { label: 'Mechanical, Production & Mechatronics', value: 'mech' },
  { label: 'Civil & Environmental Engineering', value: 'civil' },
  { label: 'Chemical & Petroleum Engineering', value: 'chem' },
  { label: 'Biotechnology & Bioengineering', value: 'bio' },
  { label: 'Aerospace & Aeronautical Engineering', value: 'aero' },
  { label: 'Metallurgy, Materials & Mining', value: 'meta' },
  { label: 'Mathematics & Computing / Basic Sciences', value: 'math_sci' },
  { label: 'Architecture & Planning', value: 'arch' },
];

const BRANCH_KEYWORDS = {
  cs_it: ['computer', 'information technology', 'data science', 'artificial intelligence', 'ai', 'software', 'computing'],
  ece: ['electronics', 'communication', 'telecommunication', 'vlsi', 'signal'],
  ee: ['electrical'],
  mech: ['mechanical', 'mechatronics', 'production', 'manufacturing', 'industrial', 'automobile'],
  civil: ['civil', 'construction', 'environmental'],
  chem: ['chemical', 'petroleum', 'polymer', 'ceramic'],
  bio: ['bio', 'biotechnology', 'biomedical', 'biochemical'],
  aero: ['aerospace', 'aeronautical', 'avionics'],
  meta: ['metallurg', 'materials', 'mining', 'mineral'],
  math_sci: ['mathematics', 'physics', 'chemistry', 'engineering physics'],
  arch: ['architecture', 'planning']
};

function findColumnKeys(fields) {
  const getField = (possibleNames) => {
    for (const name of possibleNames) {
      const target = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = fields.find(
        (f) => f.toLowerCase().replace(/[^a-z0-9]/g, '') === target
      );
      if (found) return found;
    }
    return null;
  };

  return {
    yearKey: getField(['Year', 'year']),
    roundKey: getField(['Round', 'round', 'Round No']),
    instKey: getField(['Institute', 'Institute Name', 'College', 'Institute_Name']),
    branchKey: getField(['Academic Program Name', 'Branch', 'Program', 'Course']),
    quotaKey: getField(['Quota', 'Quota_Type']),
    catKey: getField(['Seat Type', 'Seat_Type', 'Category', 'SeatType']),
    genKey: getField(['Gender', 'Gender_Type']),
    closeKey: getField(['Closing Rank', 'ClosingRank', 'Close Rank', 'Closing_Rank']),
  };
}

export async function loadCutoffsData() {
  if (cachedData) return cachedData;

  const response = await fetch('/josaa_cutoffs.csv');
  if (!response.ok) {
    throw new Error('josaa_cutoffs.csv missing in public directory');
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) return resolve([]);

        const fields = results.meta.fields || Object.keys(results.data[0]);
        const keys = findColumnKeys(fields);

        let maxYearNum = 0;
        for (let i = 0; i < results.data.length; i++) {
          const y = parseInt(results.data[i][keys.yearKey], 10);
          if (y && y > maxYearNum) maxYearNum = y;
        }
        const maxYearStr = maxYearNum ? String(maxYearNum) : '2025';

        const uniqueMap = new Map();

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          const year = keys.yearKey ? String(row[keys.yearKey] || '') : '2025';

          if (year !== maxYearStr && maxYearNum > 0) continue;

          const rawClosing = keys.closeKey ? row[keys.closeKey] : '';
          const cleanedRank = String(rawClosing || '').replace(/,/g, '').trim();
          const closingRank = parseInt(cleanedRank, 10) || 0;
          if (!closingRank) continue;

          const institute = keys.instKey ? String(row[keys.instKey] || '').trim() : '';
          const branch = keys.branchKey ? String(row[keys.branchKey] || '').trim() : '';
          const quota = keys.quotaKey ? String(row[keys.quotaKey] || '').trim() : '';
          const category = keys.catKey ? String(row[keys.catKey] || '').trim() : '';
          const gender = keys.genKey ? String(row[keys.genKey] || '').trim() : '';
          const roundNum = parseInt(keys.roundKey ? row[keys.roundKey] : '1', 10) || 1;

          const uniqueKey = `${institute}|${branch}|${quota}|${category}|${gender}`;

          if (!uniqueMap.has(uniqueKey) || roundNum > uniqueMap.get(uniqueKey).roundNum) {
            uniqueMap.set(uniqueKey, {
              year,
              roundNum,
              institute,
              branch,
              quota,
              category,
              gender,
              closingRank,
            });
          }
        }

        cachedData = Array.from(uniqueMap.values());
        resolve(cachedData);
      },
      error: (err) => reject(err),
    });
  });
}

export function getPredictions(cutoffsData, { rank, category, gender, quota, preferredBranch }) {
  const userRank = parseInt(rank, 10);
  if (isNaN(userRank)) return [];

  const filtered = cutoffsData.filter((entry) => {
    const entryCat = entry.category.toUpperCase();
    const userCat = category.trim().toUpperCase();
    let matchCategory = entryCat === userCat;
    if (userCat === 'OPEN' && (entryCat === 'GEN' || entryCat === 'GENERAL' || entryCat === 'OPEN')) {
      matchCategory = true;
    }

    let matchQuota = true;
    const entryQuota = entry.quota.toUpperCase();
    if (quota.includes('AI')) {
      matchQuota = entryQuota === 'AI' || entryQuota === 'OS' || entryQuota === 'ALL INDIA';
    } else if (quota.includes('HS')) {
      matchQuota = entryQuota.includes('HS');
    } else if (quota.includes('OS')) {
      matchQuota = entryQuota.includes('OS');
    }

    const entryGender = entry.gender.toLowerCase();
    const matchGender =
      gender === 'Female-only'
        ? true
        : !entryGender.includes('female-only');

    let matchBranch = true;
    if (preferredBranch && BRANCH_KEYWORDS[preferredBranch]) {
      const branchLower = entry.branch.toLowerCase();
      const keywords = BRANCH_KEYWORDS[preferredBranch];
      matchBranch = keywords.some((kw) => branchLower.includes(kw));
    } else if (preferredBranch) {
      matchBranch = entry.branch.toLowerCase().includes(preferredBranch.trim().toLowerCase());
    }

    return matchCategory && matchQuota && matchGender && matchBranch;
  });

  return filtered
    .map((entry) => {
      const closing = entry.closingRank;

      let tag = 'safe';
      let prob = '95%';

      if (userRank <= closing) {
        tag = 'safe';
        prob = '95%';
      } else if (userRank <= closing * 1.15) {
        tag = 'target';
        prob = '68%';
      } else if (userRank <= closing * 1.35) {
        tag = 'reach';
        prob = '40%';
      } else {
        return null;
      }

      return {
        institute: entry.institute,
        branch: entry.branch,
        expRank: closing,
        tag,
        prob,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(userRank - a.expRank) - Math.abs(userRank - b.expRank))
    .slice(0, 100);
}