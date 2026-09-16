# POCKET REELS 360 — MASTER PROJECT SPECIFICATION & ROADMAP
**Engineering & Architecture Documentation**  
**Prepared by:** KVS Developers  
**Contact:** `ksvdevlopers@gmail.com`  
**Client:** Pocket Reels 360  
**Document Date:** September 16, 2026  
**Phase 1 Target Handover Date:** September 19, 2026 (Upon Phase 1 Milestone Payment)

---

## 1. Executive Summary & Brand Identity

**Pocket Reels 360** is an agile, cinematic vertical video production and reel-maker crew that shoots on iPhone (4K ProRes), edits with dynamic rhythm, and delivers high-converting reels across Dallas (HQ), New York City, Chicago, and Charlotte.

This document establishes the multi-phase engineering roadmap, deliverables, policies, and design system developed by **KVS Developers**.

---

## 2. Technical Stack & Design System Specifications

### 2.1 Core Engineering Stack
- **Framework:** Next.js 16.3.5 (App Router with Turbopack & React 19)
- **Styling:** Tailwind CSS v4.1.13 with Custom CSS Design Variables & Micro-interactions
- **Smooth Scroll & Animation:** Lenis Smooth Scrolling + GSAP 3.15 ScrollTrigger + Custom Motion
- **AI Intelligence:** Groq SDK (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`) with Anthropic SDK fallback
- **Email Infrastructure:** Resend API with CAN-SPAM compliant transactional templates & single-thread message isolation
- **Database & Persistence:** PostgreSQL via Supabase (Connection pooling via `postgres.js`) + Serverless `/tmp` JSON fallback
- **Deployment Platform:** Vercel Production Serverless Cloud Architecture (Global Edge Network)

### 2.2 Brand Colors & Design Tokens
```css
/* Primary Dark & Light Neutral Palette */
--color-ink: #141312;              /* Deep Cinematic Charcoal Ink */
--color-ink-soft: #242220;         /* Soft Text Contrast / Dark Card Fill */
--color-ivory: #FAF9F5;            /* Editorial Warm Background */
--color-paper: #F4F2EB;            /* Card & Section Container Neutral */
--color-surface: #FFFFFF;          /* Pure Crisp Card Surface */
--color-muted: #5E5B56;            /* Secondary Body & Caption Slate */
--color-line: #DEDAD2;             /* Subtle Architectural Borders */

/* Signature Accent & Action Colors */
--color-accent: #CC101E;           /* Pocket Reels Signature Bold Red */
--color-accent-dark: #9E0813;      /* Pressed State / Button Hover */
--color-accent-soft: #FDE8EA;      /* Pill Badge Background / Light Red Tint */

/* AI Assistant & Action Bar */
--color-assistant-red: #9E0814;    /* Specialized AI Brand Red */
--color-assistant-red-hover: #7F060F;
--color-assistant-red-glow: rgba(158, 8, 20, 0.4);

/* System States */
--color-positive: #188038;         /* Confirmed / Green Status */
--color-error: #D93025;            /* Error / Alert Red */
```

### 2.3 Typography & Layout Dimensions
- **Primary Font Family:** "Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif
- **Editorial Serif:** Editorial Serif / Georgia Italic for highlighted emphasis
- **Container Max Width:** `92rem` (1472px)
- **Header Height:** `5.5rem` (88px)
- **Border Radii:** `sm: 0.6rem`, `md: 1.0rem`, `lg: 1.5rem`

---

## 3. Detailed Multi-Phase Roadmap

### Overview
- **Phase 1:** Full-Stack Web Platform, Booking Engine, Admin Portal, Legal Policies & AI Assistant (**Delivery: September 19, 2026 upon payment**).
- **Phase 2:** Admin Content Management Portal, Unified Social Analytics & 1-Click Multi-Platform Publishing (**Timeline: 7 to 10 Days**).
- **Phase 3:** AI Video Repurposing, 24/7 WhatsApp AI Agent & Telephony Voice AI Phone System (**Timeline: 25 to 35 Days**).

---

## 4. Phase 1: Full-Stack Web Platform, Booking Engine & Compliance

> **Delivery & Handover Date:** **September 19, 2026**  
> **Status:** Completed, verified, and ready for production handover upon receipt of the agreed Phase 1 milestone payment. (Payment details to be finalized).

### 4.1 Deliverables Completed in Phase 1
1. **Full-Stack Cinematic Web Application:**
   - Interactive Homepage featuring:
     - Hero section with live video reel previews and brand taglines.
     - 3D Cylindrical Curved Reel Dial (`curved-reel-dial.tsx`) powered by GSAP.
     - Production Process with Camera Viewfinder HUD simulation (`booking-flow-experience.tsx`).
     - Dual-view Portfolio Gallery (Filterable by Live & Events, Brands, Portraits, Real Estate) with Rally Wall horizontal mobile scrolling.
     - Production Scheduling card and Editorial Booking showcase.
     - Instagram highlights, live follower proof, and contact channels.
2. **End-to-End Booking Engine (`/book`):**
   - 6-step guided scheduling wizard:
     - Step 1: Package Selection (Weddings, Concerts, Brand Campaigns, VIP Milestones).
     - Step 2: Date Picker (with 12-month advance limits and automated conflict detection).
     - Step 3: Preferred Calling Window & Time Selection.
     - Step 4: Client Contact Information (Phone, Email, City, Venue).
     - Step 5: Creative Scope & Deliverables specification.
     - Step 6: Review & Final Submission with COPPA Age Verification and Legal Consent.
   - Instant "Add to Google Calendar" and `.ics` download on submission.
3. **Automated Notification & Confirmation Emails (Resend API):**
   - Customer booking confirmation with branded HTML template.
   - Internal crew notification sent directly to `koushik.lf38@gmail.com`.
   - **Conversation Thread Isolation:** Every booking automatically receives a unique reference code (e.g. `[PR-A4B92C]`) ensuring every booking arrives as a brand-new conversation thread in Gmail and email clients.
   - **CAN-SPAM Compliance:** Physical business hubs listed, clear explanation of receipt, and instant "CANCEL" / unsubscribe instructions.
4. **Admin Bookings Portal (`/admin`):**
   - Secured by 4-digit PIN (`9912`) without third-party auth bloat.
   - Real-time metrics: Total Enquiries, Pending Review, Confirmed Shoots, Next 30 Days.
   - Search & filter by Client, Package, Date, Location, and Status.
   - Prominent `PR-XXXXXX` reference badges across desktop table and mobile card views.
   - 1-click WhatsApp and Email action triggers pre-populated with inquiry reference codes.
   - 1-click CSV Export functionality for offline spreadsheet analysis.
5. **AI Creative Assistant Chatbot:**
   - Floating chat launcher powered by Groq (`openai/gpt-oss-120b`).
   - Grounded strictly in Pocket Reels 360 production packages, locations (Dallas, NYC, Chicago, Charlotte), iPhone 4K ProRes gear, and booking workflows.
   - Fallback channels wired to WhatsApp, Email, and Instagram.
6. **Accessibility & SEO:**
   - 100% WCAG 2.2 AA compliant contrast and keyboard accessibility.
   - JSON-LD Structured Data Schema for Organization and Local Business.
   - Dynamic OpenGraph cards (`/opengraph-image`), `robots.txt`, and `sitemap.xml`.

---

## 5. Client Review Checklist & Mandatory Actions

> **Client Legal & Administrative Review Required Before Public Launch:**  
> The client must review and approve the following legal policies and setup requirements before public domain pointing:

1. **Review Legal & Consumer Policies:**
   - **Privacy Policy (`/privacy`):** Confirm data collection scope, third-party vendor disclosures (Resend, Groq), and state privacy rights procedures.
   - **Terms of Service (`/terms`):** Confirm shoot terms, rescheduling windows (48 hours), weather safety contingencies, and copyright licenses.
   - **Refund & Cancellation Policy (`/refund`):** Confirm retainer terms, 7-day cancellation refund rules, and complimentary revision policies.
   - **Cookie Policy (`/cookie-policy`):** Review storage disclosure confirming zero advertising cookies or tracking pixels.
2. **Domain Purchase & DNS Configuration:**
   - Purchase the desired custom domain (e.g., `pocketreels360.com` or `pocketreels.com`) through Namecheap, GoDaddy, or Cloudflare.
   - Configure DNS records pointing to Vercel production servers:
     - `A Record`: `@` -> `76.76.21.21`
     - `CNAME Record`: `www` -> `cname.vercel-dns.com`
3. **Production Database (Supabase):**
   - Create a free or pro Supabase PostgreSQL project.
   - Provide the `DATABASE_URL` connection string to attach permanent SQL storage to Vercel.

---

## 6. Phase 2: Social Media CMS & Content Workflow Automation

**Estimated Timeline:** **7 to 10 Days** (Commences upon Phase 2 kickoff)

### 6.1 Admin Content Management Portal
- **Direct Website Content Management:** Dedicated portal allowing the Pocket Reels team to update text, pricing, packages, team bios, and service offerings directly from the browser without code changes or developer maintenance fees.
- **Authentication Options:** Flexible login supporting custom username/password or Google OAuth Sign-in.

### 6.2 Unified Social Media Performance Dashboard
- **Personalized Analytics Hub:** Track engagement, likes, views, comments, and reach across all linked channels:
  - Instagram Reels
  - YouTube Shorts
  - Facebook Reels
  - TikTok & LinkedIn Video
- **All-in-one Place:** View consolidated reach and stats in a single modern screen.

### 6.3 Multi-Platform 1-Click Publishing Workflow
- **Upload Once, Publish Everywhere:** Upload a finished 9:16 master video once to the dashboard.
- **Automated Multi-Network Distribution:** Automatically publish to Instagram, YouTube Shorts, and Facebook simultaneously.
- **Custom Post Metadata:** Custom title, caption, hashtags, and automatic first-comment engagement injection.

---

## 7. Phase 3: AI Video Automation, WhatsApp Agent & Telephony Voice AI

**Estimated Timeline:** **25 to 35 Days** (Commences upon Phase 3 kickoff)

### 7.1 AI Video Automation & Smart Repurposing
- **Custom Automated Thumbnail Generator:** Generates high-impact 9:16 vertical thumbnails with styled typography and graphic overlays tailored to reels.
- **Long-Form to Short-Form Video Converter:** AI-assisted tool to extract highlights from long videos (concerts, wedding ceremonies, corporate speeches) into dynamic 30–60 second reels for Shorts and Instagram.

### 7.2 24/7 Intelligent WhatsApp Automation Agent
- **Always-On Customer Support (24/7):** Instant replies to inquiries on WhatsApp business numbers.
- **Rich Media & Document Distribution:** Automatically delivers service brochures, sample reel galleries, PDF contracts, and venue shoot checklists.
- **Location & Booking Coordination:** Shares studio/hub directions and coordinates client call windows.
- **Automated Event & Payment Reminders:** Sends scheduled WhatsApp reminders for upcoming shoot dates, balance payments, and review approvals.
- **NLP Voice Note Understanding:** Clients can send voice notes in WhatsApp; the agent transcribes and answers accurately using natural language processing.
- **Dashboard Integration:** View all live WhatsApp conversations inside the admin dashboard with client sentiment analysis and intelligent lead sorting/filtering (Hot, Warm, Cold).

### 7.3 Telephony Voice AI Agent (Inbound & Outbound Phone Calls)
- **Direct Phone Answering (24/7 Live):** An AI phone agent that answers incoming calls on your official business telephone line.
- **Intelligent Lead Qualification:** Answers client questions about packages, pricing guidelines, camera gear, and service availability.
- **Automated Call Reminders:** Places automated follow-up calls to remind clients of scheduled shoot dates, balance payments, or consultation windows.
- **Multi-Language Support:** Real-time conversational support across English, Spanish, and regional Indian languages (Hindi, Telugu, etc.) to serve diverse wedding and event clients.

---

## 8. Summary Table of Deliverables & Schedules

| Project Phase | Focus & Deliverables | Timeline | Milestone Condition |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Full-Stack Web Platform, 3D Reel Dial, 6-Step Booking Wizard, Email Thread Isolation, 4-Digit Admin Portal, AI Assistant, Legal Suite (Privacy, Terms, Refund, Cookies). | **Ready Sept 19, 2026** | **Handover upon receipt of Phase 1 Payment** |
| **Phase 2** | Content Management Portal, Google/Password Auth, Unified Social Media Dashboard (IG, YT, FB), 1-Click Multi-Platform Video Publisher. | **7 to 10 Days** | Phase 2 Kickoff & Scope Approval |
| **Phase 3** | AI Thumbnail Design, Long-to-Shorts Video Converter, 24/7 WhatsApp AI Agent (Voice note NLP, CRM lead filtering, Docs), Telephony Voice AI Phone Agent (Multi-Language, Payment Reminders). | **25 to 35 Days** | Phase 3 Kickoff & Scope Approval |

---

*Document authored and certified by **KVS Developers** (`ksvdevlopers@gmail.com`).*
