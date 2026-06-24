export type AppScreen = 'about' | 'experience' | 'projects' | null;
export type AppTransition = 'Spring' | 'Smooth' | 'Snappy';

export interface Skill {
  name: string;
  d: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface TimelineJob {
  period: string;
  current: boolean;
  dot: string;
  title: string;
  points: string[];
  d: string;
}

export interface Highlight {
  stat: string;
  label: string;
  d: string;
}

export interface Project {
  name: string;
  tag: string;
  img: string;
  desc: string;
  features: string[];
  tech: string[];
  github: string;
  demo: string;
  d: string;
  category: 'ai' | 'engineering';
  featured?: boolean;
}
