'use client';

import { Map, Share2, Users } from 'lucide-react';
import { LABELS } from '../config';

export type CareerPathListColumnDashboardVariant = 'my-path' | 'community';

type CareerPathListColumnDashboardHeaderProps = {
  readonly variant: CareerPathListColumnDashboardVariant;
  readonly statPrimaryValue: number;
  readonly statSecondaryValue: number;
};

const MY_PATH_PRIMARY_COLOR = '#6C5CE7';
const MY_PATH_SECONDARY_COLOR = '#3B82F6';
const COMMUNITY_PRIMARY_COLOR = '#6C5CE7';
const COMMUNITY_SECONDARY_COLOR = '#22C55E';

export function CareerPathListColumnDashboardHeader({
  variant,
  statPrimaryValue,
  statSecondaryValue,
}: CareerPathListColumnDashboardHeaderProps) {
  const isMyPath = variant === 'my-path';

  const title = String(
    isMyPath
      ? LABELS.my_path_dashboard_title ?? '내 패스 기록'
      : LABELS.community_list_dashboard_title ?? '커뮤니티 탐색',
  );
  const subtitle = String(
    isMyPath
      ? LABELS.my_path_dashboard_subtitle ?? ''
      : LABELS.community_list_dashboard_subtitle ?? '',
  );

  const primaryLabel = String(
    isMyPath
      ? LABELS.my_path_dashboard_stat_plans_label ?? '내 패스'
      : LABELS.community_list_dashboard_stat_shared_label ?? '공유 패스',
  );
  const secondaryLabel = String(
    isMyPath
      ? LABELS.my_path_dashboard_stat_public_label ?? '공개 공유'
      : LABELS.community_list_dashboard_stat_groups_label ?? '참여 그룹',
  );

  const PrimaryIcon = isMyPath ? Map : Share2;
  const SecondaryIcon = isMyPath ? Share2 : Users;

  const primaryColor = isMyPath ? MY_PATH_PRIMARY_COLOR : COMMUNITY_PRIMARY_COLOR;
  const secondaryColor = isMyPath ? MY_PATH_SECONDARY_COLOR : COMMUNITY_SECONDARY_COLOR;

  return (
    <div className="space-y-4 pb-1">
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle.length > 0 && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: primaryLabel,
            count: statPrimaryValue,
            Icon: PrimaryIcon,
            color: primaryColor,
          },
          {
            label: secondaryLabel,
            count: statSecondaryValue,
            Icon: SecondaryIcon,
            color: secondaryColor,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col items-center gap-1 py-4 rounded-xl"
            style={{
              backgroundColor: `${card.color}08`,
              border: `1px solid ${card.color}20`,
            }}
          >
            <card.Icon className="w-5 h-5" style={{ color: card.color }} aria-hidden />
            <span className="text-lg font-black text-white">{card.count}</span>
            <span className="text-sm text-gray-400 text-center px-1">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
