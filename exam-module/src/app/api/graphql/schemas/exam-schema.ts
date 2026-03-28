export const examTypeDefs = /* GraphQL */ `
  type Exam {
    id: ID!
    name: String!
    creatorId: ID
    isPublic: Boolean!
    subjectId: ID
    topicId: ID
    parentId: ID
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    exams: [Exam!]!
    exam(id: ID!): Exam
    unsortedExams: [Exam!]!
  }

  type Mutation {
    createExam(
      name: String!
      creatorId: ID
      subjectId: ID
      topicId: ID
      isPublic: Boolean
    ): Exam!
    updateExam(
      id: ID!
      name: String
      isPublic: Boolean
      subjectId: ID
      topicId: ID
      parentId: ID
    ): Exam!
    deleteExam(id: ID!): Boolean!
    cloneExam(examId: ID!, teacherId: ID!): Exam!
  }
`;
