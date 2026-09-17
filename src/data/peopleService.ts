import defaultPeople from './people.json';
import { Person } from '../types.ts';

const STORAGE_KEY = 'cinematic_farewell_people_v25';

export function sortPeopleAlphabetically(list: Person[]): Person[] {
  return [...list].sort((a, b) => {
    if (a.id === 'general-team') return 1;
    if (b.id === 'general-team') return -1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export function getPeople(): Person[] {
  if (typeof window === 'undefined') {
    return sortPeopleAlphabetically(defaultPeople as Person[]);
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: Person) => p.id));
        const missingDefaults = (defaultPeople as Person[]).filter(p => !existingIds.has(p.id));
        if (missingDefaults.length > 0) {
          const merged = sortPeopleAlphabetically([...parsed, ...missingDefaults]);
          savePeople(merged);
          return merged;
        }
        return sortPeopleAlphabetically(parsed as Person[]);
      }
    }
  } catch (err) {
    console.warn('Could not read saved people from localStorage', err);
  }
  const sortedDefaults = sortPeopleAlphabetically(defaultPeople as Person[]);
  savePeople(sortedDefaults);
  return sortedDefaults;
}

export function savePeople(people: Person[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people, null, 2));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function resetToDefaultPeople(): Person[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
  return defaultPeople as Person[];
}

export function exportPeopleJson(people: Person[]): string {
  return JSON.stringify(people, null, 2);
}

export function findPersonByIdOrSlug(query: string, peopleList?: Person[]): Person | undefined {
  const people = peopleList || getPeople();
  if (!query) return undefined;
  
  const normalized = query.trim().toLowerCase();
  
  // 1. Exact ID or slug match
  const byId = people.find(p => p.id.toLowerCase() === normalized);
  if (byId) return byId;

  // 2. Exact name or shortName match
  const byName = people.find(
    p => p.name.toLowerCase() === normalized || p.shortName.toLowerCase() === normalized
  );
  if (byName) return byName;

  // 3. Slug style match (e.g. ashwini matching ashwini-k82m)
  const bySlugPrefix = people.find(p => p.id.toLowerCase().startsWith(normalized + '-'));
  if (bySlugPrefix) return bySlugPrefix;

  return undefined;
}

export function generatePersonSlug(name: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'colleague';
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${clean}-${randomSuffix}`;
}
