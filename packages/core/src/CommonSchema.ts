import { ZStringSchema } from "./JSONSchema";

export const EmailSchema: ZStringSchema = {
  type: "string",
  title: "Email Address",
  inputType: "email-address",
} as const;

export const PhoneSchema: ZStringSchema = {
  type: "string",
  title: "Phone Number",
  placeholder: "12223334444",
} as const;
