import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/api/graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/gql/graphql.tsx": {
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        // CRITICAL: Set these to match your package.json versions
        apolloClientVersion: 3,
        useTypeImports: true,
        // This forces the generator to use the React-aware entry point
        importOperationSideEffect: true,
      },
    },
  },
};

export default config;
