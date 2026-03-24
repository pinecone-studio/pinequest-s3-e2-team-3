export const examTypeDefs = /* GraphQL */ `
  type Exam {
    id: ID!
    title: String!
    description: String
    durationMinutes: Int!
  }

  type Query {
    exams: [Exam!]!
  }

  type Mutation {
    createExam(title: String!, durationMinutes: Int!): Exam!
    updateExam(
      id: ID!
      title: String
      description: String
      durationMinutes: Int
    ): Exam!
    deleteExam(id: ID!): Boolean!
  }
`;
