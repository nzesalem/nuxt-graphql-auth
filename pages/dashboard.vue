<template>
  <div class="dashboard-page">
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">Nuxt-graphql-auth</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <template #button-content>
              {{ $auth.user.firstName }} {{ $auth.user.lastName }}
            </template>
            <b-dropdown-item @click="handleLogout">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-container>
      <b-row>
        <b-col md="10" offset-md="1" class="mt-5">
          <h1>Welcome to the dashboard</h1>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  methods: {
    async handleLogout() {
      this.$nuxt.$loading.start()
      await this.$auth.logout()
    }
  },
}
</script>
