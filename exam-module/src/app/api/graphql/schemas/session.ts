export const sessionTypeDefs = `
  type ExamSession {
    id: ID!
    examId: ID!
    classId: ID!
    exam: Exam     
    class: Class    
    description: String!
    startTime: String!
    endTime: String!
    status: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateExamSessionInput {
    examId: ID!
    classId: ID!
    description: String!
    startTime: String!
    endTime: String!
  }

  extend type Query {
    getSessionsByClass(classId: ID!): [ExamSession!]!
    getActiveSessions: [ExamSession!]!
    examSession(id: ID!): ExamSession
  }

  extend type Mutation {
    createExamSession(input: CreateExamSessionInput!): ExamSession!
    updateExamSession(
      id: ID!
      examId: ID
      classId: ID
      description: String
      startTime: String
      endTime: String
    ): ExamSession!
    deleteExamSession(id: ID!): Boolean!
  }
`;
