import type { CardItem } from "../components/ui/card-stack";

/**
 * 88 IAU constellations organized into 9 levels.
 * Level 1–3: Popular/well-known constellations (Easy)
 * Level 4–6: Moderately known (Medium)
 * Level 7–9: Obscure/difficult (Hard)
 *
 * Each level introduces exactly 10 new constellations (level 9 has 8).
 * The quiz pool for a level = all constellations from level 1 up to that level.
 */

/* ── Level definitions ── */
import rawCsv from "../assets/constellations.csv?raw";

const parseCSV = (csv: string): CardItem[] => {
    const lines = csv.trim().split('\n');
    // const headers = lines[0].split(','); // Unused

    // Helper to split CSV line handling quotes
    const splitLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    return lines.slice(1).map(line => {
        const [id, title, description, image] = splitLine(line);
        // Remove surrounding quotes if present in description
        const cleanDesc = description.replace(/^"|"$/g, '').replace(/""/g, '"');
        return {
            id: parseInt(id),
            title,
            description: cleanDesc,
            image
        };
    });
};

// Curated lists to maintain difficulty progression (Popular -> Hard)
const LEVEL_TITLES = [
    // Level 1: Very Popular
    ["Orion", "Ursa Major", "Scorpius", "Leo", "Cassiopeia", "Gemini", "Taurus", "Pegasus", "Cygnus", "Aquarius"],
    // Level 2: Zodiac / Well Known
    ["Andromeda", "Aries", "Sagittarius", "Pisces", "Virgo", "Libra", "Capricornus", "Cancer", "Draco", "Lyra"],
    // Level 3: Bright / Distinctive
    ["Canis Major", "Perseus", "Hercules", "Ursa Minor", "Aquila", "Ophiuchus", "Centaurus", "Crux", "Bootes", "Canis Minor"],
    // Level 4: Northern / Ancient
    ["Cepheus", "Auriga", "Eridanus", "Cetus", "Phoenix", "Hydra", "Lupus", "Corvus", "Lepus", "Corona Borealis"],
    // Level 5: Southern / Nautical
    ["Delphinus", "Serpens", "Crater", "Monoceros", "Carina", "Vela", "Puppis", "Ara", "Pavo", "Grus"],
    // Level 6: Fainter Northern
    ["Coma Berenices", "Canes Venatici", "Lynx", "Sagitta", "Triangulum", "Scutum", "Equuleus", "Vulpecula", "Lacerta", "Sextans"],
    // Level 7: Fainter Southern
    ["Leo Minor", "Camelopardalis", "Fornax", "Sculptor", "Columba", "Horologium", "Pictor", "Caelum", "Dorado", "Piscis Austrinus"],
    // Level 8: Obscure / Metric
    ["Reticulum", "Pyxis", "Antlia", "Corona Australis", "Microscopium", "Telescopium", "Norma", "Circinus", "Indus", "Tucana"],
    // Level 9: The Rest (Southern/Faint)
    ["Chamaeleon", "Musca", "Apus", "Octans", "Hydrus", "Mensa", "Volans", "Triangulum Australe"]
];

export const ALL_CONSTELLATIONS: CardItem[] = parseCSV(rawCsv);

// Map CSV data to curated levels
export const LEVELS: CardItem[][] = LEVEL_TITLES.map((titles) => {
    return titles.map(title =>
        ALL_CONSTELLATIONS.find(c => c.title.toLowerCase() === title.toLowerCase())
    ).filter((item): item is CardItem => !!item); // Filter out missing ones
});

// Add any remaining constellations from CSV that weren't in curated lists (just in case)
const usedIds = new Set(LEVELS.flat().map(c => c.id));
const remaining = ALL_CONSTELLATIONS.filter(c => !usedIds.has(c.id));
if (remaining.length > 0) {
    // Distribute remaining among levels or add to last
    LEVELS[LEVELS.length - 1].push(...remaining);
}

/* ── Game constants ── */
export const CONSTELLATIONS_PER_LEVEL = 10;
export const CORRECT_TO_PASS = 10;
export const TOTAL_LEVELS = LEVELS.length; // 9

export type Difficulty = "easy" | "medium" | "hard";

export interface LevelConfig {
    difficulty: Difficulty;
    timerSeconds: number;
    label: string;
    color: string;
}

/** Returns the difficulty config for a given level (1-indexed) */
export function getLevelConfig(level: number): LevelConfig {
    if (level <= 3) return { difficulty: "easy", timerSeconds: 15, label: "Easy", color: "#4ade80" };
    if (level <= 6) return { difficulty: "medium", timerSeconds: 8, label: "Medium", color: "#fbbf24" };
    return { difficulty: "hard", timerSeconds: 12, label: "Hard", color: "#f87171" };
}

/**
 * Returns the constellation pool for a given level (1-indexed).
 * Pool includes all constellations from level 1 through the given level.
 */
export function getPoolForLevel(level: number): CardItem[] {
    return LEVELS.slice(0, level).flat();
}

/**
 * Returns ONLY the new constellations introduced at a given level (1-indexed).
 * These are the ones the player must identify in this level's rounds.
 */
export function getNewForLevel(level: number): CardItem[] {
    return LEVELS[level - 1] ?? [];
}

/** Shuffle utility */
export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
