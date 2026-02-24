// ─── Job Illustrations ───────────────────────────────────────────────

export const JOB_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  'ux-designer': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ux-bg)" opacity="0.3"/>
      <rect x="25" y="30" width="70" height="50" rx="8" fill="#F59E0B" opacity="0.4"/>
      <rect x="30" y="35" width="60" height="35" rx="5" fill="white" opacity="0.15"/>
      <rect x="35" y="42" width="20" height="3" rx="1.5" fill="white" opacity="0.8"/>
      <rect x="35" y="48" width="30" height="3" rx="1.5" fill="white" opacity="0.5"/>
      <rect x="35" y="54" width="25" height="3" rx="1.5" fill="white" opacity="0.5"/>
      <rect x="70" y="42" width="14" height="14" rx="4" fill="#F59E0B" opacity="0.8"/>
      <circle cx="60" cy="90" r="6" fill="#F59E0B" opacity="0.6"/>
      <rect x="45" y="88" width="30" height="4" rx="2" fill="#F59E0B" opacity="0.3"/>
      <defs>
        <linearGradient id="ux-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'webtoon-artist': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#wt-bg)" opacity="0.3"/>
      <rect x="28" y="25" width="64" height="70" rx="6" fill="#EC4899" opacity="0.4"/>
      <rect x="33" y="30" width="54" height="25" rx="3" fill="white" opacity="0.15"/>
      <rect x="33" y="58" width="25" height="15" rx="3" fill="white" opacity="0.15"/>
      <rect x="61" y="58" width="26" height="15" rx="3" fill="white" opacity="0.15"/>
      <rect x="33" y="76" width="54" height="12" rx="3" fill="white" opacity="0.1"/>
      <circle cx="60" cy="42" r="8" fill="#EC4899" opacity="0.6"/>
      <text x="60" y="46" textAnchor="middle" fontSize="10" fill="white">✏️</text>
      <defs>
        <linearGradient id="wt-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  architect: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#arch-bg)" opacity="0.3"/>
      <polygon points="60,20 90,55 30,55" fill="#F59E0B" opacity="0.6"/>
      <rect x="35" y="55" width="50" height="40" fill="#F59E0B" opacity="0.4"/>
      <rect x="50" y="70" width="20" height="25" rx="2" fill="white" opacity="0.5"/>
      <rect x="38" y="60" width="12" height="12" rx="1" fill="white" opacity="0.3"/>
      <rect x="70" y="60" width="12" height="12" rx="1" fill="white" opacity="0.3"/>
      <line x1="20" y1="95" x2="100" y2="95" stroke="white" strokeWidth="2" opacity="0.5"/>
      <defs>
        <linearGradient id="arch-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'film-director': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#film-bg)" opacity="0.3"/>
      <rect x="20" y="35" width="65" height="50" rx="6" fill="#6366F1" opacity="0.5"/>
      <polygon points="90,60 105,50 105,70" fill="#FBBF24" opacity="0.9"/>
      <circle cx="35" cy="50" r="6" fill="white" opacity="0.3"/>
      <circle cx="35" cy="70" r="6" fill="white" opacity="0.3"/>
      <rect x="30" y="40" width="45" height="40" rx="3" fill="black" opacity="0.2"/>
      <circle cx="52" cy="60" r="12" fill="#6366F1" opacity="0.6"/>
      <polygon points="48,55 48,65 60,60" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="film-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#6366F1"/>
          <stop offset="100%" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  doctor: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#doc-bg)" opacity="0.3"/>
      <circle cx="60" cy="38" r="18" fill="#4A90D9" opacity="0.9"/>
      <path d="M30 95 C30 75 90 75 90 95" fill="#4A90D9" opacity="0.7"/>
      <rect x="52" y="60" width="16" height="28" rx="4" fill="white" opacity="0.9"/>
      <rect x="46" y="66" width="28" height="4" rx="2" fill="#4A90D9"/>
      <rect x="54" y="58" width="12" height="4" rx="2" fill="#4A90D9"/>
      <circle cx="60" cy="38" r="10" fill="white" opacity="0.3"/>
      <text x="60" y="43" textAnchor="middle" fontSize="14" fill="white">🩺</text>
      <defs>
        <linearGradient id="doc-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#4A90D9"/>
          <stop offset="100%" stopColor="#764ba2"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'ai-researcher': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ai-bg)" opacity="0.3"/>
      <rect x="30" y="30" width="60" height="60" rx="12" fill="#6C5CE7" opacity="0.4"/>
      <circle cx="45" cy="50" r="6" fill="#A78BFA"/>
      <circle cx="75" cy="50" r="6" fill="#A78BFA"/>
      <circle cx="60" cy="70" r="6" fill="#A78BFA"/>
      <line x1="45" y1="50" x2="75" y2="50" stroke="#A78BFA" strokeWidth="2"/>
      <line x1="45" y1="50" x2="60" y2="70" stroke="#A78BFA" strokeWidth="2"/>
      <line x1="75" y1="50" x2="60" y2="70" stroke="#A78BFA" strokeWidth="2"/>
      <circle cx="60" cy="40" r="8" fill="white" opacity="0.2"/>
      <text x="60" y="44" textAnchor="middle" fontSize="10" fill="white">AI</text>
      <defs>
        <linearGradient id="ai-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#6C5CE7"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  pharmacist: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ph-bg)" opacity="0.3"/>
      <rect x="40" y="35" width="40" height="55" rx="8" fill="#22C55E" opacity="0.5"/>
      <rect x="44" y="40" width="32" height="8" rx="3" fill="white" opacity="0.7"/>
      <rect x="44" y="52" width="32" height="5" rx="2" fill="white" opacity="0.4"/>
      <rect x="44" y="60" width="32" height="5" rx="2" fill="white" opacity="0.4"/>
      <rect x="44" y="68" width="20" height="5" rx="2" fill="white" opacity="0.4"/>
      <circle cx="60" cy="38" r="12" fill="#22C55E" opacity="0.8"/>
      <text x="60" y="43" textAnchor="middle" fontSize="14" fill="white">💊</text>
      <defs>
        <linearGradient id="ph-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'game-developer': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#gd-bg)" opacity="0.3"/>
      <rect x="22" y="42" width="76" height="46" rx="12" fill="#10B981" opacity="0.5"/>
      <rect x="28" y="48" width="64" height="34" rx="8" fill="black" opacity="0.3"/>
      <circle cx="42" cy="65" r="8" fill="#10B981" opacity="0.4"/>
      <line x1="42" y1="57" x2="42" y2="73" stroke="white" strokeWidth="2.5" opacity="0.8"/>
      <line x1="34" y1="65" x2="50" y2="65" stroke="white" strokeWidth="2.5" opacity="0.8"/>
      <circle cx="78" cy="60" r="4" fill="white" opacity="0.7"/>
      <circle cx="86" cy="65" r="4" fill="white" opacity="0.4"/>
      <circle cx="78" cy="70" r="4" fill="white" opacity="0.4"/>
      <circle cx="70" cy="65" r="4" fill="white" opacity="0.4"/>
      <rect x="52" y="60" width="10" height="10" rx="2" fill="#10B981" opacity="0.6"/>
      <defs>
        <linearGradient id="gd-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  cybersecurity: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#cs-bg)" opacity="0.3"/>
      <path d="M60 20 L90 35 L90 65 C90 82 75 95 60 100 C45 95 30 82 30 65 L30 35 Z" fill="#10B981" opacity="0.4"/>
      <path d="M60 28 L84 41 L84 65 C84 79 72 90 60 94 C48 90 36 79 36 65 L36 41 Z" fill="#10B981" opacity="0.2"/>
      <circle cx="60" cy="60" r="14" fill="#10B981" opacity="0.5"/>
      <path d="M54 60 L58 64 L68 54" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      <defs>
        <linearGradient id="cs-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'cybersecurity-expert': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#cse-bg)" opacity="0.3"/>
      <path d="M60 20 L90 35 L90 65 C90 82 75 95 60 100 C45 95 30 82 30 65 L30 35 Z" fill="#10B981" opacity="0.4"/>
      <path d="M60 28 L84 41 L84 65 C84 79 72 90 60 94 C48 90 36 79 36 65 L36 41 Z" fill="#10B981" opacity="0.2"/>
      <rect x="53" y="52" width="14" height="10" rx="3" fill="white" opacity="0.6"/>
      <rect x="56" y="48" width="8" height="6" rx="4" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
      <circle cx="60" cy="57" r="2" fill="#10B981"/>
      <defs>
        <linearGradient id="cse-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'data-scientist': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ds-bg)" opacity="0.3"/>
      <rect x="25" y="85" width="12" height="20" rx="3" fill="#10B981" opacity="0.8"/>
      <rect x="42" y="70" width="12" height="35" rx="3" fill="#10B981" opacity="0.7"/>
      <rect x="59" y="55" width="12" height="50" rx="3" fill="#10B981" opacity="0.9"/>
      <rect x="76" y="65" width="12" height="40" rx="3" fill="#3B82F6" opacity="0.7"/>
      <polyline points="31,82 48,67 65,52 82,62" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      <circle cx="31" cy="82" r="3" fill="white" opacity="0.9"/>
      <circle cx="48" cy="67" r="3" fill="white" opacity="0.9"/>
      <circle cx="65" cy="52" r="3" fill="white" opacity="0.9"/>
      <circle cx="82" cy="62" r="3" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="ds-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  lawyer: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#law-bg)" opacity="0.3"/>
      <rect x="55" y="20" width="10" height="70" rx="3" fill="#F97316" opacity="0.7"/>
      <rect x="30" y="42" width="60" height="6" rx="3" fill="#F97316" opacity="0.5"/>
      <ellipse cx="38" cy="58" rx="14" ry="6" fill="#F97316" opacity="0.4"/>
      <ellipse cx="82" cy="58" rx="14" ry="6" fill="#F97316" opacity="0.4"/>
      <rect x="38" y="58" width="2" height="16" rx="1" fill="#F97316" opacity="0.6"/>
      <rect x="80" y="58" width="2" height="10" rx="1" fill="#F97316" opacity="0.6"/>
      <rect x="25" y="88" width="70" height="6" rx="3" fill="#F97316" opacity="0.5"/>
      <defs>
        <linearGradient id="law-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'social-entrepreneur': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#se-bg)" opacity="0.3"/>
      <circle cx="60" cy="50" r="18" fill="#F97316" opacity="0.3"/>
      <path d="M60 32 C60 32 48 42 48 52 C48 59 53 65 60 65 C67 65 72 59 72 52 C72 42 60 32 60 32Z" fill="#F97316" opacity="0.6"/>
      <path d="M60 65 L60 90" stroke="#F97316" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <path d="M48 78 L60 72 L72 78" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="35" cy="70" r="8" fill="#F97316" opacity="0.3"/>
      <circle cx="85" cy="70" r="8" fill="#F97316" opacity="0.3"/>
      <path d="M43 70 L55 68" stroke="#F97316" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M65 68 L77 70" stroke="#F97316" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <defs>
        <linearGradient id="se-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#22C55E"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  teacher: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#tc-bg)" opacity="0.3"/>
      <rect x="20" y="35" width="80" height="55" rx="6" fill="#F97316" opacity="0.3"/>
      <rect x="25" y="40" width="70" height="45" rx="4" fill="white" opacity="0.1"/>
      <rect x="30" y="48" width="35" height="3" rx="1.5" fill="white" opacity="0.8"/>
      <rect x="30" y="55" width="50" height="2" rx="1" fill="white" opacity="0.5"/>
      <rect x="30" y="61" width="45" height="2" rx="1" fill="white" opacity="0.5"/>
      <rect x="30" y="67" width="40" height="2" rx="1" fill="white" opacity="0.5"/>
      <circle cx="85" cy="50" r="10" fill="#F97316" opacity="0.6"/>
      <path d="M80 50 L84 54 L91 46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      <rect x="50" y="90" width="20" height="4" rx="2" fill="#F97316" opacity="0.5"/>
      <defs>
        <linearGradient id="tc-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'fullstack-developer': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#fsd-bg)" opacity="0.3"/>
      <rect x="22" y="30" width="76" height="50" rx="8" fill="#10B981" opacity="0.4"/>
      <rect x="27" y="35" width="66" height="35" rx="4" fill="black" opacity="0.3"/>
      <rect x="32" y="42" width="18" height="2" rx="1" fill="#34D399" opacity="0.9"/>
      <rect x="32" y="48" width="30" height="2" rx="1" fill="#6EE7B7" opacity="0.7"/>
      <rect x="36" y="54" width="22" height="2" rx="1" fill="#6EE7B7" opacity="0.6"/>
      <rect x="32" y="60" width="14" height="2" rx="1" fill="#34D399" opacity="0.8"/>
      <circle cx="60" cy="90" r="5" fill="#10B981" opacity="0.6"/>
      <rect x="45" y="88" width="30" height="4" rx="2" fill="#10B981" opacity="0.3"/>
      <defs>
        <linearGradient id="fsd-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'social-worker': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#sw2-bg)" opacity="0.3"/>
      <circle cx="45" cy="42" r="11" fill="#F97316" opacity="0.6"/>
      <circle cx="75" cy="42" r="11" fill="#F97316" opacity="0.4"/>
      <path d="M22 88 C22 70 55 65 45 65 C35 65 22 70 22 88" fill="#F97316" opacity="0.5"/>
      <path d="M52 88 C52 70 85 65 75 65 C65 65 52 70 52 88" fill="#F97316" opacity="0.3"/>
      <circle cx="60" cy="68" r="8" fill="white" opacity="0.15"/>
      <path d="M56 68 L60 72 L66 64" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      <defs>
        <linearGradient id="sw2-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  marketer: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#mk2-bg)" opacity="0.3"/>
      <rect x="25" y="88" width="70" height="2" rx="1" fill="white" opacity="0.2"/>
      <rect x="28" y="72" width="10" height="16" rx="3" fill="#F97316" opacity="0.8"/>
      <rect x="44" y="60" width="10" height="28" rx="3" fill="#F97316" opacity="0.7"/>
      <rect x="60" y="48" width="10" height="40" rx="3" fill="#FBBF24" opacity="0.9"/>
      <rect x="76" y="56" width="10" height="32" rx="3" fill="#F97316" opacity="0.7"/>
      <polyline points="33,70 49,58 65,46 81,54" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      <circle cx="33" cy="70" r="3" fill="white" opacity="0.9"/>
      <circle cx="65" cy="46" r="3" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="mk2-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'environmental-scientist': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#env-bg)" opacity="0.3"/>
      <circle cx="60" cy="60" r="30" fill="#22C55E" opacity="0.2"/>
      <path d="M60 90 C60 90 35 75 35 55 C35 42 46 32 60 32 C74 32 85 42 85 55 C85 75 60 90 60 90Z" fill="#22C55E" opacity="0.5"/>
      <path d="M60 90 L60 55" stroke="#16A34A" strokeWidth="2" opacity="0.8"/>
      <path d="M60 65 C60 65 48 58 42 50" stroke="#16A34A" strokeWidth="1.5" opacity="0.6"/>
      <path d="M60 72 C60 72 72 65 78 57" stroke="#16A34A" strokeWidth="1.5" opacity="0.6"/>
      <defs>
        <linearGradient id="env-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  veterinarian: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#vet-bg)" opacity="0.3"/>
      <ellipse cx="60" cy="48" rx="22" ry="18" fill="#22C55E" opacity="0.5"/>
      <ellipse cx="38" cy="38" rx="10" ry="8" fill="#22C55E" opacity="0.4"/>
      <ellipse cx="82" cy="38" rx="10" ry="8" fill="#22C55E" opacity="0.4"/>
      <rect x="52" y="62" width="16" height="22" rx="8" fill="#22C55E" opacity="0.5"/>
      <rect x="55" y="70" width="10" height="2" rx="1" fill="white" opacity="0.8"/>
      <rect x="59" y="66" width="2" height="10" rx="1" fill="white" opacity="0.8"/>
      <defs>
        <linearGradient id="vet-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#16A34A"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'marine-biologist': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#mb-bg)" opacity="0.3"/>
      <path d="M20 65 Q35 50 50 65 Q65 80 80 65 Q95 50 100 60" stroke="#22C55E" strokeWidth="3" fill="none" opacity="0.7"/>
      <path d="M20 75 Q35 60 50 75 Q65 90 80 75 Q95 60 100 70" stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.4"/>
      <ellipse cx="55" cy="50" rx="18" ry="10" fill="#22C55E" opacity="0.5"/>
      <path d="M73 50 L85 44 L85 56 Z" fill="#22C55E" opacity="0.7"/>
      <circle cx="47" cy="48" r="3" fill="white" opacity="0.8"/>
      <defs>
        <linearGradient id="mb-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  accountant: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#acc-bg)" opacity="0.3"/>
      <rect x="28" y="28" width="64" height="64" rx="8" fill="#8B5CF6" opacity="0.3"/>
      <rect x="35" y="38" width="20" height="6" rx="2" fill="white" opacity="0.7"/>
      <rect x="35" y="48" width="50" height="2" rx="1" fill="white" opacity="0.3"/>
      <rect x="35" y="54" width="14" height="4" rx="1" fill="#8B5CF6" opacity="0.8"/>
      <rect x="55" y="54" width="14" height="4" rx="1" fill="#8B5CF6" opacity="0.6"/>
      <rect x="75" y="54" width="10" height="4" rx="1" fill="#8B5CF6" opacity="0.6"/>
      <rect x="35" y="62" width="14" height="4" rx="1" fill="white" opacity="0.4"/>
      <rect x="55" y="62" width="14" height="4" rx="1" fill="white" opacity="0.4"/>
      <rect x="75" y="62" width="10" height="4" rx="1" fill="#A78BFA" opacity="0.7"/>
      <rect x="35" y="70" width="50" height="2" rx="1" fill="white" opacity="0.3"/>
      <defs>
        <linearGradient id="acc-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#6D28D9"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'police-detective': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#pd-bg)" opacity="0.3"/>
      <circle cx="52" cy="52" r="20" fill="none" stroke="#8B5CF6" strokeWidth="4" opacity="0.7"/>
      <line x1="66" y1="66" x2="85" y2="85" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
      <circle cx="52" cy="52" r="12" fill="#8B5CF6" opacity="0.3"/>
      <circle cx="52" cy="52" r="5" fill="#A78BFA" opacity="0.8"/>
      <defs>
        <linearGradient id="pd-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  journalist: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#jn-bg)" opacity="0.3"/>
      <rect x="25" y="28" width="70" height="64" rx="6" fill="#EC4899" opacity="0.3"/>
      <rect x="32" y="36" width="30" height="4" rx="2" fill="white" opacity="0.8"/>
      <rect x="32" y="44" width="56" height="2" rx="1" fill="white" opacity="0.5"/>
      <rect x="32" y="50" width="56" height="2" rx="1" fill="white" opacity="0.4"/>
      <rect x="32" y="56" width="40" height="2" rx="1" fill="white" opacity="0.4"/>
      <rect x="32" y="64" width="56" height="2" rx="1" fill="white" opacity="0.3"/>
      <rect x="32" y="70" width="48" height="2" rx="1" fill="white" opacity="0.3"/>
      <circle cx="80" cy="40" r="12" fill="#EC4899" opacity="0.6"/>
      <text x="80" y="44" textAnchor="middle" fontSize="12" fill="white">📰</text>
      <defs>
        <linearGradient id="jn-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'pd-director': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#pd2-bg)" opacity="0.3"/>
      <rect x="20" y="35" width="65" height="50" rx="6" fill="#EC4899" opacity="0.4"/>
      <polygon points="90,60 105,50 105,70" fill="#FBBF24" opacity="0.9"/>
      <rect x="26" y="41" width="53" height="38" rx="3" fill="black" opacity="0.2"/>
      <circle cx="52" cy="60" r="12" fill="#EC4899" opacity="0.5"/>
      <polygon points="48,55 48,65 60,60" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="pd2-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  announcer: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ann-bg)" opacity="0.3"/>
      <circle cx="60" cy="45" r="14" fill="#EC4899" opacity="0.5"/>
      <rect x="52" y="55" width="16" height="20" rx="8" fill="#EC4899" opacity="0.6"/>
      <path d="M44 65 C44 75 76 75 76 65" fill="none" stroke="#EC4899" strokeWidth="2.5" opacity="0.8"/>
      <rect x="58" y="75" width="4" height="10" rx="2" fill="#EC4899" opacity="0.7"/>
      <rect x="50" y="83" width="20" height="3" rx="1.5" fill="#EC4899" opacity="0.5"/>
      <circle cx="60" cy="45" r="6" fill="white" opacity="0.3"/>
      <defs>
        <linearGradient id="ann-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#F97316"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  entrepreneur: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ent-bg)" opacity="0.3"/>
      <path d="M60 95 L60 40" stroke="#EF4444" strokeWidth="3" opacity="0.6"/>
      <path d="M60 40 L45 55 M60 40 L75 55" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <circle cx="60" cy="35" r="10" fill="#EF4444" opacity="0.7"/>
      <circle cx="35" cy="70" r="8" fill="#EF4444" opacity="0.4"/>
      <circle cx="85" cy="70" r="8" fill="#EF4444" opacity="0.4"/>
      <line x1="43" y1="70" x2="52" y2="65" stroke="#EF4444" strokeWidth="2" opacity="0.6"/>
      <line x1="68" y1="65" x2="77" y2="70" stroke="#EF4444" strokeWidth="2" opacity="0.6"/>
      <defs>
        <linearGradient id="ent-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="100%" stopColor="#F97316"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'pro-athlete': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#ath-bg)" opacity="0.3"/>
      <polygon points="60,20 72,52 105,52 79,71 89,103 60,84 31,103 41,71 15,52 48,52" fill="#EF4444" opacity="0.5"/>
      <polygon points="60,30 69,55 95,55 74,69 82,95 60,80 38,95 46,69 25,55 51,55" fill="#FBBF24" opacity="0.4"/>
      <circle cx="60" cy="60" r="12" fill="#EF4444" opacity="0.6"/>
      <defs>
        <linearGradient id="ath-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="100%" stopColor="#FBBF24"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  'space-engineer': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="56" fill="url(#sp-bg)" opacity="0.3"/>
      <path d="M60 95 L52 75 L40 72 L52 65 L48 45 L60 55 L72 45 L68 65 L80 72 L68 75 Z" fill="#EF4444" opacity="0.6"/>
      <ellipse cx="60" cy="72" rx="12" ry="6" fill="#EF4444" opacity="0.4"/>
      <circle cx="60" cy="52" r="8" fill="#FBBF24" opacity="0.7"/>
      <path d="M45 80 Q40 90 35 95" stroke="#EF4444" strokeWidth="2" opacity="0.5"/>
      <path d="M75 80 Q80 90 85 95" stroke="#EF4444" strokeWidth="2" opacity="0.5"/>
      <circle cx="25" cy="30" r="2" fill="white" opacity="0.6"/>
      <circle cx="90" cy="25" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="95" cy="45" r="2" fill="white" opacity="0.4"/>
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
    </svg>
  ),
};
