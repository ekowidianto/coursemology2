import type { QuestionData } from './questions';

export interface PersonalTimeData {
  isFixed: boolean;
  effectiveTime: string | null;
  referenceTime: string | null;
}

interface AssessmentActionsData {
  status: 'locked' | 'attempting' | 'submitted' | 'open' | 'unavailable';
  actionButtonUrl: string | null;
  submissionsUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
}

export interface AssessmentListData extends AssessmentActionsData {
  id: number;
  title: string;
  passwordProtected: boolean;
  published: boolean;
  autograded: boolean;
  hasPersonalTimes: boolean;
  affectsPersonalTimes: boolean;
  url: string;
  conditionSatisfied: boolean;
  startAt: PersonalTimeData;
  isStartTimeBegin: boolean;

  baseExp?: number;
  timeBonusExp?: number;
  bonusEndAt?: PersonalTimeData;
  endAt?: PersonalTimeData;
  hasTodo?: boolean;
  isBonusEnded?: boolean;
  isEndTimePassed?: boolean;
  remainingConditionalsCount?: number;
  topConditionals?: {
    url: string;
    badgeUrl: string;
    title: string;
  }[];
}

export interface AssessmentsListData {
  display: {
    isStudent: boolean;
    isGamified: boolean;
    allowRandomization: boolean;
    isAchievementsEnabled: boolean;
    bonusAttributes: boolean;
    endTimes: boolean;
    canCreateAssessments: boolean;
    tabId: number;
    category: {
      id: number;
      title: string;
      tabs: {
        id: number;
        title: string;
      }[];
    };
  };

  assessments: AssessmentListData[];
}

export type QuestionType =
  | 'multipleChoice'
  | 'multipleResponse'
  | 'textResponse'
  | 'audioResponse'
  | 'fileUpload'
  | 'programming'
  | 'scribing'
  | 'forumPostResponse';

interface NewQuestionBuilderData {
  type: QuestionType;
  url: string;
}

export interface AssessmentData extends AssessmentActionsData {
  id: number;
  title: string;
  description: string;
  autograded: boolean;
  startAt: PersonalTimeData;
  hasAttempts: boolean;
  permissions: {
    canAttempt: boolean;
    canManage: boolean;
    canObserve: boolean;
  };
  requirements: {
    title: string;
    satisfied?: boolean;
  }[];
  indexUrl: string;

  endAt?: PersonalTimeData;
  hasTodo?: boolean;
  unlocks?: {
    description: string;
    title: string;
    url: string;
  }[];
  baseExp?: number;
  timeBonusExp?: number;
  bonusEndAt?: PersonalTimeData;
  willStartAt?: string;
  materialsDisabled?: boolean;
  componentsSettingsUrl?: string;
  files?: {
    id: number;
    name: string;
    url?: string;
  }[];

  showMcqMrqSolution?: boolean;
  gradedTestCases?: string;
  skippable?: boolean;
  allowPartialSubmission?: boolean;
  showMcqAnswer?: boolean;
  hasUnautogradableQuestions?: boolean;
  questions?: QuestionData[];
  newQuestionUrls?: NewQuestionBuilderData[];
}

export interface AssessmentDeleteResult {
  redirect: string;
}

export interface QuestionOrderPostData {
  question_order: QuestionData['id'][];
}

export type AssessmentUnlockRequirements = string[];
