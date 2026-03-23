'use client';

import { useCallback, useState } from 'react';
import { MessageCircle, Sparkles, Mail, User, GraduationCap, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import socialLoginDialogContent from '@/data/auth/social-login-dialog.json';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type GradeOption = { value: string; label: string };
type TermsItem = {
  id: string;
  label: string;
  required: boolean;
  viewLinkLabel: string;
  description?: string;
};
type SocialLoginDialogContent = {
  dialogTitle: string;
  loginButton: string;
  heroSubtitle: string;
  dividerText: string;
  providerButtons: { kakao: string; google: string };
  profileStepTitle: string;
  profileStepDescription: string;
  fields: { email: string; name: string; grade: string };
  gradeOptions: GradeOption[];
  terms: {
    sectionTitle: string;
    agreeAll: string;
    items: TermsItem[];
    notices: string[];
    agreeButton: string;
  };
  submitSignup: string;
  mockNotice: string;
};

const content = socialLoginDialogContent as SocialLoginDialogContent;

type SocialProviderId = 'kakao' | 'google';

type ProfileData = {
  email: string;
  name: string;
  grade: string;
};

const MOCK_PROFILE_BY_PROVIDER: Record<SocialProviderId, { email: string; name: string }> = {
  kakao: { email: 'user@kakao.user', name: '카카오 사용자' },
  google: { email: 'user@gmail.com', name: 'Google 사용자' },
};

const DEFAULT_GRADE = 'high1';

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type SocialLoginDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

const initialTermsAgreed = (items: TermsItem[]) =>
  Object.fromEntries(items.map((item) => [item.id, false]));

export function SocialLoginDialog({ open, onOpenChange }: SocialLoginDialogProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [termsAgreed, setTermsAgreed] = useState<Record<string, boolean>>(() =>
    initialTermsAgreed(content.terms.items),
  );

  const reset = useCallback(() => {
    setProfile(null);
    setTermsAgreed(initialTermsAgreed(content.terms.items));
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const handleSocialContinue = useCallback((provider: SocialProviderId) => {
    const base = MOCK_PROFILE_BY_PROVIDER[provider];
    setProfile({
      ...base,
      grade: DEFAULT_GRADE,
    });
  }, []);

  const handleSubmitProfile = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const requiredTermsIds = content.terms.items.filter((i) => i.required).map((i) => i.id);
  const allRequiredAgreed = requiredTermsIds.every((id) => termsAgreed[id]);
  const allAgreed = content.terms.items.every((i) => termsAgreed[i.id]);

  const handleAgreeAll = useCallback(() => {
    const next = !allAgreed;
    setTermsAgreed(Object.fromEntries(content.terms.items.map((i) => [i.id, next])));
  }, [allAgreed]);

  const handleTermsItemChange = useCallback((id: string, checked: boolean) => {
    setTermsAgreed((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const handleViewTerms = useCallback((_id: string) => {
    // TODO: 열기 모달/페이지 연결
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="w-[min(520px,calc(100%-2rem))] max-w-[520px] gap-0 overflow-hidden rounded-2xl border-2 p-0 text-white sm:max-w-[520px]"
        style={{
          background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1625 40%, #15101f 100%)',
          borderColor: 'rgba(139,92,246,0.5)',
          boxShadow: '0 0 60px rgba(139,92,246,0.25), 0 0 120px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        aria-describedby="social-login-desc"
      >
        {/* 상단 글로우 장식 */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full opacity-30 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }}
        />

        <DialogHeader
          className="relative space-y-0 border-b px-5 py-4 text-center sm:px-6"
          style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 100%)' }}
        >
          <DialogTitle className="text-center text-base font-bold tracking-tight text-white">
            {content.dialogTitle}
          </DialogTitle>
          <DialogDescription id="social-login-desc" className="sr-only">
            {content.mockNotice}
          </DialogDescription>
        </DialogHeader>

        {!profile ? (
          <div className="relative px-5 pb-7 pt-5 sm:px-6">
            <p className="text-[14px] font-semibold leading-snug text-white/90">{content.heroSubtitle}</p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t" style={{ borderColor: 'rgba(139,92,246,0.25)' }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[12px] font-medium" style={{ background: 'linear-gradient(165deg, #0f0f1a, #1a1625)', color: '#a78bfa' }}>
                  {content.dividerText}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSocialContinue('kakao')}
                className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-bold text-[#191600] transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FEE500 0%, #F5D000 100%)',
                  boxShadow: '0 4px 20px rgba(254,229,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <MessageCircle className="h-5 w-5 shrink-0 text-[#191600]" strokeWidth={2} />
                {content.providerButtons.kakao}
              </button>

              <button
                type="button"
                onClick={() => handleSocialContinue('google')}
                className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-bold text-gray-800 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <GoogleGIcon className="shrink-0" />
                {content.providerButtons.google}
              </button>
            </div>

            <p className="mt-5 text-center text-[11px] text-gray-500">{content.mockNotice}</p>
          </div>
        ) : (
          <div className="relative max-h-[70vh] space-y-5 overflow-y-auto px-8 pb-7 pt-6 sm:px-10">
            <div className="relative text-center">
              <div className="absolute -left-6 top-0 text-6xl opacity-20">🎮</div>
              <div className="absolute -right-6 top-0 text-6xl opacity-20">✨</div>
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 100%)', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}>
                <span className="text-3xl">🎯</span>
              </div>
              <p className="text-base font-bold text-white">{content.profileStepTitle}</p>
            </div>

            <div className="relative space-y-3">
              <div className="absolute -left-7 top-8 text-4xl opacity-30">💌</div>
              <label className="group relative block">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[11px] font-medium text-gray-500">{content.fields.email}</span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border px-4 py-2.5 pl-10 text-sm text-white/60 opacity-75 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(139,92,246,0.2)' }}
                  />
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                </div>
              </label>

              <div className="absolute -right-7 top-20 text-4xl opacity-30">👤</div>
              <label className="group relative block">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[11px] font-medium text-gray-500">{content.fields.name}</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => (p ? { ...p, name: e.target.value } : null))}
                    className="w-full rounded-xl border px-4 py-2.5 pl-10 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(139,92,246,0.25)' }}
                    autoComplete="name"
                  />
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400/60 transition-colors group-focus-within:text-violet-400" />
                </div>
              </label>

              <div className="absolute -left-7 bottom-4 text-4xl opacity-30">🎓</div>
              <label className="group relative block">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[11px] font-medium text-gray-500">{content.fields.grade}</span>
                </div>
                <div className="relative">
                  <select
                    value={profile.grade}
                    onChange={(e) => setProfile((p) => (p ? { ...p, grade: e.target.value } : null))}
                    className="w-full appearance-none rounded-xl border px-4 py-2.5 pl-10 pr-10 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(139,92,246,0.25)' }}
                  >
                    {content.gradeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ background: '#1a1625' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400/60 transition-colors group-focus-within:text-violet-400" />
                  <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-violet-400/60" />
                </div>
              </label>
            </div>

            <div className="relative space-y-3">
              <div className="absolute -left-7 -top-2 text-5xl opacity-25">🛡️</div>
              <div className="absolute -right-7 top-12 text-4xl opacity-25">📜</div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-violet-400" />
                <p className="text-sm font-bold text-white">{content.terms.sectionTitle}</p>
              </div>
              <div
                className="relative overflow-hidden rounded-xl border p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.05) 100%)',
                  borderColor: 'rgba(139,92,246,0.3)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 text-7xl opacity-10">⚔️</div>
                <label className="group flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-white/5">
                  <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allAgreed}
                      onChange={handleAgreeAll}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-violet-500/50 bg-transparent transition-all checked:border-violet-500 checked:bg-violet-500"
                    />
                    <CheckCircle2 className="pointer-events-none absolute h-5 w-5 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={2.5} />
                  </div>
                  <span className="text-[14px] font-bold text-white">{content.terms.agreeAll}</span>
                </label>
                <div
                  className="my-3 h-px w-full"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)' }}
                />
                <div className="space-y-2">
                  {content.terms.items.map((item) => (
                    <div key={item.id} className="rounded-lg transition-all hover:bg-white/5">
                      <div className="flex items-start gap-3 p-2">
                        <label className="flex flex-1 cursor-pointer items-start gap-2.5">
                          <div className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={termsAgreed[item.id] ?? false}
                              onChange={(e) => handleTermsItemChange(item.id, e.target.checked)}
                              className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-violet-500/40 bg-transparent transition-all checked:border-violet-500 checked:bg-violet-500"
                            />
                            <div className="pointer-events-none absolute h-2 w-2 rounded-sm bg-white opacity-0 transition-opacity peer-checked:opacity-100" />
                          </div>
                          <span className="text-[13px] leading-snug text-white/90">
                            {item.required && (
                              <span className="mr-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-violet-300" style={{ background: 'rgba(139,92,246,0.25)' }}>
                                필수
                              </span>
                            )}
                            {item.label}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleViewTerms(item.id)}
                          className="group/link flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-violet-400 transition-colors hover:text-violet-300"
                        >
                          {item.viewLinkLabel}
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                        </button>
                      </div>
                      {item.description && (
                        <p className="ml-9 pb-2 pr-2 text-[11px] leading-relaxed text-gray-500">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="relative overflow-hidden rounded-lg p-3"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                <div className="pointer-events-none absolute -right-4 -bottom-4 text-5xl opacity-15">⚠️</div>
                {content.terms.notices.map((notice, i) => (
                  <p key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-200/80">
                    <span className="mt-1 text-sm">💡</span>
                    <span>{notice}</span>
                  </p>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitProfile}
              disabled={!allRequiredAgreed}
              className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              style={
                allRequiredAgreed
                  ? {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
                      boxShadow: '0 4px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: '1px solid rgba(167,139,250,0.4)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }
              }
            >
              {allRequiredAgreed && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)' }}
                />
              )}
              <span className="text-base">🚀</span>
              <Sparkles className="h-4 w-4" />
              {content.submitSignup}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
