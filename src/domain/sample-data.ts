import { Budget, Vision, GoalNode, BoardCard, Task, UserPrefs, PlannerSettings } from "./types";

export const seedBudgets: Budget[] = [
  { id: "2025-08-11", dateRange: "2025-08-11/2025-08-17", daily: [45,25,15,15], weekly: [0,0,0,0] }
];

export const seedPrefs: UserPrefs[] = [
  { theme: 'light', startOfWeek: 0, plannerGridMinutes: 30 }
];

export const seedSettings: PlannerSettings[] = [
  { snapMinutes: 15, timeFormat: '12h', timezone: 'UTC' }
];

export const seedVisions: Vision[] = [
  {
    id: 'writer',
    label: 'Become a Writer',
    legacyText: 'Known for thoughtful, science-savvy fiction that respects medical reality; admired for mentoring new writers.',
    legacyValues: ['Excellence','Integrity','Service','Creativity'],
    personalText: 'A daily maker with a bias to publish; stories that sharpen my thinking and fund autonomy.',
    personalValues: ['Mastery','Autonomy','Curiosity','Playfulness']
  },
  {
    id: 'crna',
    label: 'Become a CRNA',
    legacyText: 'Trusted clinician who makes surgery safer; recognized for calm leadership.',
    legacyValues: ['Competence','Compassion','Reliability'],
    personalText: 'Financial and schedule autonomy via advanced practice; daily learning keeps me sharp.',
    personalValues: ['Mastery','Security','Growth']
  },
  {
    id: 'musician',
    label: 'Grow as Musician',
    legacyText: 'Friends know me as the person who brings music to gatherings.',
    legacyValues: ['Connection','Joy','Courage'],
    personalText: 'I can perform 3 songs comfortably and jam with others.',
    personalValues: ['Play','Mastery','Presence']
  },
  // Person domain example (physical)
  {
    id: 'athlete',
    label: 'Athletic Clinician',
    legacyText: 'Peers see me as energetic, dependable, and a model of healthy habits.',
    legacyValues: ['Vitality','Consistency','Self-respect'],
    personalText: 'Feel light, strong, and clear-headed most days.',
    personalValues: ['Discipline','Recovery','Joy']
  }
];

export const seedGoals: GoalNode[] = [
  { id: 'writer', tabId:'passion', directionId:'writer', parentId:null, type:'northStar', title:'Become a Writer', smartier:'Ship 2 publishable works/yr; maintain 4-day writing streak ≥80%.', lead:'Words/day, focus blocks', lag:'Manuscripts accepted, reviews' },
  { id: 'writer-novel', tabId:'passion', directionId:'writer', parentId:'writer', type:'goal', title:'Novel pipeline', smartier:'120k-word sci-fi by May; passes dev-edit.', lead:'WPH, sessions/wk', lag:'Editor pass/fail' },
  { id: 'writer-outline2', tabId:'passion', directionId:'writer', parentId:'writer-novel', type:'quarterGoal', title:'Outline v2', smartier:'10 beat sheets by Feb 15', lead:'Deep hours', lag:'Outline quality check' },
  { id: 'writer-draft1', tabId:'passion', directionId:'writer', parentId:'writer-novel', type:'quarterGoal', title:'Draft 1', smartier:'80k by Apr 30', lead:'Words/day', lag:'Draft wordcount' },
  { id: 'writer-shorts', tabId:'passion', directionId:'writer', parentId:'writer', type:'goal', title:'Shorts & essays', smartier:'4 shorts in 12 months', lead:'Submissions', lag:'Acceptances' },
  { id: 'writer-flash', tabId:'passion', directionId:'writer', parentId:'writer-shorts', type:'monthGoal', title:'Monthly flash', smartier:'1 flash/mo', lead:'Drafts', lag:'Published count' },

  { id: 'crna', tabId:'passion', directionId:'crna', parentId:null, type:'northStar', title:'Become a CRNA', smartier:'Admit to top program in 18–24 mo.', lead:'Study hrs, clinical experiences', lag:'GPA, certifications, offers' },
  { id: 'crna-prereqs', tabId:'passion', directionId:'crna', parentId:'crna', type:'goal', title:'Prereqs complete', smartier:'Chem, Pharm A/A-', lead:'Study blocks/wk', lag:'Grades' },
  { id: 'crna-admission', tabId:'passion', directionId:'crna', parentId:'crna', type:'goal', title:'Admission package', smartier:'GRE ≥75th, LORs, SOP v3', lead:'Prep hours', lag:'Scores, submitted apps' },

  // Play
  { id: 'musician', tabId:'play', directionId:'musician', parentId:null, type:'northStar', title:'Grow as Musician', smartier:'3-song set @ 90 BPM by summer.', lead:'Focused minutes', lag:'Clean recordings' },
  { id: 'musician-tech', tabId:'play', directionId:'musician', parentId:'musician', type:'goal', title:'Technique bootcamp', smartier:'5×20-min/wk', lead:'Minutes', lag:'Error rate' },
  { id: 'musician-rep', tabId:'play', directionId:'musician', parentId:'musician', type:'goal', title:'Repertoire', smartier:'3 songs fully learned', lead:'Sections mastered', lag:'Performance clip' },

  // Person - Physical
  { id: 'athlete', tabId:'person', directionId:'athlete', parentId:null, type:'northStar', title:'Athletic Clinician', smartier:'Sustain MVC ≥5d/wk; resting HR ↓ 5 bpm in 3 mo.', lead:'Sessions/wk, sleep hrs', lag:'HR, strength tests' },
  { id: 'athlete-strength', tabId:'person', directionId:'athlete', parentId:'athlete', type:'goal', title:'Strength Base', smartier:'12-wk plan', lead:'Lifts/wk', lag:'5RM progress' },
  { id: 'athlete-sleep', tabId:'person', directionId:'athlete', parentId:'athlete', type:'goal', title:'Sleep Routine', smartier:'10:30 wind-down', lead:'Evenings logged', lag:'Subjective energy' }
];

export const seedBoards: BoardCard[] = [
  { id:'b1', tabId:'passion', status:'active', title:'CRNA Pharm module', score:4.4, rubric:'IART+G' },
  { id:'b2', tabId:'passion', status:'active', title:'Novel +20k words', score:4.2, rubric:'IART+G' },
  { id:'b3', tabId:'passion', status:'active', title:'App onboarding slice', score:3.9, rubric:'IART+G' },
  { id:'b4', tabId:'passion', status:'incubating', title:'Research mini-course', score:3.4, rubric:'IART+G' },

  { id:'p1', tabId:'person-physical', status:'active', title:'12-wk Strength Base', score:3.0, rubric:'UIE' },

  { id:'pl1', tabId:'play-annual', status:'active', title:'Repertoire showcase', score:4.7, rubric:'JRN' },
  { id:'pl2', tabId:'play-q', status:'active', title:'Technique bootcamp', score:4.2, rubric:'JRN' }
];

export const seedTasks: Task[] = [
  { id:'t1', day:1, start:'07:00', end:'08:30', bucket:'Passion', title:'MIT – Novel draft', fixed:false },
  { id:'t2', day:1, start:'18:00', end:'18:45', bucket:'Person', title:'Workout – strength', fixed:true },
  { id:'t3', day:2, start:'07:00', end:'09:00', bucket:'Passion', title:'CRNA Pharm module', fixed:false },
  { id:'t4', day:2, start:'20:00', end:'20:30', bucket:'Play', title:'FoW – Guitar practice', fixed:false },
  { id:'t5', day:5, start:'17:00', end:'17:45', bucket:'Misc', title:'Weekly maintenance block', fixed:true }
];
