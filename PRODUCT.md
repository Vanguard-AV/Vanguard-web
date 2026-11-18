# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The website should speak to individuals, developers, and smaller businesses. Keep all three audiences in scope when making website decisions.

- Individuals want to check unfamiliar links, messages, or files and understand what action to take.
- Developers want to assess code, dependencies, and suspicious inputs within their normal workflow.
- Smaller businesses want to consolidate routine checks, understand which risks need attention, and ask about licensing or support.

## Product Purpose

Vanguard AV brings threat assessment for different kinds of digital inputs into one security product. It helps people decide what to trust before opening a file, following a link, or using a dependency. The web app is intended to run on-demand scans and bring findings, alerts, and recommended actions into a shared dashboard. The public website explains the product and lets visitors ask about access, licensing, and support. [Web app handoff](docs/web-app/README.md) · [Website reference](docs/website/README.md) · [Product proposal](docs/Finincial%20Plans/Vanguard%20Proposal.pdf)

## Positioning

The product is designed around static-first analysis and specialized models for different input types. Static analysis examines the input without executing the inspected file. The URL model scores the supplied text without visiting the destination. The broader product plan describes bringing findings into a shared view with risk priorities, explanations, and recommended actions. [Public FAQ](docs/website/sections/faq.md) · [Business plan](docs/Finincial%20Plans/Vanguard%20-%20Business%20Plan.docx)

## Operating Context

- The public marketing site and this checkout are separate implementations. The audited public site runs as a React Router SPA. This repository currently builds a Next.js 16.4.6 App Router starter at `/`, with a shared root layout and Tailwind CSS. Framework work should start from the installed Next.js guides in `node_modules/next/dist/docs/`. [Website architecture](docs/website/architecture.md) · [Local package](package.json) · [Local homepage](app/page.tsx)
- The production homepage describes Desktop, Web, and Extensions and directs visitors to Contact to get Vanguard. Its Web channel describes a product surface for URL analysis. The marketing site itself was observed serving product information and inquiry forms. The business plan describes browser and VS Code extensions as separate clients. [Channels](docs/website/sections/channels.md) · [Contact](docs/website/sections/contact.md)
- The site audit records contact and newsletter submission interfaces and observed legal navigation failures. Production submission delivery and final policy copy still need verification. [Website architecture](docs/website/architecture.md) · [Website review](docs/website/review.md)

## Capabilities and Constraints

- The confirmed lineup is **Email**, **URL & QR Code Scanning**, **Files (Binaries, PDF, Office)**, **Steganography Detection**, **Code Analysis**, **SMS**, and **Prompt Injection**. Files groups three analysis families. The two sibling Office repositories are evidence for its Office family. [Scanner inventory and evidence](docs/web-app/scanners.md)
- The business plan describes a prototype and phased rollout. The current web checkout has no scanner integration. The four model checkouts document local workflows for Email, URL text, and Office. The model report documents experiments for binaries, PDF, and image steganography. Confirm the supported inputs and release status for each workflow before offering it in the app. [Scanner inventory](docs/web-app/scanners.md) · [Business plan](docs/Finincial%20Plans/Vanguard%20-%20Business%20Plan.docx)
- The proposal describes Python package checking and source-code analysis as separate workflows. The place of dependency and package scanning in the current lineup remains open. SMS, Prompt Injection, and QR scanning are part of the lineup from the project owner's update. Their web input contracts remain open. [Open decisions](docs/web-app/README.md#open-decisions)
- Product availability, download and store links, hosting and data-handling commitments, and public pricing and licensing terms need confirmation. The commercial plan and revenue workbook are planning material. [Channels](docs/website/sections/channels.md) · [Revenue model](docs/Finincial%20Plans/Vanguard%20-%20Revenue%20Model%20%28live%29.xlsx)
- State what a scan checked, the limits of the result, and what the user can do next. Distinguish advisory scoring from automatic blocking, and give partial or inconclusive results a review state when the underlying model supports it.

## Brand Commitments

Use **Vanguard AV** when the full public product name is needed. The wordmark reads **Vanguard**, and the helmet and knight artwork are established brand identifiers. The business and pitch materials use “Guardians of the Digital Frontier.” Explain technical results in plain language and retain the established meaning of security terms. [Identity guide](docs/Team%20Important%20Docs/Identity/Vanguard%20Identity.pdf) · [Logo assets](docs/Vanguard%20Graphics/Logo/)

## Evidence on Hand

- The [production design reference](docs/website/DESIGN.md) documents the visual system observed on the public site. Use it with the [asset inventory](docs/website/assets.md) and [section references](docs/website/README.md#homepage-in-reading-order) when a task concerns that site.
- The [pitch deck](docs/Team%20Important%20Docs/Vanguard%20Pitch%20Deck.pptx), [business model canvas](docs/Finincial%20Plans/Vanguard%20BMC.pdf), and [model summary](docs/Finincial%20Plans/AI%20Models.pdf) describe the product concept and research. Research results apply to their documented evaluation conditions.
- Confirm the source and measurement scope of published metrics before reusing them. Confirm attribution and permission with the content owner before reusing endorsements. [Website review](docs/website/review.md)

## Product Principles

1. Help people assess risk before they act.
2. Explain the finding and the next step in language a non-specialist can understand.
3. Keep each capability tied to its input, channel, and release evidence.
4. Make routine checks and results usable in the workflows where people encounter threats.

## Accessibility & Inclusion

Future web work should address the observed keyboard, focus, contrast, reduced-motion, and form-feedback issues. Ensure that people can read scan or inquiry outcomes regardless of input method or motion preference. The local site shell uses English. Arabic support is documented for the email model, and website localization remains undecided. [Website review](docs/website/review.md) · [Local layout](app/layout.tsx)
