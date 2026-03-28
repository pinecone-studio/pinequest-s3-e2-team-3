export const staffTypeDefs = /* GraphQL */ `
  enum UserRole {
    teacher
    manager
  }

  type User {
    id: ID!
    name: String!
    lastName: String!
    email: String!
    username: String!
    password: String
    role: UserRole!
    subjects: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type AccessResponse {
    allowed: Boolean!
  }

  extend type Query {
    verifyStudentAccess(studentId: ID!, sessionId: ID!): AccessResponse!
    staffUsers: [User!]!
  }

  extend type Mutation {
    createTeacher(
      name: String!
      lastName: String!
      email: String!
      subjects: [String]
    ): User!
  }
`;
