export const questionsTypeDefs = /* GraphQL */ `
  type Question {
    id: ID!
    examId: ID!
    question: String!
    answers: [String!]!
    correctIndex: Int!
    variation: String!
    createdAt: String!
    updatedAt: String!
  }

  """Multiple-choice items for an exam-taker (no correct answer revealed)."""
  type ExamQuestionForTaker {
    id: ID!
    question: String!
    answers: [String!]!
    variation: String!
  }

  extend type Query {
    questions(examId: ID): [Question!]!
    question(id: ID!): Question
    examQuestionsForTaker(examId: ID!): [ExamQuestionForTaker!]!
  }

  extend type Mutation {
    createQuestion(
      examId: ID!
      question: String!
      answers: [String!]!
      correctIndex: Int!
      variation: String
    ): Question!

    updateQuestion(
      id: ID!
      examId: ID
      question: String
      answers: [String!]
      correctIndex: Int
      variation: String
    ): Question!

    deleteQuestion(id: ID!): Boolean!

    submitExamAnswers(
      studentId: ID!
      examId: ID!
      sessionId: ID
      answers: [StudentExamAnswerInput!]!
    ): SubmitExamAnswersPayload!
  }

  input StudentExamAnswerInput {
    questionId: ID!
    answerIndex: Int!
  }

  type SubmitExamAnswersPayload {
    success: Boolean!
    submittedCount: Int!
  }

  type StudentAnswer {
    id: ID!
    studentId: ID
    sessionId: ID
    examId: ID
    questionId: ID
    answerIndex: Int!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    studentAnswers(studentId: ID, sessionId: ID, examId: ID): [StudentAnswer!]!
  }
`;

