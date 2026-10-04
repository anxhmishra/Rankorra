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
  cs_it: [
    'computer',
    'information technology',
    'data science',
    'artificial intelligence',
    'ai',
    'software',
    'computing',
  ],
  ece: [
    'electronics',
    'communication',
    'telecommunication',
    'vlsi',
    'signal',
  ],
  ee: [
    'electrical',
  ],
  mech: [
    'mechanical',
    'mechatronics',
    'production',
    'manufacturing',
    'industrial',
    'automobile',
  ],
  civil: [
    'civil',
    'construction',
    'environmental',
  ],
  chem: [
    'chemical',
    'petroleum',
    'polymer',
    'ceramic',
  ],
  bio: [
    'bio',
    'biotechnology',
    'biomedical',
    'biochemical',
  ],
  aero: [
    'aerospace',
    'aeronautical',
    'avionics',
  ],
  meta: [
    'metallurg',
    'materials',
    'mining',
    'mineral',
  ],
  math_sci: [
    'mathematics',
    'physics',
    'chemistry',
    'engineering physics',
  ],
  arch: [
    'architecture',
    'planning',
  ],
};

function findColumnKeys(fields) {
  const getField = (possibleNames) => {
    for (const name of possibleNames) {
      const target = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const found = fields.find(
        (f) =>
          f.toLowerCase().replace(/[^a-z0-9]/g, '') === target
      );

      if (found) return found;
    }

    return null;
  };

  return {
    yearKey: getField(['Year', 'year']),
    roundKey: getField(['Round', 'round', 'Round No']),
    instKey: getField([
      'Institute',
      'Institute Name',
      'College',
      'Institute_Name',
    ]),
    branchKey: getField([
      'Academic Program Name',
      'Branch',
      'Program',
      'Course',
    ]),
    quotaKey: getField([
      'Quota',
      'Quota_Type',
    ]),
    catKey: getField([
      'Seat Type',
      'Seat_Type',
      'Category',
      'SeatType',
    ]),
    genKey: getField([
      'Gender',
      'Gender_Type',
    ]),
    closeKey: getField([
      'Closing Rank',
      'ClosingRank',
      'Close Rank',
      'Closing_Rank',
    ]),
  };
}

export async function loadCutoffsData() {
  if (cachedData) return cachedData;

  const response = await fetch('/josaa_cutoffs.csv');

  if (!response.ok) {
    throw new Error(
      'josaa_cutoffs.csv missing in public directory'
    );
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          return resolve([]);
        }

        const fields =
          results.meta.fields ||
          Object.keys(results.data[0]);

        const keys = findColumnKeys(fields);

        let maxYearNum = 0;

        for (let i = 0; i < results.data.length; i++) {
          const y = parseInt(
            results.data[i][keys.yearKey],
            10
          );

          if (y && y > maxYearNum) {
            maxYearNum = y;
          }
        }

        const maxYearStr = maxYearNum
          ? String(maxYearNum)
          : '2025';

        const uniqueMap = new Map();

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];

          const year = keys.yearKey
            ? String(row[keys.yearKey] || '')
            : '2025';

          if (
            year !== maxYearStr &&
            maxYearNum > 0
          ) {
            continue;
          }

          const rawClosing = keys.closeKey
            ? row[keys.closeKey]
            : '';

          const cleanedRank = String(
            rawClosing || ''
          )
            .replace(/,/g, '')
            .trim();

          const closingRank =
            parseInt(cleanedRank, 10) || 0;

          if (!closingRank) continue;

          const institute = keys.instKey
            ? String(row[keys.instKey] || '').trim()
            : '';

          const branch = keys.branchKey
            ? String(row[keys.branchKey] || '').trim()
            : '';

          const quota = keys.quotaKey
            ? String(row[keys.quotaKey] || '').trim()
            : '';

          const category = keys.catKey
            ? String(row[keys.catKey] || '').trim()
            : '';

          const gender = keys.genKey
            ? String(row[keys.genKey] || '').trim()
            : '';

          const roundNum =
            parseInt(
              keys.roundKey
                ? row[keys.roundKey]
                : '1',
              10
            ) || 1;

          const uniqueKey =
            `${institute}|${branch}|${quota}|${category}|${gender}`;

          if (
            !uniqueMap.has(uniqueKey) ||
            roundNum >
              uniqueMap.get(uniqueKey).roundNum
          ) {
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

        cachedData =
          Array.from(uniqueMap.values());

        resolve(cachedData);
      },

      error: (err) => reject(err),
    });
  });
}

/*
 * Institutional hierarchy:
 *
 * IIT  = 1
 * NIT  = 2
 * IIIT = 3
 * GFTI = 4
 */
function getInstitutionTier(institute) {
  const name = String(institute || '')
    .trim()
    .toUpperCase();

  /*
   * IIT must be checked first.
   *
   * "Indian Institute of Technology"
   * is distinct from
   * "Indian Institute of Information Technology".
   */
  if (
    name.includes(
      'INDIAN INSTITUTE OF TECHNOLOGY'
    ) &&
    !name.includes(
      'INDIAN INSTITUTE OF INFORMATION TECHNOLOGY'
    )
  ) {
    return 1;
  }

  if (
    name.includes(
      'NATIONAL INSTITUTE OF TECHNOLOGY'
    )
  ) {
    return 2;
  }

  if (
    name.includes(
      'INDIAN INSTITUTE OF INFORMATION TECHNOLOGY'
    )
  ) {
    return 3;
  }

  /*
   * Anything that is not IIT/NIT/IIIT is treated
   * as GFTI in the existing SeatWise dataset.
   */
  return 4;
}

