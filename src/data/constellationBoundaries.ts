/**
 * Advanced Sky Click Detection — Constellation Boundary Data
 *
 * Contains:
 *  - Star catalog (~300 brightest stars, RA/Dec in degrees, apparent magnitude)
 *  - Constellation boundary polygons (simplified IAU RA/Dec vertices)
 *  - Constellation stick-figure line patterns (star-to-star connections)
 *  - Metadata per constellation (name, abbreviation, difficulty, description, score)
 */

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

export interface CatalogStar {
    id: number;
    name: string;
    ra: number;   // Right Ascension in degrees (0–360)
    dec: number;  // Declination in degrees (−90 to +90)
    mag: number;  // Apparent magnitude (lower = brighter)
    constellation: string; // abbreviation
}

export interface ConstellationData {
    name: string;
    abbr: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    scoreWeight: number;
    boundary: { ra: number; dec: number }[];   // polygon vertices
    lines: [number, number][];                 // pairs of star IDs to connect
    starIds: number[];                         // primary star IDs in pattern
}

/* ═══════════════════════════════════════════════════════════════
   Star Catalog — Brightest stars with RA/Dec
   ═══════════════════════════════════════════════════════════════ */

export const STAR_CATALOG: CatalogStar[] = [
    // ── Orion ──
    { id: 1, name: 'Betelgeuse', ra: 88.79, dec: 7.41, mag: 0.42, constellation: 'Ori' },
    { id: 2, name: 'Rigel', ra: 78.63, dec: -8.20, mag: 0.13, constellation: 'Ori' },
    { id: 3, name: 'Bellatrix', ra: 81.28, dec: 6.35, mag: 1.64, constellation: 'Ori' },
    { id: 4, name: 'Mintaka', ra: 83.00, dec: -0.30, mag: 2.23, constellation: 'Ori' },
    { id: 5, name: 'Alnilam', ra: 84.05, dec: -1.20, mag: 1.69, constellation: 'Ori' },
    { id: 6, name: 'Alnitak', ra: 85.19, dec: -1.94, mag: 1.77, constellation: 'Ori' },
    { id: 7, name: 'Saiph', ra: 86.94, dec: -9.67, mag: 2.06, constellation: 'Ori' },

    // ── Ursa Major ──
    { id: 10, name: 'Dubhe', ra: 165.93, dec: 61.75, mag: 1.79, constellation: 'UMa' },
    { id: 11, name: 'Merak', ra: 165.46, dec: 56.38, mag: 2.37, constellation: 'UMa' },
    { id: 12, name: 'Phecda', ra: 178.46, dec: 53.69, mag: 2.44, constellation: 'UMa' },
    { id: 13, name: 'Megrez', ra: 183.86, dec: 57.03, mag: 3.31, constellation: 'UMa' },
    { id: 14, name: 'Alioth', ra: 193.51, dec: 55.96, mag: 1.77, constellation: 'UMa' },
    { id: 15, name: 'Mizar', ra: 200.98, dec: 54.93, mag: 2.27, constellation: 'UMa' },
    { id: 16, name: 'Alkaid', ra: 206.89, dec: 49.31, mag: 1.86, constellation: 'UMa' },

    // ── Scorpius ──
    { id: 20, name: 'Antares', ra: 247.35, dec: -26.43, mag: 0.96, constellation: 'Sco' },
    { id: 21, name: 'Shaula', ra: 263.40, dec: -37.10, mag: 1.63, constellation: 'Sco' },
    { id: 22, name: 'Sargas', ra: 264.33, dec: -43.00, mag: 1.87, constellation: 'Sco' },
    { id: 23, name: 'Dschubba', ra: 240.08, dec: -22.62, mag: 2.32, constellation: 'Sco' },
    { id: 24, name: 'Graffias', ra: 241.36, dec: -19.81, mag: 2.62, constellation: 'Sco' },
    { id: 25, name: 'Lesath', ra: 263.62, dec: -37.30, mag: 2.69, constellation: 'Sco' },
    { id: 26, name: 'Epsilon Sco', ra: 252.54, dec: -34.29, mag: 2.29, constellation: 'Sco' },

    // ── Leo ──
    { id: 30, name: 'Regulus', ra: 152.09, dec: 11.97, mag: 1.35, constellation: 'Leo' },
    { id: 31, name: 'Denebola', ra: 177.27, dec: 14.57, mag: 2.14, constellation: 'Leo' },
    { id: 32, name: 'Algieba', ra: 146.46, dec: 19.84, mag: 2.28, constellation: 'Leo' },
    { id: 33, name: 'Zosma', ra: 168.53, dec: 20.52, mag: 2.56, constellation: 'Leo' },
    { id: 34, name: 'Ras Elased', ra: 148.19, dec: 26.01, mag: 2.98, constellation: 'Leo' },
    { id: 35, name: 'Chertan', ra: 168.56, dec: 15.43, mag: 3.34, constellation: 'Leo' },

    // ── Cassiopeia ──
    { id: 40, name: 'Schedar', ra: 10.13, dec: 56.54, mag: 2.23, constellation: 'Cas' },
    { id: 41, name: 'Caph', ra: 2.29, dec: 59.15, mag: 2.27, constellation: 'Cas' },
    { id: 42, name: 'Gamma Cas', ra: 14.18, dec: 60.72, mag: 2.47, constellation: 'Cas' },
    { id: 43, name: 'Ruchbah', ra: 21.45, dec: 60.24, mag: 2.68, constellation: 'Cas' },
    { id: 44, name: 'Segin', ra: 28.60, dec: 63.67, mag: 3.37, constellation: 'Cas' },

    // ── Gemini ──
    { id: 50, name: 'Pollux', ra: 116.33, dec: 28.03, mag: 1.14, constellation: 'Gem' },
    { id: 51, name: 'Castor', ra: 113.65, dec: 31.89, mag: 1.58, constellation: 'Gem' },
    { id: 52, name: 'Alhena', ra: 99.43, dec: 16.40, mag: 1.93, constellation: 'Gem' },
    { id: 53, name: 'Tejat', ra: 95.74, dec: 22.51, mag: 2.88, constellation: 'Gem' },
    { id: 54, name: 'Mebsuta', ra: 100.98, dec: 25.13, mag: 2.98, constellation: 'Gem' },
    { id: 55, name: 'Wasat', ra: 110.03, dec: 21.98, mag: 3.53, constellation: 'Gem' },

    // ── Taurus ──
    { id: 60, name: 'Aldebaran', ra: 68.98, dec: 16.51, mag: 0.85, constellation: 'Tau' },
    { id: 61, name: 'Elnath', ra: 81.57, dec: 28.61, mag: 1.65, constellation: 'Tau' },
    { id: 62, name: 'Alcyone', ra: 56.87, dec: 24.11, mag: 2.87, constellation: 'Tau' },
    { id: 63, name: 'Zeta Tau', ra: 84.41, dec: 21.14, mag: 3.00, constellation: 'Tau' },
    { id: 64, name: 'Theta2 Tau', ra: 67.17, dec: 15.87, mag: 3.40, constellation: 'Tau' },

    // ── Cygnus ──
    { id: 70, name: 'Deneb', ra: 310.36, dec: 45.28, mag: 1.25, constellation: 'Cyg' },
    { id: 71, name: 'Sadr', ra: 305.56, dec: 40.26, mag: 2.20, constellation: 'Cyg' },
    { id: 72, name: 'Gienah Cyg', ra: 311.55, dec: 33.97, mag: 2.46, constellation: 'Cyg' },
    { id: 73, name: 'Delta Cyg', ra: 296.24, dec: 45.13, mag: 2.87, constellation: 'Cyg' },
    { id: 74, name: 'Albireo', ra: 292.68, dec: 27.96, mag: 3.08, constellation: 'Cyg' },

    // ── Lyra ──
    { id: 80, name: 'Vega', ra: 279.23, dec: 38.78, mag: 0.03, constellation: 'Lyr' },
    { id: 81, name: 'Sheliak', ra: 282.52, dec: 33.36, mag: 3.45, constellation: 'Lyr' },
    { id: 82, name: 'Sulafat', ra: 284.74, dec: 32.69, mag: 3.24, constellation: 'Lyr' },
    { id: 83, name: 'Delta1 Lyr', ra: 281.08, dec: 36.90, mag: 5.58, constellation: 'Lyr' },
    { id: 84, name: 'Epsilon Lyr', ra: 281.08, dec: 39.67, mag: 4.67, constellation: 'Lyr' },

    // ── Aquila ──
    { id: 90, name: 'Altair', ra: 297.70, dec: 8.87, mag: 0.77, constellation: 'Aql' },
    { id: 91, name: 'Tarazed', ra: 296.57, dec: 10.61, mag: 2.72, constellation: 'Aql' },
    { id: 92, name: 'Alshain', ra: 298.83, dec: 6.41, mag: 3.71, constellation: 'Aql' },
    { id: 93, name: 'Theta Aql', ra: 301.47, dec: -0.82, mag: 3.23, constellation: 'Aql' },
    { id: 94, name: 'Delta Aql', ra: 289.28, dec: 3.11, mag: 3.36, constellation: 'Aql' },

    // ── Canis Major ──
    { id: 100, name: 'Sirius', ra: 101.29, dec: -16.72, mag: -1.46, constellation: 'CMa' },
    { id: 101, name: 'Adhara', ra: 104.66, dec: -28.97, mag: 1.50, constellation: 'CMa' },
    { id: 102, name: 'Wezen', ra: 107.10, dec: -26.39, mag: 1.83, constellation: 'CMa' },
    { id: 103, name: 'Mirzam', ra: 95.67, dec: -17.96, mag: 1.98, constellation: 'CMa' },
    { id: 104, name: 'Aludra', ra: 111.02, dec: -29.30, mag: 2.45, constellation: 'CMa' },
    { id: 105, name: 'Furud', ra: 95.08, dec: -30.06, mag: 3.02, constellation: 'CMa' },

    // ── Pegasus ──
    { id: 110, name: 'Markab', ra: 346.19, dec: 15.21, mag: 2.49, constellation: 'Peg' },
    { id: 111, name: 'Scheat', ra: 345.94, dec: 28.08, mag: 2.42, constellation: 'Peg' },
    { id: 112, name: 'Algenib', ra: 3.31, dec: 15.18, mag: 2.83, constellation: 'Peg' },
    { id: 113, name: 'Enif', ra: 326.05, dec: 9.88, mag: 2.39, constellation: 'Peg' },

    // ── Andromeda ──
    { id: 120, name: 'Alpheratz', ra: 2.10, dec: 29.09, mag: 2.06, constellation: 'And' },
    { id: 121, name: 'Mirach', ra: 17.43, dec: 35.62, mag: 2.05, constellation: 'And' },
    { id: 122, name: 'Almach', ra: 30.97, dec: 42.33, mag: 2.17, constellation: 'And' },

    // ── Perseus ──
    { id: 130, name: 'Mirfak', ra: 51.08, dec: 49.86, mag: 1.80, constellation: 'Per' },
    { id: 131, name: 'Algol', ra: 47.04, dec: 40.96, mag: 2.12, constellation: 'Per' },
    { id: 132, name: 'Zeta Per', ra: 58.53, dec: 31.88, mag: 2.85, constellation: 'Per' },
    { id: 133, name: 'Epsilon Per', ra: 59.46, dec: 40.01, mag: 2.89, constellation: 'Per' },
    { id: 134, name: 'Delta Per', ra: 55.73, dec: 47.79, mag: 3.01, constellation: 'Per' },

    // ── Bootes ──
    { id: 140, name: 'Arcturus', ra: 213.92, dec: 19.18, mag: -0.05, constellation: 'Boo' },
    { id: 141, name: 'Izar', ra: 221.25, dec: 27.07, mag: 2.37, constellation: 'Boo' },
    { id: 142, name: 'Muphrid', ra: 208.67, dec: 18.40, mag: 2.68, constellation: 'Boo' },
    { id: 143, name: 'Eta Boo', ra: 208.77, dec: 18.39, mag: 2.68, constellation: 'Boo' },
    { id: 144, name: 'Nekkar', ra: 225.49, dec: 40.39, mag: 3.58, constellation: 'Boo' },

    // ── Virgo ──
    { id: 150, name: 'Spica', ra: 201.30, dec: -11.16, mag: 0.97, constellation: 'Vir' },
    { id: 151, name: 'Porrima', ra: 190.42, dec: -1.45, mag: 2.74, constellation: 'Vir' },
    { id: 152, name: 'Vindemiatrix', ra: 195.54, dec: 10.96, mag: 2.83, constellation: 'Vir' },
    { id: 153, name: 'Zavijava', ra: 177.67, dec: 1.76, mag: 3.61, constellation: 'Vir' },

    // ── Sagittarius ──
    { id: 160, name: 'Kaus Australis', ra: 276.04, dec: -34.38, mag: 1.85, constellation: 'Sgr' },
    { id: 161, name: 'Nunki', ra: 283.82, dec: -26.30, mag: 2.02, constellation: 'Sgr' },
    { id: 162, name: 'Ascella', ra: 285.65, dec: -29.88, mag: 2.59, constellation: 'Sgr' },
    { id: 163, name: 'Kaus Media', ra: 275.25, dec: -29.83, mag: 2.70, constellation: 'Sgr' },
    { id: 164, name: 'Kaus Borealis', ra: 275.25, dec: -25.42, mag: 2.81, constellation: 'Sgr' },
    { id: 165, name: 'Nash', ra: 271.45, dec: -30.42, mag: 3.11, constellation: 'Sgr' },

    // ── Crux (Southern Cross) ──
    { id: 170, name: 'Acrux', ra: 186.65, dec: -63.10, mag: 0.76, constellation: 'Cru' },
    { id: 171, name: 'Mimosa', ra: 191.93, dec: -59.69, mag: 1.25, constellation: 'Cru' },
    { id: 172, name: 'Gacrux', ra: 187.79, dec: -57.11, mag: 1.63, constellation: 'Cru' },
    { id: 173, name: 'Imai', ra: 185.34, dec: -58.75, mag: 2.80, constellation: 'Cru' },

    // ── Centaurus ──
    { id: 180, name: 'Alpha Centauri', ra: 219.90, dec: -60.83, mag: -0.27, constellation: 'Cen' },
    { id: 181, name: 'Hadar', ra: 210.96, dec: -60.37, mag: 0.61, constellation: 'Cen' },
    { id: 182, name: 'Menkent', ra: 211.67, dec: -36.37, mag: 2.06, constellation: 'Cen' },
    { id: 183, name: 'Muhlifain', ra: 190.38, dec: -48.96, mag: 2.17, constellation: 'Cen' },

    // ── Draco ──
    { id: 190, name: 'Eltanin', ra: 269.15, dec: 51.49, mag: 2.23, constellation: 'Dra' },
    { id: 191, name: 'Rastaban', ra: 262.61, dec: 52.30, mag: 2.79, constellation: 'Dra' },
    { id: 192, name: 'Thuban', ra: 211.10, dec: 64.38, mag: 3.65, constellation: 'Dra' },
    { id: 193, name: 'Eta Dra', ra: 245.99, dec: 61.51, mag: 2.74, constellation: 'Dra' },
    { id: 194, name: 'Grumium', ra: 268.38, dec: 56.87, mag: 3.75, constellation: 'Dra' },

    // ── Aries ──
    { id: 200, name: 'Hamal', ra: 31.79, dec: 23.46, mag: 2.00, constellation: 'Ari' },
    { id: 201, name: 'Sheratan', ra: 28.66, dec: 20.81, mag: 2.64, constellation: 'Ari' },
    { id: 202, name: '41 Ari', ra: 32.86, dec: 27.26, mag: 3.63, constellation: 'Ari' },

    // ── Pisces ──
    { id: 210, name: 'Eta Psc', ra: 22.87, dec: 15.35, mag: 3.62, constellation: 'Psc' },
    { id: 211, name: 'Gamma Psc', ra: 349.29, dec: 3.28, mag: 3.69, constellation: 'Psc' },
    { id: 212, name: 'Omega Psc', ra: 354.99, dec: 6.86, mag: 4.01, constellation: 'Psc' },
    { id: 213, name: 'Alpha Psc', ra: 30.51, dec: 2.76, mag: 3.82, constellation: 'Psc' },

    // ── Libra ──
    { id: 220, name: 'Zubeneschamali', ra: 229.25, dec: -9.38, mag: 2.61, constellation: 'Lib' },
    { id: 221, name: 'Zubenelgenubi', ra: 222.72, dec: -16.04, mag: 2.75, constellation: 'Lib' },
    { id: 222, name: 'Sigma Lib', ra: 226.02, dec: -25.28, mag: 3.29, constellation: 'Lib' },

    // ── Capricornus ──
    { id: 230, name: 'Deneb Algedi', ra: 326.76, dec: -16.13, mag: 2.87, constellation: 'Cap' },
    { id: 231, name: 'Nashira', ra: 325.02, dec: -16.66, mag: 3.68, constellation: 'Cap' },
    { id: 232, name: 'Alpha2 Cap', ra: 304.51, dec: -12.51, mag: 3.56, constellation: 'Cap' },
    { id: 233, name: 'Beta Cap', ra: 305.25, dec: -14.78, mag: 3.08, constellation: 'Cap' },

    // ── Cancer ──
    { id: 240, name: 'Acubens', ra: 134.62, dec: 11.86, mag: 4.25, constellation: 'Cnc' },
    { id: 241, name: 'Al Tarf', ra: 124.13, dec: 9.19, mag: 3.52, constellation: 'Cnc' },
    { id: 242, name: 'Asellus Australis', ra: 131.17, dec: 18.15, mag: 3.94, constellation: 'Cnc' },
    { id: 243, name: 'Asellus Borealis', ra: 130.07, dec: 21.47, mag: 4.66, constellation: 'Cnc' },

    // ── Ophiuchus ──
    { id: 250, name: 'Rasalhague', ra: 263.73, dec: 12.56, mag: 2.07, constellation: 'Oph' },
    { id: 251, name: 'Sabik', ra: 257.59, dec: -15.72, mag: 2.43, constellation: 'Oph' },
    { id: 252, name: 'Zeta Oph', ra: 249.29, dec: -10.57, mag: 2.56, constellation: 'Oph' },
    { id: 253, name: 'Yed Prior', ra: 243.59, dec: -3.69, mag: 2.74, constellation: 'Oph' },
    { id: 254, name: 'Cebalrai', ra: 265.87, dec: 4.57, mag: 2.77, constellation: 'Oph' },

    // ── Hercules ──
    { id: 260, name: 'Kornephoros', ra: 247.55, dec: 21.49, mag: 2.77, constellation: 'Her' },
    { id: 261, name: 'Zeta Her', ra: 250.32, dec: 31.60, mag: 2.81, constellation: 'Her' },
    { id: 262, name: 'Eta Her', ra: 254.16, dec: 38.92, mag: 3.49, constellation: 'Her' },
    { id: 263, name: 'Pi Her', ra: 258.76, dec: 36.81, mag: 3.16, constellation: 'Her' },
    { id: 264, name: 'Epsilon Her', ra: 253.08, dec: 30.93, mag: 3.92, constellation: 'Her' },

    // ── Auriga ──
    { id: 270, name: 'Capella', ra: 79.17, dec: 45.99, mag: 0.08, constellation: 'Aur' },
    { id: 271, name: 'Menkalinan', ra: 89.88, dec: 44.95, mag: 1.90, constellation: 'Aur' },
    { id: 272, name: 'Theta Aur', ra: 89.93, dec: 37.21, mag: 2.62, constellation: 'Aur' },
    { id: 273, name: 'Iota Aur', ra: 74.25, dec: 33.17, mag: 2.69, constellation: 'Aur' },

    // ── Corona Borealis ──
    { id: 280, name: 'Alphecca', ra: 233.67, dec: 26.71, mag: 2.24, constellation: 'CrB' },
    { id: 281, name: 'Nusakan', ra: 231.96, dec: 29.11, mag: 3.68, constellation: 'CrB' },

    // ── Aquarius ──
    { id: 290, name: 'Sadalsuud', ra: 322.89, dec: -5.57, mag: 2.91, constellation: 'Aqr' },
    { id: 291, name: 'Sadalmelik', ra: 331.45, dec: -0.32, mag: 2.96, constellation: 'Aqr' },
    { id: 292, name: 'Skat', ra: 343.66, dec: -15.82, mag: 3.27, constellation: 'Aqr' },

    // ── Canis Minor ──
    { id: 300, name: 'Procyon', ra: 114.83, dec: 5.22, mag: 0.34, constellation: 'CMi' },
    { id: 301, name: 'Gomeisa', ra: 111.79, dec: 8.29, mag: 2.90, constellation: 'CMi' },

    // ── Ursa Minor ──
    { id: 310, name: 'Polaris', ra: 37.95, dec: 89.26, mag: 1.98, constellation: 'UMi' },
    { id: 311, name: 'Kochab', ra: 222.68, dec: 74.16, mag: 2.08, constellation: 'UMi' },
    { id: 312, name: 'Pherkad', ra: 230.18, dec: 71.83, mag: 3.00, constellation: 'UMi' },

    // ── Eridanus ──
    { id: 320, name: 'Achernar', ra: 24.43, dec: -57.24, mag: 0.46, constellation: 'Eri' },
    { id: 321, name: 'Cursa', ra: 76.96, dec: -5.09, mag: 2.79, constellation: 'Eri' },
    { id: 322, name: 'Zaurak', ra: 59.51, dec: -13.51, mag: 2.95, constellation: 'Eri' },

    // ── Carina ──
    { id: 330, name: 'Canopus', ra: 95.99, dec: -52.70, mag: -0.74, constellation: 'Car' },
    { id: 331, name: 'Avior', ra: 125.63, dec: -59.51, mag: 1.86, constellation: 'Car' },
    { id: 332, name: 'Aspidiske', ra: 139.27, dec: -59.28, mag: 2.25, constellation: 'Car' },
    { id: 333, name: 'Miaplacidus', ra: 138.30, dec: -69.72, mag: 1.68, constellation: 'Car' },

    // ── Pavo ──
    { id: 340, name: 'Peacock', ra: 306.41, dec: -56.74, mag: 1.94, constellation: 'Pav' },
    { id: 341, name: 'Beta Pav', ra: 311.24, dec: -66.20, mag: 3.42, constellation: 'Pav' },

    // ── Grus ──
    { id: 350, name: 'Alnair', ra: 332.06, dec: -46.96, mag: 1.74, constellation: 'Gru' },
    { id: 351, name: 'Beta Gru', ra: 340.67, dec: -46.88, mag: 2.10, constellation: 'Gru' },

    // ── Hydra ──
    { id: 360, name: 'Alphard', ra: 141.90, dec: -8.66, mag: 1.98, constellation: 'Hya' },
    { id: 361, name: 'Gamma Hya', ra: 199.73, dec: -23.17, mag: 2.99, constellation: 'Hya' },

    // ── Corvus ──
    { id: 370, name: 'Gienah', ra: 183.95, dec: -17.54, mag: 2.59, constellation: 'Crv' },
    { id: 371, name: 'Kraz', ra: 188.60, dec: -23.40, mag: 2.65, constellation: 'Crv' },
    { id: 372, name: 'Algorab', ra: 187.47, dec: -16.52, mag: 2.95, constellation: 'Crv' },
    { id: 373, name: 'Minkar', ra: 182.10, dec: -22.62, mag: 3.00, constellation: 'Crv' },

    // ── Delphinus ──
    { id: 380, name: 'Rotanev', ra: 309.39, dec: 14.60, mag: 3.63, constellation: 'Del' },
    { id: 381, name: 'Sualocin', ra: 308.30, dec: 15.91, mag: 3.77, constellation: 'Del' },
    { id: 382, name: 'Gamma Del', ra: 310.86, dec: 16.12, mag: 3.87, constellation: 'Del' },
    { id: 383, name: 'Delta Del', ra: 310.40, dec: 15.07, mag: 4.43, constellation: 'Del' },

    // ── Triangulum ──
    { id: 390, name: 'Beta Tri', ra: 28.27, dec: 34.99, mag: 3.00, constellation: 'Tri' },
    { id: 391, name: 'Alpha Tri', ra: 28.27, dec: 29.58, mag: 3.41, constellation: 'Tri' },
    { id: 392, name: 'Gamma Tri', ra: 34.54, dec: 33.84, mag: 4.01, constellation: 'Tri' },

    // ── Cepheus ──
    { id: 400, name: 'Alderamin', ra: 319.64, dec: 62.59, mag: 2.51, constellation: 'Cep' },
    { id: 401, name: 'Errai', ra: 354.84, dec: 77.63, mag: 3.23, constellation: 'Cep' },
    { id: 402, name: 'Zeta Cep', ra: 330.95, dec: 58.20, mag: 3.35, constellation: 'Cep' },

    // ── Lupus ──
    { id: 410, name: 'Alpha Lup', ra: 220.48, dec: -47.39, mag: 2.30, constellation: 'Lup' },
    { id: 411, name: 'Beta Lup', ra: 224.63, dec: -43.13, mag: 2.68, constellation: 'Lup' },

    // ── Sculptor ──
    { id: 420, name: 'Alpha Scl', ra: 14.04, dec: -29.36, mag: 4.31, constellation: 'Scl' },

    // ── Fornax ──
    { id: 430, name: 'Alpha For', ra: 48.02, dec: -28.99, mag: 3.87, constellation: 'For' },

    // ── Piscis Austrinus ──
    { id: 440, name: 'Fomalhaut', ra: 344.41, dec: -29.62, mag: 1.16, constellation: 'PsA' },

    // ── Extra bright stars for background ──
    { id: 500, name: 'Acamar', ra: 44.57, dec: -40.30, mag: 2.88, constellation: 'Eri' },
    { id: 501, name: 'Diphda', ra: 10.90, dec: -17.99, mag: 2.02, constellation: 'Cet' },
    { id: 502, name: 'Ankaa', ra: 6.57, dec: -42.31, mag: 2.38, constellation: 'Phe' },
];

