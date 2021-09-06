import { gql } from 'graphql-tag'

import { LocalScheme } from '~auth/runtime'

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String, $password: String) {
    logIn(email: $email, password: $password) {
      token
      expiresIn
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation LogOutMutation {
    logOut
  }
`

export const USER_DETAILS_QUERY = gql`
  query UserDetailsQuery {
    me {
      id
      name
      email
    }
  }
`

export default class GraphQLScheme extends LocalScheme {
  constructor(...params) {
    super(...params)

    // This option will prevent $axios methods from being called
    // since we are not using axios
    this.options.token.global = false
  }

  async login(credentials, { reset = true } = {}) {
    const {
      apolloProvider: { defaultClient: apolloClient },
      $apolloHelpers,
      // $config,
    } = this.$auth.ctx.app

    // Ditch any leftover local tokens before attempting to log in
    if (reset) {
      this.$auth.reset({ resetInterceptor: false })
    }

    // Make login request
    const response = await apolloClient
      .mutate({
        mutation: LOGIN_MUTATION,
        variables: credentials,
      })
      .then(({ data }) => data && data.logIn)

    this.token.set(response.token)

    // Set your graphql-token
    await $apolloHelpers.onLogin(response.token)

    // Fetch user
    await this.fetchUser()

    // Update tokens
    return response.token
  }

  // Override `fetchUser` method of `local` scheme
  fetchUser() {
    const {
      apolloProvider: { defaultClient: apolloClient },
    } = this.$auth.ctx.app

    // Token is required but not available
    if (!this.check().valid) {
      return
    }

    // Try to fetch user
    return apolloClient
      .query({
        query: USER_DETAILS_QUERY,
        fetchPolicy: 'no-cache', // Very Important!
      })
      .then(({ data }) => {
        if (!data.me) {
          const error = new Error(`User Data response not resolved`)
          return Promise.reject(error)
        }

        this.$auth.setUser(data.me)

        return data.me
      })
      .catch((error) => {
        this.$auth.callOnError(error, { method: 'fetchUser' })
        return Promise.reject(error)
      })
  }

  async logout() {
    const {
      apolloProvider: { defaultClient: apolloClient },
      $apolloHelpers,
    } = this.$auth.ctx.app

    await apolloClient
      .mutate({
        mutation: LOGOUT_MUTATION,
      })
      .catch(() => {
        // console.log(err)
      })

    // But reset regardless
    $apolloHelpers.onLogout()
    return this.$auth.reset({ resetInterceptor: false })
  }

  initializeRequestInterceptor() {
    // Instead of initializing axios interceptors, Do nothing
    // Since we are not using axios
  }

  reset() {
    this.$auth.setUser(false)
    this.token.reset()
  }
}
