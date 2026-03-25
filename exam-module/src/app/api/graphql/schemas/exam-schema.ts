export const examTypeDefs = /* GraphQL */ `
  type Exam {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    exams: [Exam!]!
    exam(id: ID!): Exam
  }

  type Mutation {
    createExam(name: String!): Exam!
    updateExam(id: ID!, name: String): Exam!
    deleteExam(id: ID!): Boolean!
  }
`;
