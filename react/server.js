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
