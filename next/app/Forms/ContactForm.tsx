"use client";

import { useEffect, useTransition } from "react";
import { useFormState } from "react-dom";

import { SubmitHandler, FieldValues } from "react-hook-form";

import HubSpotForm, { FieldGroup } from "@ez-digital/react-hubspot-hook-form";
import "@ez-digital/react-hubspot-hook-form/style";

import { ContactFormSubmit } from "../actions";

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
