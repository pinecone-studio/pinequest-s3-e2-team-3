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
    classIds: [ID!]!
    createdAt: String!
    updatedAt: String!
  }

  type LoginResponse {
    success: Boolean!
    message: String
    user: User
  }

  type AccessResponse {
    allowed: Boolean!
  }

  extend type Query {
    verifyStudentAccess(studentId: ID!, sessionId: ID!): AccessResponse!
    staffUsers: [User!]!
  }

  extend type Mutation {
    login(username: String!, password: String!): LoginResponse!
    createTeacher(
      name: String!
      lastName: String!
      email: String!
      subjects: [String]
    ): User!
    assignTeacherToClass(teacherId: ID!, classId: ID!): User!
    removeTeacherFromClass(teacherId: ID!, classId: ID!): User!
    deleteTeacher(teacherId: ID!): Boolean!
  }
`;
