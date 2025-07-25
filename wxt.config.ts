import { defineConfig } from "wxt";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: () => {
    return {
      name: "CheckX",
      key: import.meta.env.VITE_CRX_PUBLIC_KEY,
      description:
        "CheckX is a browser extension that allows users to check the truthfulness of a given X (formerly twitter) post.",
      permissions: [
        "contextMenus",
        "activeTab",
        "storage",
        "cookies",
        "notifications",
        "scripting",
      ],
      commands: {
        "save-link": {
          suggested_key: {
            default: "Ctrl+S",
            mac: "Command+S",
          },
          description:
            "Check the truthfulness of a given X (formerly twitter) post.",
        },
      },
    };
  },
  dev: {
    server: {
      port: 3001,
    },
  },
  vite: () => ({
    plugins: [tailwindcss(), require("@tailwindcss/typography")],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
});
