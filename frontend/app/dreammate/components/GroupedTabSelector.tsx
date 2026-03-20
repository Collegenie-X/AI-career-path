'use client';

import { useId } from 'react';

export interface GroupedTabOption<TValue extends string> {
  id: TValue;
  label: string;
  emoji?: string;
}

interface GroupedTabSelectorProps<TValue extends string> {
  groupLabel: string;
  value: TValue;
  options: ReadonlyArray<GroupedTabOption<TValue>>;
  onChange: (nextValue: TValue) => void;
  containerClassName?: string;
}

export function GroupedTabSelector<TValue extends string>({
  groupLabel,
  value,
  options,
  onChange,
  containerClassName = '',
}: GroupedTabSelectorProps<TValue>) {
  const inputGroupName = useId();

  return (
    <fieldset
      className={`flex items-center gap-1.5 rounded-2xl p-1 ${containerClassName}`.trim()}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <legend className="sr-only">{groupLabel}</legend>
      {options.map(option => {
        const isActive = value === option.id;

        return (
          <label
            key={option.id}
            role="tab"
            aria-selected={isActive}
            className="flex-1 h-10 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            style={isActive
              ? {
                  background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(108,92,231,0.28)',
                }
              : {
                  color: 'rgba(255,255,255,0.45)',
                }}
          >
            <input
              type="radio"
              className="sr-only"
              name={inputGroupName}
              value={option.id}
              checked={isActive}
              onChange={() => onChange(option.id)}
            />
            {option.emoji ? <span>{option.emoji}</span> : null}
            <span className="truncate">{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
