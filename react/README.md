# Usage

It's crucial to keep your `PORTAL_ID` and `HUBSPOT_API_TOKEN` secure to prevent unauthorized form submissions and other actions. To achieve this, set up your own server to store these environment variables and handle form requests. Remember, HubSpot mandates that form data requests be submitted from a server, rejecting any client-side requests.

Here's an example of how to use the HubSpotForm component in your React application:

```tsx
// App.tsx
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
```

```js
// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/api/getHubSpotForm", async (req, res) => {
  const { formId } = req.query;

  try {
    const response = await axios.get(
      `https://api.hubapi.com/marketing/v3/forms/${formId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_TOKEN}`,
        },
      }
    );

    res.json({
      fieldGroups: response?.data?.fieldGroups || [],
      submitButtonText: response?.data?.displayOptions?.submitButtonText || "",
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).send("Failed to fetch form");
  }
});

app.post("/api/postHubSpotForm", async (req, res) => {
  const { formId, fields } = req.body;

  try {
    const response = await axios.post(
      `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.PORTALID}/${formId}`,
      {
        fields,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).send("Failed to submit form");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

```makefile
# env
PORTALID=YOUR_PORTALID
REACT_APP_CONTACTFORMID=YOUR_CONTACTFORMID
HUBSPOT_API_TOKEN=YOUR_HUBSPOT_API_TOKEN
```
