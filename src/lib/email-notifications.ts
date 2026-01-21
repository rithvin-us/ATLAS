type EmailPayload = {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, string>;
};

/**
 * Placeholder for email dispatch. Replace with real implementation (e.g. SendGrid, Postmark).
 */
export async function sendEmailNotification(payload: EmailPayload) {
  // TODO: wire up actual email provider
  console.info("Email dispatch stub", payload);
  return { ok: true };
}
