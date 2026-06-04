import ENV from "./env.js";
import arcjet, { shield } from "@arcjet/node";

const aj = ENV.ARCJET_KEY
  ? arcjet({
    key: ENV.ARCJET_KEY,
    rules: [shield({ mode: "LIVE" })],
  })
  : {
    async protect() {
      return { isDenied: false, results: [] };
    },
  };

export default aj;
