"use server";

import { FieldGroup, FieldValues } from "@ez-digital/react-hubspot-hook-form";

import { State } from "./Forms/ContactForm";

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
