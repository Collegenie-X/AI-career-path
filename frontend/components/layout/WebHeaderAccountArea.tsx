'use client';

import Link from 'next/link';
import { ChevronDown, LogIn, Settings, UserRound, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { storage, type AuthProfile } from '@/lib/storage';
import webHeaderAccountContent from '@/data/layout/web-header-account.json';
import socialLoginDialogContent from '@/data/auth/social-login-dialog.json';

type WebHeaderAccountContent = {
  readonly settingsLabel: string;
  readonly profileSettingsLabel: string;
  readonly logoutLabel: string;
  readonly settingsPath: string;
  readonly profileSettingsHash: string;
  readonly memberMenuAriaLabelTemplate: string;
};

const accountLabels = webHeaderAccountContent as WebHeaderAccountContent;
const loginButtonLabel = (socialLoginDialogContent as { loginButton: string }).loginButton;

type WebHeaderAccountAreaProps = {
  readonly authProfile: AuthProfile | null;
  readonly onOpenLoginDialog: () => void;
  readonly onAuthSessionChange: () => void;
};

function buildMemberMenuAriaLabel(displayName: string): string {
  return accountLabels.memberMenuAriaLabelTemplate.replace('{{name}}', displayName);
}

export function WebHeaderAccountArea({
  authProfile,
  onOpenLoginDialog,
  onAuthSessionChange,
}: WebHeaderAccountAreaProps) {
  const displayName = authProfile?.name?.trim() || '';
  const profileSettingsHref = `${accountLabels.settingsPath}${accountLabels.profileSettingsHash}`;
  const memberAriaLabel = displayName ? buildMemberMenuAriaLabel(displayName) : loginButtonLabel;

  const handleLogout = () => {
    storage.auth.clear();
    onAuthSessionChange();
  };

  if (!authProfile || !displayName) {
    return (
      <button
        type="button"
        onClick={onOpenLoginDialog}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white md:px-3 md:text-sm"
        aria-haspopup="dialog"
        aria-label={loginButtonLabel}
      >
        <LogIn className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
        <span className="hidden sm:inline">{loginButtonLabel}</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex max-w-[min(200px,40vw)] shrink-0 items-center gap-1 rounded-lg border border-violet-500/35 bg-violet-500/15 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-500/25 md:gap-1.5 md:px-3 md:text-sm"
          aria-label={memberAriaLabel}
          aria-haspopup="menu"
        >
          <span className="truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80 md:h-4 md:w-4" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] border-white/15 bg-[rgb(26,26,46)] text-white shadow-xl"
      >
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
          <Link href={accountLabels.settingsPath} className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-violet-300" />
            {accountLabels.settingsLabel}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
          <Link href={profileSettingsHref} className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-violet-300" />
            {accountLabels.profileSettingsLabel}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer focus:bg-red-500/15 focus:text-red-200"
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          {accountLabels.logoutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
