/**
 * 런치패드 커뮤니티 가입 상태 저장소
 */
const CLUBS_KEY = 'launchpad_joined_clubs';
const GROUPS_KEY = 'launchpad_joined_groups';

export function loadJoinedClubIds(): string[] {
  try {
    const raw = localStorage.getItem(CLUBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJoinedClubIds(ids: string[]) {
  try {
    localStorage.setItem(CLUBS_KEY, JSON.stringify(ids));
  } catch {}
}

export function joinClub(clubId: string) {
  const ids = loadJoinedClubIds();
  if (!ids.includes(clubId)) {
    saveJoinedClubIds([...ids, clubId]);
  }
}

export function leaveClub(clubId: string) {
  saveJoinedClubIds(loadJoinedClubIds().filter(id => id !== clubId));
}

export function isJoinedClub(clubId: string): boolean {
  return loadJoinedClubIds().includes(clubId);
}

export function loadJoinedGroupIds(): string[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJoinedGroupIds(ids: string[]) {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(ids));
  } catch {}
}

export function joinGroup(groupId: string) {
  const ids = loadJoinedGroupIds();
  if (!ids.includes(groupId)) {
    saveJoinedGroupIds([...ids, groupId]);
  }
}

export function leaveGroup(groupId: string) {
  saveJoinedGroupIds(loadJoinedGroupIds().filter(id => id !== groupId));
}

export function isJoinedGroup(groupId: string): boolean {
  return loadJoinedGroupIds().includes(groupId);
}
