'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import { StarProfilePanel, StarProfileSummary } from '@/components/star-profile-panel';
import exploreStar from '@/data/stars/explore-star.json';
import createStar from '@/data/stars/create-star.json';
import techStar from '@/data/stars/tech-star.json';
import connectStar from '@/data/stars/connect-star.json';
import natureStar from '@/data/stars/nature-star.json';
import orderStar from '@/data/stars/order-star.json';
import communicateStar from '@/data/stars/communicate-star.json';
import challengeStar from '@/data/stars/challenge-star.json';
import {
  Sparkles, ChevronRight, ChevronLeft, Star,
  Clock, TrendingUp, ArrowRight, Play,
  BookOpen, Briefcase, X, Zap,
  Calendar, Target, Trophy,
} from 'lucide-react';

type StarData = typeof exploreStar;
type Job = StarData['jobs'][0];
type WorkPhase = Job['workProcess']['phases'][0]; // used in PhaseIllustration

/* ─── Inline SVG Illustrations per job ─── */
const JOB_ILLUSTRATIONS: Record<string, React.ReactNode> = {
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
  /* ── 자연의 별 ── */
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
  /* ── 질서의 별 ── */
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
  /* ── 소통의 별 ── */
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
  /* ── 도전의 별 ── */
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

/* ─── Phase big icons ─── */
const PHASE_BG_COLORS: Record<number, string> = {
  1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  5: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};

/* ─── Star Field ─── */
function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: ((i * 137.5) % 100),
    y: ((i * 97.3) % 100),
    size: (i % 3) + 1,
    delay: (i * 0.4) % 4,
    dur: 2 + (i % 3),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size, opacity: 0.25,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Star Card ─── */
function StarCard({ star, onClick, index }: { star: StarData; onClick: () => void; index: number }) {
  return (
    <button
      className="relative rounded-3xl overflow-hidden text-left w-full transition-all duration-300 active:scale-95 group"
      style={{
        background: `linear-gradient(135deg, ${star.bgColor}ee 0%, ${star.bgColor}aa 100%)`,
        border: `2px solid ${star.color}44`,
        boxShadow: `0 8px 32px ${star.color}33`,
        animation: `slide-up 0.5s ease-out ${index * 0.08}s both`,
      }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 50%, ${star.color}33, transparent 70%)` }}
      />
      <div className="relative p-5 h-48 flex flex-col">
        <div className="flex items-start justify-between mb-auto">
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            style={{ backgroundColor: `${star.color}33`, color: star.color, border: `1px solid ${star.color}66` }}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>직업 {star.jobCount}개</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center my-3">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-2 group-hover:scale-110 transition-transform"
            style={{ background: `${star.color}22`, boxShadow: `0 0 20px ${star.color}44` }}
          >
            {star.emoji}
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-white text-lg mb-1">{star.name}</h3>
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: `${star.color}dd` }}>
            {star.description}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── Job Card ─── */
function JobCard({ job, color, onClick }: { job: Job; color: string; onClick: () => void }) {
  const illus = JOB_ILLUSTRATIONS[job.id];
  return (
    <button
      className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] group overflow-hidden relative"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)` }}
      onClick={onClick}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${color}11, transparent)` }}
      />
      {/* Illustration / Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${color}44, ${color}22)`, border: `1px solid ${color}55` }}
      >
        {illus ? (
          <div className="w-full h-full p-1">{illus}</div>
        ) : (
          <span className="text-3xl">{job.icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 relative">
        <div className="font-bold text-white text-base mb-0.5">{job.name}</div>
        <div className="text-xs text-gray-400 line-clamp-1 mb-2">{job.shortDesc}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${color}22`, color }}>
            {job.holland}
          </span>
          <span className="text-[10px] text-gray-500">💰 {job.salaryRange.split('~')[0]}~</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5" style={{ color: i < job.futureGrowth ? '#FBBF24' : '#333', fill: i < job.futureGrowth ? '#FBBF24' : 'none' }} />
            ))}
          </div>
        </div>
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative group-hover:scale-110 transition-transform"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 0 12px ${color}66` }}
      >
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
    </button>
  );
}

