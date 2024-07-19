# Usage

It's crucial to keep your `PORTAL_ID` and `HUBSPOT_API_TOKEN` secure to prevent unauthorized form submissions and other actions. To achieve this, set up your own server to store these environment variables and handle form requests. Remember, HubSpot mandates that form data requests be submitted from a server, rejecting any client-side requests.

For Next.js applications, you can create a utility function to fetch HubSpot form data server-side.

```tsx
// app/page.tsx
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
```

```tsx
// app/Forms/ContactForm.tsx
"use client";

import { useEffect, useTransition } from "react";
import { useFormState } from "react-dom";

import { SubmitHandler, FieldValues } from "react-hook-form";

import HubSpotForm, { FieldGroup } from "@ez-digital/react-hubspot-hook-form";
import "@ez-digital/react-hubspot-hook-form/style";

import { ContactFormSubmit } from "./actions";

export type State = {
  status: "success" | "error";
  message?: string;
} | null;

const ContactForm = ({
  fieldGroups,
  submitButtonText,
}: {
  fieldGroups: FieldGroup[];
  submitButtonText: string;
}) => {
  const [isSubmitting, startTransition] = useTransition();

  const [message, formAction] = useFormState<State, FieldValues>(
    ContactFormSubmit,
    null
  );

  useEffect(() => {
    if (message?.status === "success") {
      console.log("form submitted successfully");
    }
  }, [message]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    startTransition(() => {
      formAction(data);
    });
  };

  return (
    <HubSpotForm
      fieldGroups={fieldGroups}
      submitButtonText={submitButtonText}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      isSubmitted={message?.status === "success"}
      successMessage="The form has been submitted successfully."
    />
  );
};

export default ContactForm;
```

```ts
// app/actions.ts
"use server";

import { FieldGroup, FieldValues } from "@ez-digital/react-hubspot-hook-form";

import { State } from "./ContactForm";

import env from "./env";

type HubSpotFormResponse = {
  fieldGroups: FieldGroup[];
  submitButtonText: string;
};

export async function getHubSpotForm(
  formId: string,
  hubspotApiToken: string
): Promise<HubSpotFormResponse> {
  try {
    const res = await fetch(
      `https://api.hubapi.com/marketing/v3/forms/${formId}`,
      {
        cache: "no-cache",
        headers: {
          Authorization: `Bearer ${hubspotApiToken}`,
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return {
      fieldGroups: data?.fieldGroups || [],
      submitButtonText: data?.displayOptions?.submitButtonText || "",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      throw new Error(error.message);
    } else {
      console.error(error);
      throw new Error("An unknown error occurred.");
    }
  }
}

export async function ContactFormSubmit(
  currentState: State,
  formData: FieldValues
): Promise<State> {
  const formattedFields = [];

  for (const [fieldName, fieldValue] of Object.entries(formData) as [
    string,
    string | { label: string; value: string }
  ][]) {
    if (Array.isArray(fieldValue)) {
      formattedFields.push({
        name: fieldName,
        value: fieldValue.join("; "),
      });
    } else if (typeof fieldValue === "object") {
      formattedFields.push({
        name: fieldName,
        value: fieldValue?.label || "",
      });
    } else {
      formattedFields.push({ name: fieldName, value: fieldValue || "" });
    }
  }

  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${env.PORTALID}/${env.CONTACTFORMID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: formattedFields,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: "error",
        message: errorData.message || "Submission failed",
      };
    }

    return { status: "success" };
  } catch (error: any) {
    console.log(error);
    return { status: "error", message: error.message || "Unexpected error" };
  }
}
```

```ts
// app/env.ts
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
```

```makefile
# env
PORTALID=YOUR_PORTALID
CONTACTFORMID=YOUR_CONTACTFORMID
HUBSPOT_API_TOKEN=YOUR_HUBSPOT_API_TOKEN
```
