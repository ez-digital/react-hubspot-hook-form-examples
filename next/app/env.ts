import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  client: {},
  server: {
    HUBSPOT_API_TOKEN: z.string(),
    PORTALID: z.string(),
    CONTACTFORMID: z.string(),
  },
  runtimeEnv: {
    // Server
    HUBSPOT_API_TOKEN: process.env.HUBSPOT_API_TOKEN,
    PORTALID: process.env.PORTALID,
    CONTACTFORMID: process.env.CONTACTFORMID,
  },
});

export default env;
