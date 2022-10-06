import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'
import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import router from './router'
import { WebSocketLink } from '@apollo/client/link/ws'
import typeDefs from '@/graphql/typedefs.gql'
import './assets/main.css'
import { getMainDefinition } from '@apollo/client/utilities'
import FAVORITE_BOOKS_QUERY from '@/graphql/queries/favoriteBooks.query.gql'

// const wsLink = new WebSocketLink(new SubscriptionClient('ws://localhost:4000/graphql', { reconnect: true }))

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
  },
})

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const cache = new InMemoryCache()

cache.writeQuery({
  query: FAVORITE_BOOKS_QUERY,
  data: {
    favoriteBooks: [
      {
        __typename: 'Book',
        title: 'My Book',
        id: 123,
        rating: 5,
      },
    ],
  },
})

const resolvers = {
  Mutation: {
    addBookToFavorites: (_, { book }, { cache }) => {
      const data = cache.readQuery({ query: FAVORITE_BOOKS_QUERY })
      const newData = {
        favoriteBooks: [...data.favoriteBooks, book],
      }
      cache.writeQuery({ query: FAVORITE_BOOKS_QUERY, data: newData })
      return newData.favoriteBooks
    },
  },
}

const apolloClient = new ApolloClient({ link, cache, typeDefs, resolvers })

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})

app.use(createPinia())
app.use(router)
app.mount('#app')
