import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    "name": "unrest-therapy",
    "compatibilityDate": "2026-09-21",
    "observability": {
      "enabled": true
    },
    // learn.html 같은 주소를 /learn 으로 돌리지 않는다 (sitemap·canonical 주소 유지)
    "assets": {
      "htmlHandling": "none"
    }
  }
});
