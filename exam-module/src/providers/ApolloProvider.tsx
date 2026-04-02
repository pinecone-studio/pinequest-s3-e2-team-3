"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";

const cache = new InMemoryCache();

// Create client immediately (used before persistence is ready)
const client = new ApolloClient({
  link: new HttpLink({ uri: "/api/graphql" }),
  cache,
  defaultOptions: {
    watchQuery: {
      // Use cache when available, fall back to network
      fetchPolicy: "cache-first",
    },
  },
});

// Restore persisted cache in the background
if (typeof window !== "undefined") {
  persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    maxSize: false,
  }).catch((e) => console.warn("[Apollo] cache persist error:", e));
}

export function GQLProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
