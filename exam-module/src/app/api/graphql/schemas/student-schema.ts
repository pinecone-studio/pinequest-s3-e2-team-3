export const studentTypeDefs = `#graphql
  type Student {
    id: ID!
    name: String!
    email: String!
    phone: String!
    classId: ID!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
  getStudents: [Student!]!
    student(id: ID!): Student
    studentsByClass(classId: ID!): [Student!]!
  }

  extend type Mutation {
    createStudent(name: String!, email: String!, phone: String!, classId: ID!): Student!
    updateStudent(id: ID!, name: String, email: String, phone: String, classId: ID): Student!
    deleteStudent(id: ID!): Boolean!
  }
`;