function isIIT(institute) {
  return getInstitutionTier(institute) === 1;
}

export function getPredictions(
  cutoffsData,
  {
    mainsRank,
    advancedRank,
    category,
    gender,
    quota,
    preferredBranch,
  }
) {
  const mainUserRank = parseInt(
    mainsRank,
    10
  );

  /*
   * IMPORTANT:
   *
   * Blank / undefined / null Advanced rank
   * becomes null.
   *
   * We deliberately do NOT use:
   *
   * advancedRank ? ...
   *
   * because explicit null handling is clearer.
   */
  const advUserRank =
    advancedRank === null ||
    advancedRank === undefined ||
    String(advancedRank).trim() === ''
      ? null
      : parseInt(advancedRank, 10);

  if (
    Number.isNaN(mainUserRank) ||
    mainUserRank < 1
  ) {
    return [];
  }

  /*
   * IITs are completely unavailable when
   * the user has no Advanced rank.
   */
  const filtered = cutoffsData.filter(
    (entry) => {
      const inst = entry.institute;
      const institutionTier =
        getInstitutionTier(inst);

      /*
       * HARD IIT RULE:
       *
       * No Advanced rank = NO IIT RESULT.
       */
      if (
        institutionTier === 1 &&
        advUserRank === null
      ) {
        return false;
      }

      const entryCat =
        entry.category.toUpperCase();

      const userCat =
        category.trim().toUpperCase();

      let matchCategory =
        entryCat === userCat;

      if (
        userCat === 'OPEN' &&
        (
          entryCat === 'GEN' ||
          entryCat === 'GENERAL' ||
          entryCat === 'OPEN'
        )
      ) {
        matchCategory = true;
      }

      let matchQuota = true;

      const entryQuota =
        entry.quota.toUpperCase();

      if (quota.includes('AI')) {
        matchQuota =
          entryQuota === 'AI' ||
          entryQuota === 'OS' ||
          entryQuota === 'ALL INDIA';
      } else if (quota.includes('HS')) {
        matchQuota =
          entryQuota.includes('HS');
      } else if (quota.includes('OS')) {
        matchQuota =
          entryQuota.includes('OS');
      }

      const entryGender =
        entry.gender.toLowerCase();

      const matchGender =
        gender === 'Female-only'
          ? true
          : !entryGender.includes(
              'female-only'
            );

      let matchBranch = true;

      if (
        preferredBranch &&
        BRANCH_KEYWORDS[preferredBranch]
      ) {
        const branchLower =
          entry.branch.toLowerCase();

        const keywords =
          BRANCH_KEYWORDS[preferredBranch];

        matchBranch = keywords.some(
          (kw) =>
            branchLower.includes(kw)
        );
      } else if (preferredBranch) {
        matchBranch =
          entry.branch
            .toLowerCase()
            .includes(
              preferredBranch
                .trim()
                .toLowerCase()
            );
      }

      return (
        matchCategory &&
        matchQuota &&
        matchGender &&
        matchBranch
      );
    }
  );

  return filtered
    .map((entry) => {
      const closing =
        entry.closingRank;

      const inst =
        entry.institute;

      const institutionTier =
        getInstitutionTier(inst);

      /*
       * IIT:
       *   Advanced rank
       *
       * NIT / IIIT / GFTI:
       *   Mains rank
       */
      const effectiveUserRank =
        institutionTier === 1
          ? advUserRank
          : mainUserRank;

      /*
       * This should only happen for IITs when
       * Advanced rank is missing, but keep the
       * guard here as an extra safety layer.
       */
      if (!effectiveUserRank) {
        return null;
      }

      let tag = 'safe';
      let prob = '95%';

      if (
        effectiveUserRank <= closing
      ) {
        tag = 'safe';
        prob = '95%';
      } else if (
        effectiveUserRank <=
        closing * 1.15
      ) {
        tag = 'target';
        prob = '68%';
      } else if (
        effectiveUserRank <=
        closing * 1.35
      ) {
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
    .sort((a, b) => {
      /*
       * STRICT INSTITUTIONAL HIERARCHY
       *
       * IIT  -> 1
       * NIT  -> 2
       * IIIT -> 3
       * GFTI -> 4
       *
       * This guarantees that an IIT can never
       * appear below an NIT/IIIT/GFTI simply
       * because its rank distance is larger.
       */
      const tierA =
        getInstitutionTier(a.institute);

      const tierB =
        getInstitutionTier(b.institute);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      /*
       * Within the SAME institutional tier,
       * sort by proximity to the relevant
       * closing rank.
       */
      const rankA =
        tierA === 1
          ? advUserRank
          : mainUserRank;

      const rankB =
        tierB === 1
          ? advUserRank
          : mainUserRank;

      const distanceA =
        Math.abs(rankA - a.expRank);

      const distanceB =
        Math.abs(rankB - b.expRank);

      return distanceA - distanceB;
    })
    .slice(0, 100);
}