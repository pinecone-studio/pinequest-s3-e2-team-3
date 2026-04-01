import type { GraphQLResolveInfo } from 'graphql';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AccessResponse = {
  __typename?: 'AccessResponse';
  allowed: Scalars['Boolean']['output'];
};

export type Class = {
  __typename?: 'Class';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ClassAttendance = {
  __typename?: 'ClassAttendance';
  attendanceRate: Scalars['Float']['output'];
  attended: Scalars['Int']['output'];
  /** Student IDs in this class who have started the exam session. */
  attendedStudentIds: Array<Scalars['ID']['output']>;
  classId: Scalars['ID']['output'];
  examSessionId: Scalars['ID']['output'];
  totalStudents: Scalars['Int']['output'];
};

export type ClassAverage = {
  __typename?: 'ClassAverage';
  averageScore: Scalars['Float']['output'];
  classId: Scalars['ID']['output'];
  examSessionId: Scalars['ID']['output'];
  totalStudents: Scalars['Int']['output'];
};

export type CreateExamSessionInput = {
  classId: Scalars['ID']['input'];
  creatorId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  examId: Scalars['ID']['input'];
  startTime: Scalars['String']['input'];
};

export type Exam = {
  __typename?: 'Exam';
  createdAt: Scalars['String']['output'];
  creatorId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['ID']['output']>;
  subjectId?: Maybe<Scalars['ID']['output']>;
  topicId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['String']['output'];
};

/** Multiple-choice items for an exam-taker (no correct answer revealed). */
export type ExamQuestionForTaker = {
  __typename?: 'ExamQuestionForTaker';
  answers: Array<Scalars['String']['output']>;
  attachmentUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
  variation: Scalars['String']['output'];
};

export type ExamSession = {
  __typename?: 'ExamSession';
  class?: Maybe<Class>;
  classId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  creatorId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  exam?: Maybe<Exam>;
  examId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  assignTeacherToClass: User;
  cloneExam: Exam;
  createClass: Class;
  createExam: Exam;
  createExamSession: ExamSession;
  createProctorLog: ProctorLog;
  createQuestion: Question;
  createStudent: Student;
  createSubject: Subject;
  createTeacher: User;
  createTopic: Topic;
  deleteClass: Scalars['Boolean']['output'];
  deleteExam: Scalars['Boolean']['output'];
  deleteExamSession: Scalars['Boolean']['output'];
  deleteProctorLog: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  deleteStudent: Scalars['Boolean']['output'];
  deleteTeacher: Scalars['Boolean']['output'];
  deleteTopic: Scalars['Boolean']['output'];
  login: LoginResponse;
  /**
   * Marks the student's session as started when they open the active exam link.
   * Idempotent. Creates a status row if missing (e.g. legacy sessions).
   */
  markStudentExamSessionStarted: Scalars['Boolean']['output'];
  removeTeacherFromClass: User;
  submitExamAnswers: SubmitExamAnswersPayload;
  updateClass: Class;
  updateExam: Exam;
  updateExamSession: ExamSession;
  updateProctorLog: ProctorLog;
  updateQuestion: Question;
  updateStudent: Student;
  updateTopic: Topic;
};


export type MutationAssignTeacherToClassArgs = {
  classId: Scalars['ID']['input'];
  teacherId: Scalars['ID']['input'];
};


export type MutationCloneExamArgs = {
  examId: Scalars['ID']['input'];
  teacherId: Scalars['ID']['input'];
};


export type MutationCreateClassArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateExamArgs = {
  creatorId?: InputMaybe<Scalars['ID']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  topicId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationCreateExamSessionArgs = {
  input: CreateExamSessionInput;
};


export type MutationCreateProctorLogArgs = {
  eventType: Scalars['String']['input'];
  examId?: InputMaybe<Scalars['ID']['input']>;
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  studentId: Scalars['ID']['input'];
};


export type MutationCreateQuestionArgs = {
  answers: Array<Scalars['String']['input']>;
  attachmentKey?: InputMaybe<Scalars['String']['input']>;
  correctIndex: Scalars['Int']['input'];
  examId: Scalars['ID']['input'];
  question: Scalars['String']['input'];
  variation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateStudentArgs = {
  classId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};


export type MutationCreateSubjectArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateTeacherArgs = {
  email: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  role?: InputMaybe<UserRole>;
  subjects?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationCreateTopicArgs = {
  grade: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  subjectId: Scalars['ID']['input'];
};


export type MutationDeleteClassArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteExamSessionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProctorLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStudentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTeacherArgs = {
  teacherId: Scalars['ID']['input'];
};


export type MutationDeleteTopicArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationMarkStudentExamSessionStartedArgs = {
  sessionId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationRemoveTeacherFromClassArgs = {
  classId: Scalars['ID']['input'];
  teacherId: Scalars['ID']['input'];
};


export type MutationSubmitExamAnswersArgs = {
  answers: Array<StudentExamAnswerInput>;
  examId: Scalars['ID']['input'];
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  studentId: Scalars['ID']['input'];
};


export type MutationUpdateClassArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateExamArgs = {
  id: Scalars['ID']['input'];
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  topicId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpdateExamSessionArgs = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateProctorLogArgs = {
  eventType?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpdateQuestionArgs = {
  answers?: InputMaybe<Array<Scalars['String']['input']>>;
  attachmentKey?: InputMaybe<Scalars['String']['input']>;
  correctIndex?: InputMaybe<Scalars['Int']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  question?: InputMaybe<Scalars['String']['input']>;
  variation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateStudentArgs = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTopicArgs = {
  grade?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
};

export type ProctorLog = {
  __typename?: 'ProctorLog';
  createdAt: Scalars['String']['output'];
  eventType: Scalars['String']['output'];
  /** Derived from the linked exam session when `sessionId` is set. */
  examId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  sessionId?: Maybe<Scalars['ID']['output']>;
  studentId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  class?: Maybe<Class>;
  classAttendance: ClassAttendance;
  classAverage: ClassAverage;
  exam?: Maybe<Exam>;
  examQuestionsForTaker: Array<ExamQuestionForTaker>;
  examSession?: Maybe<ExamSession>;
  exams: Array<Exam>;
  getActiveSessions: Array<ExamSession>;
  getClasses: Array<Class>;
  getSessionsByClass: Array<ExamSession>;
  getSessionsByCreator: Array<ExamSession>;
  getStudents: Array<Student>;
  proctorLog?: Maybe<ProctorLog>;
  proctorLogs: Array<ProctorLog>;
  question?: Maybe<Question>;
  questions: Array<Question>;
  staffUsers: Array<User>;
  student?: Maybe<Student>;
  studentAnswers: Array<StudentAnswer>;
  /** Per-student progress for an exam session. Null if the student is not in that session's class. */
  studentExamSessionStatus?: Maybe<StudentExamSessionStatus>;
  studentsByClass: Array<Student>;
  subjects: Array<Subject>;
  topic?: Maybe<Topic>;
  topics: Array<Topic>;
  unsortedExams: Array<Exam>;
  verifyStudentAccess: AccessResponse;
};


export type QueryClassArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassAttendanceArgs = {
  classId: Scalars['ID']['input'];
  examSessionId: Scalars['ID']['input'];
};


export type QueryClassAverageArgs = {
  classId: Scalars['ID']['input'];
  examSessionId: Scalars['ID']['input'];
};


export type QueryExamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamQuestionsForTakerArgs = {
  examId: Scalars['ID']['input'];
};


export type QueryExamSessionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSessionsByClassArgs = {
  classId: Scalars['ID']['input'];
};


export type QueryGetSessionsByCreatorArgs = {
  creatorId: Scalars['ID']['input'];
};


export type QueryProctorLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProctorLogsArgs = {
  examId?: InputMaybe<Scalars['ID']['input']>;
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuestionsArgs = {
  examId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryStudentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStudentAnswersArgs = {
  examId?: InputMaybe<Scalars['ID']['input']>;
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryStudentExamSessionStatusArgs = {
  sessionId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type QueryStudentsByClassArgs = {
  classId: Scalars['ID']['input'];
};


export type QueryTopicArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTopicsArgs = {
  subjectId: Scalars['ID']['input'];
};


export type QueryVerifyStudentAccessArgs = {
  sessionId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  answers: Array<Scalars['String']['output']>;
  /** R2 object key when a file (e.g. PDF) is attached. */
  attachmentKey?: Maybe<Scalars['String']['output']>;
  /** Absolute URL to download the attachment (same origin /api/exam-file). */
  attachmentUrl?: Maybe<Scalars['String']['output']>;
  correctIndex: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  examId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  variation: Scalars['String']['output'];
};

export type Student = {
  __typename?: 'Student';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type StudentAnswer = {
  __typename?: 'StudentAnswer';
  answerIndex: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  examId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  questionId?: Maybe<Scalars['ID']['output']>;
  sessionId?: Maybe<Scalars['ID']['output']>;
  studentId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type StudentExamAnswerInput = {
  answerIndex: Scalars['Int']['input'];
  questionId: Scalars['ID']['input'];
};

export type StudentExamSessionStatus = {
  __typename?: 'StudentExamSessionStatus';
  isFinished: Scalars['Boolean']['output'];
  isStarted: Scalars['Boolean']['output'];
};

export type Subject = {
  __typename?: 'Subject';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type SubmitExamAnswersPayload = {
  __typename?: 'SubmitExamAnswersPayload';
  submittedCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type Topic = {
  __typename?: 'Topic';
  createdAt: Scalars['String']['output'];
  grade: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  subjectId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  classIds: Array<Scalars['ID']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  name: Scalars['String']['output'];
  password?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  subjects: Array<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export enum UserRole {
  Manager = 'manager',
  Teacher = 'teacher'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccessResponse: ResolverTypeWrapper<AccessResponse>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Class: ResolverTypeWrapper<Class>;
  ClassAttendance: ResolverTypeWrapper<ClassAttendance>;
  ClassAverage: ResolverTypeWrapper<ClassAverage>;
  CreateExamSessionInput: CreateExamSessionInput;
  Exam: ResolverTypeWrapper<Exam>;
  ExamQuestionForTaker: ResolverTypeWrapper<ExamQuestionForTaker>;
  ExamSession: ResolverTypeWrapper<ExamSession>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LoginResponse: ResolverTypeWrapper<LoginResponse>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ProctorLog: ResolverTypeWrapper<ProctorLog>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Question: ResolverTypeWrapper<Question>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Student: ResolverTypeWrapper<Student>;
  StudentAnswer: ResolverTypeWrapper<StudentAnswer>;
  StudentExamAnswerInput: StudentExamAnswerInput;
  StudentExamSessionStatus: ResolverTypeWrapper<StudentExamSessionStatus>;
  Subject: ResolverTypeWrapper<Subject>;
  SubmitExamAnswersPayload: ResolverTypeWrapper<SubmitExamAnswersPayload>;
  Topic: ResolverTypeWrapper<Topic>;
  User: ResolverTypeWrapper<User>;
  UserRole: UserRole;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AccessResponse: AccessResponse;
  Boolean: Scalars['Boolean']['output'];
  Class: Class;
  ClassAttendance: ClassAttendance;
  ClassAverage: ClassAverage;
  CreateExamSessionInput: CreateExamSessionInput;
  Exam: Exam;
  ExamQuestionForTaker: ExamQuestionForTaker;
  ExamSession: ExamSession;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LoginResponse: LoginResponse;
  Mutation: Record<PropertyKey, never>;
  ProctorLog: ProctorLog;
  Query: Record<PropertyKey, never>;
  Question: Question;
  String: Scalars['String']['output'];
  Student: Student;
  StudentAnswer: StudentAnswer;
  StudentExamAnswerInput: StudentExamAnswerInput;
  StudentExamSessionStatus: StudentExamSessionStatus;
  Subject: Subject;
  SubmitExamAnswersPayload: SubmitExamAnswersPayload;
  Topic: Topic;
  User: User;
};

export type AccessResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AccessResponse'] = ResolversParentTypes['AccessResponse']> = {
  allowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type ClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ClassAttendanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClassAttendance'] = ResolversParentTypes['ClassAttendance']> = {
  attendanceRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  attended?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  attendedStudentIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  classId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  examSessionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalStudents?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type ClassAverageResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClassAverage'] = ResolversParentTypes['ClassAverage']> = {
  averageScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  classId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  examSessionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalStudents?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type ExamResolvers<ContextType = any, ParentType extends ResolversParentTypes['Exam'] = ResolversParentTypes['Exam']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  creatorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  subjectId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  topicId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ExamQuestionForTakerResolvers<ContextType = any, ParentType extends ResolversParentTypes['ExamQuestionForTaker'] = ResolversParentTypes['ExamQuestionForTaker']> = {
  answers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ExamSessionResolvers<ContextType = any, ParentType extends ResolversParentTypes['ExamSession'] = ResolversParentTypes['ExamSession']> = {
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType>;
  classId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  creatorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  exam?: Resolver<Maybe<ResolversTypes['Exam']>, ParentType, ContextType>;
  examId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type LoginResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  assignTeacherToClass?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationAssignTeacherToClassArgs, 'classId' | 'teacherId'>>;
  cloneExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationCloneExamArgs, 'examId' | 'teacherId'>>;
  createClass?: Resolver<ResolversTypes['Class'], ParentType, ContextType, RequireFields<MutationCreateClassArgs, 'name'>>;
  createExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationCreateExamArgs, 'name'>>;
  createExamSession?: Resolver<ResolversTypes['ExamSession'], ParentType, ContextType, RequireFields<MutationCreateExamSessionArgs, 'input'>>;
  createProctorLog?: Resolver<ResolversTypes['ProctorLog'], ParentType, ContextType, RequireFields<MutationCreateProctorLogArgs, 'eventType' | 'studentId'>>;
  createQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationCreateQuestionArgs, 'answers' | 'correctIndex' | 'examId' | 'question'>>;
  createStudent?: Resolver<ResolversTypes['Student'], ParentType, ContextType, RequireFields<MutationCreateStudentArgs, 'classId' | 'email' | 'name' | 'phone'>>;
  createSubject?: Resolver<ResolversTypes['Subject'], ParentType, ContextType, RequireFields<MutationCreateSubjectArgs, 'name'>>;
  createTeacher?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateTeacherArgs, 'email' | 'lastName' | 'name'>>;
  createTopic?: Resolver<ResolversTypes['Topic'], ParentType, ContextType, RequireFields<MutationCreateTopicArgs, 'grade' | 'name' | 'subjectId'>>;
  deleteClass?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteClassArgs, 'id'>>;
  deleteExam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteExamArgs, 'id'>>;
  deleteExamSession?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteExamSessionArgs, 'id'>>;
  deleteProctorLog?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProctorLogArgs, 'id'>>;
  deleteQuestion?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteQuestionArgs, 'id'>>;
  deleteStudent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteStudentArgs, 'id'>>;
  deleteTeacher?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTeacherArgs, 'teacherId'>>;
  deleteTopic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTopicArgs, 'id'>>;
  login?: Resolver<ResolversTypes['LoginResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'password' | 'username'>>;
  markStudentExamSessionStarted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkStudentExamSessionStartedArgs, 'sessionId' | 'studentId'>>;
  removeTeacherFromClass?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationRemoveTeacherFromClassArgs, 'classId' | 'teacherId'>>;
  submitExamAnswers?: Resolver<ResolversTypes['SubmitExamAnswersPayload'], ParentType, ContextType, RequireFields<MutationSubmitExamAnswersArgs, 'answers' | 'examId' | 'studentId'>>;
  updateClass?: Resolver<ResolversTypes['Class'], ParentType, ContextType, RequireFields<MutationUpdateClassArgs, 'id'>>;
  updateExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationUpdateExamArgs, 'id'>>;
  updateExamSession?: Resolver<ResolversTypes['ExamSession'], ParentType, ContextType, RequireFields<MutationUpdateExamSessionArgs, 'id'>>;
  updateProctorLog?: Resolver<ResolversTypes['ProctorLog'], ParentType, ContextType, RequireFields<MutationUpdateProctorLogArgs, 'id'>>;
  updateQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationUpdateQuestionArgs, 'id'>>;
  updateStudent?: Resolver<ResolversTypes['Student'], ParentType, ContextType, RequireFields<MutationUpdateStudentArgs, 'id'>>;
  updateTopic?: Resolver<ResolversTypes['Topic'], ParentType, ContextType, RequireFields<MutationUpdateTopicArgs, 'id'>>;
};

export type ProctorLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProctorLog'] = ResolversParentTypes['ProctorLog']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  examId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sessionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  studentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'id'>>;
  classAttendance?: Resolver<ResolversTypes['ClassAttendance'], ParentType, ContextType, RequireFields<QueryClassAttendanceArgs, 'classId' | 'examSessionId'>>;
  classAverage?: Resolver<ResolversTypes['ClassAverage'], ParentType, ContextType, RequireFields<QueryClassAverageArgs, 'classId' | 'examSessionId'>>;
  exam?: Resolver<Maybe<ResolversTypes['Exam']>, ParentType, ContextType, RequireFields<QueryExamArgs, 'id'>>;
  examQuestionsForTaker?: Resolver<Array<ResolversTypes['ExamQuestionForTaker']>, ParentType, ContextType, RequireFields<QueryExamQuestionsForTakerArgs, 'examId'>>;
  examSession?: Resolver<Maybe<ResolversTypes['ExamSession']>, ParentType, ContextType, RequireFields<QueryExamSessionArgs, 'id'>>;
  exams?: Resolver<Array<ResolversTypes['Exam']>, ParentType, ContextType>;
  getActiveSessions?: Resolver<Array<ResolversTypes['ExamSession']>, ParentType, ContextType>;
  getClasses?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType>;
  getSessionsByClass?: Resolver<Array<ResolversTypes['ExamSession']>, ParentType, ContextType, RequireFields<QueryGetSessionsByClassArgs, 'classId'>>;
  getSessionsByCreator?: Resolver<Array<ResolversTypes['ExamSession']>, ParentType, ContextType, RequireFields<QueryGetSessionsByCreatorArgs, 'creatorId'>>;
  getStudents?: Resolver<Array<ResolversTypes['Student']>, ParentType, ContextType>;
  proctorLog?: Resolver<Maybe<ResolversTypes['ProctorLog']>, ParentType, ContextType, RequireFields<QueryProctorLogArgs, 'id'>>;
  proctorLogs?: Resolver<Array<ResolversTypes['ProctorLog']>, ParentType, ContextType, Partial<QueryProctorLogsArgs>>;
  question?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<QueryQuestionArgs, 'id'>>;
  questions?: Resolver<Array<ResolversTypes['Question']>, ParentType, ContextType, Partial<QueryQuestionsArgs>>;
  staffUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  student?: Resolver<Maybe<ResolversTypes['Student']>, ParentType, ContextType, RequireFields<QueryStudentArgs, 'id'>>;
  studentAnswers?: Resolver<Array<ResolversTypes['StudentAnswer']>, ParentType, ContextType, Partial<QueryStudentAnswersArgs>>;
  studentExamSessionStatus?: Resolver<Maybe<ResolversTypes['StudentExamSessionStatus']>, ParentType, ContextType, RequireFields<QueryStudentExamSessionStatusArgs, 'sessionId' | 'studentId'>>;
  studentsByClass?: Resolver<Array<ResolversTypes['Student']>, ParentType, ContextType, RequireFields<QueryStudentsByClassArgs, 'classId'>>;
  subjects?: Resolver<Array<ResolversTypes['Subject']>, ParentType, ContextType>;
  topic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<QueryTopicArgs, 'id'>>;
  topics?: Resolver<Array<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<QueryTopicsArgs, 'subjectId'>>;
  unsortedExams?: Resolver<Array<ResolversTypes['Exam']>, ParentType, ContextType>;
  verifyStudentAccess?: Resolver<ResolversTypes['AccessResponse'], ParentType, ContextType, RequireFields<QueryVerifyStudentAccessArgs, 'sessionId' | 'studentId'>>;
};

export type QuestionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Question'] = ResolversParentTypes['Question']> = {
  answers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  correctIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  examId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type StudentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Student'] = ResolversParentTypes['Student']> = {
  classId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type StudentAnswerResolvers<ContextType = any, ParentType extends ResolversParentTypes['StudentAnswer'] = ResolversParentTypes['StudentAnswer']> = {
  answerIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  examId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  questionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  sessionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  studentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type StudentExamSessionStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['StudentExamSessionStatus'] = ResolversParentTypes['StudentExamSessionStatus']> = {
  isFinished?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isStarted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type SubjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subject'] = ResolversParentTypes['Subject']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type SubmitExamAnswersPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubmitExamAnswersPayload'] = ResolversParentTypes['SubmitExamAnswersPayload']> = {
  submittedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type TopicResolvers<ContextType = any, ParentType extends ResolversParentTypes['Topic'] = ResolversParentTypes['Topic']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  grade?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subjectId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  classIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  subjects?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AccessResponse?: AccessResponseResolvers<ContextType>;
  Class?: ClassResolvers<ContextType>;
  ClassAttendance?: ClassAttendanceResolvers<ContextType>;
  ClassAverage?: ClassAverageResolvers<ContextType>;
  Exam?: ExamResolvers<ContextType>;
  ExamQuestionForTaker?: ExamQuestionForTakerResolvers<ContextType>;
  ExamSession?: ExamSessionResolvers<ContextType>;
  LoginResponse?: LoginResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ProctorLog?: ProctorLogResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Question?: QuestionResolvers<ContextType>;
  Student?: StudentResolvers<ContextType>;
  StudentAnswer?: StudentAnswerResolvers<ContextType>;
  StudentExamSessionStatus?: StudentExamSessionStatusResolvers<ContextType>;
  Subject?: SubjectResolvers<ContextType>;
  SubmitExamAnswersPayload?: SubmitExamAnswersPayloadResolvers<ContextType>;
  Topic?: TopicResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};


export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', success: boolean, message?: string | null, user?: { __typename?: 'User', id: string, name: string, lastName: string, email: string, username: string, role: UserRole, subjects: Array<string>, classIds: Array<string> } | null } };

export type GetQuestionsForSessionQueryVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type GetQuestionsForSessionQuery = { __typename?: 'Query', questions: Array<{ __typename?: 'Question', id: string, examId: string, question: string, answers: Array<string>, correctIndex: number, variation: string, attachmentUrl?: string | null, createdAt: string }> };

export type GetStudentAnswersQueryVariables = Exact<{
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetStudentAnswersQuery = { __typename?: 'Query', studentAnswers: Array<{ __typename?: 'StudentAnswer', id: string, studentId?: string | null, sessionId?: string | null, examId?: string | null, questionId?: string | null, answerIndex: number, createdAt: string }> };

export type GetClassesDetailPageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClassesDetailPageQuery = { __typename?: 'Query', getClasses: Array<{ __typename?: 'Class', id: string, name: string }> };

export type GetStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStudentsQuery = { __typename?: 'Query', getStudents: Array<{ __typename?: 'Student', email: string, id: string, name: string, classId: string }> };

export type AssignTeacherToClassMutationVariables = Exact<{
  teacherId: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
}>;


export type AssignTeacherToClassMutation = { __typename?: 'Mutation', assignTeacherToClass: { __typename?: 'User', id: string, name: string, lastName: string, email: string, role: UserRole, subjects: Array<string>, classIds: Array<string> } };

export type CreateTeacherMutationVariables = Exact<{
  name: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  subjects?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  role?: InputMaybe<UserRole>;
}>;


export type CreateTeacherMutation = { __typename?: 'Mutation', createTeacher: { __typename?: 'User', id: string, name: string, lastName: string, email: string, role: UserRole, subjects: Array<string>, classIds: Array<string>, createdAt: string } };

export type DeleteTeacherMutationVariables = Exact<{
  teacherId: Scalars['ID']['input'];
}>;


export type DeleteTeacherMutation = { __typename?: 'Mutation', deleteTeacher: boolean };

export type GetStaffUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStaffUsersQuery = { __typename?: 'Query', staffUsers: Array<{ __typename?: 'User', id: string, name: string, lastName: string, email: string, role: UserRole, subjects: Array<string>, classIds: Array<string>, createdAt: string }> };

export type RemoveTeacherFromClassMutationVariables = Exact<{
  teacherId: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
}>;


export type RemoveTeacherFromClassMutation = { __typename?: 'Mutation', removeTeacherFromClass: { __typename?: 'User', id: string, name: string, lastName: string, email: string, role: UserRole, subjects: Array<string>, classIds: Array<string> } };

export type CreateExamSessionMutationMutationVariables = Exact<{
  description?: InputMaybe<Scalars['String']['input']>;
  classId?: InputMaybe<Scalars['ID']['input']>;
  creatorId: Scalars['ID']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateExamSessionMutationMutation = { __typename?: 'Mutation', createExamSession: { __typename?: 'ExamSession', createdAt: string, updatedAt: string, startTime: string, status?: string | null, id: string, creatorId: string, description: string, endTime: string, class?: { __typename?: 'Class', name: string, id: string } | null, exam?: { __typename?: 'Exam', id: string, name: string } | null } };

export type GetClassAverageQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
  examSessionId: Scalars['ID']['input'];
}>;


export type GetClassAverageQuery = { __typename?: 'Query', classAverage: { __typename?: 'ClassAverage', classId: string, examSessionId: string, averageScore: number, totalStudents: number } };

export type GetClassAttendanceQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
  examSessionId: Scalars['ID']['input'];
}>;


export type GetClassAttendanceQuery = { __typename?: 'Query', classAttendance: { __typename?: 'ClassAttendance', classId: string, examSessionId: string, attended: number, totalStudents: number, attendanceRate: number, attendedStudentIds: Array<string> } };

export type GetActiveSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveSessionQuery = { __typename?: 'Query', getActiveSessions: Array<{ __typename?: 'ExamSession', classId: string, id: string, startTime: string, description: string, createdAt: string, endTime: string, updatedAt: string, status?: string | null, class?: { __typename?: 'Class', id: string, name: string } | null, exam?: { __typename?: 'Exam', id: string, name: string } | null }> };

export type GetClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClassesQuery = { __typename?: 'Query', getClasses: Array<{ __typename?: 'Class', id: string, name: string }> };

export type GetExamQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', createdAt: string, creatorId?: string | null, id: string, isPublic: boolean, name: string, subjectId?: string | null, topicId?: string | null }> };

export type GetProctorLogsQueryVariables = Exact<{
  examId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
  sessionId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetProctorLogsQuery = { __typename?: 'Query', proctorLogs: Array<{ __typename?: 'ProctorLog', id: string, sessionId?: string | null, examId?: string | null, studentId?: string | null, eventType: string, createdAt: string, updatedAt: string }> };

export type GetSessionsByCreatorQueryVariables = Exact<{
  creatorId: Scalars['ID']['input'];
}>;


export type GetSessionsByCreatorQuery = { __typename?: 'Query', getSessionsByCreator: Array<{ __typename?: 'ExamSession', classId: string, id: string, startTime: string, description: string, createdAt: string, endTime: string, updatedAt: string, status?: string | null, class?: { __typename?: 'Class', id: string, name: string } | null, exam?: { __typename?: 'Exam', id: string, name: string } | null }> };

export type GetStudentsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type GetStudentsByClassQuery = { __typename?: 'Query', studentsByClass: Array<{ __typename?: 'Student', id: string, name: string }> };

export type CreateSubjectMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateSubjectMutation = { __typename?: 'Mutation', createSubject: { __typename?: 'Subject', id: string, name: string, createdAt: string } };

export type CreateTopicMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  subjectId: Scalars['ID']['input'];
  grade?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateTopicMutation = { __typename?: 'Mutation', createTopic: { __typename?: 'Topic', id: string, name: string, grade: number } };

export type GetSubjectQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubjectQuery = { __typename?: 'Query', subjects: Array<{ __typename?: 'Subject', createdAt: string, id: string, name: string }> };

export type GetTopicsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTopicsQuery = { __typename?: 'Query', topics: Array<{ __typename?: 'Topic', subjectId: string, name: string, id: string, grade: number, createdAt: string }> };

export type UpdateexamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  topicId?: InputMaybe<Scalars['ID']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateexamMutation = { __typename?: 'Mutation', updateExam: { __typename?: 'Exam', id: string, name: string, subjectId?: string | null, topicId?: string | null, isPublic: boolean, updatedAt: string } };

export type GetStudentsByClasssQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type GetStudentsByClasssQuery = { __typename?: 'Query', studentsByClass: Array<{ __typename?: 'Student', id: string, name: string, email: string, phone: string, classId: string, createdAt: string }> };

export type CreateExamMaterialMutationVariables = Exact<{
  creatorId: Scalars['ID']['input'];
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  subjectId: Scalars['ID']['input'];
  topicId: Scalars['ID']['input'];
}>;


export type CreateExamMaterialMutation = { __typename?: 'Mutation', createExam: { __typename?: 'Exam', id: string, name: string } };

export type CreateQuestionMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  question: Scalars['String']['input'];
  answers: Array<Scalars['String']['input']> | Scalars['String']['input'];
  correctIndex: Scalars['Int']['input'];
  variation?: InputMaybe<Scalars['String']['input']>;
  attachmentKey?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateQuestionMutation = { __typename?: 'Mutation', createQuestion: { __typename?: 'Question', id: string } };

export type DeleteQuestionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'Mutation', deleteQuestion: boolean };

export type GetExamCreateOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamCreateOptionsQuery = { __typename?: 'Query', staffUsers: Array<{ __typename?: 'User', id: string, name: string, lastName: string }>, subjects: Array<{ __typename?: 'Subject', id: string, name: string }> };

export type GetExamForEditQueryVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type GetExamForEditQuery = { __typename?: 'Query', exam?: { __typename?: 'Exam', id: string, name: string } | null, questions: Array<{ __typename?: 'Question', id: string, question: string, answers: Array<string>, correctIndex: number, variation: string, attachmentKey?: string | null, attachmentUrl?: string | null }> };

export type GetExamssQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamssQueryQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string, isPublic: boolean, name: string, parentId?: string | null, subjectId?: string | null, topicId?: string | null, createdAt: string, creatorId?: string | null }> };

export type GetSubjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubjectsQuery = { __typename?: 'Query', subjects: Array<{ __typename?: 'Subject', id: string, name: string }> };

export type TopicsBySubjectQueryVariables = Exact<{
  subjectId: Scalars['ID']['input'];
}>;


export type TopicsBySubjectQuery = { __typename?: 'Query', topics: Array<{ __typename?: 'Topic', id: string, name: string, grade: number }> };

export type UpdateExamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateExamMutation = { __typename?: 'Mutation', updateExam: { __typename?: 'Exam', id: string, name: string } };

export type UpdateQuestionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  question?: InputMaybe<Scalars['String']['input']>;
  answers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  correctIndex?: InputMaybe<Scalars['Int']['input']>;
  variation?: InputMaybe<Scalars['String']['input']>;
  attachmentKey?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateQuestionMutation = { __typename?: 'Mutation', updateQuestion: { __typename?: 'Question', id: string } };

export type CreateClassMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateClassMutation = { __typename?: 'Mutation', createClass: { __typename?: 'Class', id: string, name: string } };

export type CreateExamMutationVariables = Exact<{
  name: Scalars['String']['input'];
  creatorId: Scalars['ID']['input'];
  subjectId: Scalars['ID']['input'];
  topicId: Scalars['ID']['input'];
}>;


export type CreateExamMutation = { __typename?: 'Mutation', createExam: { __typename?: 'Exam', id: string, name: string } };

export type GetExamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamsQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string, name: string, createdAt: string }> };

export type CreateStudentMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  classId: Scalars['ID']['input'];
}>;


export type CreateStudentMutation = { __typename?: 'Mutation', createStudent: { __typename?: 'Student', id: string, name: string, email: string, phone: string, classId: string } };

export type MyQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyQueryQuery = { __typename?: 'Query', getStudents: Array<{ __typename?: 'Student', classId: string, email: string, id: string, name: string }> };

export type CreateProctorLogMutationVariables = Exact<{
  eventType: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
  examId?: InputMaybe<Scalars['ID']['input']>;
  sessionId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CreateProctorLogMutation = { __typename?: 'Mutation', createProctorLog: { __typename?: 'ProctorLog', id: string } };

export type GetActiveExamTakingQueryVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type GetActiveExamTakingQuery = { __typename?: 'Query', exam?: { __typename?: 'Exam', id: string, name: string } | null, examQuestionsForTaker: Array<{ __typename?: 'ExamQuestionForTaker', id: string, question: string, answers: Array<string>, variation: string, attachmentUrl?: string | null }> };

export type GetExamSessionForActiveExamQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type GetExamSessionForActiveExamQuery = { __typename?: 'Query', examSession?: { __typename?: 'ExamSession', id: string, examId: string, startTime: string, endTime: string, description: string, status?: string | null } | null, studentExamSessionStatus?: { __typename?: 'StudentExamSessionStatus', isStarted: boolean, isFinished: boolean } | null };

export type MarkStudentExamSessionStartedMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type MarkStudentExamSessionStartedMutation = { __typename?: 'Mutation', markStudentExamSessionStarted: boolean };

export type SubmitExamAnswersMutationVariables = Exact<{
  studentId: Scalars['ID']['input'];
  examId: Scalars['ID']['input'];
  sessionId?: InputMaybe<Scalars['ID']['input']>;
  answers: Array<StudentExamAnswerInput> | StudentExamAnswerInput;
}>;


export type SubmitExamAnswersMutation = { __typename?: 'Mutation', submitExamAnswers: { __typename?: 'SubmitExamAnswersPayload', success: boolean, submittedCount: number } };


export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    success
    message
    user {
      id
      name
      lastName
      email
      username
      role
      subjects
      classIds
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const GetQuestionsForSessionDocument = gql`
    query GetQuestionsForSession($examId: ID!) {
  questions(examId: $examId) {
    id
    examId
    question
    answers
    correctIndex
    variation
    attachmentUrl
    createdAt
  }
}
    `;

/**
 * __useGetQuestionsForSessionQuery__
 *
 * To run a query within a React component, call `useGetQuestionsForSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionsForSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionsForSessionQuery({
 *   variables: {
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useGetQuestionsForSessionQuery(baseOptions: Apollo.QueryHookOptions<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables> & ({ variables: GetQuestionsForSessionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>(GetQuestionsForSessionDocument, options);
      }
export function useGetQuestionsForSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>(GetQuestionsForSessionDocument, options);
        }
// @ts-ignore
export function useGetQuestionsForSessionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>): Apollo.UseSuspenseQueryResult<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>;
export function useGetQuestionsForSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>): Apollo.UseSuspenseQueryResult<GetQuestionsForSessionQuery | undefined, GetQuestionsForSessionQueryVariables>;
export function useGetQuestionsForSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>(GetQuestionsForSessionDocument, options);
        }
export type GetQuestionsForSessionQueryHookResult = ReturnType<typeof useGetQuestionsForSessionQuery>;
export type GetQuestionsForSessionLazyQueryHookResult = ReturnType<typeof useGetQuestionsForSessionLazyQuery>;
export type GetQuestionsForSessionSuspenseQueryHookResult = ReturnType<typeof useGetQuestionsForSessionSuspenseQuery>;
export type GetQuestionsForSessionQueryResult = Apollo.QueryResult<GetQuestionsForSessionQuery, GetQuestionsForSessionQueryVariables>;
export const GetStudentAnswersDocument = gql`
    query GetStudentAnswers($sessionId: ID, $examId: ID) {
  studentAnswers(sessionId: $sessionId, examId: $examId) {
    id
    studentId
    sessionId
    examId
    questionId
    answerIndex
    createdAt
  }
}
    `;

/**
 * __useGetStudentAnswersQuery__
 *
 * To run a query within a React component, call `useGetStudentAnswersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStudentAnswersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStudentAnswersQuery({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useGetStudentAnswersQuery(baseOptions?: Apollo.QueryHookOptions<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>(GetStudentAnswersDocument, options);
      }
export function useGetStudentAnswersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>(GetStudentAnswersDocument, options);
        }
// @ts-ignore
export function useGetStudentAnswersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>;
export function useGetStudentAnswersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentAnswersQuery | undefined, GetStudentAnswersQueryVariables>;
export function useGetStudentAnswersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>(GetStudentAnswersDocument, options);
        }
export type GetStudentAnswersQueryHookResult = ReturnType<typeof useGetStudentAnswersQuery>;
export type GetStudentAnswersLazyQueryHookResult = ReturnType<typeof useGetStudentAnswersLazyQuery>;
export type GetStudentAnswersSuspenseQueryHookResult = ReturnType<typeof useGetStudentAnswersSuspenseQuery>;
export type GetStudentAnswersQueryResult = Apollo.QueryResult<GetStudentAnswersQuery, GetStudentAnswersQueryVariables>;
export const GetClassesDetailPageDocument = gql`
    query GetClassesDetailPage {
  getClasses {
    id
    name
  }
}
    `;

/**
 * __useGetClassesDetailPageQuery__
 *
 * To run a query within a React component, call `useGetClassesDetailPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClassesDetailPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClassesDetailPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetClassesDetailPageQuery(baseOptions?: Apollo.QueryHookOptions<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>(GetClassesDetailPageDocument, options);
      }
export function useGetClassesDetailPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>(GetClassesDetailPageDocument, options);
        }
// @ts-ignore
export function useGetClassesDetailPageSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>;
export function useGetClassesDetailPageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassesDetailPageQuery | undefined, GetClassesDetailPageQueryVariables>;
export function useGetClassesDetailPageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>(GetClassesDetailPageDocument, options);
        }
export type GetClassesDetailPageQueryHookResult = ReturnType<typeof useGetClassesDetailPageQuery>;
export type GetClassesDetailPageLazyQueryHookResult = ReturnType<typeof useGetClassesDetailPageLazyQuery>;
export type GetClassesDetailPageSuspenseQueryHookResult = ReturnType<typeof useGetClassesDetailPageSuspenseQuery>;
export type GetClassesDetailPageQueryResult = Apollo.QueryResult<GetClassesDetailPageQuery, GetClassesDetailPageQueryVariables>;
export const GetStudentsDocument = gql`
    query GetStudents {
  getStudents {
    email
    id
    name
    classId
  }
}
    `;

/**
 * __useGetStudentsQuery__
 *
 * To run a query within a React component, call `useGetStudentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStudentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStudentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetStudentsQuery(baseOptions?: Apollo.QueryHookOptions<GetStudentsQuery, GetStudentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStudentsQuery, GetStudentsQueryVariables>(GetStudentsDocument, options);
      }
export function useGetStudentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStudentsQuery, GetStudentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStudentsQuery, GetStudentsQueryVariables>(GetStudentsDocument, options);
        }
// @ts-ignore
export function useGetStudentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStudentsQuery, GetStudentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentsQuery, GetStudentsQueryVariables>;
export function useGetStudentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentsQuery, GetStudentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentsQuery | undefined, GetStudentsQueryVariables>;
export function useGetStudentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentsQuery, GetStudentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStudentsQuery, GetStudentsQueryVariables>(GetStudentsDocument, options);
        }
export type GetStudentsQueryHookResult = ReturnType<typeof useGetStudentsQuery>;
export type GetStudentsLazyQueryHookResult = ReturnType<typeof useGetStudentsLazyQuery>;
export type GetStudentsSuspenseQueryHookResult = ReturnType<typeof useGetStudentsSuspenseQuery>;
export type GetStudentsQueryResult = Apollo.QueryResult<GetStudentsQuery, GetStudentsQueryVariables>;
export const AssignTeacherToClassDocument = gql`
    mutation AssignTeacherToClass($teacherId: ID!, $classId: ID!) {
  assignTeacherToClass(teacherId: $teacherId, classId: $classId) {
    id
    name
    lastName
    email
    role
    subjects
    classIds
  }
}
    `;
export type AssignTeacherToClassMutationFn = Apollo.MutationFunction<AssignTeacherToClassMutation, AssignTeacherToClassMutationVariables>;

/**
 * __useAssignTeacherToClassMutation__
 *
 * To run a mutation, you first call `useAssignTeacherToClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignTeacherToClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignTeacherToClassMutation, { data, loading, error }] = useAssignTeacherToClassMutation({
 *   variables: {
 *      teacherId: // value for 'teacherId'
 *      classId: // value for 'classId'
 *   },
 * });
 */
export function useAssignTeacherToClassMutation(baseOptions?: Apollo.MutationHookOptions<AssignTeacherToClassMutation, AssignTeacherToClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignTeacherToClassMutation, AssignTeacherToClassMutationVariables>(AssignTeacherToClassDocument, options);
      }
export type AssignTeacherToClassMutationHookResult = ReturnType<typeof useAssignTeacherToClassMutation>;
export type AssignTeacherToClassMutationResult = Apollo.MutationResult<AssignTeacherToClassMutation>;
export type AssignTeacherToClassMutationOptions = Apollo.BaseMutationOptions<AssignTeacherToClassMutation, AssignTeacherToClassMutationVariables>;
export const CreateTeacherDocument = gql`
    mutation CreateTeacher($name: String!, $lastName: String!, $email: String!, $subjects: [String], $role: UserRole) {
  createTeacher(
    name: $name
    lastName: $lastName
    email: $email
    subjects: $subjects
    role: $role
  ) {
    id
    name
    lastName
    email
    role
    subjects
    classIds
    createdAt
  }
}
    `;
export type CreateTeacherMutationFn = Apollo.MutationFunction<CreateTeacherMutation, CreateTeacherMutationVariables>;

/**
 * __useCreateTeacherMutation__
 *
 * To run a mutation, you first call `useCreateTeacherMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTeacherMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTeacherMutation, { data, loading, error }] = useCreateTeacherMutation({
 *   variables: {
 *      name: // value for 'name'
 *      lastName: // value for 'lastName'
 *      email: // value for 'email'
 *      subjects: // value for 'subjects'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useCreateTeacherMutation(baseOptions?: Apollo.MutationHookOptions<CreateTeacherMutation, CreateTeacherMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTeacherMutation, CreateTeacherMutationVariables>(CreateTeacherDocument, options);
      }
export type CreateTeacherMutationHookResult = ReturnType<typeof useCreateTeacherMutation>;
export type CreateTeacherMutationResult = Apollo.MutationResult<CreateTeacherMutation>;
export type CreateTeacherMutationOptions = Apollo.BaseMutationOptions<CreateTeacherMutation, CreateTeacherMutationVariables>;
export const DeleteTeacherDocument = gql`
    mutation DeleteTeacher($teacherId: ID!) {
  deleteTeacher(teacherId: $teacherId)
}
    `;
export type DeleteTeacherMutationFn = Apollo.MutationFunction<DeleteTeacherMutation, DeleteTeacherMutationVariables>;

/**
 * __useDeleteTeacherMutation__
 *
 * To run a mutation, you first call `useDeleteTeacherMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTeacherMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTeacherMutation, { data, loading, error }] = useDeleteTeacherMutation({
 *   variables: {
 *      teacherId: // value for 'teacherId'
 *   },
 * });
 */
export function useDeleteTeacherMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTeacherMutation, DeleteTeacherMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTeacherMutation, DeleteTeacherMutationVariables>(DeleteTeacherDocument, options);
      }
export type DeleteTeacherMutationHookResult = ReturnType<typeof useDeleteTeacherMutation>;
export type DeleteTeacherMutationResult = Apollo.MutationResult<DeleteTeacherMutation>;
export type DeleteTeacherMutationOptions = Apollo.BaseMutationOptions<DeleteTeacherMutation, DeleteTeacherMutationVariables>;
export const GetStaffUsersDocument = gql`
    query GetStaffUsers {
  staffUsers {
    id
    name
    lastName
    email
    role
    subjects
    classIds
    createdAt
  }
}
    `;

/**
 * __useGetStaffUsersQuery__
 *
 * To run a query within a React component, call `useGetStaffUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStaffUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStaffUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetStaffUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetStaffUsersQuery, GetStaffUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStaffUsersQuery, GetStaffUsersQueryVariables>(GetStaffUsersDocument, options);
      }
export function useGetStaffUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStaffUsersQuery, GetStaffUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStaffUsersQuery, GetStaffUsersQueryVariables>(GetStaffUsersDocument, options);
        }
// @ts-ignore
export function useGetStaffUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStaffUsersQuery, GetStaffUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetStaffUsersQuery, GetStaffUsersQueryVariables>;
export function useGetStaffUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStaffUsersQuery, GetStaffUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetStaffUsersQuery | undefined, GetStaffUsersQueryVariables>;
export function useGetStaffUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStaffUsersQuery, GetStaffUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStaffUsersQuery, GetStaffUsersQueryVariables>(GetStaffUsersDocument, options);
        }
export type GetStaffUsersQueryHookResult = ReturnType<typeof useGetStaffUsersQuery>;
export type GetStaffUsersLazyQueryHookResult = ReturnType<typeof useGetStaffUsersLazyQuery>;
export type GetStaffUsersSuspenseQueryHookResult = ReturnType<typeof useGetStaffUsersSuspenseQuery>;
export type GetStaffUsersQueryResult = Apollo.QueryResult<GetStaffUsersQuery, GetStaffUsersQueryVariables>;
export const RemoveTeacherFromClassDocument = gql`
    mutation RemoveTeacherFromClass($teacherId: ID!, $classId: ID!) {
  removeTeacherFromClass(teacherId: $teacherId, classId: $classId) {
    id
    name
    lastName
    email
    role
    subjects
    classIds
  }
}
    `;
export type RemoveTeacherFromClassMutationFn = Apollo.MutationFunction<RemoveTeacherFromClassMutation, RemoveTeacherFromClassMutationVariables>;

/**
 * __useRemoveTeacherFromClassMutation__
 *
 * To run a mutation, you first call `useRemoveTeacherFromClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTeacherFromClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeTeacherFromClassMutation, { data, loading, error }] = useRemoveTeacherFromClassMutation({
 *   variables: {
 *      teacherId: // value for 'teacherId'
 *      classId: // value for 'classId'
 *   },
 * });
 */
export function useRemoveTeacherFromClassMutation(baseOptions?: Apollo.MutationHookOptions<RemoveTeacherFromClassMutation, RemoveTeacherFromClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveTeacherFromClassMutation, RemoveTeacherFromClassMutationVariables>(RemoveTeacherFromClassDocument, options);
      }
export type RemoveTeacherFromClassMutationHookResult = ReturnType<typeof useRemoveTeacherFromClassMutation>;
export type RemoveTeacherFromClassMutationResult = Apollo.MutationResult<RemoveTeacherFromClassMutation>;
export type RemoveTeacherFromClassMutationOptions = Apollo.BaseMutationOptions<RemoveTeacherFromClassMutation, RemoveTeacherFromClassMutationVariables>;
export const CreateExamSessionMutationDocument = gql`
    mutation CreateExamSessionMutation($description: String = "", $classId: ID = "", $creatorId: ID!, $endTime: String = "", $examId: ID = "", $startTime: String = "") {
  createExamSession(
    input: {examId: $examId, classId: $classId, creatorId: $creatorId, description: $description, startTime: $startTime, endTime: $endTime}
  ) {
    createdAt
    updatedAt
    startTime
    status
    id
    creatorId
    description
    endTime
    class {
      name
      id
    }
    exam {
      id
      name
    }
  }
}
    `;
export type CreateExamSessionMutationMutationFn = Apollo.MutationFunction<CreateExamSessionMutationMutation, CreateExamSessionMutationMutationVariables>;

/**
 * __useCreateExamSessionMutationMutation__
 *
 * To run a mutation, you first call `useCreateExamSessionMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExamSessionMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExamSessionMutationMutation, { data, loading, error }] = useCreateExamSessionMutationMutation({
 *   variables: {
 *      description: // value for 'description'
 *      classId: // value for 'classId'
 *      creatorId: // value for 'creatorId'
 *      endTime: // value for 'endTime'
 *      examId: // value for 'examId'
 *      startTime: // value for 'startTime'
 *   },
 * });
 */
export function useCreateExamSessionMutationMutation(baseOptions?: Apollo.MutationHookOptions<CreateExamSessionMutationMutation, CreateExamSessionMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateExamSessionMutationMutation, CreateExamSessionMutationMutationVariables>(CreateExamSessionMutationDocument, options);
      }
export type CreateExamSessionMutationMutationHookResult = ReturnType<typeof useCreateExamSessionMutationMutation>;
export type CreateExamSessionMutationMutationResult = Apollo.MutationResult<CreateExamSessionMutationMutation>;
export type CreateExamSessionMutationMutationOptions = Apollo.BaseMutationOptions<CreateExamSessionMutationMutation, CreateExamSessionMutationMutationVariables>;
export const GetClassAverageDocument = gql`
    query GetClassAverage($classId: ID!, $examSessionId: ID!) {
  classAverage(classId: $classId, examSessionId: $examSessionId) {
    classId
    examSessionId
    averageScore
    totalStudents
  }
}
    `;

/**
 * __useGetClassAverageQuery__
 *
 * To run a query within a React component, call `useGetClassAverageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClassAverageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClassAverageQuery({
 *   variables: {
 *      classId: // value for 'classId'
 *      examSessionId: // value for 'examSessionId'
 *   },
 * });
 */
export function useGetClassAverageQuery(baseOptions: Apollo.QueryHookOptions<GetClassAverageQuery, GetClassAverageQueryVariables> & ({ variables: GetClassAverageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClassAverageQuery, GetClassAverageQueryVariables>(GetClassAverageDocument, options);
      }
export function useGetClassAverageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClassAverageQuery, GetClassAverageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClassAverageQuery, GetClassAverageQueryVariables>(GetClassAverageDocument, options);
        }
// @ts-ignore
export function useGetClassAverageSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClassAverageQuery, GetClassAverageQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassAverageQuery, GetClassAverageQueryVariables>;
export function useGetClassAverageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassAverageQuery, GetClassAverageQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassAverageQuery | undefined, GetClassAverageQueryVariables>;
export function useGetClassAverageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassAverageQuery, GetClassAverageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClassAverageQuery, GetClassAverageQueryVariables>(GetClassAverageDocument, options);
        }
export type GetClassAverageQueryHookResult = ReturnType<typeof useGetClassAverageQuery>;
export type GetClassAverageLazyQueryHookResult = ReturnType<typeof useGetClassAverageLazyQuery>;
export type GetClassAverageSuspenseQueryHookResult = ReturnType<typeof useGetClassAverageSuspenseQuery>;
export type GetClassAverageQueryResult = Apollo.QueryResult<GetClassAverageQuery, GetClassAverageQueryVariables>;
export const GetClassAttendanceDocument = gql`
    query GetClassAttendance($classId: ID!, $examSessionId: ID!) {
  classAttendance(classId: $classId, examSessionId: $examSessionId) {
    classId
    examSessionId
    attended
    totalStudents
    attendanceRate
    attendedStudentIds
  }
}
    `;

/**
 * __useGetClassAttendanceQuery__
 *
 * To run a query within a React component, call `useGetClassAttendanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClassAttendanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClassAttendanceQuery({
 *   variables: {
 *      classId: // value for 'classId'
 *      examSessionId: // value for 'examSessionId'
 *   },
 * });
 */
export function useGetClassAttendanceQuery(baseOptions: Apollo.QueryHookOptions<GetClassAttendanceQuery, GetClassAttendanceQueryVariables> & ({ variables: GetClassAttendanceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>(GetClassAttendanceDocument, options);
      }
export function useGetClassAttendanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>(GetClassAttendanceDocument, options);
        }
// @ts-ignore
export function useGetClassAttendanceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>;
export function useGetClassAttendanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassAttendanceQuery | undefined, GetClassAttendanceQueryVariables>;
export function useGetClassAttendanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>(GetClassAttendanceDocument, options);
        }
export type GetClassAttendanceQueryHookResult = ReturnType<typeof useGetClassAttendanceQuery>;
export type GetClassAttendanceLazyQueryHookResult = ReturnType<typeof useGetClassAttendanceLazyQuery>;
export type GetClassAttendanceSuspenseQueryHookResult = ReturnType<typeof useGetClassAttendanceSuspenseQuery>;
export type GetClassAttendanceQueryResult = Apollo.QueryResult<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>;
export const GetActiveSessionDocument = gql`
    query GetActiveSession {
  getActiveSessions {
    classId
    class {
      id
      name
    }
    exam {
      id
      name
    }
    id
    startTime
    description
    createdAt
    endTime
    updatedAt
    status
  }
}
    `;

/**
 * __useGetActiveSessionQuery__
 *
 * To run a query within a React component, call `useGetActiveSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveSessionQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveSessionQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveSessionQuery, GetActiveSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveSessionQuery, GetActiveSessionQueryVariables>(GetActiveSessionDocument, options);
      }
export function useGetActiveSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveSessionQuery, GetActiveSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveSessionQuery, GetActiveSessionQueryVariables>(GetActiveSessionDocument, options);
        }
// @ts-ignore
export function useGetActiveSessionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetActiveSessionQuery, GetActiveSessionQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveSessionQuery, GetActiveSessionQueryVariables>;
export function useGetActiveSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveSessionQuery, GetActiveSessionQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveSessionQuery | undefined, GetActiveSessionQueryVariables>;
export function useGetActiveSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveSessionQuery, GetActiveSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveSessionQuery, GetActiveSessionQueryVariables>(GetActiveSessionDocument, options);
        }
export type GetActiveSessionQueryHookResult = ReturnType<typeof useGetActiveSessionQuery>;
export type GetActiveSessionLazyQueryHookResult = ReturnType<typeof useGetActiveSessionLazyQuery>;
export type GetActiveSessionSuspenseQueryHookResult = ReturnType<typeof useGetActiveSessionSuspenseQuery>;
export type GetActiveSessionQueryResult = Apollo.QueryResult<GetActiveSessionQuery, GetActiveSessionQueryVariables>;
export const GetClassesDocument = gql`
    query GetClasses {
  getClasses {
    id
    name
  }
}
    `;

/**
 * __useGetClassesQuery__
 *
 * To run a query within a React component, call `useGetClassesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClassesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClassesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetClassesQuery(baseOptions?: Apollo.QueryHookOptions<GetClassesQuery, GetClassesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClassesQuery, GetClassesQueryVariables>(GetClassesDocument, options);
      }
export function useGetClassesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClassesQuery, GetClassesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClassesQuery, GetClassesQueryVariables>(GetClassesDocument, options);
        }
// @ts-ignore
export function useGetClassesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClassesQuery, GetClassesQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassesQuery, GetClassesQueryVariables>;
export function useGetClassesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassesQuery, GetClassesQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassesQuery | undefined, GetClassesQueryVariables>;
export function useGetClassesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassesQuery, GetClassesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClassesQuery, GetClassesQueryVariables>(GetClassesDocument, options);
        }
export type GetClassesQueryHookResult = ReturnType<typeof useGetClassesQuery>;
export type GetClassesLazyQueryHookResult = ReturnType<typeof useGetClassesLazyQuery>;
export type GetClassesSuspenseQueryHookResult = ReturnType<typeof useGetClassesSuspenseQuery>;
export type GetClassesQueryResult = Apollo.QueryResult<GetClassesQuery, GetClassesQueryVariables>;
export const GetExamDocument = gql`
    query GetExam {
  exams {
    createdAt
    creatorId
    id
    isPublic
    name
    subjectId
    topicId
  }
}
    `;

/**
 * __useGetExamQuery__
 *
 * To run a query within a React component, call `useGetExamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExamQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetExamQuery(baseOptions?: Apollo.QueryHookOptions<GetExamQuery, GetExamQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExamQuery, GetExamQueryVariables>(GetExamDocument, options);
      }
export function useGetExamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExamQuery, GetExamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExamQuery, GetExamQueryVariables>(GetExamDocument, options);
        }
// @ts-ignore
export function useGetExamSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetExamQuery, GetExamQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamQuery, GetExamQueryVariables>;
export function useGetExamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamQuery, GetExamQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamQuery | undefined, GetExamQueryVariables>;
export function useGetExamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamQuery, GetExamQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExamQuery, GetExamQueryVariables>(GetExamDocument, options);
        }
export type GetExamQueryHookResult = ReturnType<typeof useGetExamQuery>;
export type GetExamLazyQueryHookResult = ReturnType<typeof useGetExamLazyQuery>;
export type GetExamSuspenseQueryHookResult = ReturnType<typeof useGetExamSuspenseQuery>;
export type GetExamQueryResult = Apollo.QueryResult<GetExamQuery, GetExamQueryVariables>;
export const GetProctorLogsDocument = gql`
    query GetProctorLogs($examId: ID, $studentId: ID, $sessionId: ID) {
  proctorLogs(examId: $examId, studentId: $studentId, sessionId: $sessionId) {
    id
    sessionId
    examId
    studentId
    eventType
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetProctorLogsQuery__
 *
 * To run a query within a React component, call `useGetProctorLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProctorLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProctorLogsQuery({
 *   variables: {
 *      examId: // value for 'examId'
 *      studentId: // value for 'studentId'
 *      sessionId: // value for 'sessionId'
 *   },
 * });
 */
export function useGetProctorLogsQuery(baseOptions?: Apollo.QueryHookOptions<GetProctorLogsQuery, GetProctorLogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProctorLogsQuery, GetProctorLogsQueryVariables>(GetProctorLogsDocument, options);
      }
export function useGetProctorLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProctorLogsQuery, GetProctorLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProctorLogsQuery, GetProctorLogsQueryVariables>(GetProctorLogsDocument, options);
        }
// @ts-ignore
export function useGetProctorLogsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProctorLogsQuery, GetProctorLogsQueryVariables>): Apollo.UseSuspenseQueryResult<GetProctorLogsQuery, GetProctorLogsQueryVariables>;
export function useGetProctorLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProctorLogsQuery, GetProctorLogsQueryVariables>): Apollo.UseSuspenseQueryResult<GetProctorLogsQuery | undefined, GetProctorLogsQueryVariables>;
export function useGetProctorLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProctorLogsQuery, GetProctorLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProctorLogsQuery, GetProctorLogsQueryVariables>(GetProctorLogsDocument, options);
        }
export type GetProctorLogsQueryHookResult = ReturnType<typeof useGetProctorLogsQuery>;
export type GetProctorLogsLazyQueryHookResult = ReturnType<typeof useGetProctorLogsLazyQuery>;
export type GetProctorLogsSuspenseQueryHookResult = ReturnType<typeof useGetProctorLogsSuspenseQuery>;
export type GetProctorLogsQueryResult = Apollo.QueryResult<GetProctorLogsQuery, GetProctorLogsQueryVariables>;
export const GetSessionsByCreatorDocument = gql`
    query GetSessionsByCreator($creatorId: ID!) {
  getSessionsByCreator(creatorId: $creatorId) {
    classId
    class {
      id
      name
    }
    exam {
      id
      name
    }
    id
    startTime
    description
    createdAt
    endTime
    updatedAt
    status
  }
}
    `;

/**
 * __useGetSessionsByCreatorQuery__
 *
 * To run a query within a React component, call `useGetSessionsByCreatorQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsByCreatorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsByCreatorQuery({
 *   variables: {
 *      creatorId: // value for 'creatorId'
 *   },
 * });
 */
export function useGetSessionsByCreatorQuery(baseOptions: Apollo.QueryHookOptions<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables> & ({ variables: GetSessionsByCreatorQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>(GetSessionsByCreatorDocument, options);
      }
export function useGetSessionsByCreatorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>(GetSessionsByCreatorDocument, options);
        }
// @ts-ignore
export function useGetSessionsByCreatorSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>): Apollo.UseSuspenseQueryResult<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>;
export function useGetSessionsByCreatorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>): Apollo.UseSuspenseQueryResult<GetSessionsByCreatorQuery | undefined, GetSessionsByCreatorQueryVariables>;
export function useGetSessionsByCreatorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>(GetSessionsByCreatorDocument, options);
        }
export type GetSessionsByCreatorQueryHookResult = ReturnType<typeof useGetSessionsByCreatorQuery>;
export type GetSessionsByCreatorLazyQueryHookResult = ReturnType<typeof useGetSessionsByCreatorLazyQuery>;
export type GetSessionsByCreatorSuspenseQueryHookResult = ReturnType<typeof useGetSessionsByCreatorSuspenseQuery>;
export type GetSessionsByCreatorQueryResult = Apollo.QueryResult<GetSessionsByCreatorQuery, GetSessionsByCreatorQueryVariables>;
export const GetStudentsByClassDocument = gql`
    query GetStudentsByClass($classId: ID!) {
  studentsByClass(classId: $classId) {
    id
    name
  }
}
    `;

/**
 * __useGetStudentsByClassQuery__
 *
 * To run a query within a React component, call `useGetStudentsByClassQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStudentsByClassQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStudentsByClassQuery({
 *   variables: {
 *      classId: // value for 'classId'
 *   },
 * });
 */
export function useGetStudentsByClassQuery(baseOptions: Apollo.QueryHookOptions<GetStudentsByClassQuery, GetStudentsByClassQueryVariables> & ({ variables: GetStudentsByClassQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>(GetStudentsByClassDocument, options);
      }
export function useGetStudentsByClassLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>(GetStudentsByClassDocument, options);
        }
// @ts-ignore
export function useGetStudentsByClassSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>;
export function useGetStudentsByClassSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentsByClassQuery | undefined, GetStudentsByClassQueryVariables>;
export function useGetStudentsByClassSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>(GetStudentsByClassDocument, options);
        }
export type GetStudentsByClassQueryHookResult = ReturnType<typeof useGetStudentsByClassQuery>;
export type GetStudentsByClassLazyQueryHookResult = ReturnType<typeof useGetStudentsByClassLazyQuery>;
export type GetStudentsByClassSuspenseQueryHookResult = ReturnType<typeof useGetStudentsByClassSuspenseQuery>;
export type GetStudentsByClassQueryResult = Apollo.QueryResult<GetStudentsByClassQuery, GetStudentsByClassQueryVariables>;
export const CreateSubjectDocument = gql`
    mutation CreateSubject($name: String = "") {
  createSubject(name: $name) {
    id
    name
    createdAt
  }
}
    `;
export type CreateSubjectMutationFn = Apollo.MutationFunction<CreateSubjectMutation, CreateSubjectMutationVariables>;

/**
 * __useCreateSubjectMutation__
 *
 * To run a mutation, you first call `useCreateSubjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSubjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSubjectMutation, { data, loading, error }] = useCreateSubjectMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateSubjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateSubjectMutation, CreateSubjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSubjectMutation, CreateSubjectMutationVariables>(CreateSubjectDocument, options);
      }
export type CreateSubjectMutationHookResult = ReturnType<typeof useCreateSubjectMutation>;
export type CreateSubjectMutationResult = Apollo.MutationResult<CreateSubjectMutation>;
export type CreateSubjectMutationOptions = Apollo.BaseMutationOptions<CreateSubjectMutation, CreateSubjectMutationVariables>;
export const CreateTopicDocument = gql`
    mutation CreateTopic($name: String = "Шинэ хичээл", $subjectId: ID!, $grade: Int = 10) {
  createTopic(name: $name, subjectId: $subjectId, grade: $grade) {
    id
    name
    grade
  }
}
    `;
export type CreateTopicMutationFn = Apollo.MutationFunction<CreateTopicMutation, CreateTopicMutationVariables>;

/**
 * __useCreateTopicMutation__
 *
 * To run a mutation, you first call `useCreateTopicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTopicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTopicMutation, { data, loading, error }] = useCreateTopicMutation({
 *   variables: {
 *      name: // value for 'name'
 *      subjectId: // value for 'subjectId'
 *      grade: // value for 'grade'
 *   },
 * });
 */
export function useCreateTopicMutation(baseOptions?: Apollo.MutationHookOptions<CreateTopicMutation, CreateTopicMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTopicMutation, CreateTopicMutationVariables>(CreateTopicDocument, options);
      }
export type CreateTopicMutationHookResult = ReturnType<typeof useCreateTopicMutation>;
export type CreateTopicMutationResult = Apollo.MutationResult<CreateTopicMutation>;
export type CreateTopicMutationOptions = Apollo.BaseMutationOptions<CreateTopicMutation, CreateTopicMutationVariables>;
export const GetSubjectDocument = gql`
    query GetSubject {
  subjects {
    createdAt
    id
    name
  }
}
    `;

/**
 * __useGetSubjectQuery__
 *
 * To run a query within a React component, call `useGetSubjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubjectQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSubjectQuery(baseOptions?: Apollo.QueryHookOptions<GetSubjectQuery, GetSubjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSubjectQuery, GetSubjectQueryVariables>(GetSubjectDocument, options);
      }
export function useGetSubjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSubjectQuery, GetSubjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSubjectQuery, GetSubjectQueryVariables>(GetSubjectDocument, options);
        }
// @ts-ignore
export function useGetSubjectSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSubjectQuery, GetSubjectQueryVariables>): Apollo.UseSuspenseQueryResult<GetSubjectQuery, GetSubjectQueryVariables>;
export function useGetSubjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSubjectQuery, GetSubjectQueryVariables>): Apollo.UseSuspenseQueryResult<GetSubjectQuery | undefined, GetSubjectQueryVariables>;
export function useGetSubjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSubjectQuery, GetSubjectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSubjectQuery, GetSubjectQueryVariables>(GetSubjectDocument, options);
        }
export type GetSubjectQueryHookResult = ReturnType<typeof useGetSubjectQuery>;
export type GetSubjectLazyQueryHookResult = ReturnType<typeof useGetSubjectLazyQuery>;
export type GetSubjectSuspenseQueryHookResult = ReturnType<typeof useGetSubjectSuspenseQuery>;
export type GetSubjectQueryResult = Apollo.QueryResult<GetSubjectQuery, GetSubjectQueryVariables>;
export const GetTopicsDocument = gql`
    query GetTopics {
  topics(subjectId: "") {
    subjectId
    name
    id
    grade
    createdAt
  }
}
    `;

/**
 * __useGetTopicsQuery__
 *
 * To run a query within a React component, call `useGetTopicsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopicsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopicsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTopicsQuery(baseOptions?: Apollo.QueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTopicsQuery, GetTopicsQueryVariables>(GetTopicsDocument, options);
      }
export function useGetTopicsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTopicsQuery, GetTopicsQueryVariables>(GetTopicsDocument, options);
        }
// @ts-ignore
export function useGetTopicsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTopicsQuery, GetTopicsQueryVariables>;
export function useGetTopicsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTopicsQuery | undefined, GetTopicsQueryVariables>;
export function useGetTopicsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTopicsQuery, GetTopicsQueryVariables>(GetTopicsDocument, options);
        }
export type GetTopicsQueryHookResult = ReturnType<typeof useGetTopicsQuery>;
export type GetTopicsLazyQueryHookResult = ReturnType<typeof useGetTopicsLazyQuery>;
export type GetTopicsSuspenseQueryHookResult = ReturnType<typeof useGetTopicsSuspenseQuery>;
export type GetTopicsQueryResult = Apollo.QueryResult<GetTopicsQuery, GetTopicsQueryVariables>;
export const UpdateexamDocument = gql`
    mutation Updateexam($id: ID!, $name: String, $subjectId: ID, $topicId: ID, $isPublic: Boolean) {
  updateExam(
    id: $id
    name: $name
    subjectId: $subjectId
    topicId: $topicId
    isPublic: $isPublic
  ) {
    id
    name
    subjectId
    topicId
    isPublic
    updatedAt
  }
}
    `;
export type UpdateexamMutationFn = Apollo.MutationFunction<UpdateexamMutation, UpdateexamMutationVariables>;

/**
 * __useUpdateexamMutation__
 *
 * To run a mutation, you first call `useUpdateexamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateexamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateexamMutation, { data, loading, error }] = useUpdateexamMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      subjectId: // value for 'subjectId'
 *      topicId: // value for 'topicId'
 *      isPublic: // value for 'isPublic'
 *   },
 * });
 */
export function useUpdateexamMutation(baseOptions?: Apollo.MutationHookOptions<UpdateexamMutation, UpdateexamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateexamMutation, UpdateexamMutationVariables>(UpdateexamDocument, options);
      }
export type UpdateexamMutationHookResult = ReturnType<typeof useUpdateexamMutation>;
export type UpdateexamMutationResult = Apollo.MutationResult<UpdateexamMutation>;
export type UpdateexamMutationOptions = Apollo.BaseMutationOptions<UpdateexamMutation, UpdateexamMutationVariables>;
export const GetStudentsByClasssDocument = gql`
    query GetStudentsByClasss($classId: ID!) {
  studentsByClass(classId: $classId) {
    id
    name
    email
    phone
    classId
    createdAt
  }
}
    `;

/**
 * __useGetStudentsByClasssQuery__
 *
 * To run a query within a React component, call `useGetStudentsByClasssQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStudentsByClasssQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStudentsByClasssQuery({
 *   variables: {
 *      classId: // value for 'classId'
 *   },
 * });
 */
export function useGetStudentsByClasssQuery(baseOptions: Apollo.QueryHookOptions<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables> & ({ variables: GetStudentsByClasssQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>(GetStudentsByClasssDocument, options);
      }
export function useGetStudentsByClasssLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>(GetStudentsByClasssDocument, options);
        }
// @ts-ignore
export function useGetStudentsByClasssSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>;
export function useGetStudentsByClasssSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentsByClasssQuery | undefined, GetStudentsByClasssQueryVariables>;
export function useGetStudentsByClasssSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>(GetStudentsByClasssDocument, options);
        }
export type GetStudentsByClasssQueryHookResult = ReturnType<typeof useGetStudentsByClasssQuery>;
export type GetStudentsByClasssLazyQueryHookResult = ReturnType<typeof useGetStudentsByClasssLazyQuery>;
export type GetStudentsByClasssSuspenseQueryHookResult = ReturnType<typeof useGetStudentsByClasssSuspenseQuery>;
export type GetStudentsByClasssQueryResult = Apollo.QueryResult<GetStudentsByClasssQuery, GetStudentsByClasssQueryVariables>;
export const CreateExamMaterialDocument = gql`
    mutation CreateExamMaterial($creatorId: ID!, $isPublic: Boolean, $name: String!, $subjectId: ID!, $topicId: ID!) {
  createExam(
    name: $name
    creatorId: $creatorId
    isPublic: $isPublic
    subjectId: $subjectId
    topicId: $topicId
  ) {
    id
    name
  }
}
    `;
export type CreateExamMaterialMutationFn = Apollo.MutationFunction<CreateExamMaterialMutation, CreateExamMaterialMutationVariables>;

/**
 * __useCreateExamMaterialMutation__
 *
 * To run a mutation, you first call `useCreateExamMaterialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExamMaterialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExamMaterialMutation, { data, loading, error }] = useCreateExamMaterialMutation({
 *   variables: {
 *      creatorId: // value for 'creatorId'
 *      isPublic: // value for 'isPublic'
 *      name: // value for 'name'
 *      subjectId: // value for 'subjectId'
 *      topicId: // value for 'topicId'
 *   },
 * });
 */
export function useCreateExamMaterialMutation(baseOptions?: Apollo.MutationHookOptions<CreateExamMaterialMutation, CreateExamMaterialMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateExamMaterialMutation, CreateExamMaterialMutationVariables>(CreateExamMaterialDocument, options);
      }
export type CreateExamMaterialMutationHookResult = ReturnType<typeof useCreateExamMaterialMutation>;
export type CreateExamMaterialMutationResult = Apollo.MutationResult<CreateExamMaterialMutation>;
export type CreateExamMaterialMutationOptions = Apollo.BaseMutationOptions<CreateExamMaterialMutation, CreateExamMaterialMutationVariables>;
export const CreateQuestionDocument = gql`
    mutation CreateQuestion($examId: ID!, $question: String!, $answers: [String!]!, $correctIndex: Int!, $variation: String, $attachmentKey: String) {
  createQuestion(
    examId: $examId
    question: $question
    answers: $answers
    correctIndex: $correctIndex
    variation: $variation
    attachmentKey: $attachmentKey
  ) {
    id
  }
}
    `;
export type CreateQuestionMutationFn = Apollo.MutationFunction<CreateQuestionMutation, CreateQuestionMutationVariables>;

/**
 * __useCreateQuestionMutation__
 *
 * To run a mutation, you first call `useCreateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionMutation, { data, loading, error }] = useCreateQuestionMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *      question: // value for 'question'
 *      answers: // value for 'answers'
 *      correctIndex: // value for 'correctIndex'
 *      variation: // value for 'variation'
 *      attachmentKey: // value for 'attachmentKey'
 *   },
 * });
 */
export function useCreateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<CreateQuestionMutation, CreateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateQuestionMutation, CreateQuestionMutationVariables>(CreateQuestionDocument, options);
      }
export type CreateQuestionMutationHookResult = ReturnType<typeof useCreateQuestionMutation>;
export type CreateQuestionMutationResult = Apollo.MutationResult<CreateQuestionMutation>;
export type CreateQuestionMutationOptions = Apollo.BaseMutationOptions<CreateQuestionMutation, CreateQuestionMutationVariables>;
export const DeleteQuestionDocument = gql`
    mutation DeleteQuestion($id: ID!) {
  deleteQuestion(id: $id)
}
    `;
export type DeleteQuestionMutationFn = Apollo.MutationFunction<DeleteQuestionMutation, DeleteQuestionMutationVariables>;

/**
 * __useDeleteQuestionMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionMutation, { data, loading, error }] = useDeleteQuestionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteQuestionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteQuestionMutation, DeleteQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteQuestionMutation, DeleteQuestionMutationVariables>(DeleteQuestionDocument, options);
      }
export type DeleteQuestionMutationHookResult = ReturnType<typeof useDeleteQuestionMutation>;
export type DeleteQuestionMutationResult = Apollo.MutationResult<DeleteQuestionMutation>;
export type DeleteQuestionMutationOptions = Apollo.BaseMutationOptions<DeleteQuestionMutation, DeleteQuestionMutationVariables>;
export const GetExamCreateOptionsDocument = gql`
    query GetExamCreateOptions {
  staffUsers {
    id
    name
    lastName
  }
  subjects {
    id
    name
  }
}
    `;

/**
 * __useGetExamCreateOptionsQuery__
 *
 * To run a query within a React component, call `useGetExamCreateOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExamCreateOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExamCreateOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetExamCreateOptionsQuery(baseOptions?: Apollo.QueryHookOptions<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>(GetExamCreateOptionsDocument, options);
      }
export function useGetExamCreateOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>(GetExamCreateOptionsDocument, options);
        }
// @ts-ignore
export function useGetExamCreateOptionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>;
export function useGetExamCreateOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamCreateOptionsQuery | undefined, GetExamCreateOptionsQueryVariables>;
export function useGetExamCreateOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>(GetExamCreateOptionsDocument, options);
        }
export type GetExamCreateOptionsQueryHookResult = ReturnType<typeof useGetExamCreateOptionsQuery>;
export type GetExamCreateOptionsLazyQueryHookResult = ReturnType<typeof useGetExamCreateOptionsLazyQuery>;
export type GetExamCreateOptionsSuspenseQueryHookResult = ReturnType<typeof useGetExamCreateOptionsSuspenseQuery>;
export type GetExamCreateOptionsQueryResult = Apollo.QueryResult<GetExamCreateOptionsQuery, GetExamCreateOptionsQueryVariables>;
export const GetExamForEditDocument = gql`
    query GetExamForEdit($examId: ID!) {
  exam(id: $examId) {
    id
    name
  }
  questions(examId: $examId) {
    id
    question
    answers
    correctIndex
    variation
    attachmentKey
    attachmentUrl
  }
}
    `;

/**
 * __useGetExamForEditQuery__
 *
 * To run a query within a React component, call `useGetExamForEditQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExamForEditQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExamForEditQuery({
 *   variables: {
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useGetExamForEditQuery(baseOptions: Apollo.QueryHookOptions<GetExamForEditQuery, GetExamForEditQueryVariables> & ({ variables: GetExamForEditQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExamForEditQuery, GetExamForEditQueryVariables>(GetExamForEditDocument, options);
      }
export function useGetExamForEditLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExamForEditQuery, GetExamForEditQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExamForEditQuery, GetExamForEditQueryVariables>(GetExamForEditDocument, options);
        }
// @ts-ignore
export function useGetExamForEditSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetExamForEditQuery, GetExamForEditQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamForEditQuery, GetExamForEditQueryVariables>;
export function useGetExamForEditSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamForEditQuery, GetExamForEditQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamForEditQuery | undefined, GetExamForEditQueryVariables>;
export function useGetExamForEditSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamForEditQuery, GetExamForEditQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExamForEditQuery, GetExamForEditQueryVariables>(GetExamForEditDocument, options);
        }
export type GetExamForEditQueryHookResult = ReturnType<typeof useGetExamForEditQuery>;
export type GetExamForEditLazyQueryHookResult = ReturnType<typeof useGetExamForEditLazyQuery>;
export type GetExamForEditSuspenseQueryHookResult = ReturnType<typeof useGetExamForEditSuspenseQuery>;
export type GetExamForEditQueryResult = Apollo.QueryResult<GetExamForEditQuery, GetExamForEditQueryVariables>;
export const GetExamssQueryDocument = gql`
    query GetExamssQuery {
  exams {
    id
    isPublic
    name
    parentId
    subjectId
    topicId
    createdAt
    creatorId
  }
}
    `;

/**
 * __useGetExamssQueryQuery__
 *
 * To run a query within a React component, call `useGetExamssQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExamssQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExamssQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetExamssQueryQuery(baseOptions?: Apollo.QueryHookOptions<GetExamssQueryQuery, GetExamssQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExamssQueryQuery, GetExamssQueryQueryVariables>(GetExamssQueryDocument, options);
      }
export function useGetExamssQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExamssQueryQuery, GetExamssQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExamssQueryQuery, GetExamssQueryQueryVariables>(GetExamssQueryDocument, options);
        }
// @ts-ignore
export function useGetExamssQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetExamssQueryQuery, GetExamssQueryQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamssQueryQuery, GetExamssQueryQueryVariables>;
export function useGetExamssQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamssQueryQuery, GetExamssQueryQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamssQueryQuery | undefined, GetExamssQueryQueryVariables>;
export function useGetExamssQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamssQueryQuery, GetExamssQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExamssQueryQuery, GetExamssQueryQueryVariables>(GetExamssQueryDocument, options);
        }
export type GetExamssQueryQueryHookResult = ReturnType<typeof useGetExamssQueryQuery>;
export type GetExamssQueryLazyQueryHookResult = ReturnType<typeof useGetExamssQueryLazyQuery>;
export type GetExamssQuerySuspenseQueryHookResult = ReturnType<typeof useGetExamssQuerySuspenseQuery>;
export type GetExamssQueryQueryResult = Apollo.QueryResult<GetExamssQueryQuery, GetExamssQueryQueryVariables>;
export const GetSubjectsDocument = gql`
    query GetSubjects {
  subjects {
    id
    name
  }
}
    `;

/**
 * __useGetSubjectsQuery__
 *
 * To run a query within a React component, call `useGetSubjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSubjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetSubjectsQuery, GetSubjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSubjectsQuery, GetSubjectsQueryVariables>(GetSubjectsDocument, options);
      }
export function useGetSubjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSubjectsQuery, GetSubjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSubjectsQuery, GetSubjectsQueryVariables>(GetSubjectsDocument, options);
        }
// @ts-ignore
export function useGetSubjectsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSubjectsQuery, GetSubjectsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSubjectsQuery, GetSubjectsQueryVariables>;
export function useGetSubjectsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSubjectsQuery, GetSubjectsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSubjectsQuery | undefined, GetSubjectsQueryVariables>;
export function useGetSubjectsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSubjectsQuery, GetSubjectsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSubjectsQuery, GetSubjectsQueryVariables>(GetSubjectsDocument, options);
        }
export type GetSubjectsQueryHookResult = ReturnType<typeof useGetSubjectsQuery>;
export type GetSubjectsLazyQueryHookResult = ReturnType<typeof useGetSubjectsLazyQuery>;
export type GetSubjectsSuspenseQueryHookResult = ReturnType<typeof useGetSubjectsSuspenseQuery>;
export type GetSubjectsQueryResult = Apollo.QueryResult<GetSubjectsQuery, GetSubjectsQueryVariables>;
export const TopicsBySubjectDocument = gql`
    query TopicsBySubject($subjectId: ID!) {
  topics(subjectId: $subjectId) {
    id
    name
    grade
  }
}
    `;

/**
 * __useTopicsBySubjectQuery__
 *
 * To run a query within a React component, call `useTopicsBySubjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopicsBySubjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopicsBySubjectQuery({
 *   variables: {
 *      subjectId: // value for 'subjectId'
 *   },
 * });
 */
export function useTopicsBySubjectQuery(baseOptions: Apollo.QueryHookOptions<TopicsBySubjectQuery, TopicsBySubjectQueryVariables> & ({ variables: TopicsBySubjectQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>(TopicsBySubjectDocument, options);
      }
export function useTopicsBySubjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>(TopicsBySubjectDocument, options);
        }
// @ts-ignore
export function useTopicsBySubjectSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>): Apollo.UseSuspenseQueryResult<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>;
export function useTopicsBySubjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>): Apollo.UseSuspenseQueryResult<TopicsBySubjectQuery | undefined, TopicsBySubjectQueryVariables>;
export function useTopicsBySubjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>(TopicsBySubjectDocument, options);
        }
export type TopicsBySubjectQueryHookResult = ReturnType<typeof useTopicsBySubjectQuery>;
export type TopicsBySubjectLazyQueryHookResult = ReturnType<typeof useTopicsBySubjectLazyQuery>;
export type TopicsBySubjectSuspenseQueryHookResult = ReturnType<typeof useTopicsBySubjectSuspenseQuery>;
export type TopicsBySubjectQueryResult = Apollo.QueryResult<TopicsBySubjectQuery, TopicsBySubjectQueryVariables>;
export const UpdateExamDocument = gql`
    mutation UpdateExam($id: ID!, $name: String) {
  updateExam(id: $id, name: $name) {
    id
    name
  }
}
    `;
export type UpdateExamMutationFn = Apollo.MutationFunction<UpdateExamMutation, UpdateExamMutationVariables>;

/**
 * __useUpdateExamMutation__
 *
 * To run a mutation, you first call `useUpdateExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateExamMutation, { data, loading, error }] = useUpdateExamMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateExamMutation(baseOptions?: Apollo.MutationHookOptions<UpdateExamMutation, UpdateExamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateExamMutation, UpdateExamMutationVariables>(UpdateExamDocument, options);
      }
export type UpdateExamMutationHookResult = ReturnType<typeof useUpdateExamMutation>;
export type UpdateExamMutationResult = Apollo.MutationResult<UpdateExamMutation>;
export type UpdateExamMutationOptions = Apollo.BaseMutationOptions<UpdateExamMutation, UpdateExamMutationVariables>;
export const UpdateQuestionDocument = gql`
    mutation UpdateQuestion($id: ID!, $question: String, $answers: [String!], $correctIndex: Int, $variation: String, $attachmentKey: String) {
  updateQuestion(
    id: $id
    question: $question
    answers: $answers
    correctIndex: $correctIndex
    variation: $variation
    attachmentKey: $attachmentKey
  ) {
    id
  }
}
    `;
export type UpdateQuestionMutationFn = Apollo.MutationFunction<UpdateQuestionMutation, UpdateQuestionMutationVariables>;

/**
 * __useUpdateQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionMutation, { data, loading, error }] = useUpdateQuestionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      question: // value for 'question'
 *      answers: // value for 'answers'
 *      correctIndex: // value for 'correctIndex'
 *      variation: // value for 'variation'
 *      attachmentKey: // value for 'attachmentKey'
 *   },
 * });
 */
export function useUpdateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuestionMutation, UpdateQuestionMutationVariables>(UpdateQuestionDocument, options);
      }
export type UpdateQuestionMutationHookResult = ReturnType<typeof useUpdateQuestionMutation>;
export type UpdateQuestionMutationResult = Apollo.MutationResult<UpdateQuestionMutation>;
export type UpdateQuestionMutationOptions = Apollo.BaseMutationOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>;
export const CreateClassDocument = gql`
    mutation createClass($name: String!) {
  createClass(name: $name) {
    id
    name
  }
}
    `;
export type CreateClassMutationFn = Apollo.MutationFunction<CreateClassMutation, CreateClassMutationVariables>;

/**
 * __useCreateClassMutation__
 *
 * To run a mutation, you first call `useCreateClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createClassMutation, { data, loading, error }] = useCreateClassMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateClassMutation(baseOptions?: Apollo.MutationHookOptions<CreateClassMutation, CreateClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateClassMutation, CreateClassMutationVariables>(CreateClassDocument, options);
      }
export type CreateClassMutationHookResult = ReturnType<typeof useCreateClassMutation>;
export type CreateClassMutationResult = Apollo.MutationResult<CreateClassMutation>;
export type CreateClassMutationOptions = Apollo.BaseMutationOptions<CreateClassMutation, CreateClassMutationVariables>;
export const CreateExamDocument = gql`
    mutation CreateExam($name: String!, $creatorId: ID!, $subjectId: ID!, $topicId: ID!) {
  createExam(
    name: $name
    creatorId: $creatorId
    subjectId: $subjectId
    topicId: $topicId
  ) {
    id
    name
  }
}
    `;
export type CreateExamMutationFn = Apollo.MutationFunction<CreateExamMutation, CreateExamMutationVariables>;

/**
 * __useCreateExamMutation__
 *
 * To run a mutation, you first call `useCreateExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExamMutation, { data, loading, error }] = useCreateExamMutation({
 *   variables: {
 *      name: // value for 'name'
 *      creatorId: // value for 'creatorId'
 *      subjectId: // value for 'subjectId'
 *      topicId: // value for 'topicId'
 *   },
 * });
 */
export function useCreateExamMutation(baseOptions?: Apollo.MutationHookOptions<CreateExamMutation, CreateExamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateExamMutation, CreateExamMutationVariables>(CreateExamDocument, options);
      }
export type CreateExamMutationHookResult = ReturnType<typeof useCreateExamMutation>;
export type CreateExamMutationResult = Apollo.MutationResult<CreateExamMutation>;
export type CreateExamMutationOptions = Apollo.BaseMutationOptions<CreateExamMutation, CreateExamMutationVariables>;
export const GetExamsDocument = gql`
    query GetExams {
  exams {
    id
    name
    createdAt
  }
}
    `;

/**
 * __useGetExamsQuery__
 *
 * To run a query within a React component, call `useGetExamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExamsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetExamsQuery(baseOptions?: Apollo.QueryHookOptions<GetExamsQuery, GetExamsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExamsQuery, GetExamsQueryVariables>(GetExamsDocument, options);
      }
export function useGetExamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExamsQuery, GetExamsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExamsQuery, GetExamsQueryVariables>(GetExamsDocument, options);
        }
// @ts-ignore
export function useGetExamsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetExamsQuery, GetExamsQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamsQuery, GetExamsQueryVariables>;
export function useGetExamsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamsQuery, GetExamsQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamsQuery | undefined, GetExamsQueryVariables>;
export function useGetExamsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamsQuery, GetExamsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExamsQuery, GetExamsQueryVariables>(GetExamsDocument, options);
        }
export type GetExamsQueryHookResult = ReturnType<typeof useGetExamsQuery>;
export type GetExamsLazyQueryHookResult = ReturnType<typeof useGetExamsLazyQuery>;
export type GetExamsSuspenseQueryHookResult = ReturnType<typeof useGetExamsSuspenseQuery>;
export type GetExamsQueryResult = Apollo.QueryResult<GetExamsQuery, GetExamsQueryVariables>;
export const CreateStudentDocument = gql`
    mutation CreateStudent($name: String!, $email: String!, $phone: String!, $classId: ID!) {
  createStudent(name: $name, email: $email, phone: $phone, classId: $classId) {
    id
    name
    email
    phone
    classId
  }
}
    `;
export type CreateStudentMutationFn = Apollo.MutationFunction<CreateStudentMutation, CreateStudentMutationVariables>;

/**
 * __useCreateStudentMutation__
 *
 * To run a mutation, you first call `useCreateStudentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateStudentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createStudentMutation, { data, loading, error }] = useCreateStudentMutation({
 *   variables: {
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      phone: // value for 'phone'
 *      classId: // value for 'classId'
 *   },
 * });
 */
export function useCreateStudentMutation(baseOptions?: Apollo.MutationHookOptions<CreateStudentMutation, CreateStudentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateStudentMutation, CreateStudentMutationVariables>(CreateStudentDocument, options);
      }
export type CreateStudentMutationHookResult = ReturnType<typeof useCreateStudentMutation>;
export type CreateStudentMutationResult = Apollo.MutationResult<CreateStudentMutation>;
export type CreateStudentMutationOptions = Apollo.BaseMutationOptions<CreateStudentMutation, CreateStudentMutationVariables>;
export const MyQueryDocument = gql`
    query MyQuery {
  getStudents {
    classId
    email
    id
    name
  }
}
    `;

/**
 * __useMyQueryQuery__
 *
 * To run a query within a React component, call `useMyQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyQueryQuery(baseOptions?: Apollo.QueryHookOptions<MyQueryQuery, MyQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyQueryQuery, MyQueryQueryVariables>(MyQueryDocument, options);
      }
export function useMyQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyQueryQuery, MyQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyQueryQuery, MyQueryQueryVariables>(MyQueryDocument, options);
        }
// @ts-ignore
export function useMyQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyQueryQuery, MyQueryQueryVariables>): Apollo.UseSuspenseQueryResult<MyQueryQuery, MyQueryQueryVariables>;
export function useMyQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyQueryQuery, MyQueryQueryVariables>): Apollo.UseSuspenseQueryResult<MyQueryQuery | undefined, MyQueryQueryVariables>;
export function useMyQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyQueryQuery, MyQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyQueryQuery, MyQueryQueryVariables>(MyQueryDocument, options);
        }
export type MyQueryQueryHookResult = ReturnType<typeof useMyQueryQuery>;
export type MyQueryLazyQueryHookResult = ReturnType<typeof useMyQueryLazyQuery>;
export type MyQuerySuspenseQueryHookResult = ReturnType<typeof useMyQuerySuspenseQuery>;
export type MyQueryQueryResult = Apollo.QueryResult<MyQueryQuery, MyQueryQueryVariables>;
export const CreateProctorLogDocument = gql`
    mutation CreateProctorLog($eventType: String!, $studentId: ID!, $examId: ID, $sessionId: ID) {
  createProctorLog(
    eventType: $eventType
    studentId: $studentId
    examId: $examId
    sessionId: $sessionId
  ) {
    id
  }
}
    `;
export type CreateProctorLogMutationFn = Apollo.MutationFunction<CreateProctorLogMutation, CreateProctorLogMutationVariables>;

/**
 * __useCreateProctorLogMutation__
 *
 * To run a mutation, you first call `useCreateProctorLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProctorLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProctorLogMutation, { data, loading, error }] = useCreateProctorLogMutation({
 *   variables: {
 *      eventType: // value for 'eventType'
 *      studentId: // value for 'studentId'
 *      examId: // value for 'examId'
 *      sessionId: // value for 'sessionId'
 *   },
 * });
 */
export function useCreateProctorLogMutation(baseOptions?: Apollo.MutationHookOptions<CreateProctorLogMutation, CreateProctorLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProctorLogMutation, CreateProctorLogMutationVariables>(CreateProctorLogDocument, options);
      }
export type CreateProctorLogMutationHookResult = ReturnType<typeof useCreateProctorLogMutation>;
export type CreateProctorLogMutationResult = Apollo.MutationResult<CreateProctorLogMutation>;
export type CreateProctorLogMutationOptions = Apollo.BaseMutationOptions<CreateProctorLogMutation, CreateProctorLogMutationVariables>;
export const GetActiveExamTakingDocument = gql`
    query GetActiveExamTaking($examId: ID!) {
  exam(id: $examId) {
    id
    name
  }
  examQuestionsForTaker(examId: $examId) {
    id
    question
    answers
    variation
    attachmentUrl
  }
}
    `;

/**
 * __useGetActiveExamTakingQuery__
 *
 * To run a query within a React component, call `useGetActiveExamTakingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveExamTakingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveExamTakingQuery({
 *   variables: {
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useGetActiveExamTakingQuery(baseOptions: Apollo.QueryHookOptions<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables> & ({ variables: GetActiveExamTakingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>(GetActiveExamTakingDocument, options);
      }
export function useGetActiveExamTakingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>(GetActiveExamTakingDocument, options);
        }
// @ts-ignore
export function useGetActiveExamTakingSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>;
export function useGetActiveExamTakingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveExamTakingQuery | undefined, GetActiveExamTakingQueryVariables>;
export function useGetActiveExamTakingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>(GetActiveExamTakingDocument, options);
        }
export type GetActiveExamTakingQueryHookResult = ReturnType<typeof useGetActiveExamTakingQuery>;
export type GetActiveExamTakingLazyQueryHookResult = ReturnType<typeof useGetActiveExamTakingLazyQuery>;
export type GetActiveExamTakingSuspenseQueryHookResult = ReturnType<typeof useGetActiveExamTakingSuspenseQuery>;
export type GetActiveExamTakingQueryResult = Apollo.QueryResult<GetActiveExamTakingQuery, GetActiveExamTakingQueryVariables>;
export const GetExamSessionForActiveExamDocument = gql`
    query GetExamSessionForActiveExam($id: ID!, $studentId: ID!) {
  examSession(id: $id) {
    id
    examId
    startTime
    endTime
    description
    status
  }
  studentExamSessionStatus(sessionId: $id, studentId: $studentId) {
    isStarted
    isFinished
  }
}
    `;

/**
 * __useGetExamSessionForActiveExamQuery__
 *
 * To run a query within a React component, call `useGetExamSessionForActiveExamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExamSessionForActiveExamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExamSessionForActiveExamQuery({
 *   variables: {
 *      id: // value for 'id'
 *      studentId: // value for 'studentId'
 *   },
 * });
 */
export function useGetExamSessionForActiveExamQuery(baseOptions: Apollo.QueryHookOptions<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables> & ({ variables: GetExamSessionForActiveExamQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>(GetExamSessionForActiveExamDocument, options);
      }
export function useGetExamSessionForActiveExamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>(GetExamSessionForActiveExamDocument, options);
        }
// @ts-ignore
export function useGetExamSessionForActiveExamSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>;
export function useGetExamSessionForActiveExamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>): Apollo.UseSuspenseQueryResult<GetExamSessionForActiveExamQuery | undefined, GetExamSessionForActiveExamQueryVariables>;
export function useGetExamSessionForActiveExamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>(GetExamSessionForActiveExamDocument, options);
        }
export type GetExamSessionForActiveExamQueryHookResult = ReturnType<typeof useGetExamSessionForActiveExamQuery>;
export type GetExamSessionForActiveExamLazyQueryHookResult = ReturnType<typeof useGetExamSessionForActiveExamLazyQuery>;
export type GetExamSessionForActiveExamSuspenseQueryHookResult = ReturnType<typeof useGetExamSessionForActiveExamSuspenseQuery>;
export type GetExamSessionForActiveExamQueryResult = Apollo.QueryResult<GetExamSessionForActiveExamQuery, GetExamSessionForActiveExamQueryVariables>;
export const MarkStudentExamSessionStartedDocument = gql`
    mutation MarkStudentExamSessionStarted($sessionId: ID!, $studentId: ID!) {
  markStudentExamSessionStarted(sessionId: $sessionId, studentId: $studentId)
}
    `;
export type MarkStudentExamSessionStartedMutationFn = Apollo.MutationFunction<MarkStudentExamSessionStartedMutation, MarkStudentExamSessionStartedMutationVariables>;

/**
 * __useMarkStudentExamSessionStartedMutation__
 *
 * To run a mutation, you first call `useMarkStudentExamSessionStartedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkStudentExamSessionStartedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markStudentExamSessionStartedMutation, { data, loading, error }] = useMarkStudentExamSessionStartedMutation({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *      studentId: // value for 'studentId'
 *   },
 * });
 */
export function useMarkStudentExamSessionStartedMutation(baseOptions?: Apollo.MutationHookOptions<MarkStudentExamSessionStartedMutation, MarkStudentExamSessionStartedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkStudentExamSessionStartedMutation, MarkStudentExamSessionStartedMutationVariables>(MarkStudentExamSessionStartedDocument, options);
      }
export type MarkStudentExamSessionStartedMutationHookResult = ReturnType<typeof useMarkStudentExamSessionStartedMutation>;
export type MarkStudentExamSessionStartedMutationResult = Apollo.MutationResult<MarkStudentExamSessionStartedMutation>;
export type MarkStudentExamSessionStartedMutationOptions = Apollo.BaseMutationOptions<MarkStudentExamSessionStartedMutation, MarkStudentExamSessionStartedMutationVariables>;
export const SubmitExamAnswersDocument = gql`
    mutation SubmitExamAnswers($studentId: ID!, $examId: ID!, $sessionId: ID, $answers: [StudentExamAnswerInput!]!) {
  submitExamAnswers(
    studentId: $studentId
    examId: $examId
    sessionId: $sessionId
    answers: $answers
  ) {
    success
    submittedCount
  }
}
    `;
export type SubmitExamAnswersMutationFn = Apollo.MutationFunction<SubmitExamAnswersMutation, SubmitExamAnswersMutationVariables>;

/**
 * __useSubmitExamAnswersMutation__
 *
 * To run a mutation, you first call `useSubmitExamAnswersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitExamAnswersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitExamAnswersMutation, { data, loading, error }] = useSubmitExamAnswersMutation({
 *   variables: {
 *      studentId: // value for 'studentId'
 *      examId: // value for 'examId'
 *      sessionId: // value for 'sessionId'
 *      answers: // value for 'answers'
 *   },
 * });
 */
export function useSubmitExamAnswersMutation(baseOptions?: Apollo.MutationHookOptions<SubmitExamAnswersMutation, SubmitExamAnswersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitExamAnswersMutation, SubmitExamAnswersMutationVariables>(SubmitExamAnswersDocument, options);
      }
export type SubmitExamAnswersMutationHookResult = ReturnType<typeof useSubmitExamAnswersMutation>;
export type SubmitExamAnswersMutationResult = Apollo.MutationResult<SubmitExamAnswersMutation>;
export type SubmitExamAnswersMutationOptions = Apollo.BaseMutationOptions<SubmitExamAnswersMutation, SubmitExamAnswersMutationVariables>;