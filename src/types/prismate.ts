/**
 * Prismate 1.5 — Global Type Definitions
 */

export type ScreenType = 'home' | 'chemistry' | 'physics' | 'mathematics' | 'profile';

export type ListType = 'weaklist' | 'stronglist' | 'studylist';

export type DifficultyLevel = 'classic' | 'expert' | 'master';

export interface UserProfile {
  id: string;
  username: string;
  avatarSeed: string;
  defaultStartupScreen: ScreenType;
  homePageEnabled: boolean;
}

export interface ListItem {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  category: 'reaction' | 'formula' | 'diagram' | 'question';
  title: string;
  content: string;
  source: string;
  addedAt: number;
}

export interface QuizQuestion {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  category: 'bb' | 'pta' | 'board' | 'formula' | 'unit';
  sourcePage?: number;
  requiresDiagram?: boolean;
}

export interface ChemicalReaction {
  id: string;
  chapter: string;
  name: string;
  equation: string;
  reactants: string;
  products: string;
  conditions: string;
  mechanismNote?: string;
}

export interface SubjectDiagram {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  title: string;
  chapter: string;
  description: string;
  svgType: string;
}

export interface QuestionPaperItem {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  title: string;
  yearOrType: string;
  questionCount: number;
  duration: string;
  marks: number;
  fileUrl?: string;
  answerKeyUrl?: string;
  examSession?: string;
}
