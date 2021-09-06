<template>
  <b-container>
    <b-row>
      <b-col md="4" offset-md="4" class="mt-5">
        <b-alert v-if="errors.length" variant="danger" dismissible show>
          <p v-for="(error, i) in errors" :key="i + 1" class="m-0">
            {{ error }}
          </p>
        </b-alert>
        <form method="POST" @submit.prevent="handleLoginSubmit">
          <div class="form-group">
            <label for="email">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              aria-describedby="emailHelp"
              autocomplete="off"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="formBusy">
            <b-spinner v-if="formBusy" small class="mr-2" /> Login
          </button>
        </form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      formBusy: false,
      errors: [],
    }
  },

  methods: {
    async handleLoginSubmit() {
      const credentials = this.form
      this.formBusy = true
      this.errors = []

      try {
        await this.$auth.loginWith('graphql', credentials)

        this.formBusy = false
      } catch ({ graphQLErrors: errors }) {
        this.formBusy = false
        // Handle hour custom error
        if (errors && errors.length) {
          errors.forEach((error) => {
            if (error.extensions.key === 'InvalidCredentials') {
              this.errors = [...this.errors, error.message]
            }
          })
        } else {
          // Handle other errors
        }
      }
    },
  },
}
</script>
