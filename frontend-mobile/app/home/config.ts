import homeContent from '@/data/home-content.json';

export type WhyStructureItem = {
  readonly id: string;
  readonly icon: string;
  readonly emoji: string;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly color: string;
};

export type WhyStructureData = {
  readonly title: string;
  readonly subtitle: string;
  readonly items: readonly WhyStructureItem[];
  readonly footer: string;
};

export const WHY_STRUCTURE = homeContent.whyThisStructure as WhyStructureData;
