'use client';

import type { DreamItemType } from '../../types';

export interface RoadmapEditorDreamItemTypeOption {
  value: DreamItemType;
  label: string;
  color: string;
  emoji: string;
}

interface RoadmapEditorDreamItemTypeToggleGridProps {
  options: readonly RoadmapEditorDreamItemTypeOption[];
  selectedValues: readonly DreamItemType[];
  onToggle: (itemType: DreamItemType) => void;
}

export function RoadmapEditorDreamItemTypeToggleGrid({
  options,
  selectedValues,
  onToggle,
}: RoadmapEditorDreamItemTypeToggleGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(itemType => {
        const isSelected = selectedValues.includes(itemType.value);
        return (
          <button
            key={itemType.value}
            type="button"
            onClick={() => onToggle(itemType.value)}
            className={`h-11 px-3 rounded-xl text-sm font-semibold text-left transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
              isSelected
                ? 'text-white'
                : 'text-white/55 bg-white/[0.05] hover:bg-white/[0.08]'
            }`}
            style={
              isSelected
                ? {
                    background: `linear-gradient(145deg, ${itemType.color}38, ${itemType.color}12)`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  }
                : undefined
            }
          >
            {itemType.emoji} {itemType.label}
          </button>
        );
      })}
    </div>
  );
}
