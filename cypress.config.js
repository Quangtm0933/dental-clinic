const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost/dental-clinic/public",
    setupNodeEvents(on, config) {
    },
  },
})