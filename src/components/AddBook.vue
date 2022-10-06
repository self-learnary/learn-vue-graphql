<script setup>
import { defineProps, reactive } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import ADD_BOOK from '@/graphql/mutations/addBook.mutation.gql'
import ALL_BOOKS from '@/graphql/queries/allBooks.query.gql'

const emit = defineEmits(['closeForm'])
const props = defineProps({
  search: {
    type: String,
    required: true,
  },
})
const newBook = reactive({
  title: '',
  author: '',
  year: '',
  rating: '',
  description: '',
})

const { mutate: addBook, onDone } = useMutation(ADD_BOOK, () => ({
  variables: {
    input: { ...newBook, rating: newBook.rating || null },
  },
  update(cache, response) {
    const sourceData = cache.readQuery({ query: ALL_BOOKS, variables: { search: props.search } })
    const data = {
      allBooks: [...sourceData.allBooks, response.data.addBook],
    }
    cache.writeQuery({
      data,
      query: ALL_BOOKS,
      variables: { search: props.search },
    })
  },
  optimisticResponse: {
    addBook: {
      __typename: 'Book',
      id: -1,
      ...newBook,
    },
  },
}))

onDone(() => {
  emit('closeForm')
})
</script>

<template>
  <form @submit.prevent="addBook">
    <label for="title">
      Title
      <input type="text" id="title" required v-model.trim="newBook.title" />
    </label>
    <label for="author">
      Author
      <input type="text" id="author" required v-model.trim="newBook.author" />
    </label>
    <label for="description">
      Description (Opsional)
      <input type="text" id="description" v-model.trim="newBook.description" />
    </label>
    <label for="year">
      Year
      <input type="number" id="year" required v-model.trim="newBook.year" />
    </label>
    <label for="rating">
      Rating (opsional)
      <input type="number" id="rating" v-model.trim="newBook.rating" />
    </label>
    <button type="submit">Submit</button>
    <button type="reset" @click="$emit('closeForm')">Close Form</button>
  </form>
</template>

<style scoped>
label {
  display: block;
}
</style>
