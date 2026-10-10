export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  console.log('====================================');
  console.log(`📧 [MOCK MAILER] To: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Text Content: ${text || 'See HTML'}`);
  console.log('====================================');
  return true;
}