/* ═══════════════════════════════════════════════════════════════
   Constellation Definitions
   ═══════════════════════════════════════════════════════════════ */

export const CONSTELLATIONS: ConstellationData[] = [
    // ════════════════ EASY TIER ════════════════
    {
        name: 'Orion',
        abbr: 'Ori',
        difficulty: 'easy',
        description: 'The Hunter — one of the most recognizable constellations, featuring the famous three-star belt.',
        scoreWeight: 1,
        boundary: [
            { ra: 73, dec: 16 }, { ra: 93, dec: 16 }, { ra: 93, dec: -12 },
            { ra: 73, dec: -12 },
        ],
        starIds: [1, 2, 3, 4, 5, 6, 7],
        lines: [[1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 2], [2, 6], [4, 1]],
    },
    {
        name: 'Ursa Major',
        abbr: 'UMa',
        difficulty: 'easy',
        description: 'The Great Bear — contains the famous Big Dipper asterism, used for millennia for navigation.',
        scoreWeight: 1,
        boundary: [
            { ra: 158, dec: 65 }, { ra: 214, dec: 65 }, { ra: 214, dec: 46 },
            { ra: 158, dec: 46 },
        ],
        starIds: [10, 11, 12, 13, 14, 15, 16],
        lines: [[10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16]],
    },
    {
        name: 'Scorpius',
        abbr: 'Sco',
        difficulty: 'easy',
        description: 'The Scorpion — a zodiac constellation with bright red Antares at its heart.',
        scoreWeight: 1,
        boundary: [
            { ra: 235, dec: -16 }, { ra: 270, dec: -16 }, { ra: 270, dec: -46 },
            { ra: 235, dec: -46 },
        ],
        starIds: [20, 21, 22, 23, 24, 25, 26],
        lines: [[24, 23], [23, 20], [20, 26], [26, 21], [21, 25], [21, 22]],
    },
    {
        name: 'Leo',
        abbr: 'Leo',
        difficulty: 'easy',
        description: 'The Lion — a zodiac constellation featuring the bright star Regulus.',
        scoreWeight: 1,
        boundary: [
            { ra: 140, dec: 30 }, { ra: 182, dec: 30 }, { ra: 182, dec: 6 },
            { ra: 140, dec: 6 },
        ],
        starIds: [30, 31, 32, 33, 34, 35],
        lines: [[30, 32], [32, 34], [32, 33], [33, 31], [30, 35], [35, 33]],
    },
    {
        name: 'Cassiopeia',
        abbr: 'Cas',
        difficulty: 'easy',
        description: 'The Queen — an easily identified W-shaped pattern in the northern sky.',
        scoreWeight: 1,
        boundary: [
            { ra: 355, dec: 75 }, { ra: 35, dec: 75 }, { ra: 35, dec: 53 },
            { ra: 355, dec: 53 },
        ],
        starIds: [40, 41, 42, 43, 44],
        lines: [[41, 40], [40, 42], [42, 43], [43, 44]],
    },
    {
        name: 'Gemini',
        abbr: 'Gem',
        difficulty: 'easy',
        description: 'The Twins — a zodiac constellation marked by the bright stars Castor and Pollux.',
        scoreWeight: 1,
        boundary: [
            { ra: 90, dec: 35 }, { ra: 120, dec: 35 }, { ra: 120, dec: 12 },
            { ra: 90, dec: 12 },
        ],
        starIds: [50, 51, 52, 53, 54, 55],
        lines: [[51, 50], [51, 54], [54, 53], [50, 55], [55, 52]],
    },
    {
        name: 'Taurus',
        abbr: 'Tau',
        difficulty: 'easy',
        description: 'The Bull — a zodiac constellation featuring bright Aldebaran and the Pleiades cluster.',
        scoreWeight: 1,
        boundary: [
            { ra: 50, dec: 32 }, { ra: 90, dec: 32 }, { ra: 90, dec: 10 },
            { ra: 50, dec: 10 },
        ],
        starIds: [60, 61, 62, 63, 64],
        lines: [[60, 64], [60, 61], [61, 63], [60, 62]],
    },
    {
        name: 'Cygnus',
        abbr: 'Cyg',
        difficulty: 'easy',
        description: 'The Swan — also known as the Northern Cross, containing bright star Deneb.',
        scoreWeight: 1,
        boundary: [
            { ra: 286, dec: 50 }, { ra: 318, dec: 50 }, { ra: 318, dec: 25 },
            { ra: 286, dec: 25 },
        ],
        starIds: [70, 71, 72, 73, 74],
        lines: [[70, 71], [71, 74], [73, 71], [71, 72]],
    },
    {
        name: 'Canis Major',
        abbr: 'CMa',
        difficulty: 'easy',
        description: 'The Greater Dog — home to Sirius, the brightest star in the night sky.',
        scoreWeight: 1,
        boundary: [
            { ra: 90, dec: -12 }, { ra: 116, dec: -12 }, { ra: 116, dec: -34 },
            { ra: 90, dec: -34 },
        ],
        starIds: [100, 101, 102, 103, 104, 105],
        lines: [[103, 100], [100, 102], [102, 101], [101, 104], [103, 105]],
    },
    {
        name: 'Lyra',
        abbr: 'Lyr',
        difficulty: 'easy',
        description: 'The Lyre — a small constellation containing Vega, one of the brightest stars visible from Earth.',
        scoreWeight: 1,
        boundary: [
            { ra: 275, dec: 44 }, { ra: 290, dec: 44 }, { ra: 290, dec: 30 },
            { ra: 275, dec: 30 },
        ],
        starIds: [80, 81, 82, 83, 84],
        lines: [[80, 84], [80, 83], [83, 81], [81, 82], [82, 83]],
    },
    {
        name: 'Aquila',
        abbr: 'Aql',
        difficulty: 'easy',
        description: 'The Eagle — featuring Altair, part of the famous Summer Triangle asterism.',
        scoreWeight: 1,
        boundary: [
            { ra: 285, dec: 15 }, { ra: 308, dec: 15 }, { ra: 308, dec: -5 },
            { ra: 285, dec: -5 },
        ],
        starIds: [90, 91, 92, 93, 94],
        lines: [[94, 91], [91, 90], [90, 92], [92, 93]],
    },
    {
        name: 'Pegasus',
        abbr: 'Peg',
        difficulty: 'easy',
        description: 'The Winged Horse — known for the Great Square of Pegasus, a prominent asterism.',
        scoreWeight: 1,
        boundary: [
            { ra: 320, dec: 35 }, { ra: 10, dec: 35 }, { ra: 10, dec: 5 },
            { ra: 320, dec: 5 },
        ],
        starIds: [110, 111, 112, 113],
        lines: [[111, 110], [110, 112], [112, 111], [113, 110]],
    },

    // ════════════════ MEDIUM TIER ════════════════
    {
        name: 'Andromeda',
        abbr: 'And',
        difficulty: 'medium',
        description: 'The Chained Princess — contains the Andromeda Galaxy (M31), the nearest major galaxy.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 355, dec: 50 }, { ra: 38, dec: 50 }, { ra: 38, dec: 25 },
            { ra: 355, dec: 25 },
        ],
        starIds: [120, 121, 122],
        lines: [[120, 121], [121, 122]],
    },
    {
        name: 'Perseus',
        abbr: 'Per',
        difficulty: 'medium',
        description: 'The Hero — home to the famous eclipsing binary star Algol, the "Demon Star".',
        scoreWeight: 1.5,
        boundary: [
            { ra: 40, dec: 55 }, { ra: 65, dec: 55 }, { ra: 65, dec: 28 },
            { ra: 40, dec: 28 },
        ],
        starIds: [130, 131, 132, 133, 134],
        lines: [[130, 134], [130, 133], [133, 132], [130, 131]],
    },
    {
        name: 'Bootes',
        abbr: 'Boo',
        difficulty: 'medium',
        description: 'The Herdsman — features Arcturus, the brightest star in the northern celestial hemisphere.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 205, dec: 45 }, { ra: 232, dec: 45 }, { ra: 232, dec: 14 },
            { ra: 205, dec: 14 },
        ],
        starIds: [140, 141, 142, 143, 144],
        lines: [[140, 142], [140, 141], [141, 144]],
    },
    {
        name: 'Virgo',
        abbr: 'Vir',
        difficulty: 'medium',
        description: 'The Maiden — largest zodiac constellation, featuring the bright blue star Spica.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 172, dec: 16 }, { ra: 208, dec: 16 }, { ra: 208, dec: -16 },
            { ra: 172, dec: -16 },
        ],
        starIds: [150, 151, 152, 153],
        lines: [[153, 151], [151, 150], [151, 152]],
    },
    {
        name: 'Sagittarius',
        abbr: 'Sgr',
        difficulty: 'medium',
        description: 'The Archer — a zodiac constellation pointing toward the center of the Milky Way.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 265, dec: -20 }, { ra: 293, dec: -20 }, { ra: 293, dec: -42 },
            { ra: 265, dec: -42 },
        ],
        starIds: [160, 161, 162, 163, 164, 165],
        lines: [[165, 163], [163, 164], [163, 160], [160, 161], [161, 162]],
    },
    {
        name: 'Draco',
        abbr: 'Dra',
        difficulty: 'medium',
        description: 'The Dragon — a large northern constellation that winds around the north celestial pole.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 207, dec: 78 }, { ra: 276, dec: 78 }, { ra: 276, dec: 48 },
            { ra: 207, dec: 48 },
        ],
        starIds: [190, 191, 192, 193, 194],
        lines: [[192, 193], [193, 191], [191, 190], [190, 194]],
    },
    {
        name: 'Ophiuchus',
        abbr: 'Oph',
        difficulty: 'medium',
        description: 'The Serpent Bearer — a large constellation straddling the celestial equator.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 238, dec: 18 }, { ra: 270, dec: 18 }, { ra: 270, dec: -18 },
            { ra: 238, dec: -18 },
        ],
        starIds: [250, 251, 252, 253, 254],
        lines: [[253, 252], [252, 251], [250, 254], [250, 253]],
    },
    {
        name: 'Hercules',
        abbr: 'Her',
        difficulty: 'medium',
        description: 'The Strongman — the fifth-largest constellation, home to the Keystone asterism and M13.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 242, dec: 45 }, { ra: 265, dec: 45 }, { ra: 265, dec: 18 },
            { ra: 242, dec: 18 },
        ],
        starIds: [260, 261, 262, 263, 264],
        lines: [[260, 261], [261, 264], [264, 260], [261, 262], [262, 263]],
    },
    {
        name: 'Auriga',
        abbr: 'Aur',
        difficulty: 'medium',
        description: 'The Charioteer — a prominent northern constellation featuring the bright star Capella.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 70, dec: 50 }, { ra: 95, dec: 50 }, { ra: 95, dec: 30 },
            { ra: 70, dec: 30 },
        ],
        starIds: [270, 271, 272, 273],
        lines: [[270, 271], [271, 272], [272, 273], [273, 270]],
    },
    {
        name: 'Centaurus',
        abbr: 'Cen',
        difficulty: 'medium',
        description: 'The Centaur — contains Alpha Centauri, the closest star system to our Sun.',
        scoreWeight: 1.5,
        boundary: [
            { ra: 185, dec: -30 }, { ra: 225, dec: -30 }, { ra: 225, dec: -65 },
            { ra: 185, dec: -65 },
        ],
        starIds: [180, 181, 182, 183],
        lines: [[180, 181], [181, 183], [183, 182]],
    },

    // ════════════════ HARD TIER ════════════════
    {
        name: 'Crux',
        abbr: 'Cru',
        difficulty: 'hard',
        description: 'The Southern Cross — the smallest constellation, an iconic symbol of the Southern Hemisphere.',
        scoreWeight: 2,
        boundary: [
            { ra: 181, dec: -55 }, { ra: 196, dec: -55 }, { ra: 196, dec: -66 },
            { ra: 181, dec: -66 },
        ],
        starIds: [170, 171, 172, 173],
        lines: [[170, 172], [173, 171]],
    },
    {
        name: 'Corona Borealis',
        abbr: 'CrB',
        difficulty: 'hard',
        description: 'The Northern Crown — a small semicircular arc of stars, representing a crown of the gods.',
        scoreWeight: 2,
        boundary: [
            { ra: 227, dec: 35 }, { ra: 240, dec: 35 }, { ra: 240, dec: 23 },
            { ra: 227, dec: 23 },
        ],
        starIds: [280, 281],
        lines: [[280, 281]],
    },
    {
        name: 'Corvus',
        abbr: 'Crv',
        difficulty: 'hard',
        description: 'The Crow — a small but distinct quadrilateral of stars in the southern sky.',
        scoreWeight: 2,
        boundary: [
            { ra: 178, dec: -12 }, { ra: 194, dec: -12 }, { ra: 194, dec: -26 },
            { ra: 178, dec: -26 },
        ],
        starIds: [370, 371, 372, 373],
        lines: [[370, 372], [372, 371], [371, 373], [373, 370]],
    },
    {
        name: 'Delphinus',
        abbr: 'Del',
        difficulty: 'hard',
        description: 'The Dolphin — a small, delightful constellation leaping out of the Milky Way.',
        scoreWeight: 2,
        boundary: [
            { ra: 304, dec: 20 }, { ra: 316, dec: 20 }, { ra: 316, dec: 11 },
            { ra: 304, dec: 11 },
        ],
        starIds: [380, 381, 382, 383],
        lines: [[381, 380], [380, 383], [383, 382], [382, 381]],
    },
    {
        name: 'Triangulum',
        abbr: 'Tri',
        difficulty: 'hard',
        description: 'The Triangle — a small northern constellation hosting the Triangulum Galaxy (M33).',
        scoreWeight: 2,
        boundary: [
            { ra: 23, dec: 38 }, { ra: 40, dec: 38 }, { ra: 40, dec: 26 },
            { ra: 23, dec: 26 },
        ],
        starIds: [390, 391, 392],
        lines: [[390, 391], [391, 392], [392, 390]],
    },
    {
        name: 'Carina',
        abbr: 'Car',
        difficulty: 'hard',
        description: 'The Keel — features Canopus, the second-brightest star in the night sky.',
        scoreWeight: 2,
        boundary: [
            { ra: 88, dec: -48 }, { ra: 145, dec: -48 }, { ra: 145, dec: -73 },
            { ra: 88, dec: -73 },
        ],
        starIds: [330, 331, 332, 333],
        lines: [[330, 331], [331, 332], [332, 333]],
    },
    {
        name: 'Pavo',
        abbr: 'Pav',
        difficulty: 'hard',
        description: 'The Peacock — a southern constellation named after the sacred bird of Juno.',
        scoreWeight: 2,
        boundary: [
            { ra: 290, dec: -52 }, { ra: 325, dec: -52 }, { ra: 325, dec: -72 },
            { ra: 290, dec: -72 },
        ],
        starIds: [340, 341],
        lines: [[340, 341]],
    },
    {
        name: 'Grus',
        abbr: 'Gru',
        difficulty: 'hard',
        description: 'The Crane — a southern constellation with the bright star Alnair.',
        scoreWeight: 2,
        boundary: [
            { ra: 325, dec: -40 }, { ra: 348, dec: -40 }, { ra: 348, dec: -55 },
            { ra: 325, dec: -55 },
        ],
        starIds: [350, 351],
        lines: [[350, 351]],
    },
];

