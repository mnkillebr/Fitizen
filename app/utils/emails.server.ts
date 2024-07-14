import FormData from "form-data";
import Mailgun from "mailgun.js";
const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

if (typeof MAILGUN_API_KEY !== "string") {
  throw new Error("Missing env: MAILGUN_API_KEY");
}

const mailgun = new Mailgun(FormData);
const client = mailgun.client({
  username: "api",
  key: MAILGUN_API_KEY,
});

type Message = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

export function sendEmail(message: Message) {
  if (typeof MAILGUN_DOMAIN !== "string") {
    throw new Error("Missing env: MAILGUN_DOMAIN");
  }
  return client.messages.create(MAILGUN_DOMAIN, message);
}
