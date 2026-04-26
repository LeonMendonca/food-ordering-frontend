import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let currentUserId: string | null = null;

export const setUserId = (id: string | null) => {
  currentUserId = id;
};

const setContextLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-user-id": currentUserId || "",
    }
  }
});

const httpLink = new HttpLink({
  uri: "http://localhost:3001/graphql",
});

const client = new ApolloClient({
  link: setContextLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;