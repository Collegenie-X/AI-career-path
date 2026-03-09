/**
 * 커뮤니티 가입 요청 저장소
 * 데모: localStorage 사용. 백엔드 연동 시 API로 교체
 */
const STORAGE_KEY = 'launchpad_community_join_requests';
const STORAGE_KEY_MY_REQUEST_ID = 'launchpad_community_my_request_id';

export type CommunityJoinRequest = {
  id: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'denied';
};

export function loadJoinRequests(): CommunityJoinRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveJoinRequests(requests: CommunityJoinRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {}
}

export function setAccess(granted: boolean) {
  try {
    localStorage.setItem('launchpad_community_access', granted ? 'true' : 'false');
  } catch {}
}

export function addJoinRequest(message: string): string {
  const requests = loadJoinRequests();
  const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newRequest: CommunityJoinRequest = {
    id,
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'approved',  // 즉시 승인
  };
  requests.push(newRequest);
  saveJoinRequests(requests);
  try {
    localStorage.setItem(STORAGE_KEY_MY_REQUEST_ID, id);
    localStorage.setItem('launchpad_community_access', 'true');  // 즉시 접근 허용
  } catch {}
  return id;
}

export function getMyRequestId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_MY_REQUEST_ID);
  } catch {}
  return null;
}

export function hasPendingRequest(): boolean {
  return false;  // 즉시 승인이므로 항상 false
}

export function approveRequest(id: string): void {
  const requests = loadJoinRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx >= 0) {
    requests[idx] = { ...requests[idx], status: 'approved' };
    saveJoinRequests(requests);
    try {
      const myId = localStorage.getItem(STORAGE_KEY_MY_REQUEST_ID);
      if (myId === id) {
        localStorage.setItem('launchpad_community_access', 'true');
      }
    } catch {}
  }
}

export function denyRequest(id: string): void {
  const requests = loadJoinRequests().filter(r => r.id !== id);
  saveJoinRequests(requests);
}

export function getPendingRequests(): CommunityJoinRequest[] {
  return loadJoinRequests().filter(r => r.status === 'pending');
}
