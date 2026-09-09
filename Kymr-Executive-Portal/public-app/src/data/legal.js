// ============================================================
// PRIVACY POLICY AND TERMS
//
// Written 2026-09-08. Two rules governed every line of it:
//
// 1. NOTHING HERE IS BOILERPLATE. Every claim about what this site
//    collects, where it sends it and what it does not do was read off
//    the code, not off a template:
//
//      lib/inquiry.js       the exact fields the two forms send
//      lib/submitInquiry.js Firebase callable + App Check/reCAPTCHA
//      functions/index.js   region asia-southeast1
//      firestore.rules      client reads and writes denied outright
//      lib/scope.js         sessionStorage draft
//      ArchiveScene.jsx     the localStorage autoplay preference
//      public/index.html    no analytics, no tag manager, no pixel
//
//    A policy that claims more than the product does is a lie in the
//    visitor's favour; one that claims less is a lie in ours. Both are
//    worth avoiding, and the only way to avoid them is to read the code.
//
// 2. NOTHING IS INVENTED. Facts the codebase does not contain - the
//    registered entity name, the address, the GST number - are marked
//    NEEDS_OWNER and rendered as a visible placeholder rather than
//    guessed at. A privacy notice with a made-up registered address is
//    worse than no privacy notice.
//
// THIS IS A STRONG DRAFT, NOT LEGAL ADVICE. It is written to be
// accurate and readable and to map onto India's DPDP Act 2023 and the
// GDPR, but it has not been reviewed by a lawyer and it should be
// before it is relied on.
// ============================================================

/** Anything the studio has to supply before these pages are truthful. */
export const NEEDS_OWNER = "[ to be supplied ]";

export const LEGAL_CONTACT = "media@kymrstudio.com";
export const LEGAL_UPDATED = "8 September 2026";

