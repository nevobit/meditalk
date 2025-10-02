
import type { Token } from "./types";
export const breakpoints: Token[] = [
  { key: "breakpoints-xs", cssVar: "--ds-breakpoints-xs", value: "0px", description: "Base / mobile-first" },
  { key: "breakpoints-sm", cssVar: "--ds-breakpoints-sm", value: "640px" },
  { key: "breakpoints-md", cssVar: "--ds-breakpoints-md", value: "768px" },
  { key: "breakpoints-lg", cssVar: "--ds-breakpoints-lg", value: "1024px" },
  { key: "breakpoints-xl", cssVar: "--ds-breakpoints-xl", value: "1280px" }
];
