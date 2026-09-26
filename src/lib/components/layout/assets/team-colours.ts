import type { TeamName } from './Logo.svelte';

type TeamColours = {
	/* Stroke colour for charts; bright enough to read on the dark card */
	line: string;
	/* [inner, outer] drop-shadow colours for logo glows */
	glow: [string, string];
};

// Tuned for equal perceived brightness on the dark card rather than raw brand hex.
// Leafs navy (#00205b) and Habs navy (#192168) are lifted or dropped since they
// vanish against the card; Bruins gold (#fcb514) is deepened for glows because
// yellow reads much brighter than the reds and blues.
export const teamColours: Record<TeamName, TeamColours> = {
	Leafs: { line: '#3b72f0', glow: ['#2a62e0', '#1a3f9e'] },
	Habs: { line: '#e0364a', glow: ['#d6293b', '#b3202f'] },
	Bruins: { line: '#e3a61c', glow: ['#b8860b', '#8a6410'] },
	Wings: { line: '#f2f2f2', glow: ['#ce1126', '#ce1126'] }
};
