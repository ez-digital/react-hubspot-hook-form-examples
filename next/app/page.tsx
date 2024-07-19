import ContactForm from "./Forms/ContactForm";

import { getHubSpotForm } from "./actions";

import env from "./env";

export default async function Page() {
  const formData = await getHubSpotForm(
    env.CONTACTFORMID,
    env.HUBSPOT_API_TOKEN
  );
  return <ContactForm {...formData} />;
}
