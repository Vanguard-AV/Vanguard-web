# Vanguard AV

Start with the [web app handoff](docs/web-app/README.md) for requirements, scanner interfaces, and the build sequence. [PRODUCT.md](PRODUCT.md) contains the product brief for Impeccable. The [production website reference](docs/website/README.md) covers the deployed marketing site.

## Local development

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contact form email delivery

Website submissions are paused. Set `contactFormEnabled` to `true` in `lib/contact-fields.ts` and rebuild to resume submissions.

Set these server-side environment variables in `.env.local` for local development or in the hosting environment for production. Restart the server after changing local values.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend API key with permission to send email. |
| `CONTACT_FROM_EMAIL` | Sender address on a domain verified in Resend. |
| `CONTACT_TO_EMAIL` | Optional recipient override. Defaults to `info@vanguard-av.net`. |

The form sends plain-text email and sets the visitor’s email as Reply-To. The form preserves the draft and displays an error if email delivery is unavailable. [Resend Email API](https://resend.com/docs/api-reference/emails/send-email)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
