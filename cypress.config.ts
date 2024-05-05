import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'sp4ncw',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
