import { StatsBand, type Stat } from "@/components/ui/stats-band";

const xfinityAffected = 35_879_455;

const stats: readonly Stat[] = [
  {
    label: "Individuals",
    value: 859_532,
    notation: "compact",
    detail: "Reports of suspected internet crime received by the FBI in 2024.",
    source: {
      label: "FBI Internet Crime Report",
      href: "https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf",
    },
    visual: {
      kind: "trend",
      caption: "FBI complaints, 2020–2024",
      summary:
        "Internet crime complaints to the FBI by year: 791,790 in 2020, 847,376 in 2021, 800,944 in 2022, 880,418 in 2023, and 859,532 in 2024.",
      values: [791_790, 847_376, 800_944, 880_418, 859_532],
    },
  },
  {
    label: "Developers",
    value: 512_000,
    notation: "compact",
    suffix: "+",
    detail: "New malware samples found in public package repositories.",
    source: {
      label: "Sonatype 2024 Report",
      href: "https://sonatype.com/hubfs/SSCR-2024/SSCR_2024-FINAL-optimized.pdf",
    },
    visual: {
      kind: "strip",
      caption: "65K samples scored 7+ on CVSS",
      summary:
        "Sonatype reported more than 512,000 new malware samples in public repositories, with around 65,000 scoring 7 or above on the Common Vulnerability Scoring System since November 2023.",
      highlighted: 65_000,
      total: 512_000,
    },
  },
  {
    label: "Businesses",
    value: xfinityAffected,
    notation: "compact",
    decimals: 1,
    detail: "People affected by a single Xfinity data breach in 2023.",
    source: {
      label: "Maine AG Breach Notice",
      href: "https://www.maine.gov/agviewer/content/ag/985235c7-cb95-4be2-8792-a1252b4f8318/49e711c6-e27c-4340-867c-9a529ab3ca2c.shtml",
    },
    visual: {
      kind: "bars",
      caption: "Selected 2023 breach disclosures",
      summary:
        "Reported impact of four 2023 breaches: 23andMe, nearly 7 million customers. MCNA, 8.9 million people. Xfinity, 35.9 million people. T-Mobile, about 37 million accounts.",
      values: [
        // 23andMe: https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2025/pipeda-2025-001/
        { label: "23andMe", value: 7_000_000 },
        // MCNA: https://www.maine.gov/agviewer/content/ag/985235c7-cb95-4be2-8792-a1252b4f8318/895b95c8-abc8-41f1-8c03-b0415575de56.shtml
        { label: "MCNA", value: 8_923_662 },
        { label: "Xfinity", value: xfinityAffected, highlight: true },
        // T-Mobile: https://www.sec.gov/Archives/edgar/data/1283699/000119312524000008/tmus-20231231.htm
        { label: "T-Mobile", value: 37_000_000 },
      ],
    },
  },
  {
    label: "Industry",
    value: 5_560_000,
    notation: "compact",
    decimals: 2,
    prefix: "$",
    detail: "Average cost of an industrial data breach in IBM’s 2024 study.",
    source: {
      label: "IBM Cost of a Data Breach",
      href: "https://www.ibm.com/think/insights/cost-of-a-data-breach-industrial-sector",
    },
    visual: {
      kind: "map",
      caption: "16 countries and regions in the study",
      summary:
        "IBM’s overall 2024 study covered the United States, Canada, the United Kingdom, France, Germany, Italy, Benelux, Latin America, Brazil, South Africa, the Middle East, India, ASEAN, South Korea, Japan, and Australia.",
      // Approximate centers for the countries and regions in the report’s geographic sample.
      points: [
        [-100, 39],
        [-106, 57],
        [-2, 54],
        [2, 47],
        [10, 51],
        [12, 43],
        [5, 51],
        [-75, 4],
        [-52, -12],
        [25, -29],
        [45, 30],
        [79, 22],
        [106, 10],
        [128, 36],
        [138, 37],
        [134, -25],
      ],
    },
  },
];

export function Stats() {
  return (
    <StatsBand
      id="problem"
      title="The scale of cyber risk"
      description="Published figures on internet crime, software supply chains, and the impact of data breaches."
      layout="divided"
      stats={stats}
    />
  );
}
