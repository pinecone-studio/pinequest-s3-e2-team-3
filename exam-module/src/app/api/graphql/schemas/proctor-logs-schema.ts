export const proctorLogsTypeDefs = /* GraphQL */ `
  type ProctorLog {
    id: ID!
    examId: ID
    studentId: ID!
    eventType: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    proctorLogs(examId: ID, studentId: ID): [ProctorLog!]!
    proctorLog(id: ID!): ProctorLog
  }

  extend type Mutation {
    createProctorLog(
      examId: ID
      studentId: ID!
      eventType: String!
    ): ProctorLog!

    updateProctorLog(
      id: ID!
      examId: ID
      studentId: ID
      eventType: String
    ): ProctorLog!

    deleteProctorLog(id: ID!): Boolean!
  }
`;