/* ═══════════════════════════════════════════════════════════════
   Difficulty Tier Helpers
   ═══════════════════════════════════════════════════════════════ */

export const EASY_CONSTELLATIONS = CONSTELLATIONS.filter(c => c.difficulty === 'easy');
export const MEDIUM_CONSTELLATIONS = CONSTELLATIONS.filter(c => c.difficulty === 'medium');
export const HARD_CONSTELLATIONS = CONSTELLATIONS.filter(c => c.difficulty === 'hard');

export type DifficultyTier = 'easy' | 'medium' | 'hard';

export interface TierConfig {
    difficulty: DifficultyTier;
    label: string;
    color: string;
    timerSeconds: number;
    showLines: boolean;
    showBoundaryHint: boolean;
    constellations: ConstellationData[];
}

export function getTierConfig(difficulty: DifficultyTier): TierConfig {
    switch (difficulty) {
        case 'easy':
            return {
                difficulty: 'easy', label: 'Beginner', color: '#4ade80',
                timerSeconds: 20, showLines: true, showBoundaryHint: true,
                constellations: EASY_CONSTELLATIONS,
            };
        case 'medium':
            return {
                difficulty: 'medium', label: 'Explorer', color: '#fbbf24',
                timerSeconds: 15, showLines: true, showBoundaryHint: false,
                constellations: [...EASY_CONSTELLATIONS, ...MEDIUM_CONSTELLATIONS],
            };
        case 'hard':
            return {
                difficulty: 'hard', label: 'Astronomer', color: '#f87171',
                timerSeconds: 10, showLines: false, showBoundaryHint: false,
                constellations: CONSTELLATIONS,
            };
    }
}

