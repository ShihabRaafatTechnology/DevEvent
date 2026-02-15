# PostHog post-wizard report

The wizard has completed a deep integration of your DevEvent project with PostHog analytics. The integration includes client-side event tracking using the `instrumentation-client.ts` approach (recommended for Next.js 15.3+), a reverse proxy configuration for reliable event capture, and automatic exception tracking.

## Integration Summary

- **PostHog SDK**: `posthog-js` installed and initialized via `instrumentation-client.ts`
- **Reverse Proxy**: Configured in `next.config.ts` to route PostHog requests through `/ingest` to avoid ad blockers
- **Environment Variables**: Configured in `.env.local` with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- **Exception Tracking**: Enabled via `capture_exceptions: true`

## Events Instrumented

| Event Name | Description | File |
|------------|-------------|------|
| `explore_events_clicked` | User clicked the Explore Events button on the homepage - top of funnel conversion event | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicked on an event card to view details - key engagement event with event title, slug, location, and date properties | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicked a navigation link in the navbar with link name property | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/314534/dashboard/1280975) - Core analytics dashboard for DevEvent

### Insights
- [Explore Events Clicked Over Time](https://us.posthog.com/project/314534/insights/LEHDNMoJ) - Tracks when users click the Explore Events button
- [Event Card Clicks Over Time](https://us.posthog.com/project/314534/insights/MlHJa9Ip) - Tracks when users click on event cards
- [Most Popular Events by Clicks](https://us.posthog.com/project/314534/insights/3PRu7qgY) - Shows which events are most clicked, broken down by event title
- [Event Discovery Funnel](https://us.posthog.com/project/314534/insights/25gbew2T) - Conversion funnel from exploring events to clicking on a specific event
- [Navigation Link Distribution](https://us.posthog.com/project/314534/insights/XoOiY8oy) - Shows distribution of navigation link clicks by link name

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
