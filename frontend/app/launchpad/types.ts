import type { SessionType, ModeType } from './config';

export type Resource = {
  id: string;
  title: string;
  url: string;
};

export type AgendaItem = {
  id: string;
  text: string;
};

export type Reply = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  replies: Reply[];
};

export type LaunchpadSession = {
  id: string;
  title: string;
  type: SessionType;
  mode: ModeType;
  description: string;
  agenda: AgendaItem[];
  date: string;
  time: string;
  location: string;
  zoomLink?: string;
  schoolName?: string;
  clubName?: string;
  isTeacherCreated?: boolean;
  teacherName?: string;
  careerPathRef?: string;
  maxParticipants: number;
  currentParticipants: number;
  hostName: string;
  tags: string[];
  resources: Resource[];
  createdAt: string;
};