/* ═══════════════════════════════════════════════════════════════
   Geometry Helpers — Point-in-Polygon (RA/Dec)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Ray-casting point-in-polygon test for celestial coordinates.
 * Handles RA wrap-around (e.g., 355° to 5°) by normalizing.
 */
export function isPointInBoundary(
    ra: number, dec: number,
    boundary: { ra: number; dec: number }[]
): boolean {
    // Normalize RA relative to boundary center to handle wrap-around
    const centerRA = boundary.reduce((s, p) => s + p.ra, 0) / boundary.length;
    const normalizeRA = (r: number) => {
        let d = r - centerRA;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        return d;
    };

    const testRA = normalizeRA(ra);
    const points = boundary.map(p => ({ x: normalizeRA(p.ra), y: p.dec }));

    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;

        const intersect = ((yi > dec) !== (yj > dec)) &&
            (testRA < (xj - xi) * (dec - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Find which constellation a celestial coordinate falls within.
 */
export function findConstellationAtPoint(
    ra: number, dec: number,
    pool: ConstellationData[]
): ConstellationData | null {
    // 1. First check if point is strictly inside a defined boundary polygon
    for (const c of pool) {
        if (isPointInBoundary(ra, dec, c.boundary)) {
            return c;
        }
    }

    // 2. Fallback: Find closest constellation based on its stars
    // This allows clicking near a star to select its constellation even if the crude boundary missed it
    let closest: ConstellationData | null = null;
    let minDistance = 8.0; // Max snap distance in degrees

    // Create lookup map for O(1) star retrieval
    const starMap = new Map(STAR_CATALOG.map(s => [s.id, s]));

    for (const c of pool) {
        for (const starId of c.starIds) {
            const star = starMap.get(starId);
            if (!star) continue;
            
            // True angular distance using spherical law of cosines
            const dec1 = dec * (Math.PI / 180);
            const dec2 = star.dec * (Math.PI / 180);
            const dRa = (star.ra - ra) * (Math.PI / 180);
            
            // Angular distance formula (clamped to prevent NaN from floating point errors)
            const cosAngle = Math.max(-1, Math.min(1, 
                Math.sin(dec1) * Math.sin(dec2) + 
                Math.cos(dec1) * Math.cos(dec2) * Math.cos(dRa)
            ));
            const angle = Math.acos(cosAngle);
            const distDeg = angle * (180 / Math.PI);
            
            if (distDeg < minDistance) {
                minDistance = distDeg;
                closest = c;
            }
        }
    }

    return closest;
}

/* ═══════════════════════════════════════════════════════════════
   Coordinate Conversion — 3D ↔ Celestial
   ═══════════════════════════════════════════════════════════════ */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/** Convert RA/Dec (degrees) to unit sphere 3D position. */
export function celestialToCartesian(ra: number, dec: number, radius = 100): [number, number, number] {
    const raRad = ra * DEG2RAD;
    const decRad = dec * DEG2RAD;
    const x = radius * Math.cos(decRad) * Math.cos(raRad);
    const y = radius * Math.sin(decRad);
    const z = -radius * Math.cos(decRad) * Math.sin(raRad);
    return [x, y, z];
}

/** Convert 3D cartesian position to RA/Dec (degrees). */
export function cartesianToCelestial(x: number, y: number, z: number): { ra: number; dec: number } {
    const r = Math.sqrt(x * x + y * y + z * z);
    const dec = Math.asin(y / r) * RAD2DEG;
    let ra = Math.atan2(-z, x) * RAD2DEG;
    if (ra < 0) ra += 360;
    return { ra, dec };
}
