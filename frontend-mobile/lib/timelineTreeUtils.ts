export interface TimeSortableRecord {
  createdAt: string;
}

export interface ParentTreeRecord extends TimeSortableRecord {
  id: string;
  parentId?: string | null;
}

export interface MonthTimelineRecord {
  months: number[];
}

export type ParentTreeNode<T extends ParentTreeRecord> = T & {
  children: ParentTreeNode<T>[];
};

function toTime(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortByCreatedAtAscending<T extends TimeSortableRecord>(records: T[]): T[] {
  return [...records].sort((left, right) => toTime(left.createdAt) - toTime(right.createdAt));
}

export function sortByCreatedAtDescending<T extends TimeSortableRecord>(records: T[]): T[] {
  return [...records].sort((left, right) => toTime(right.createdAt) - toTime(left.createdAt));
}

export function buildChronologicalParentTree<T extends ParentTreeRecord>(
  records: T[],
): ParentTreeNode<T>[] {
  const groupedChildrenByParent = new Map<string, T[]>();
  const rootRecords: T[] = [];

  records.forEach(record => {
    if (!record.parentId) {
      rootRecords.push(record);
      return;
    }
    const siblings = groupedChildrenByParent.get(record.parentId) ?? [];
    siblings.push(record);
    groupedChildrenByParent.set(record.parentId, siblings);
  });

  const attachChildren = (record: T): ParentTreeNode<T> => {
    const sortedChildren = sortByCreatedAtAscending(groupedChildrenByParent.get(record.id) ?? []);
    return {
      ...record,
      children: sortedChildren.map(attachChildren),
    };
  };

  return sortByCreatedAtAscending(rootRecords).map(attachChildren);
}

export function sortByEarliestMonth<T extends MonthTimelineRecord>(records: T[]): T[] {
  return [...records].sort((left, right) => {
    const leftMonth = left.months.length > 0 ? Math.min(...left.months) : 13;
    const rightMonth = right.months.length > 0 ? Math.min(...right.months) : 13;
    return leftMonth - rightMonth;
  });
}

