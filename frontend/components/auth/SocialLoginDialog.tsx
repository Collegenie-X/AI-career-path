'use client';

import { useCallback, useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import socialLoginDialogContent from '@/data/auth/social-login-dialog.json';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type GradeOption = { value: string; label: string };
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

export function SocialLoginDialog({ open, onOpenChange }: SocialLoginDialogProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const reset = useCallback(() => {
    setProfile(null);
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
          <div className="mb-1.5 inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(139,92,246,0.25)', color: '#c4b5fd' }}>
            <Sparkles className="h-3 w-3" />
            Stage · Entry
          </div>
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
          <div className="relative space-y-4 px-5 pb-7 pt-4 sm:px-6">
            <p className="text-sm font-bold text-white">{content.profileStepTitle}</p>
            <p className="text-[13px] text-gray-400">{content.profileStepDescription}</p>
            <div className="space-y-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-gray-500">{content.fields.email}</span>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border px-3 py-2.5 text-sm text-white/60 opacity-75 transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(139,92,246,0.2)' }}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-gray-500">{content.fields.name}</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => (p ? { ...p, name: e.target.value } : null))}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(139,92,246,0.25)' }}
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-gray-500">{content.fields.grade}</span>
                <select
                  value={profile.grade}
                  onChange={(e) => setProfile((p) => (p ? { ...p, grade: e.target.value } : null))}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(139,92,246,0.25)' }}
                >
                  {content.gradeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={handleSubmitProfile}
              className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
                boxShadow: '0 4px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(167,139,250,0.4)',
              }}
            >
              {content.submitSignup}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