/* ─── Phase Illustration ─── */
function PhaseIllustration({ phase, jobId, color }: { phase: WorkPhase; jobId: string; color: string }) {
  const bgGrad = PHASE_BG_COLORS[phase.id] ?? `linear-gradient(135deg, ${color}, ${color}88)`;
  return (
    <div
      className="w-full rounded-3xl flex flex-col items-center justify-center py-10 mb-5 relative overflow-hidden"
      style={{ background: bgGrad, minHeight: 200 }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white/30" style={{ animation: 'twinkle 2s ease-in-out infinite' }} />
      <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-white/40" style={{ animation: 'twinkle 3s ease-in-out 1s infinite' }} />
      <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-white/20" style={{ animation: 'twinkle 2.5s ease-in-out 0.5s infinite' }} />

      {/* Big icon */}
      <div
        className="text-7xl mb-4 relative z-10"
        style={{ animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
      >
        {phase.icon}
      </div>

      {/* Phase badge */}
      <div className="relative z-10 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
        <span className="text-white font-bold text-sm">{phase.phase}</span>
      </div>

      {/* Step indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <span className="text-white/60 text-xs font-bold">STEP {phase.id}</span>
      </div>
    </div>
  );
}

/* ─── Job Detail Modal ─── */
function JobDetailModal({ job, star, onClose }: { job: Job; star: StarData; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'process' | 'timeline'>('process');
  const [processStep, setProcessStep] = useState(0);

  const phases = job.workProcess.phases;
  const currentPhase = phases[processStep];
  const isLastPhase = processStep === phases.length - 1;
  const milestones = job.careerTimeline.milestones;

  return (
    /* Full-screen overlay — centers at 430px on desktop */
    <div className="fixed inset-0 z-50 flex justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      {/* Card — fixed mobile width */}
      <div
        className="relative flex flex-col w-full max-w-[430px]"
        style={{
          height: '100dvh',
          background: 'linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 pb-3 border-b border-white/10"
          style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))', background: 'rgba(18,18,42,0.98)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${star.color}55, ${star.color}22)`, border: `1.5px solid ${star.color}66` }}
            >
              {JOB_ILLUSTRATIONS[job.id] ? (
                <div className="w-full h-full p-1">{JOB_ILLUSTRATIONS[job.id]}</div>
              ) : (
                <span>{job.icon}</span>
              )}
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight">{job.name}</div>
              <div className="text-xs flex items-center gap-1.5 mt-0.5">
                <span style={{ color: star.color }}>{star.name}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400">{job.holland}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex-shrink-0 px-4 py-2.5 flex gap-2" style={{ background: 'rgba(18,18,42,0.95)' }}>
          {[
            { key: 'process' as const, label: '직무 프로세스', icon: Briefcase },
            { key: 'timeline' as const, label: '커리어 패스', icon: Calendar },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${star.color}, ${star.color}bb)`, color: '#fff', boxShadow: `0 4px 12px ${star.color}55` }
                  : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
                onClick={() => setActiveTab(t.key)}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'process' ? (
            <div className="px-4 pt-2 pb-4">
              {/* Progress bar */}
              <div className="flex gap-1.5 mb-1">
                {phases.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all duration-500"
                    style={{ backgroundColor: i <= processStep ? star.color : 'rgba(255,255,255,0.1)' }}
                  />
                ))}
              </div>
              <div className="text-[11px] text-gray-500 mb-3">
                {processStep + 1} / {phases.length} 단계
              </div>

              {/* Big illustration */}
              <PhaseIllustration phase={currentPhase} jobId={job.id} color={star.color} />

              {/* Title + desc */}
              <div className="mb-4">
                <h3 className="text-white font-bold text-2xl mb-2 leading-tight">{currentPhase.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{currentPhase.description}</p>
              </div>

              {/* Duration */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4"
                style={{ background: `${star.color}15`, border: `1px solid ${star.color}33` }}
              >
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: star.color }} />
                <span className="text-sm font-semibold text-white">소요 시간</span>
                <span className="ml-auto text-sm font-bold" style={{ color: star.color }}>{currentPhase.duration}</span>
              </div>

              {/* Example */}
              {currentPhase.example && (
                <div
                  className="rounded-2xl p-4 mb-4 relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="absolute top-3 right-3 text-2xl opacity-20">💡</div>
                  <div className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
                    <span className="text-base">💡</span> 실제 예시
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{currentPhase.example}</p>
                </div>
              )}

              {/* Tools */}
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" /> 사용 도구
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentPhase.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> 필요 스킬
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentPhase.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: `${star.color}22`, color: star.color, border: `1px solid ${star.color}44` }}
                    >
                      ⚡ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last step summary */}
              {isLastPhase && (
                <div
                  className="rounded-2xl p-4 mt-2"
                  style={{ background: `linear-gradient(135deg, ${star.color}22, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
                >
                  <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: star.color }} />
                    직업 종합 정보
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">연봉</span>
                      <span className="text-white font-semibold">{job.salaryRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI 대체 위험</span>
                      <span className="font-semibold" style={{ color: star.color }}>{job.aiRisk}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">미래 성장성</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5" style={{ color: i < job.futureGrowth ? '#FBBF24' : '#333', fill: i < job.futureGrowth ? '#FBBF24' : 'none' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Career Timeline ── */
            <div className="px-4 pt-3 pb-6">
              {/* Header */}
              <div
                className="rounded-2xl p-4 mb-5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${star.color}33, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
              >
                <div className="absolute -right-4 -top-4 text-8xl opacity-10">{job.icon}</div>
                <div className="text-white font-bold text-lg mb-1">{job.careerTimeline.title}</div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{job.careerTimeline.totalYears}</span>
                  <span className="flex items-center gap-1">💰 총 {job.careerTimeline.totalCost}</span>
                </div>
              </div>

              {/* Milestones */}
              <div className="relative">
                {/* Vertical line */}
                <div
                  className="absolute left-[22px] top-0 bottom-0 w-0.5"
                  style={{ background: `linear-gradient(to bottom, ${star.color}88, ${star.color}11)` }}
                />

                <div className="space-y-1">
                  {milestones.map((m, i) => {
                    const isHighSchool = m.period.startsWith('고');
                    const isMiddle = m.period.startsWith('중');
                    const isGrad = m.awards && m.awards.some(a => a.includes('합격'));
                    return (
                      <div key={i} className="flex gap-3 relative">
                        {/* Node */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 z-10 relative"
                          style={{
                            background: isGrad
                              ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                              : isHighSchool
                                ? `linear-gradient(135deg, ${star.color}, ${star.color}88)`
                                : isMiddle
                                  ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                                  : 'linear-gradient(135deg, #10B981, #059669)',
                            boxShadow: isGrad ? '0 0 16px #FBBF2466' : `0 0 8px ${star.color}44`,
                          }}
                        >
                          {m.icon}
                        </div>

                        {/* Content */}
                        <div
                          className="flex-1 rounded-2xl p-3 mb-2"
                          style={{
                            background: isGrad
                              ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))'
                              : 'rgba(255,255,255,0.03)',
                            border: isGrad
                              ? '1.5px solid rgba(251,191,36,0.4)'
                              : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: isHighSchool ? `${star.color}33` : isMiddle ? '#8B5CF633' : '#10B98133',
                                color: isHighSchool ? star.color : isMiddle ? '#A78BFA' : '#34D399',
                              }}
                            >
                              {m.period} {m.semester}
                            </span>
                            {m.cost && <span className="text-[10px] text-gray-600">💰 {m.cost}</span>}
                          </div>

                          <div className="font-bold text-white text-sm mb-1">{m.title}</div>
                          <div className="text-xs text-gray-400 leading-relaxed mb-1.5">
                            {m.activities.join(' · ')}
                          </div>

                          {m.awards && m.awards.length > 0 && (
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              {m.awards.map((a, ai) => (
                                <span key={ai} className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                                  <Trophy className="w-3 h-3" /> {a}
                                </span>
                              ))}
                            </div>
                          )}

                          {m.setak && (
                            <div
                              className="mt-2 p-2.5 rounded-xl"
                              style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.25)' }}
                            >
                              <div className="text-[9px] font-bold text-purple-400 mb-0.5 uppercase tracking-wider">세특 포인트</div>
                              <div className="text-xs text-gray-300 leading-relaxed">{m.setak}</div>
                            </div>
                          )}

                          <div className="mt-2 text-xs font-bold flex items-center gap-1" style={{ color: star.color }}>
                            <span>✓</span> {m.achievement}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key success */}
              <div
                className="mt-4 rounded-2xl p-4"
                style={{ background: `linear-gradient(135deg, ${star.color}22, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
              >
                <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: star.color }} />
                  핵심 성공 지표
                </div>
                <div className="space-y-2">
                  {job.careerTimeline.keySuccess.map((k, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${star.color}33` }}>
                        <span className="text-[10px]">✓</span>
                      </div>
                      <span className="text-sm text-gray-300">{k}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500 flex items-center justify-between">
                  <span>총 예상 비용</span>
                  <span className="font-bold text-white">{job.careerTimeline.totalCost}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Controls (process tab only) ── */}
        {activeTab === 'process' && (
          <div
            className="flex-shrink-0 px-4 pt-3 flex gap-3 border-t border-white/10"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))', background: 'rgba(13,13,26,0.98)' }}
          >
            {processStep > 0 && (
              <button
                className="h-12 px-5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                onClick={() => setProcessStep(s => s - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
            )}
            {!isLastPhase ? (
              <button
                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${star.color}, ${star.color}bb)`, boxShadow: `0 4px 16px ${star.color}55` }}
                onClick={() => setProcessStep(s => s + 1)}
              >
                다음 단계
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', boxShadow: '0 4px 16px rgba(251,191,36,0.4)' }}
                onClick={() => { setActiveTab('timeline'); setProcessStep(0); }}
              >
                <Trophy className="w-4 h-4" />
                커리어 패스 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function JobsExplorePage() {
  const router = useRouter();
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStarProfile, setShowStarProfile] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stars = [exploreStar, createStar, techStar, connectStar, natureStar, orderStar, communicateStar, challengeStar] as StarData[];

  return (
    /* Centered mobile container */
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ paddingBottom: 'calc(65px + env(safe-area-inset-bottom, 0px))' }}
    >
      <StarField />

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: 'rgba(18,18,42,0.97)' }}
      >
        <div className="flex items-center gap-3">
          {selectedStar && (
            <button
              className="w-8 h-8 rounded-full bg-white/10 active:bg-white/20 flex items-center justify-center flex-shrink-0"
              onClick={() => setSelectedStar(null)}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              {selectedStar ? `${selectedStar.emoji} ${selectedStar.name}` : 'Job 간접 경험'}
            </h1>
            <p className="text-xs text-gray-400">
              {selectedStar
                ? `${selectedStar.jobCount}개 직업 프로세스 & 커리어 패스`
                : '8개 별의 직업 세계를 탐험하세요'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 py-5 space-y-4">
        {!selectedStar ? (
          <>
            {/* Intro Banner */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.3) 0%, rgba(59,130,246,0.2) 100%)', border: '2px solid rgba(108,92,231,0.4)' }}
            >
              <div className="absolute top-3 right-4 text-6xl opacity-10">🌌</div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">직업 세계 탐험</span>
              </div>
              <p className="text-base text-white font-semibold mb-1">별을 선택하고 직업을 체험하세요</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                실제 <span className="text-white font-bold">직무 프로세스</span>와 <span className="text-white font-bold">커리어 패스</span>를 게임처럼 경험해보세요!
              </p>
            </div>

            {/* Star Grid */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 8개 별 선택
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {stars.map((s, i) => (
                  <StarCard key={s.id} star={s} index={i} onClick={() => setSelectedStar(s)} />
                ))}
                {[...Array(8 - stars.length)].map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="rounded-3xl h-48 flex flex-col items-center justify-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}
                  >
                    <div className="text-3xl opacity-20">🌟</div>
                    <div className="text-xs text-gray-700 font-semibold">준비 중</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Star Info Banner */}
            <div
              className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${selectedStar.bgColor}ee, ${selectedStar.bgColor}88)`, border: `2px solid ${selectedStar.color}55` }}
            >
              <div className="absolute -right-4 -top-4 text-8xl opacity-10">{selectedStar.emoji}</div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${selectedStar.color}33`, border: `2px solid ${selectedStar.color}66` }}
              >
                {selectedStar.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-lg">{selectedStar.name}</div>
                <div className="text-xs leading-relaxed mt-0.5" style={{ color: `${selectedStar.color}cc` }}>
                  {selectedStar.description}
                </div>
              </div>
            </div>

            {/* Star Profile Summary — tap to open detail panel */}
            {'starProfile' in selectedStar && selectedStar.starProfile && (
              <StarProfileSummary
                star={selectedStar as Parameters<typeof StarProfileSummary>[0]['star']}
                onOpenDetail={() => setShowStarProfile(true)}
              />
            )}

            {/* Jobs */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> {selectedStar.jobCount}개 직업 체험
              </h2>
              <div className="space-y-3">
                {selectedStar.jobs.map(job => (
                  <JobCard key={job.id} job={job} color={selectedStar.color} onClick={() => setSelectedJob(job)} />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.1))', border: '1.5px solid rgba(108,92,231,0.35)' }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">커리어 패스 만들기</div>
                <div className="text-xs text-gray-400">이 별 직업의 활동·수상 계획 세우기</div>
              </div>
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
                onClick={() => router.push(`/career?star=${selectedStar.id}`)}
              >
                시작
              </button>
            </div>
          </>
        )}
      </div>

      {!selectedJob && <TabBar />}

      {/* Job Detail Modal */}
      {selectedJob && selectedStar && (
        <JobDetailModal job={selectedJob} star={selectedStar} onClose={() => setSelectedJob(null)} />
      )}

      {/* Star Profile Panel */}
      {showStarProfile && selectedStar && 'starProfile' in selectedStar && selectedStar.starProfile && (
        <StarProfilePanel
          star={selectedStar as Parameters<typeof StarProfilePanel>[0]['star']}
          onClose={() => setShowStarProfile(false)}
        />
      )}
    </div>
  );
}
