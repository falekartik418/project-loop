import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

type FeedbackSeed = {
  content: string
  channel: string
  customerLabel: string
  sentiment: 'POS' | 'NEU' | 'NEG'
  sentimentScore: number
  theme: string
}

const FEEDBACK_DATA: FeedbackSeed[] = [
  // =========================
  // ONBOARDING — 15
  // =========================

  {
    content: "The signup process was surprisingly quick and I had my workspace ready within a few minutes.",
    channel: "NPS survey",
    customerLabel: "Customer 001",
    sentiment: "POS",
    sentimentScore: 0.82,
    theme: "Onboarding",
  },
  {
    content: "I wasn't sure which information to enter during the initial setup, so I had to restart the onboarding flow.",
    channel: "Support ticket",
    customerLabel: "Customer 002",
    sentiment: "NEG",
    sentimentScore: -0.62,
    theme: "Onboarding",
  },
  {
    content: "The onboarding checklist made it easy to understand what I needed to configure first.",
    channel: "App store review",
    customerLabel: "Customer 003",
    sentiment: "POS",
    sentimentScore: 0.76,
    theme: "Onboarding",
  },
  {
    content: "I completed registration but wasn't sure what to do after reaching the dashboard.",
    channel: "Community post",
    customerLabel: "Customer 004",
    sentiment: "NEG",
    sentimentScore: -0.48,
    theme: "Onboarding",
  },
  {
    content: "The guided setup is useful, especially for configuring the first workspace.",
    channel: "Sales call note",
    customerLabel: "Customer 005",
    sentiment: "POS",
    sentimentScore: 0.68,
    theme: "Onboarding",
  },
  {
    content: "The welcome tutorial explains the main features clearly without overwhelming new users.",
    channel: "NPS survey",
    customerLabel: "Customer 006",
    sentiment: "POS",
    sentimentScore: 0.79,
    theme: "Onboarding",
  },
  {
    content: "I skipped the tutorial and later struggled to find some of the configuration options.",
    channel: "Support ticket",
    customerLabel: "Customer 007",
    sentiment: "NEG",
    sentimentScore: -0.57,
    theme: "Onboarding",
  },
  {
    content: "The onboarding experience is straightforward, although I would like more explanations for advanced settings.",
    channel: "Community post",
    customerLabel: "Customer 008",
    sentiment: "NEU",
    sentimentScore: 0.08,
    theme: "Onboarding",
  },
  {
    content: "Importing our initial data during setup worked without any problems.",
    channel: "Sales call note",
    customerLabel: "Customer 009",
    sentiment: "POS",
    sentimentScore: 0.71,
    theme: "Onboarding",
  },
  {
    content: "It took me several attempts to understand how workspace setup and team invitations were connected.",
    channel: "Support ticket",
    customerLabel: "Customer 010",
    sentiment: "NEG",
    sentimentScore: -0.69,
    theme: "Onboarding",
  },
  {
    content: "The setup wizard saved me a lot of time compared with configuring everything manually.",
    channel: "App store review",
    customerLabel: "Customer 011",
    sentiment: "POS",
    sentimentScore: 0.84,
    theme: "Onboarding",
  },
  {
    content: "The onboarding emails were helpful but arrived a little too frequently.",
    channel: "NPS survey",
    customerLabel: "Customer 012",
    sentiment: "NEU",
    sentimentScore: 0.12,
    theme: "Onboarding",
  },
  {
    content: "Our team was able to get started without needing a training session.",
    channel: "Sales call note",
    customerLabel: "Customer 013",
    sentiment: "POS",
    sentimentScore: 0.73,
    theme: "Onboarding",
  },
  {
    content: "I expected more guidance when connecting our first data source.",
    channel: "Community post",
    customerLabel: "Customer 014",
    sentiment: "NEG",
    sentimentScore: -0.51,
    theme: "Onboarding",
  },
  {
    content: "The onboarding screens are clean and the progress indicator makes the process feel manageable.",
    channel: "App store review",
    customerLabel: "Customer 015",
    sentiment: "POS",
    sentimentScore: 0.77,
    theme: "Onboarding",
  },

  // =========================
  // BILLING — 15
  // =========================

  {
    content: "The pricing information is easy to understand and I knew exactly what plan we were selecting.",
    channel: "NPS survey",
    customerLabel: "Customer 016",
    sentiment: "POS",
    sentimentScore: 0.74,
    theme: "Billing",
  },
  {
    content: "I was charged for an additional seat even though the user was removed before the billing date.",
    channel: "Support ticket",
    customerLabel: "Customer 017",
    sentiment: "NEG",
    sentimentScore: -0.86,
    theme: "Billing",
  },
  {
    content: "The invoice downloads correctly and contains all the details our finance team needs.",
    channel: "Sales call note",
    customerLabel: "Customer 018",
    sentiment: "POS",
    sentimentScore: 0.72,
    theme: "Billing",
  },
  {
    content: "I couldn't immediately find where to update our payment method.",
    channel: "App store review",
    customerLabel: "Customer 019",
    sentiment: "NEG",
    sentimentScore: -0.55,
    theme: "Billing",
  },
  {
    content: "The monthly billing amount matched what was shown during checkout.",
    channel: "NPS survey",
    customerLabel: "Customer 020",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Billing",
  },
  {
    content: "Our finance department needs more flexibility around invoice dates.",
    channel: "Sales call note",
    customerLabel: "Customer 021",
    sentiment: "NEU",
    sentimentScore: -0.04,
    theme: "Billing",
  },
  {
    content: "I received two billing notifications for the same transaction.",
    channel: "Support ticket",
    customerLabel: "Customer 022",
    sentiment: "NEG",
    sentimentScore: -0.72,
    theme: "Billing",
  },
  {
    content: "Upgrading our plan was simple and the new limits appeared immediately.",
    channel: "App store review",
    customerLabel: "Customer 023",
    sentiment: "POS",
    sentimentScore: 0.79,
    theme: "Billing",
  },
  {
    content: "The tax information on our invoice was incorrect and required support assistance.",
    channel: "Support ticket",
    customerLabel: "Customer 024",
    sentiment: "NEG",
    sentimentScore: -0.78,
    theme: "Billing",
  },
  {
    content: "I like that billing history remains available even after changing plans.",
    channel: "Community post",
    customerLabel: "Customer 025",
    sentiment: "POS",
    sentimentScore: 0.67,
    theme: "Billing",
  },
  {
    content: "The cancellation process explained what would happen to our remaining subscription period.",
    channel: "NPS survey",
    customerLabel: "Customer 026",
    sentiment: "POS",
    sentimentScore: 0.61,
    theme: "Billing",
  },
  {
    content: "It wasn't obvious whether unused credits would carry over to the next billing cycle.",
    channel: "Community post",
    customerLabel: "Customer 027",
    sentiment: "NEU",
    sentimentScore: -0.09,
    theme: "Billing",
  },
  {
    content: "Our company needs purchase-order numbers included automatically on invoices.",
    channel: "Sales call note",
    customerLabel: "Customer 028",
    sentiment: "NEU",
    sentimentScore: 0.02,
    theme: "Billing",
  },
  {
    content: "The payment failed even though the same card works normally with other services.",
    channel: "Support ticket",
    customerLabel: "Customer 029",
    sentiment: "NEG",
    sentimentScore: -0.73,
    theme: "Billing",
  },
  {
    content: "The billing dashboard gives me a clear view of our current subscription and usage.",
    channel: "App store review",
    customerLabel: "Customer 030",
    sentiment: "POS",
    sentimentScore: 0.75,
    theme: "Billing",
  },

  // =========================
  // PERFORMANCE — 15
  // =========================

  {
    content: "Pages load almost instantly when I'm working with smaller datasets.",
    channel: "App store review",
    customerLabel: "Customer 031",
    sentiment: "POS",
    sentimentScore: 0.78,
    theme: "Performance",
  },
  {
    content: "The dashboard becomes noticeably slow when we load several months of data.",
    channel: "Support ticket",
    customerLabel: "Customer 032",
    sentiment: "NEG",
    sentimentScore: -0.71,
    theme: "Performance",
  },
  {
    content: "Reports generated much faster after the latest update.",
    channel: "NPS survey",
    customerLabel: "Customer 033",
    sentiment: "POS",
    sentimentScore: 0.83,
    theme: "Performance",
  },
  {
    content: "The application occasionally freezes while switching between large reports.",
    channel: "Community post",
    customerLabel: "Customer 034",
    sentiment: "NEG",
    sentimentScore: -0.68,
    theme: "Performance",
  },
  {
    content: "Search results appear quickly even with thousands of feedback records.",
    channel: "Sales call note",
    customerLabel: "Customer 035",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Performance",
  },
  {
    content: "There is a short delay when opening the analytics dashboard, but it is manageable.",
    channel: "NPS survey",
    customerLabel: "Customer 036",
    sentiment: "NEU",
    sentimentScore: 0.16,
    theme: "Performance",
  },
  {
    content: "Uploading a large feedback file takes much longer than expected.",
    channel: "Support ticket",
    customerLabel: "Customer 037",
    sentiment: "NEG",
    sentimentScore: -0.65,
    theme: "Performance",
  },
  {
    content: "The application feels much smoother on the latest browser version.",
    channel: "Community post",
    customerLabel: "Customer 038",
    sentiment: "POS",
    sentimentScore: 0.69,
    theme: "Performance",
  },
  {
    content: "Sometimes the trends page takes nearly a minute to display all results.",
    channel: "App store review",
    customerLabel: "Customer 039",
    sentiment: "NEG",
    sentimentScore: -0.76,
    theme: "Performance",
  },
  {
    content: "Our team hasn't experienced any major performance issues so far.",
    channel: "Sales call note",
    customerLabel: "Customer 040",
    sentiment: "POS",
    sentimentScore: 0.64,
    theme: "Performance",
  },
  {
    content: "The first page loads quickly but navigating to deeper analytics takes longer.",
    channel: "NPS survey",
    customerLabel: "Customer 041",
    sentiment: "NEU",
    sentimentScore: -0.02,
    theme: "Performance",
  },
  {
    content: "I noticed slower response times during peak working hours.",
    channel: "Support ticket",
    customerLabel: "Customer 042",
    sentiment: "NEG",
    sentimentScore: -0.59,
    theme: "Performance",
  },
  {
    content: "Exporting a report now takes only a few seconds, which is a big improvement.",
    channel: "App store review",
    customerLabel: "Customer 043",
    sentiment: "POS",
    sentimentScore: 0.86,
    theme: "Performance",
  },
  {
    content: "Performance is acceptable for our current usage, although we expect more data next quarter.",
    channel: "Sales call note",
    customerLabel: "Customer 044",
    sentiment: "NEU",
    sentimentScore: 0.21,
    theme: "Performance",
  },
  {
    content: "The interface became unresponsive while processing a particularly large import.",
    channel: "Community post",
    customerLabel: "Customer 045",
    sentiment: "NEG",
    sentimentScore: -0.74,
    theme: "Performance",
  },

  // =========================
  // MOBILE EXPERIENCE — 15
  // =========================

  {
    content: "The mobile interface makes it convenient to check feedback while I'm away from my desk.",
    channel: "App store review",
    customerLabel: "Customer 046",
    sentiment: "POS",
    sentimentScore: 0.82,
    theme: "Mobile experience",
  },
  {
    content: "Some buttons are difficult to tap because they are too close together on smaller screens.",
    channel: "Support ticket",
    customerLabel: "Customer 047",
    sentiment: "NEG",
    sentimentScore: -0.61,
    theme: "Mobile experience",
  },
  {
    content: "Notifications work reliably on my phone and help me respond quickly.",
    channel: "NPS survey",
    customerLabel: "Customer 048",
    sentiment: "POS",
    sentimentScore: 0.79,
    theme: "Mobile experience",
  },
  {
    content: "The mobile dashboard doesn't show all the information available on desktop.",
    channel: "Community post",
    customerLabel: "Customer 049",
    sentiment: "NEG",
    sentimentScore: -0.58,
    theme: "Mobile experience",
  },
  {
    content: "I can review customer comments during meetings without opening my laptop.",
    channel: "Sales call note",
    customerLabel: "Customer 050",
    sentiment: "POS",
    sentimentScore: 0.73,
    theme: "Mobile experience",
  },
  {
    content: "The mobile layout is functional but some analytics require too much scrolling.",
    channel: "NPS survey",
    customerLabel: "Customer 051",
    sentiment: "NEU",
    sentimentScore: 0.04,
    theme: "Mobile experience",
  },
  {
    content: "The app occasionally logs me out when I switch between applications.",
    channel: "Support ticket",
    customerLabel: "Customer 052",
    sentiment: "NEG",
    sentimentScore: -0.67,
    theme: "Mobile experience",
  },
  {
    content: "I like how quickly the mobile app opens compared with the previous version.",
    channel: "App store review",
    customerLabel: "Customer 053",
    sentiment: "POS",
    sentimentScore: 0.77,
    theme: "Mobile experience",
  },
  {
    content: "Text in the analytics charts is too small to read comfortably on my phone.",
    channel: "Community post",
    customerLabel: "Customer 054",
    sentiment: "NEG",
    sentimentScore: -0.56,
    theme: "Mobile experience",
  },
  {
    content: "The mobile version is useful for quick checks but I still prefer desktop for detailed analysis.",
    channel: "Sales call note",
    customerLabel: "Customer 055",
    sentiment: "NEU",
    sentimentScore: 0.18,
    theme: "Mobile experience",
  },
  {
    content: "Push alerts helped our support team catch an urgent complaint quickly.",
    channel: "NPS survey",
    customerLabel: "Customer 056",
    sentiment: "POS",
    sentimentScore: 0.85,
    theme: "Mobile experience",
  },
  {
    content: "The app crashes occasionally when I open a report from a notification.",
    channel: "Support ticket",
    customerLabel: "Customer 057",
    sentiment: "NEG",
    sentimentScore: -0.82,
    theme: "Mobile experience",
  },
  {
    content: "The mobile navigation is simple enough that new team members learn it quickly.",
    channel: "App store review",
    customerLabel: "Customer 058",
    sentiment: "POS",
    sentimentScore: 0.70,
    theme: "Mobile experience",
  },
  {
    content: "Landscape mode would make the analytics charts much easier to use.",
    channel: "Community post",
    customerLabel: "Customer 059",
    sentiment: "NEU",
    sentimentScore: 0.01,
    theme: "Mobile experience",
  },
  {
    content: "I can complete most daily tasks from my phone without needing the desktop application.",
    channel: "Sales call note",
    customerLabel: "Customer 060",
    sentiment: "POS",
    sentimentScore: 0.80,
    theme: "Mobile experience",
  },

  // =========================
  // INTEGRATIONS — 15
  // =========================

  {
    content: "Connecting our CRM took less than ten minutes and the imported data looked correct.",
    channel: "Sales call note",
    customerLabel: "Customer 061",
    sentiment: "POS",
    sentimentScore: 0.84,
    theme: "Integrations",
  },
  {
    content: "The Slack integration stopped sending notifications after we changed our workspace settings.",
    channel: "Support ticket",
    customerLabel: "Customer 062",
    sentiment: "NEG",
    sentimentScore: -0.70,
    theme: "Integrations",
  },
  {
    content: "I appreciate having integrations available without needing custom development.",
    channel: "NPS survey",
    customerLabel: "Customer 063",
    sentiment: "POS",
    sentimentScore: 0.76,
    theme: "Integrations",
  },
  {
    content: "Our team couldn't connect the external service because the documentation was unclear.",
    channel: "Community post",
    customerLabel: "Customer 064",
    sentiment: "NEG",
    sentimentScore: -0.63,
    theme: "Integrations",
  },
  {
    content: "The webhook integration gives us exactly the automation flexibility we needed.",
    channel: "Sales call note",
    customerLabel: "Customer 065",
    sentiment: "POS",
    sentimentScore: 0.86,
    theme: "Integrations",
  },
  {
    content: "The integration setup has several technical fields that non-developers may find confusing.",
    channel: "NPS survey",
    customerLabel: "Customer 066",
    sentiment: "NEU",
    sentimentScore: -0.06,
    theme: "Integrations",
  },
  {
    content: "Our data synchronization failed twice before completing successfully.",
    channel: "Support ticket",
    customerLabel: "Customer 067",
    sentiment: "NEG",
    sentimentScore: -0.66,
    theme: "Integrations",
  },
  {
    content: "The Google integration saved our team from manually importing customer information.",
    channel: "App store review",
    customerLabel: "Customer 068",
    sentiment: "POS",
    sentimentScore: 0.80,
    theme: "Integrations",
  },
  {
    content: "I would like to see more third-party integrations added in the future.",
    channel: "Community post",
    customerLabel: "Customer 069",
    sentiment: "NEU",
    sentimentScore: 0.23,
    theme: "Integrations",
  },
  {
    content: "API authentication was straightforward and our developer had it running quickly.",
    channel: "Sales call note",
    customerLabel: "Customer 070",
    sentiment: "POS",
    sentimentScore: 0.78,
    theme: "Integrations",
  },
  {
    content: "The integration occasionally duplicates records when synchronization runs twice.",
    channel: "Support ticket",
    customerLabel: "Customer 071",
    sentiment: "NEG",
    sentimentScore: -0.77,
    theme: "Integrations",
  },
  {
    content: "The integration status page makes it easy to see which connections are currently active.",
    channel: "NPS survey",
    customerLabel: "Customer 072",
    sentiment: "POS",
    sentimentScore: 0.71,
    theme: "Integrations",
  },
  {
    content: "We are evaluating the available integrations before deciding which plan to purchase.",
    channel: "Sales call note",
    customerLabel: "Customer 073",
    sentiment: "NEU",
    sentimentScore: 0.09,
    theme: "Integrations",
  },
  {
    content: "The CRM connection disconnected unexpectedly and required manual reauthorization.",
    channel: "Support ticket",
    customerLabel: "Customer 074",
    sentiment: "NEG",
    sentimentScore: -0.64,
    theme: "Integrations",
  },
  {
    content: "Having multiple integration options makes the platform much more useful for our workflow.",
    channel: "App store review",
    customerLabel: "Customer 075",
    sentiment: "POS",
    sentimentScore: 0.83,
    theme: "Integrations",
  },

  // =========================
  // NOTIFICATIONS — 15
  // =========================

  {
    content: "The notification settings give me enough control over which updates I receive.",
    channel: "NPS survey",
    customerLabel: "Customer 076",
    sentiment: "POS",
    sentimentScore: 0.72,
    theme: "Notifications",
  },
  {
    content: "I receive too many alerts for minor changes that don't require immediate attention.",
    channel: "App store review",
    customerLabel: "Customer 077",
    sentiment: "NEG",
    sentimentScore: -0.58,
    theme: "Notifications",
  },
  {
    content: "Email alerts arrive quickly whenever a new negative review is detected.",
    channel: "Support ticket",
    customerLabel: "Customer 078",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Notifications",
  },
  {
    content: "It would be useful to schedule notification quiet hours.",
    channel: "Community post",
    customerLabel: "Customer 079",
    sentiment: "NEU",
    sentimentScore: 0.14,
    theme: "Notifications",
  },
  {
    content: "Our managers rely on the daily summary notification to stay updated.",
    channel: "Sales call note",
    customerLabel: "Customer 080",
    sentiment: "POS",
    sentimentScore: 0.75,
    theme: "Notifications",
  },
  {
    content: "Some notifications arrive several hours after the event that triggered them.",
    channel: "Support ticket",
    customerLabel: "Customer 081",
    sentiment: "NEG",
    sentimentScore: -0.69,
    theme: "Notifications",
  },
  {
    content: "I like receiving a weekly summary instead of individual messages for every feedback item.",
    channel: "NPS survey",
    customerLabel: "Customer 082",
    sentiment: "POS",
    sentimentScore: 0.68,
    theme: "Notifications",
  },
  {
    content: "The alert preferences are spread across several settings pages.",
    channel: "Community post",
    customerLabel: "Customer 083",
    sentiment: "NEG",
    sentimentScore: -0.49,
    theme: "Notifications",
  },
  {
    content: "Notifications helped us identify a sudden increase in negative comments.",
    channel: "Sales call note",
    customerLabel: "Customer 084",
    sentiment: "POS",
    sentimentScore: 0.87,
    theme: "Notifications",
  },
  {
    content: "I am not always sure which notifications are generated by the system and which come from integrations.",
    channel: "App store review",
    customerLabel: "Customer 085",
    sentiment: "NEU",
    sentimentScore: -0.03,
    theme: "Notifications",
  },
  {
    content: "The notification badge sometimes remains visible even after I have read everything.",
    channel: "Support ticket",
    customerLabel: "Customer 086",
    sentiment: "NEG",
    sentimentScore: -0.54,
    theme: "Notifications",
  },
  {
    content: "The daily digest is concise and gives me exactly the information I need.",
    channel: "NPS survey",
    customerLabel: "Customer 087",
    sentiment: "POS",
    sentimentScore: 0.80,
    theme: "Notifications",
  },
  {
    content: "We would like separate notification rules for administrators and analysts.",
    channel: "Sales call note",
    customerLabel: "Customer 088",
    sentiment: "NEU",
    sentimentScore: 0.11,
    theme: "Notifications",
  },
  {
    content: "Critical alerts are sometimes buried underneath less important notifications.",
    channel: "Community post",
    customerLabel: "Customer 089",
    sentiment: "NEG",
    sentimentScore: -0.62,
    theme: "Notifications",
  },
  {
    content: "The notification system gives our support team faster visibility into urgent feedback.",
    channel: "App store review",
    customerLabel: "Customer 090",
    sentiment: "POS",
    sentimentScore: 0.77,
    theme: "Notifications",
  },

  // =========================
  // DASHBOARD — 15
  // =========================

  {
    content: "The dashboard gives me a useful overview of customer sentiment at a glance.",
    channel: "NPS survey",
    customerLabel: "Customer 091",
    sentiment: "POS",
    sentimentScore: 0.84,
    theme: "Dashboard",
  },
  {
    content: "There are too many cards on the dashboard and I have trouble finding the metrics I care about.",
    channel: "Community post",
    customerLabel: "Customer 092",
    sentiment: "NEG",
    sentimentScore: -0.61,
    theme: "Dashboard",
  },
  {
    content: "The sentiment breakdown is one of the most useful sections for our weekly meetings.",
    channel: "Sales call note",
    customerLabel: "Customer 093",
    sentiment: "POS",
    sentimentScore: 0.80,
    theme: "Dashboard",
  },
  {
    content: "I would like to customize which metrics appear on the main dashboard.",
    channel: "Support ticket",
    customerLabel: "Customer 094",
    sentiment: "NEU",
    sentimentScore: 0.16,
    theme: "Dashboard",
  },
  {
    content: "The trend cards make it easy to spot changes in customer feedback.",
    channel: "App store review",
    customerLabel: "Customer 095",
    sentiment: "POS",
    sentimentScore: 0.78,
    theme: "Dashboard",
  },
  {
    content: "The dashboard numbers sometimes don't match the totals shown in exported reports.",
    channel: "Support ticket",
    customerLabel: "Customer 096",
    sentiment: "NEG",
    sentimentScore: -0.79,
    theme: "Dashboard",
  },
  {
    content: "I like that the dashboard highlights the themes receiving the most feedback.",
    channel: "NPS survey",
    customerLabel: "Customer 097",
    sentiment: "POS",
    sentimentScore: 0.73,
    theme: "Dashboard",
  },
  {
    content: "The graphs are visually clear but I would like more filtering options.",
    channel: "Community post",
    customerLabel: "Customer 098",
    sentiment: "NEU",
    sentimentScore: 0.18,
    theme: "Dashboard",
  },
  {
    content: "The executive summary is helpful when presenting customer insights to leadership.",
    channel: "Sales call note",
    customerLabel: "Customer 099",
    sentiment: "POS",
    sentimentScore: 0.86,
    theme: "Dashboard",
  },
  {
    content: "It takes several clicks to move from a dashboard metric to the actual feedback behind it.",
    channel: "App store review",
    customerLabel: "Customer 100",
    sentiment: "NEG",
    sentimentScore: -0.53,
    theme: "Dashboard",
  },
  {
    content: "The dashboard loads with the key numbers immediately visible.",
    channel: "NPS survey",
    customerLabel: "Customer 101",
    sentiment: "POS",
    sentimentScore: 0.75,
    theme: "Dashboard",
  },
  {
    content: "I wasn't sure whether the dashboard was showing today's data or the entire workspace history.",
    channel: "Support ticket",
    customerLabel: "Customer 102",
    sentiment: "NEU",
    sentimentScore: -0.12,
    theme: "Dashboard",
  },
  {
    content: "Being able to see positive and negative feedback side by side makes reviews much easier.",
    channel: "App store review",
    customerLabel: "Customer 103",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Dashboard",
  },
  {
    content: "Some dashboard charts become difficult to interpret when there are many categories.",
    channel: "Community post",
    customerLabel: "Customer 104",
    sentiment: "NEG",
    sentimentScore: -0.47,
    theme: "Dashboard",
  },
  {
    content: "The dashboard is a good starting point before diving into individual customer comments.",
    channel: "Sales call note",
    customerLabel: "Customer 105",
    sentiment: "POS",
    sentimentScore: 0.70,
    theme: "Dashboard",
  },

  // =========================
  // SEARCH — 15
  // =========================

  {
    content: "Search makes it easy to find specific customer complaints from previous months.",
    channel: "NPS survey",
    customerLabel: "Customer 106",
    sentiment: "POS",
    sentimentScore: 0.79,
    theme: "Search",
  },
  {
    content: "Search results sometimes include unrelated feedback when I use broad keywords.",
    channel: "Support ticket",
    customerLabel: "Customer 107",
    sentiment: "NEG",
    sentimentScore: -0.55,
    theme: "Search",
  },
  {
    content: "The filters make it much easier to narrow results by channel and sentiment.",
    channel: "App store review",
    customerLabel: "Customer 108",
    sentiment: "POS",
    sentimentScore: 0.83,
    theme: "Search",
  },
  {
    content: "I would like search to understand similar phrases instead of only exact words.",
    channel: "Community post",
    customerLabel: "Customer 109",
    sentiment: "NEU",
    sentimentScore: 0.13,
    theme: "Search",
  },
  {
    content: "Finding all feedback related to billing took only a few seconds.",
    channel: "Sales call note",
    customerLabel: "Customer 110",
    sentiment: "POS",
    sentimentScore: 0.76,
    theme: "Search",
  },
  {
    content: "The search box clears my query whenever I change a filter.",
    channel: "Support ticket",
    customerLabel: "Customer 111",
    sentiment: "NEG",
    sentimentScore: -0.63,
    theme: "Search",
  },
  {
    content: "Searching by customer label is particularly useful for our support team.",
    channel: "NPS survey",
    customerLabel: "Customer 112",
    sentiment: "POS",
    sentimentScore: 0.72,
    theme: "Search",
  },
  {
    content: "I sometimes get too many results and need additional filters to find the exact issue.",
    channel: "Community post",
    customerLabel: "Customer 113",
    sentiment: "NEU",
    sentimentScore: -0.08,
    theme: "Search",
  },
  {
    content: "Search is fast even when our workspace contains a large number of feedback records.",
    channel: "App store review",
    customerLabel: "Customer 114",
    sentiment: "POS",
    sentimentScore: 0.85,
    theme: "Search",
  },
  {
    content: "Searching for a phrase with punctuation sometimes returns no results even when the phrase exists.",
    channel: "Support ticket",
    customerLabel: "Customer 115",
    sentiment: "NEG",
    sentimentScore: -0.59,
    theme: "Search",
  },
  {
    content: "The date filter is helpful when investigating feedback from a specific campaign.",
    channel: "Sales call note",
    customerLabel: "Customer 116",
    sentiment: "POS",
    sentimentScore: 0.69,
    theme: "Search",
  },
  {
    content: "I would appreciate autocomplete suggestions while entering search terms.",
    channel: "NPS survey",
    customerLabel: "Customer 117",
    sentiment: "NEU",
    sentimentScore: 0.20,
    theme: "Search",
  },
  {
    content: "The search results are not always sorted in the order I expect.",
    channel: "Community post",
    customerLabel: "Customer 118",
    sentiment: "NEG",
    sentimentScore: -0.46,
    theme: "Search",
  },
  {
    content: "Combining sentiment and theme filters helps us investigate specific customer problems.",
    channel: "App store review",
    customerLabel: "Customer 119",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Search",
  },
  {
    content: "Search works well for basic queries, although more advanced operators would be useful.",
    channel: "Sales call note",
    customerLabel: "Customer 120",
    sentiment: "NEU",
    sentimentScore: 0.09,
    theme: "Search",
  },

  // =========================
  // REPORTING — 15
  // =========================

  {
    content: "The weekly report gives our leadership team a clear summary of customer sentiment.",
    channel: "NPS survey",
    customerLabel: "Customer 121",
    sentiment: "POS",
    sentimentScore: 0.86,
    theme: "Reporting",
  },
  {
    content: "The report export failed twice before finally downloading successfully.",
    channel: "Support ticket",
    customerLabel: "Customer 122",
    sentiment: "NEG",
    sentimentScore: -0.70,
    theme: "Reporting",
  },
  {
    content: "I like that reports include both overall sentiment and the individual themes behind it.",
    channel: "Sales call note",
    customerLabel: "Customer 123",
    sentiment: "POS",
    sentimentScore: 0.82,
    theme: "Reporting",
  },
  {
    content: "The PDF report has more pages than necessary and could be more concise.",
    channel: "Community post",
    customerLabel: "Customer 124",
    sentiment: "NEU",
    sentimentScore: -0.07,
    theme: "Reporting",
  },
  {
    content: "Being able to export insights directly saves our analysts a lot of manual work.",
    channel: "App store review",
    customerLabel: "Customer 125",
    sentiment: "POS",
    sentimentScore: 0.80,
    theme: "Reporting",
  },
  {
    content: "The generated report sometimes takes too long when the selected date range is large.",
    channel: "Support ticket",
    customerLabel: "Customer 126",
    sentiment: "NEG",
    sentimentScore: -0.64,
    theme: "Reporting",
  },
  {
    content: "The report comparison between two time periods is useful for tracking improvements.",
    channel: "NPS survey",
    customerLabel: "Customer 127",
    sentiment: "POS",
    sentimentScore: 0.77,
    theme: "Reporting",
  },
  {
    content: "I would like reports to support our company logo and custom branding.",
    channel: "Sales call note",
    customerLabel: "Customer 128",
    sentiment: "NEU",
    sentimentScore: 0.18,
    theme: "Reporting",
  },
  {
    content: "Some report charts lose their labels when exported to PDF.",
    channel: "Support ticket",
    customerLabel: "Customer 129",
    sentiment: "NEG",
    sentimentScore: -0.67,
    theme: "Reporting",
  },
  {
    content: "The executive report is polished enough to share directly with senior management.",
    channel: "App store review",
    customerLabel: "Customer 130",
    sentiment: "POS",
    sentimentScore: 0.84,
    theme: "Reporting",
  },
  {
    content: "The reporting section covers the metrics we currently need.",
    channel: "NPS survey",
    customerLabel: "Customer 131",
    sentiment: "POS",
    sentimentScore: 0.65,
    theme: "Reporting",
  },
  {
    content: "I couldn't figure out how to schedule a report to be sent automatically.",
    channel: "Community post",
    customerLabel: "Customer 132",
    sentiment: "NEG",
    sentimentScore: -0.52,
    theme: "Reporting",
  },
  {
    content: "The report narrative makes the raw statistics easier for non-technical stakeholders to understand.",
    channel: "Sales call note",
    customerLabel: "Customer 133",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Reporting",
  },
  {
    content: "It would be helpful to choose which themes are included before generating a report.",
    channel: "NPS survey",
    customerLabel: "Customer 134",
    sentiment: "NEU",
    sentimentScore: 0.10,
    theme: "Reporting",
  },
  {
    content: "Our analysts spend less time preparing presentations because the reports contain ready-to-use insights.",
    channel: "App store review",
    customerLabel: "Customer 135",
    sentiment: "POS",
    sentimentScore: 0.88,
    theme: "Reporting",
  },

  // =========================
  // AUTHENTICATION — 15
  // =========================

  {
    content: "Logging in with my company account works reliably every morning.",
    channel: "NPS survey",
    customerLabel: "Customer 136",
    sentiment: "POS",
    sentimentScore: 0.78,
    theme: "Authentication",
  },
  {
    content: "I was locked out after entering the correct password several times.",
    channel: "Support ticket",
    customerLabel: "Customer 137",
    sentiment: "NEG",
    sentimentScore: -0.76,
    theme: "Authentication",
  },
  {
    content: "The password reset email arrived immediately and the reset process was simple.",
    channel: "App store review",
    customerLabel: "Customer 138",
    sentiment: "POS",
    sentimentScore: 0.83,
    theme: "Authentication",
  },
  {
    content: "We need single sign-on support before rolling this platform out company-wide.",
    channel: "Sales call note",
    customerLabel: "Customer 139",
    sentiment: "NEU",
    sentimentScore: 0.04,
    theme: "Authentication",
  },
  {
    content: "The session expired while I was reviewing a long report and I lost my place.",
    channel: "Community post",
    customerLabel: "Customer 140",
    sentiment: "NEG",
    sentimentScore: -0.62,
    theme: "Authentication",
  },
  {
    content: "Two-factor authentication gives our administrators more confidence in account security.",
    channel: "NPS survey",
    customerLabel: "Customer 141",
    sentiment: "POS",
    sentimentScore: 0.87,
    theme: "Authentication",
  },
  {
    content: "I wasn't sure why the system asked me to verify my email again.",
    channel: "Support ticket",
    customerLabel: "Customer 142",
    sentiment: "NEU",
    sentimentScore: -0.11,
    theme: "Authentication",
  },
  {
    content: "The login page remembers my email address which saves a little time.",
    channel: "App store review",
    customerLabel: "Customer 143",
    sentiment: "POS",
    sentimentScore: 0.66,
    theme: "Authentication",
  },
  {
    content: "Our invitation links occasionally expire before new employees have a chance to use them.",
    channel: "Support ticket",
    customerLabel: "Customer 144",
    sentiment: "NEG",
    sentimentScore: -0.60,
    theme: "Authentication",
  },
  {
    content: "The team invitation process is straightforward and new users can create accounts quickly.",
    channel: "Sales call note",
    customerLabel: "Customer 145",
    sentiment: "POS",
    sentimentScore: 0.74,
    theme: "Authentication",
  },
  {
    content: "I would like an option to sign in with our existing identity provider.",
    channel: "Community post",
    customerLabel: "Customer 146",
    sentiment: "NEU",
    sentimentScore: 0.08,
    theme: "Authentication",
  },
  {
    content: "The verification code sometimes arrives after it has already expired.",
    channel: "Support ticket",
    customerLabel: "Customer 147",
    sentiment: "NEG",
    sentimentScore: -0.73,
    theme: "Authentication",
  },
  {
    content: "Account recovery was much easier than I expected after losing access to my password.",
    channel: "NPS survey",
    customerLabel: "Customer 148",
    sentiment: "POS",
    sentimentScore: 0.81,
    theme: "Authentication",
  },
  {
    content: "The login experience is standard and I haven't encountered any major issues.",
    channel: "App store review",
    customerLabel: "Customer 149",
    sentiment: "NEU",
    sentimentScore: 0.25,
    theme: "Authentication",
  },
  {
    content: "Our security team appreciates the available authentication controls for administrators.",
    channel: "Sales call note",
    customerLabel: "Customer 150",
    sentiment: "POS",
    sentimentScore: 0.85,
    theme: "Authentication",
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data so every seed starts from a predictable state.
  await db.feedbackTheme.deleteMany()
  await db.embedding.deleteMany()
  await db.report.deleteMany()
  await db.feedback.deleteMany()
  await db.theme.deleteMany()
  await db.user.deleteMany()
  await db.workspace.deleteMany()

  // Create demo workspace.
  const workspace = await db.workspace.create({
    data: {
      name: 'Acme Demo Co',
    },
  })

  // Create demo users.
  const passwordHash = await bcrypt.hash('password123', 12)

  await db.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@loop.com',
      passwordHash,
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  })

  await db.user.create({
    data: {
      name: 'Ana Analyst',
      email: 'analyst@loop.com',
      passwordHash,
      role: 'ANALYST',
      workspaceId: workspace.id,
    },
  })

  await db.user.create({
    data: {
      name: 'Vic Viewer',
      email: 'viewer@loop.com',
      passwordHash,
      role: 'VIEWER',
      workspaceId: workspace.id,
    },
  })

  // Create all themes used by the 150 feedback records.
  const themeNames = [
    'Onboarding',
    'Billing',
    'Performance',
    'Mobile experience',
    'Integrations',
    'Notifications',
    'Dashboard',
    'Search',
    'Reporting',
    'Authentication',
  ]

  const themes = await Promise.all(
    themeNames.map((name) =>
      db.theme.create({
        data: {
          name,
          workspaceId: workspace.id,
        },
      }),
    ),
  )

  // Fast lookup: theme name -> database theme.
  const themeMap = new Map(
    themes.map((theme) => [theme.name, theme]),
  )

  // Create exactly 150 feedback records.
  for (let i = 0; i < FEEDBACK_DATA.length; i++) {
    const item = FEEDBACK_DATA[i]

    // Spread records over the previous 60 days.
    const daysAgo = Math.floor((i / FEEDBACK_DATA.length) * 60)
    const createdAt = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000,
    )

    const feedback = await db.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        customerLabel: item.customerLabel,
        sentiment: item.sentiment,
        sentimentScore: item.sentimentScore,
        status: 'NEW',
        workspaceId: workspace.id,
        createdAt,
      },
    })

    const theme = themeMap.get(item.theme)

    if (!theme) {
      throw new Error(`Theme not found: ${item.theme}`)
    }

    await db.feedbackTheme.create({
      data: {
        feedbackId: feedback.id,
        themeId: theme.id,
        confidence: 0.9,
      },
    })
  }

  console.log('')
  console.log('✅ Seed complete!')
  console.log(`✅ Created ${FEEDBACK_DATA.length} feedback records`)
  console.log(`✅ Created ${themeNames.length} themes`)
  console.log('')

  console.log('Demo accounts:')
  console.log('  Admin:   admin@loop.com   / password123')
  console.log('  Analyst: analyst@loop.com / password123')
  console.log('  Viewer:  viewer@loop.com  / password123')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })