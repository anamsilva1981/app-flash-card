import type { Rating } from "../models";

export function xpForRating(rating: Rating): number {
  return { again: 0, hard: 5, good: 10, easy: 15 }[rating];
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}
