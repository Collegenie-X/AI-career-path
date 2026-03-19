const JOINED_SPACES_KEY = 'dreammate_joined_spaces';
const REACTIONS_KEY = 'dreammate_reactions_v1';

export function loadJoinedSpaceIds(): string[] {
  try {
    const raw = localStorage.getItem(JOINED_SPACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJoinedSpaceIds(ids: string[]) {
  try {
    localStorage.setItem(JOINED_SPACES_KEY, JSON.stringify(ids));
  } catch {}
}

export function joinSpace(spaceId: string) {
  const ids = loadJoinedSpaceIds();
  if (!ids.includes(spaceId)) {
    saveJoinedSpaceIds([...ids, spaceId]);
  }
}

export function leaveSpace(spaceId: string) {
  saveJoinedSpaceIds(loadJoinedSpaceIds().filter(id => id !== spaceId));
}

export type DreamReactions = {
  likedRoadmapIds: string[];
  bookmarkedRoadmapIds: string[];
  likedResourceIds: string[];
  bookmarkedResourceIds: string[];
};

const DEFAULT_REACTIONS: DreamReactions = {
  likedRoadmapIds: [],
  bookmarkedRoadmapIds: [],
  likedResourceIds: [],
  bookmarkedResourceIds: [],
};

export function loadDreamReactions(): DreamReactions {
  try {
    const raw = localStorage.getItem(REACTIONS_KEY);
    return raw ? { ...DEFAULT_REACTIONS, ...JSON.parse(raw) } : DEFAULT_REACTIONS;
  } catch {
    return DEFAULT_REACTIONS;
  }
}

export function saveDreamReactions(reactions: DreamReactions) {
  try {
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions));
  } catch {}
}
