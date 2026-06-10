import resend from '@config/resend';

export async function sendVerificationEmail(
  to: string,
  link: string,
): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: 'Verify your email',
    html: `<p>Welcome! Please verify your email:</p>
           <p><a href="${link}">Verify my email</a></p>
           <p>This link expires in 1 hour.</p>`,
  });

  // Resend returns an error object instead of throwing — surface it so the
  // caller's best-effort try/catch can log the failure.
  if (error) throw new Error(error.message);
}
