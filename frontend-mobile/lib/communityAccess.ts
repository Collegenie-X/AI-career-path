/**
 * 커뮤니티 접근 권한 공통 유틸
 * launchpad / career 양쪽에서 동일한 키를 사용
 */
const STORAGE_KEY_ACCESS = 'launchpad_community_access';
const STORAGE_KEY_REQUEST = 'launchpad_community_join_requests';
const STORAGE_KEY_MY_REQUEST_ID = 'launchpad_community_my_request_id';

export type CommunityJoinRequest = {
  id: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'denied';
};

export function hasCommunityAccess(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS) === 'true';
  } catch {
    return false;
  }
}

export function setCommunityAccess(granted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_ACCESS, granted ? 'true' : 'false');
  } catch {}
}

export function addCommunityJoinRequest(message: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUEST);
    const requests: CommunityJoinRequest[] = raw ? JSON.parse(raw) : [];
    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    requests.push({
      id,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'approved',  // 즉시 승인
    });
    localStorage.setItem(STORAGE_KEY_REQUEST, JSON.stringify(requests));
    localStorage.setItem(STORAGE_KEY_MY_REQUEST_ID, id);
    setCommunityAccess(true);
  } catch {}
}

export function getPendingCommunityRequests(): CommunityJoinRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUEST);
    const requests: CommunityJoinRequest[] = raw ? JSON.parse(raw) : [];
    return requests.filter(r => r.status === 'pending');
  } catch {
    return [];
  }
}

export function approveCommunityRequest(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUEST);
    const requests: CommunityJoinRequest[] = raw ? JSON.parse(raw) : [];
    const idx = requests.findIndex(r => r.id === id);
    if (idx >= 0) {
      requests[idx] = { ...requests[idx], status: 'approved' };
      localStorage.setItem(STORAGE_KEY_REQUEST, JSON.stringify(requests));
      const myId = localStorage.getItem(STORAGE_KEY_MY_REQUEST_ID);
      if (myId === id) setCommunityAccess(true);
    }
  } catch {}
}

export function denyCommunityRequest(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUEST);
    const requests: CommunityJoinRequest[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(
      STORAGE_KEY_REQUEST,
      JSON.stringify(requests.filter(r => r.id !== id))
    );
  } catch {}
}
