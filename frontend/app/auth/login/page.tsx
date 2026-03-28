'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { emailLoginApi, emailSignupApi } from '@/lib/auth/authApi';
import { setAccessToken, setRefreshToken } from '@/lib/auth/jwtStorage';

type AuthMode = 'login' | 'signup';

/** User.GRADE_CHOICES 와 동일한 value (백엔드 검증 통과) */
const GRADE_OPTIONS = [
  { value: 'elementary_4', label: '초등학교 4학년' },
  { value: 'elementary_5', label: '초등학교 5학년' },
  { value: 'elementary_6', label: '초등학교 6학년' },
  { value: 'middle_1', label: '중학교 1학년' },
  { value: 'middle_2', label: '중학교 2학년' },
  { value: 'middle_3', label: '중학교 3학년' },
  { value: 'high_1', label: '고등학교 1학년' },
  { value: 'high_2', label: '고등학교 2학년' },
  { value: 'high_3', label: '고등학교 3학년' },
];

const EMOJI_OPTIONS = ['👤', '😊', '🎓', '🚀', '⭐', '💫', '🌟', '✨', '🎯', '🔥', '💡', '🎨', '🧪', '📚', '🏆'];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('high_1');
  const [emoji, setEmoji] = useState('👤');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const response = await emailSignupApi({
          email,
          password,
          name,
          grade,
          emoji,
        });
        setAccessToken(response.access_token);
        setRefreshToken(response.refresh_token);
        router.push('/career');
      } else {
        const response = await emailLoginApi({
          email,
          password,
        });
        setAccessToken(response.access_token);
        setRefreshToken(response.refresh_token);
        router.push('/career');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('400')) {
          setError(mode === 'signup' ? '이미 등록된 이메일입니다.' : '이메일 또는 비밀번호를 확인해주세요.');
        } else if (err.message.includes('401')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setError('오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 37.3) % 100}%`,
              top: `${(i * 51.7) % 100}%`,
              width: (i % 3) + 1,
              height: (i % 3) + 1,
              opacity: 0.1,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div
          className="rounded-2xl p-8 border"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
            borderColor: 'rgba(255,255,255,0.12)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? '로그인' : '회원가입'}
            </h1>
            <p className="text-sm text-white/60">
              {mode === 'login' ? '커리어 패스를 관리하세요' : '새로운 계정을 만드세요'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">이름</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">학년</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    {GRADE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-800">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">프로필 이모지</label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all"
                        style={{
                          background: emoji === e ? 'linear-gradient(135deg, #6C5CE7, #a855f7)' : 'rgba(255,255,255,0.1)',
                          border: emoji === e ? '2px solid rgba(108,92,231,0.5)' : '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '8자 이상 입력하세요' : '비밀번호'}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isLoading ? 'rgba(108,92,231,0.5)' : 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(108,92,231,0.4)',
              }}
            >
              {isLoading ? (
                <span>처리 중...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? '로그인' : '회원가입'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
              <span className="font-bold text-purple-400">
                {mode === 'login' ? '회원가입' : '로그인'}
              </span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button
              onClick={() => router.push('/career')}
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              로그인 없이 둘러보기 →
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/40">
          테스트용 계정: test@example.com / password123
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
