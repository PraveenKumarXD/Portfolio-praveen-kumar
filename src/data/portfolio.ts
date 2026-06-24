import type { Skill, SkillGroup, TimelineJob, Highlight, Project } from '../types';

export const GITHUB_URL = 'https://github.com/Prav3in';

export const skills: Skill[] = [
  'Prompt Engineering', 'Agentic Systems', 'Workflow Orchestration',
  'Structured Outputs', 'Context Engineering', 'LLM Evaluation',
  'TypeScript', 'Python', 'LangChain', 'LangGraph',
  'Appium', 'Playwright', 'WebdriverIO', 'Docker', 'GitHub Actions',
].map((name, i) => ({ name, d: `${i * 50}ms` }));

export const skillGroups: SkillGroup[] = [
  {
    label: 'AI & LLMs',
    items: ['Prompt Engineering', 'Agentic Systems', 'Workflow Orchestration', 'Structured Outputs', 'Context Engineering', 'LLM Evaluation', 'Multi-Agent Architectures'],
  },
  {
    label: 'Programming',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java'],
  },
  {
    label: 'Frameworks & Tools',
    items: ['Playwright', 'Appium', 'WebdriverIO', 'LangChain', 'LangGraph', 'Jenkins', 'Docker', 'GitHub Actions'],
  },
];

export const timeline: TimelineJob[] = [
  {
    period: 'Present',
    current: true,
    dot: '#1d1d1f',
    title: 'AI Engineer · Agentic Systems Builder',
    points: ['Agentic AI Systems', 'Workflow Orchestration', 'LLM Applications', 'AI Product Development', 'Natural Language Interfaces'],
  },
  {
    period: 'Earlier',
    current: false,
    dot: '#c7c7cc',
    title: 'Automation Architect · SDET',
    points: ['Framework Architecture', 'CI/CD Systems', 'Mobile Automation', 'Platform Engineering', 'Test Infrastructure'],
  },
].map((j, i) => ({ ...j, d: `${i * 150 + 120}ms` }));

export const highlights: Highlight[] = [
  { stat: 'AI', label: 'Native systems that reason, plan and execute' },
  { stat: '80%', label: 'Reduction in execution planning time via qAI' },
  { stat: '5+', label: 'Years evolving from automation to agentic AI' },
  { stat: '∞', label: 'Intent-driven workflows, minimal human intervention' },
].map((h, i) => ({ ...h, d: `${i * 90 + 100}ms` }));

export const currentFocus = [
  'Agentic AI Systems',
  'AI Product Development',
  'Workflow Automation',
  'LLM Applications',
  'Natural Language Interfaces',
  'Autonomous Execution Systems',
];

export const projects: Project[] = [
  {
    name: 'qAI',
    tag: 'AI-Native Automation Platform',
    img: 'qai.preview',
    desc: 'AI-powered platform that transforms natural language requirements into executable workflows using structured reasoning and deterministic execution.',
    features: [
      'Multi-stage agent workflows',
      'Schema-driven AI interactions',
      '80% reduction in execution planning time',
      'Natural language workflow generation',
      'Intent-to-action execution engine',
    ],
    tech: ['TypeScript', 'LLMs', 'Agentic Workflows', 'Appium', 'Prompt Engineering'],
    github: GITHUB_URL,
    demo: '#',
    category: 'ai',
    featured: true,
  },
  {
    name: 'Multi-Agent Workflow System',
    tag: 'Agentic Architecture',
    img: 'multiagent.preview',
    desc: 'Collaborative AI architecture where specialized agents perform independent tasks and validate one another\'s outputs.',
    features: [
      'Application Understanding agent',
      'Requirement Analysis agent',
      'Workflow Generation agent',
      'Validation & Verification agent',
      'Execution Planning agent',
    ],
    tech: ['TypeScript', 'LLMs', 'Multi-Agent', 'Workflow Orchestration'],
    github: GITHUB_URL,
    demo: '#',
    category: 'ai',
  },
  {
    name: 'NL Execution Engine',
    tag: 'Natural Language to Action',
    img: 'nlengine.preview',
    desc: 'Execution framework that converts plain English instructions into deterministic, reliable executable actions.',
    features: [
      'Intent parsing & action mapping',
      'Deterministic runtime execution',
      'Minimal AI dependency at runtime',
      'Outcome validation built-in',
      'Extensible action architecture',
    ],
    tech: ['TypeScript', 'LLMs', 'Structured Outputs', 'Appium'],
    github: GITHUB_URL,
    demo: '#',
    category: 'ai',
  },
  {
    name: 'AI Reliability Framework',
    tag: 'Research · LLM Consistency',
    img: 'reliability.preview',
    desc: 'Research project focused on reducing hallucinations and increasing consistency in LLM-based systems.',
    features: [
      'Schema-driven generation',
      'Context optimization',
      'Validation pipelines',
      'Multi-stage reasoning',
      'Output constraint enforcement',
    ],
    tech: ['Python', 'LLMs', 'LangChain', 'Structured Outputs'],
    github: GITHUB_URL,
    demo: '#',
    category: 'ai',
  },
  {
    name: 'Mobile Automation Platform',
    tag: 'Enterprise Framework',
    img: 'mobile.preview',
    desc: 'Enterprise-grade automation framework supporting Android and iOS with cross-platform architecture and CI/CD integration.',
    features: [
      'Cross-platform iOS & Android',
      'TypeScript-based framework',
      'BrowserStack integration',
      'Allure reporting pipeline',
      'Scalable execution model',
    ],
    tech: ['TypeScript', 'Appium', 'WebdriverIO', 'BrowserStack', 'Jenkins'],
    github: GITHUB_URL,
    demo: '#',
    category: 'engineering',
  },
  {
    name: 'Unified CI/CD Reporting',
    tag: 'Infrastructure Platform',
    img: 'cicd.preview',
    desc: 'Reporting and execution infrastructure that aggregates results across multiple environments and platforms.',
    features: [
      'Multi-environment aggregation',
      'AWS S3 result storage',
      'Allure dashboard integration',
      'Jenkins pipeline orchestration',
      'Cross-platform result merging',
    ],
    tech: ['Jenkins', 'AWS S3', 'BrowserStack', 'Allure', 'TypeScript'],
    github: GITHUB_URL,
    demo: '#',
    category: 'engineering',
  },
  {
    name: 'SaveMyDisk',
    tag: 'AI Storage Product',
    img: 'savemydisk.preview',
    desc: 'AI-assisted storage recovery platform that creates intelligent recovery plans rather than traditional file-system visualization.',
    features: [
      '"How much to recover?" UX model',
      'Safety-optimised recovery plans',
      'Intelligent file prioritisation',
      'Impact-based recommendations',
    ],
    tech: ['Rust', 'TypeScript', 'Next.js', 'AI Agents'],
    github: GITHUB_URL,
    demo: '#',
    category: 'engineering',
  },
].map((p, i) => ({ ...p, d: `${i * 100 + 80}ms` })) as Project[];
