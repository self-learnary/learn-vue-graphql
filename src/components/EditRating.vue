<script setup>
import { ref, defineProps } from 'vue'

import UPDATE_BOOK from '@/graphql/mutations/updateBook.mutation.gql'

import { useMutation } from '@vue/apollo-composable'

const props = defineProps({
  initialRating: {
    type: Number,

    required: true,
  },

  bookId: {
    type: String,

    required: true,
  },
})

const emit = defineEmits(['closeForm'])

const rating = ref(props.initialRating)

const {
  mutate: updateRating,

  onDone,

  loading,

  error,
} = useMutation(UPDATE_BOOK, () => ({
  variables: {
    id: props.bookId,

    rating: parseFloat(rating.value),
  },
}))

onDone(() => {
  emit('closeForm')
})

// const updateRating = () => {

//   mutate()

//   emit('closeForm')

// }
</script>

<template>
  <input type="text" v-model="rating" @keyup.enter="updateRating" @keyup.esc="$emit('closeForm')" />

  <p v-if="loading">Updating...</p>

  <p v-if="error">{{ error }}</p>
</template>