// ------------------------------------------------------------
// PRIVACY
// ------------------------------------------------------------
export const PRIVACY = {
  slug: "privacy",
  title: "Privacy Policy",
  standfirst:
    "This site asks for very little and does almost nothing with it. Everything below describes what actually happens, read off the code that runs this page rather than adapted from a template.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      id: "short",
      h: "The short version",
      body: [
        "We collect what you type into the contact form, and nothing else. There are no analytics, no advertising pixels, no tag manager and no tracking cookies on this site — not configured off, simply not present.",
        "What you send is used to reply to you. It is not sold, not shared for anyone else's marketing, and never added to a mailing list. You are not profiled and no automated decision is made about you.",
        "If you would rather not use the form at all, email us instead. Nothing on this site has to be filled in to read it.",
      ],
    },
    {
      id: "who",
      h: "Who is responsible",
      body: [
        `KymrStudio ("we", "us") decides how the information described here is handled. Under the DPDP Act we are the Data Fiduciary; under the GDPR we are the Controller.`,
        `Registered name and address: ${NEEDS_OWNER}.`,
        `For anything in this policy, including any request about your data, write to ${LEGAL_CONTACT}. A person reads that address.`,
      ],
    },
    {
      id: "collect",
      h: "What we collect, exactly",
      body: [
        "Two forms on this site send anything anywhere, and these are the complete field lists.",
      ],
      lists: [
        {
          h: "A general enquiry sends",
          items: [
            "Your name",
            "Your email address",
            "Your company or brand, if you enter one — the field is optional",
            "Your website, if you enter one — optional",
            "Your message",
            "The time you started writing, which we use to discard automated submissions",
          ],
        },
        {
          h: "A guided project brief sends the same, plus only the answers you choose to give",
          items: [
            "What you are looking for",
            "A note about your brand",
            "A monthly advertising budget range — skippable, and marked as media spend rather than our fee",
            "Your current return on ad spend — skippable",
            "Your own target monthly revenue — skippable",
          ],
        },
        {
          h: "If you have configured a scope in one of the estimators, the summary line travels with your enquiry",
          items: [
            "The market you chose and the scope you assembled, as a single line of text",
            "No price is included, because the estimator does not calculate one for us — it shows you a range and stops",
          ],
        },
      ],
      after: [
        "That is the entire list. We do not ask for, and the form cannot send, a phone number, a postal address, a date of birth, a payment detail or any government identifier. If you volunteer something like that inside the message box it reaches us as part of your message, so please do not.",
        "We do not knowingly collect information from children. This is a business-to-business studio site and nothing on it is directed at them.",
      ],
    },
    {
      id: "not",
      h: "What we do not collect",
      body: [
        "This section exists because on most sites it would be untrue, and here it is checkable — the page source is served to you and contains none of it.",
      ],
      lists: [
        {
          h: "Not present on this site",
          items: [
            "No Google Analytics, and no analytics of any other kind",
            "No tag manager",
            "No advertising or social pixel, including Meta, LinkedIn and TikTok",
            "No session recording or heatmapping",
            "No cross-site or third-party cookies",
            "No fingerprinting",
            "No mailing list, and therefore no newsletter you have to unsubscribe from",
          ],
        },
      ],
      after: [
        "There is no cookie banner on this site because there is nothing to consent to. If that ever changes, the banner will appear before the tracking does, not after.",
      ],
    },
    {
      id: "storage",
      h: "What this site stores in your browser",
      body: [
        "Three small values are kept by your own browser. None of them is a tracking cookie, none is sent to us, and none can identify you.",
      ],
      lists: [
        {
          h: "Kept locally, on your device only",
          items: [
            "Whether you have already seen the opening sequence, so you are not shown it twice in one visit. Cleared when you close the tab.",
            "A scope you have started configuring, so it survives closing the estimator by accident. Cleared when you close the tab.",
            "Whether you paused the archive's rotation, so it stays paused next time. This one persists until you clear your site data.",
          ],
        },
      ],
      after: [
        "Clearing site data for this domain removes all three, and the site works normally without them.",
      ],
    },
    {
      id: "why",
      h: "Why we hold it, and on what basis",
      body: [
        "One purpose: to read what you sent and reply to it, and to carry on that conversation if it becomes a project.",
        "Under the GDPR the lawful basis is our legitimate interest in responding to someone who has deliberately contacted us about work, and where the exchange leads to an engagement, the steps taken at your request before entering a contract. Under the DPDP Act it is the consent you give by choosing to submit the form, which you may withdraw at any time.",
        "We will not use what you send for anything else — no marketing, no profiling, no training of any model — without asking you first and separately.",
      ],
    },
    {
      id: "where",
      h: "Where it goes",
      body: [
        "The form does not post to an inbox. It calls a server function that validates the submission and writes it to a database, so that what reaches us is checked before it is stored.",
      ],
      lists: [
        {
          h: "The route your enquiry takes",
          items: [
            "Your browser calls a Google Cloud Function, protected by Firebase App Check and reCAPTCHA Enterprise, which exists to keep automated submissions out",
            "The function validates the fields and writes the record to Google Cloud Firestore",
            "Both run in Google's asia-southeast1 region, in Singapore",
            "Firestore's rules deny every read and write from a browser outright, so no visitor to this site can read what anyone else has sent",
            "From there the enquiry reaches the studio's own CRM so it can be answered and followed up",
          ],
        },
      ],
      after: [
        "Google is our processor for hosting, the function and the database, under their data processing terms. They do not use your enquiry for their own purposes.",
        "If you are in the EEA or the UK, this means your information is transferred outside it. That transfer is covered by the Standard Contractual Clauses in Google's terms.",
        `We use no other processor for enquiries. If that changes, this section changes with it.`,
      ],
    },
    {
      id: "elsewhere",
      h: "Links that leave this site",
      body: [
        "Two things on this site hand you to someone else, and only if you click them.",
        "Booking a strategy call opens Cal.com, which becomes responsible for whatever you enter there under its own privacy policy. The social links open Instagram and LinkedIn. We do not embed any of them, so none of them can see you until you choose to go.",
      ],
    },
    {
      id: "keep",
      h: "How long we keep it",
      body: [
        "An enquiry that does not become a project is kept for up to 24 months so that we can pick up a conversation you may return to, and then deleted.",
        "An enquiry that becomes a project is kept for as long as we work together and for 7 years afterwards, because tax and accounting law in India requires business records to be retained.",
        "Ask us to delete yours sooner and we will, unless one of those legal retention duties applies to it — in which case we will tell you which, and delete it when it lapses.",
      ],
    },
    {
      id: "rights",
      h: "Your rights, and how to actually use them",
      body: [
        `Write to ${LEGAL_CONTACT} and say what you want. You do not need to cite a law or use a particular form of words, and we will not ask you to create an account to make a request. We aim to answer within 30 days.`,
      ],
      lists: [
        {
          h: "You can ask us to",
          items: [
            "Tell you what we hold about you, and give you a copy",
            "Correct anything wrong or out of date",
            "Delete it",
            "Stop using it, or restrict what we do with it",
            "Send it to you, or to someone else, in a portable form",
            "Withdraw consent you have given, which stops future use without undoing what was lawful before",
            "Object to our relying on legitimate interest",
          ],
        },
      ],
      after: [
        "We may need to check you are who you say you are before acting — usually by replying to the address the enquiry came from.",
        "If you think we have handled this badly, please tell us first so we can put it right. You also have the right to go over our heads: in India, to the Data Protection Board; in the EEA or the UK, to your national supervisory authority or the Information Commissioner's Office.",
        "Under the DPDP Act you may also nominate someone to exercise these rights on your behalf if you die or become incapacitated. Tell us and we will record it.",
      ],
    },
    {
      id: "security",
      h: "Keeping it safe",
      body: [
        "Everything is served over HTTPS. The submission endpoint is gated by App Check and reCAPTCHA Enterprise. The database refuses every browser-side read and write, so enquiries are only reachable by an authorised account. Access inside the studio is limited to the people who need it to answer you.",
        "No system is beyond compromise. If a breach affects your information we will notify you and the relevant regulator as the law requires, and we will tell you what happened rather than the least we can get away with.",
      ],
    },
    {
      id: "changes",
      h: "Changes to this policy",
      body: [
        `This version is dated ${LEGAL_UPDATED}. If we change it we will change that date, and for anything that materially affects what happens to information you have already sent us, we will contact you rather than rely on your noticing.`,
      ],
    },
  ],
};

