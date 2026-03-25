export const questionsTypeDefs = /* GraphQL */ `
  type Question {
    id: ID!
    examId: ID
    question: String!
    answers: [String!]!
    correctIndex: Int!
    variation: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    questions(examId: ID): [Question!]!
    question(id: ID!): Question
  }

  extend type Mutation {
    createQuestion(
      examId: ID
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
  }
`;

