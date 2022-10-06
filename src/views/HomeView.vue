<script setup>
import { useQuery, useMutation } from '@vue/apollo-composable'
import { ref, computed } from 'vue'
import ADD_BOOK_TO_FAVORITES from '@/graphql/mutations/addBookToFavorites.mutation.gql'
import ALL_BOOKS_QUERY from '@/graphql/queries/allBooks.query.gql'
import FAVORITE_BOOKS from '@/graphql/queries/favoriteBooks.query.gql'
import BOOK_SUBSCRIPTION from '@/graphql/subscription/newBook.subscription.gql'
import EditRating from '../components/EditRating.vue'
import AddBook from '../components/AddBook.vue'

const search = ref('')
const activeBook = ref(null)
const showNewBookForm = ref(false)

const { result, loading, error, subscribeToMore } = useQuery(
  ALL_BOOKS_QUERY,
  () => ({ search: search.value }),
  () => ({
    debounce: 500,
    // enabled: !!search.value,
  }),
)

subscribeToMore(() => ({
  document: BOOK_SUBSCRIPTION,
  updateQuery(prevResult, { subscriptionData }) {
    const res = {
      allBooks: [...prevResult.allBooks, subscriptionData.data.bookSub],
    }
    return res
  },
}))

const books = computed(() => result.value?.allBooks ?? [])

const { result: favBooksResult } = useQuery(FAVORITE_BOOKS)

const { mutate: addBookToFavorites } = useMutation(ADD_BOOK_TO_FAVORITES)
</script>

<template>
  <main>
    <h1>Learn Vue GraphQL</h1>
    <div>
      <button v-if="!showNewBookForm" @click="showNewBookForm = true">Add a new book</button>
      <AddBook v-if="showNewBookForm" :search="search" @close-form="showNewBookForm = false" />
    </div>
    <input type="text" v-model="search" />
    <div>
      <p v-if="loading">Loading...</p>
      <p v-else-if="error">Something went wrong! Please try again</p>
      <template v-else>
        <div v-if="activeBook">
          <EditRating :initial-rating="activeBook.rating" :book-id="activeBook.id" @close-form="activeBook = null" />
        </div>
        <template v-else>
          <section class="list-wrapper">
            <div class="list">
              <h3>All Books</h3>
              <ul>
                <li v-for="book in books" :key="book.id">
                  {{ book.title }} - {{ book.rating }}
                  <button @click="activeBook = book">Edit rating</button>
                  <button @click="addBookToFavorites({ book })">Add to Favorites</button>
                </li>
              </ul>
            </div>
            <div class="list">
              <h3>Favorite Books</h3>
              <ul>
                <li v-for="book in favBooksResult.favoriteBooks" :key="book.id">
                  {{ book.title }} - {{ book.rating }}
                  <button @click="activeBook = book">Edit rating</button>
                </li>
              </ul>
            </div>
          </section>
        </template>
      </template>
    </div>
  </main>
</template>
<style scoped>
.list-wrapper {
  display: flex;
  margin: 0 auto;
  max-width: 960px;
}
.list {
  width: 50%;
}
</style>
