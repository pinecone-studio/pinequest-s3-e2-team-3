export const proctorLogsTypeDefs = /* GraphQL */ `
  type ProctorLog {
    id: ID!
    sessionId: ID
    """Derived from the linked exam session when \`sessionId\` is set."""
    examId: ID
    studentId: ID
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
      sessionId: ID
      examId: ID
      studentId: ID!
      eventType: String!
    ): ProctorLog!

    updateProctorLog(
      id: ID!
      sessionId: ID
      studentId: ID
      eventType: String
    ): ProctorLog!

    deleteProctorLog(id: ID!): Boolean!
  }
`;

