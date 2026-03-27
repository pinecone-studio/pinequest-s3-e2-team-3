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

export type Class = {
  __typename?: 'Class';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CreateExamSessionInput = {
  classId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  examId: Scalars['ID']['input'];
  startTime: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Exam = {
  __typename?: 'Exam';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ExamSession = {
  __typename?: 'ExamSession';
  class?: Maybe<Class>;
  classId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  exam?: Maybe<Exam>;
  examId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createClass: Class;
  createExam: Exam;
  createExamSession: ExamSession;
  createProctorLog: ProctorLog;
  createQuestion: Question;
  createStudent: Student;
  deleteClass: Scalars['Boolean']['output'];
  deleteExam: Scalars['Boolean']['output'];
  deleteExamSession: Scalars['Boolean']['output'];
  deleteProctorLog: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  deleteStudent: Scalars['Boolean']['output'];
  updateClass: Class;
  updateExam: Exam;
  updateExamSession: ExamSession;
  updateProctorLog: ProctorLog;
  updateQuestion: Question;
  updateStudent: Student;
};


export type MutationCreateClassArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateExamArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateExamSessionArgs = {
  input: CreateExamSessionInput;
};


export type MutationCreateProctorLogArgs = {
  eventType: Scalars['String']['input'];
  examId?: InputMaybe<Scalars['ID']['input']>;
  studentId: Scalars['ID']['input'];
};


export type MutationCreateQuestionArgs = {
  answers: Array<Scalars['String']['input']>;
  correctIndex: Scalars['Int']['input'];
  examId?: InputMaybe<Scalars['ID']['input']>;
  question: Scalars['String']['input'];
  variation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateStudentArgs = {
  classId: Scalars['ID']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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


export type MutationUpdateClassArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateExamArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateExamSessionArgs = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateProctorLogArgs = {
  eventType?: InputMaybe<Scalars['String']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpdateQuestionArgs = {
  answers?: InputMaybe<Array<Scalars['String']['input']>>;
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
};

export type ProctorLog = {
  __typename?: 'ProctorLog';
  createdAt: Scalars['String']['output'];
  eventType: Scalars['String']['output'];
  examId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  studentId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  class?: Maybe<Class>;
  exam?: Maybe<Exam>;
  examSession?: Maybe<ExamSession>;
  exams: Array<Exam>;
  getActiveSessions: Array<ExamSession>;
  getClasses: Array<Class>;
  getSessionsByClass: Array<ExamSession>;
  getStudents: Array<Student>;
  proctorLog?: Maybe<ProctorLog>;
  proctorLogs: Array<ProctorLog>;
  question?: Maybe<Question>;
  questions: Array<Question>;
  student?: Maybe<Student>;
};


export type QueryClassArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamSessionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSessionsByClassArgs = {
  classId: Scalars['ID']['input'];
};


export type QueryProctorLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProctorLogsArgs = {
  examId?: InputMaybe<Scalars['ID']['input']>;
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

export type Question = {
  __typename?: 'Question';
  answers: Array<Scalars['String']['output']>;
  correctIndex: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  examId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  variation: Scalars['String']['output'];
};

export type Student = {
  __typename?: 'Student';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};



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
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Class: ResolverTypeWrapper<Class>;
  CreateExamSessionInput: CreateExamSessionInput;
  Exam: ResolverTypeWrapper<Exam>;
  ExamSession: ResolverTypeWrapper<ExamSession>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ProctorLog: ResolverTypeWrapper<ProctorLog>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Question: ResolverTypeWrapper<Question>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Student: ResolverTypeWrapper<Student>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Class: Class;
  CreateExamSessionInput: CreateExamSessionInput;
  Exam: Exam;
  ExamSession: ExamSession;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  ProctorLog: ProctorLog;
  Query: Record<PropertyKey, never>;
  Question: Question;
  String: Scalars['String']['output'];
  Student: Student;
};

export type ClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ExamResolvers<ContextType = any, ParentType extends ResolversParentTypes['Exam'] = ResolversParentTypes['Exam']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ExamSessionResolvers<ContextType = any, ParentType extends ResolversParentTypes['ExamSession'] = ResolversParentTypes['ExamSession']> = {
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType>;
  classId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  exam?: Resolver<Maybe<ResolversTypes['Exam']>, ParentType, ContextType>;
  examId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createClass?: Resolver<ResolversTypes['Class'], ParentType, ContextType, RequireFields<MutationCreateClassArgs, 'name'>>;
  createExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationCreateExamArgs, 'name'>>;
  createExamSession?: Resolver<ResolversTypes['ExamSession'], ParentType, ContextType, RequireFields<MutationCreateExamSessionArgs, 'input'>>;
  createProctorLog?: Resolver<ResolversTypes['ProctorLog'], ParentType, ContextType, RequireFields<MutationCreateProctorLogArgs, 'eventType' | 'studentId'>>;
  createQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationCreateQuestionArgs, 'answers' | 'correctIndex' | 'question'>>;
  createStudent?: Resolver<ResolversTypes['Student'], ParentType, ContextType, RequireFields<MutationCreateStudentArgs, 'classId' | 'name'>>;
  deleteClass?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteClassArgs, 'id'>>;
  deleteExam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteExamArgs, 'id'>>;
  deleteExamSession?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteExamSessionArgs, 'id'>>;
  deleteProctorLog?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProctorLogArgs, 'id'>>;
  deleteQuestion?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteQuestionArgs, 'id'>>;
  deleteStudent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteStudentArgs, 'id'>>;
  updateClass?: Resolver<ResolversTypes['Class'], ParentType, ContextType, RequireFields<MutationUpdateClassArgs, 'id'>>;
  updateExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationUpdateExamArgs, 'id'>>;
  updateExamSession?: Resolver<ResolversTypes['ExamSession'], ParentType, ContextType, RequireFields<MutationUpdateExamSessionArgs, 'id'>>;
  updateProctorLog?: Resolver<ResolversTypes['ProctorLog'], ParentType, ContextType, RequireFields<MutationUpdateProctorLogArgs, 'id'>>;
  updateQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationUpdateQuestionArgs, 'id'>>;
  updateStudent?: Resolver<ResolversTypes['Student'], ParentType, ContextType, RequireFields<MutationUpdateStudentArgs, 'id'>>;
};

export type ProctorLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProctorLog'] = ResolversParentTypes['ProctorLog']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  examId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  studentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'id'>>;
  exam?: Resolver<Maybe<ResolversTypes['Exam']>, ParentType, ContextType, RequireFields<QueryExamArgs, 'id'>>;
  examSession?: Resolver<Maybe<ResolversTypes['ExamSession']>, ParentType, ContextType, RequireFields<QueryExamSessionArgs, 'id'>>;
  exams?: Resolver<Array<ResolversTypes['Exam']>, ParentType, ContextType>;
  getActiveSessions?: Resolver<Array<ResolversTypes['ExamSession']>, ParentType, ContextType>;
  getClasses?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType>;
  getSessionsByClass?: Resolver<Array<ResolversTypes['ExamSession']>, ParentType, ContextType, RequireFields<QueryGetSessionsByClassArgs, 'classId'>>;
  getStudents?: Resolver<Array<ResolversTypes['Student']>, ParentType, ContextType>;
  proctorLog?: Resolver<Maybe<ResolversTypes['ProctorLog']>, ParentType, ContextType, RequireFields<QueryProctorLogArgs, 'id'>>;
  proctorLogs?: Resolver<Array<ResolversTypes['ProctorLog']>, ParentType, ContextType, Partial<QueryProctorLogsArgs>>;
  question?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<QueryQuestionArgs, 'id'>>;
  questions?: Resolver<Array<ResolversTypes['Question']>, ParentType, ContextType, Partial<QueryQuestionsArgs>>;
  student?: Resolver<Maybe<ResolversTypes['Student']>, ParentType, ContextType, RequireFields<QueryStudentArgs, 'id'>>;
};

export type QuestionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Question'] = ResolversParentTypes['Question']> = {
  answers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  correctIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  examId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type StudentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Student'] = ResolversParentTypes['Student']> = {
  classId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Class?: ClassResolvers<ContextType>;
  Exam?: ExamResolvers<ContextType>;
  ExamSession?: ExamSessionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ProctorLog?: ProctorLogResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Question?: QuestionResolvers<ContextType>;
  Student?: StudentResolvers<ContextType>;
};


export type CreateProctorLogMutationVariables = Exact<{
  eventType: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
  examId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CreateProctorLogMutation = { __typename?: 'Mutation', createProctorLog: { __typename?: 'ProctorLog', id: string } };

export type GetExamSessionForActiveExamQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetExamSessionForActiveExamQuery = { __typename?: 'Query', examSession?: { __typename?: 'ExamSession', id: string, examId: string, startTime: string, endTime: string, description: string, status?: string | null } | null };

export type GetClassesDetailPageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClassesDetailPageQuery = { __typename?: 'Query', getClasses: Array<{ __typename?: 'Class', id: string, name: string }> };

export type GetStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStudentsQuery = { __typename?: 'Query', getStudents: Array<{ __typename?: 'Student', email?: string | null, id: string, name: string, classId: string }> };

export type CreateExamSessionMutationMutationVariables = Exact<{
  description?: InputMaybe<Scalars['String']['input']>;
  classId?: InputMaybe<Scalars['ID']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  examId?: InputMaybe<Scalars['ID']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateExamSessionMutationMutation = { __typename?: 'Mutation', createExamSession: { __typename?: 'ExamSession', createdAt: string, updatedAt: string, startTime: string, status?: string | null, id: string, description: string, endTime: string, class?: { __typename?: 'Class', name: string, id: string } | null, exam?: { __typename?: 'Exam', id: string, name: string } | null } };

export type GetActiveSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveSessionQuery = { __typename?: 'Query', getActiveSessions: Array<{ __typename?: 'ExamSession', id: string, startTime: string, description: string, createdAt: string, endTime: string, updatedAt: string, status?: string | null, class?: { __typename?: 'Class', id: string, name: string } | null, exam?: { __typename?: 'Exam', id: string, name: string } | null }> };

export type GetClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClassesQuery = { __typename?: 'Query', getClasses: Array<{ __typename?: 'Class', id: string, name: string }> };

export type GetExamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamsQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string, name: string, createdAt: string }> };

export type GetProctorLogsQueryVariables = Exact<{
  examId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetProctorLogsQuery = { __typename?: 'Query', proctorLogs: Array<{ __typename?: 'ProctorLog', id: string, examId?: string | null, studentId: string, eventType: string, createdAt: string, updatedAt: string }> };

export type CreateQuestionMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  question: Scalars['String']['input'];
  answers: Array<Scalars['String']['input']> | Scalars['String']['input'];
  correctIndex: Scalars['Int']['input'];
  variation?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateQuestionMutation = { __typename?: 'Mutation', createQuestion: { __typename?: 'Question', id: string } };

export type DeleteQuestionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'Mutation', deleteQuestion: boolean };

export type GetExamForEditQueryVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type GetExamForEditQuery = { __typename?: 'Query', exam?: { __typename?: 'Exam', id: string, name: string } | null, questions: Array<{ __typename?: 'Question', id: string, question: string, answers: Array<string>, correctIndex: number, variation: string }> };

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
}>;


export type UpdateQuestionMutation = { __typename?: 'Mutation', updateQuestion: { __typename?: 'Question', id: string } };

export type CreateExamMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateExamMutation = { __typename?: 'Mutation', createExam: { __typename?: 'Exam', id: string, name: string } };

export type CreateClassMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateClassMutation = { __typename?: 'Mutation', createClass: { __typename?: 'Class', id: string, name: string } };

export type CreateStudentMutationVariables = Exact<{
  classId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateStudentMutation = { __typename?: 'Mutation', createStudent: { __typename?: 'Student', id: string, name: string, email?: string | null, classId: string } };

export type MyQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyQueryQuery = { __typename?: 'Query', getStudents: Array<{ __typename?: 'Student', classId: string, email?: string | null, id: string, name: string }> };


export const CreateProctorLogDocument = gql`
    mutation CreateProctorLog($eventType: String!, $studentId: ID!, $examId: ID) {
  createProctorLog(eventType: $eventType, studentId: $studentId, examId: $examId) {
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
export const GetExamSessionForActiveExamDocument = gql`
    query GetExamSessionForActiveExam($id: ID!) {
  examSession(id: $id) {
    id
    examId
    startTime
    endTime
    description
    status
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
export const CreateExamSessionMutationDocument = gql`
    mutation CreateExamSessionMutation($description: String = "", $classId: ID = "", $endTime: String = "", $examId: ID = "", $startTime: String = "", $status: String = "") {
  createExamSession(
    input: {examId: $examId, classId: $classId, description: $description, startTime: $startTime, endTime: $endTime, status: $status}
  ) {
    createdAt
    updatedAt
    startTime
    status
    id
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
 *      endTime: // value for 'endTime'
 *      examId: // value for 'examId'
 *      startTime: // value for 'startTime'
 *      status: // value for 'status'
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
export const GetActiveSessionDocument = gql`
    query GetActiveSession {
  getActiveSessions {
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
export const GetProctorLogsDocument = gql`
    query GetProctorLogs($examId: ID, $studentId: ID) {
  proctorLogs(examId: $examId, studentId: $studentId) {
    id
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
export const CreateQuestionDocument = gql`
    mutation CreateQuestion($examId: ID!, $question: String!, $answers: [String!]!, $correctIndex: Int!, $variation: String) {
  createQuestion(
    examId: $examId
    question: $question
    answers: $answers
    correctIndex: $correctIndex
    variation: $variation
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
    mutation UpdateQuestion($id: ID!, $question: String, $answers: [String!], $correctIndex: Int, $variation: String) {
  updateQuestion(
    id: $id
    question: $question
    answers: $answers
    correctIndex: $correctIndex
    variation: $variation
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
export const CreateExamDocument = gql`
    mutation CreateExam($name: String!) {
  createExam(name: $name) {
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
export const CreateClassDocument = gql`
    mutation CreateClass($name: String!) {
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
export const CreateStudentDocument = gql`
    mutation CreateStudent($classId: ID!, $name: String!, $email: String) {
  createStudent(classId: $classId, name: $name, email: $email) {
    id
    name
    email
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
 *      classId: // value for 'classId'
 *      name: // value for 'name'
 *      email: // value for 'email'
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