// ------------------------------------------------------------
// TERMS
// ------------------------------------------------------------
export const TERMS = {
  slug: "terms",
  title: "Terms & Conditions",
  standfirst:
    "What this site is, what the numbers on it mean, and the terms we work under. Written to be read rather than to be survived.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      id: "about",
      h: "These terms, and what they cover",
      body: [
        `These terms govern your use of this website. They also form the baseline for work we take on, unless a signed proposal or statement of work says otherwise — in which case that document wins on any point where the two disagree.`,
        `The studio is KymrStudio, ${NEEDS_OWNER}. Contact: ${LEGAL_CONTACT}.`,
        "Using this site means you accept these terms. If you do not, please stop using it.",
      ],
    },
    {
      id: "what",
      h: "What we do",
      body: [
        "Two kinds of work, scoped separately because they are bought differently.",
      ],
      lists: [
        {
          h: "Advertising creative",
          items: [
            "Campaign films",
            "Product content",
            "Social advertising",
            "Editing and versioning — ratios, cutdowns, hooks and recuts",
          ],
        },
        {
          h: "Builds",
          items: [
            "Websites",
            "Ecommerce stores",
            "Content editing, blogs, booking and enquiry forms, payments, additional languages and third-party integrations, where a project includes them",
          ],
        },
      ],
    },
    {
      id: "estimates",
      h: "What the estimators do and do not do",
      body: [
        "This is the most important section on this page, so it is early and it is blunt.",
        "The scope builders on this site produce an indicative range, not a quote, not an offer and not a contract. Nothing you configure obliges either of us to anything.",
        "Two figures are firm: our studio minimums of ₹15,000 negotiable in India and US$500 negotiable internationally. They are the least it costs to engage us, not the price of any particular piece of work. They are stated independently of one another and neither is a currency conversion of the other.",
        "Every other figure is a working ladder used to produce an indicative range. Scope, timeline, licensing, media requirements and delivery formats all move a real price. A binding price exists only in a written proposal signed by both of us.",
        "Prices exclude taxes, which are added as the law requires, and exclude third-party costs — stock, licences, talent, hosting, domains and paid media — which are yours unless a proposal says we carry them.",
      ],
    },
    {
      id: "work",
      h: "The work shown on this site",
      body: [
        "The concepts in the archive are self-initiated spec work. They were made by this studio to demonstrate how it thinks. None of them was a commissioned campaign, none of them ran, and no performance result is claimed for any of them.",
        "Where a brief, an audience or an objective is described alongside a concept, it is the brief we set ourselves, not a client's.",
        "We say this here as well as on the work itself because it should not be possible to mistake it.",
      ],
    },
    {
      id: "results",
      h: "What we do not promise",
      body: [
        "We do not guarantee outcomes. No return on ad spend, no revenue figure, no reach, no conversion rate, no ranking and no follower count.",
        "Advertising performance depends on your product, your pricing, your offer, your audience, your media budget and the platforms you run on — most of which are yours and none of which are wholly ours. Any figure you enter in the guided brief is your own target, recorded so we understand what you are aiming at. It is never a projection from us.",
        "Anyone in this industry who guarantees you a number is either guessing or selling. We would rather say so in our terms than in a meeting.",
      ],
    },
    {
      id: "engaging",
      h: "How an engagement starts",
      body: [
        "An enquiry starts a conversation and nothing more. A project begins when we have both agreed a written proposal covering scope, deliverables, timeline and price, and you have confirmed it.",
        "We may decline work. Usually that is capacity, occasionally it is fit, and sometimes it is that we do not think we would do it well.",
      ],
    },
    {
      id: "delivery",
      h: "Delivery, revisions and your part in it",
      body: [
        "Timelines assume you supply what the work needs — product, assets, brand materials, approvals and feedback — by the dates the proposal names. If those slip, the delivery dates move with them, and we will say so at the time rather than at the end.",
        "Each stage carries the number of revision rounds its proposal states. Changes that alter the agreed brief rather than refine its execution are new scope, quoted before anything is done — never invoiced as a surprise.",
        "Where turnaround commitments appear on this site, they describe our own working standard for a batch already in production, not a promise attaching to a project that has not started.",
      ],
    },
    {
      id: "ip",
      h: "Who owns what",
      body: [
        "On full payment, the rights to the final delivered work transfer to you, for the uses the proposal names.",
        "Until then the work remains ours, and unpaid work must not be published or run.",
        "We keep ownership of what we brought with us: our working methods, our project files and templates, our tooling, and anything developed independently of your project. Where a deliverable depends on one of those, you get a licence to use it as part of that deliverable.",
        "Third-party material — stock, fonts, music, talent — is licensed for the uses the proposal names. Extending to a different territory, medium or period may require a new licence, and we will tell you when it does.",
        "You warrant that anything you give us is yours to give.",
      ],
    },
    {
      id: "portfolio",
      h: "Showing the work",
      body: [
        "We would like to show what we make. Unless you tell us not to, we may display completed work in our portfolio and on our own channels once it has run publicly.",
        "Tell us at any point, before or after, and it comes down or never goes up. Confidential work stays confidential, and anything covered by an NDA is out of scope for this entirely.",
      ],
    },
    {
      id: "payment",
      h: "Payment",
      body: [
        "Fees, schedule and currency are set in the proposal. Work generally begins on an advance, with the balance due at the milestones the proposal names.",
        "Invoices are payable within the period stated on them. On overdue amounts we may pause work and charge interest at the rate allowed by law.",
        "Taxes are added as applicable. Bank charges and currency conversion costs on international payments are yours.",
      ],
    },
    {
      id: "cancel",
      h: "Stopping",
      body: [
        "Either of us may end an engagement in writing.",
        "If you stop a project after it has started, work completed and irrevocable third-party costs already committed are payable. If we stop it other than for non-payment or a breach on your side, we invoice only what has been completed and hand over what you have paid for.",
      ],
    },
    {
      id: "site",
      h: "Using this site",
      body: [
        "The design, code, text and imagery here are ours. You may read, link to and share the site. You may not copy it, scrape it, republish it or reuse its imagery without written permission.",
        "Do not attempt to break, overload or gain unauthorised access to it, and do not submit anything unlawful, misleading, or infringing through the form.",
        "We may change or withdraw any part of this site at any time.",
      ],
    },
    {
      id: "liability",
      h: "Liability",
      body: [
        "Nothing here limits liability that cannot lawfully be limited — including for death or personal injury caused by negligence, or for fraud.",
        "Subject to that, our total liability arising out of an engagement is limited to the fees you have paid us for the work the claim relates to, and we are not liable for indirect or consequential loss, or for lost profit, revenue, data, goodwill or anticipated savings.",
        "This site is provided as it is. We do not warrant that it will be uninterrupted or error-free.",
      ],
    },
    {
      id: "law",
      h: "Governing law",
      body: [
        `These terms are governed by the laws of India, and the courts at ${NEEDS_OWNER} have exclusive jurisdiction.`,
        "Before either of us goes to court, we will each raise the problem in writing and give the other 30 days to resolve it. Most things end there.",
      ],
    },
    {
      id: "misc",
      h: "The rest",
      body: [
        "If any part of these terms turns out to be unenforceable, the rest still stands.",
        "Not enforcing something once does not waive it.",
        "Neither of us is liable for failures caused by events genuinely outside our control.",
        `We may update these terms; the version in force is the one published here, dated ${LEGAL_UPDATED}. Changes do not alter the terms of a project already agreed in writing.`,
      ],
    },
  ],
};

export const LEGAL_PAGES = { privacy: PRIVACY, terms: TERMS };
