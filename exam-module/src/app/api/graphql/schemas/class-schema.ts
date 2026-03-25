export const classTypeDefs = `
  type Class {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    getClasses: [Class!]!
    class(id: ID!): Class
  }

  extend type Mutation {
    createClass(name: String!): Class!
    updateClass(id: ID!, name: String): Class!
    deleteClass(id: ID!): Boolean!
  }
`;
