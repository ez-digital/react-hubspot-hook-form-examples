import { useState, useEffect } from "react";

import HubSpotForm, {
  FieldGroup,
  FieldValues,
} from "@ez-digital/react-hubspot-hook-form";
import "@ez-digital/react-hubspot-hook-form/style";

const App = () => {
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [submitButtonText, setSubmitButtonText] = useState("");
  const [isFormLoading, setFormLoading] = useState(true);
  const [isFormSubmitting, setFormSubmitting] = useState(false);
  const [isFormSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_URL}/getHubSpotForm?formId=${process.env.REACT_APP_CONTACTFORMID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setFieldGroups(data?.fieldGroups);
        setSubmitButtonText(data?.submitButtonText);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      })
      .finally(() => setFormLoading(false));
  }, []);

  const onSubmit = async (fields: FieldValues) => {
    setFormSubmitting(true);

    const formattedFields = [];

    for (const [fieldName, fieldValue] of Object.entries(fields) as [
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
        `${process.env.REACT_APP_API_URL}/postHubSpotForm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formId: process.env.REACT_APP_CONTACTFORMID,
            fields: formattedFields,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form data");
      }

      setFormSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <HubSpotForm
      fieldGroups={fieldGroups}
      submitButtonText={submitButtonText}
      isLoading={isFormLoading}
      onSubmit={onSubmit}
      isSubmitting={isFormSubmitting}
      isSubmitted={isFormSubmitted}
      successMessage="The form has been submitted successfully."
    />
  );
};

export default App;
