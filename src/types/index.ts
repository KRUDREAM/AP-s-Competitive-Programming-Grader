export type Language = 'cpp' | 'c';

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'POSN / Olympic';

export type ProblemCategory =
  | 'Basics & IO'
  | 'Math'
  | 'Loop & Array'
  | 'Greedy'
  | 'Dynamic Programming'
  | 'Graph'
  | 'String'
  | 'Data Structures';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export interface TestCase {
  id: number;
  input: string;
  output: string;
  isHidden: boolean;
  weight: number;
  explanation?: string;
}

export interface SampleCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: ProblemCategory;
  statement: {
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    notes?: string;
  };
  timeLimitMs: number;
  memoryLimitMB: number;
  samples: SampleCase[];
  testCases: TestCase[];
  author: {
    name: string;
    handle: string;
    isStaff?: boolean;
    school?: string;
  };
  verificationStatus: VerificationStatus;
  adminFeedback?: string;
  solvedCount: number;
  totalSubmissions: number;
  tags: string[];
  createdAt: string;
  isWeeklyTask?: boolean;
  starterCode?: {
    cpp: string;
    c: string;
  };
}

export type Verdict = 'AC' | 'WA' | 'TLE' | 'RTE' | 'CE' | 'Running' | 'Pending';

export interface TestResult {
  testCaseId: number;
  verdict: 'P' | '-' | 'T' | 'X'; // Pass, Fail, TLE, RTE
  timeMs: number;
  memoryKB: number;
  inputSnippet?: string;
  expectedSnippet?: string;
  actualSnippet?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  userHandle: string;
  userName: string;
  language: Language;
  code: string;
  status: Verdict;
  score: number; // 0 - 100
  executionTimeMs: number;
  memoryUsedKB: number;
  submittedAt: string;
  testResults: TestResult[];
  compileError?: string;
}

export type RatingTier =
  | 'Grandmaster' // 2400+
  | 'Master' // 2000 - 2399
  | 'Expert' // 1600 - 1999
  | 'Specialist' // 1400 - 1599
  | 'Pupil' // 1200 - 1399
  | 'Newbie'; // < 1200

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface UserProfile {
  handle: string;
  name: string;
  avatarUrl: string;
  rating: number;
  tier: RatingTier;
  school: string;
  role: 'student' | 'admin';
  solvedProblemIds: string[];
  weeklyXp: number;
  totalXp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  badges: Badge[];
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly' | 'achievement';
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface DiscussionReply {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarUrl: string;
    role?: 'student' | 'admin';
  };
  content: string;
  codeSnippet?: string;
  isAccepted: boolean;
  upvotes: number;
  createdAt: string;
}

export interface Discussion {
  id: string;
  problemId?: string;
  problemTitle?: string;
  title: string;
  content: string;
  codeSnippet?: string;
  language?: Language;
  category: 'problem-help' | 'general' | 'posn-olympic' | 'c-tricks' | 'feedback';
  author: {
    name: string;
    handle: string;
    avatarUrl: string;
    role?: 'student' | 'admin';
    school?: string;
  };
  upvotes: number;
  userUpvoted: boolean;
  createdAt: string;
  isSolved: boolean;
  replies: DiscussionReply[];
}
