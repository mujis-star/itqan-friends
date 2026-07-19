# ITQAN Friends - Content Update Guide

Welcome to the ITQAN Friends website content management guide! 
This website is built with a scalable, data-driven architecture. You do **not** need to edit any HTML files to update events, news, or committee members.

## Where is the Content?
All of the website's dynamic content lives inside the `/data` folder in easy-to-read JSON files:
- `data/announcements.json` - Temporary, high-priority notices.
- `data/news.json` - Historical timeline of past activities.
- `data/events.json` - Upcoming events and registration links.
- `data/team.json` - Core committee members and wing leaders.
- `data/publications.json` - Magazines and Annual reports.
- `data/stats.json` - The numbers displayed on the homepage stats bar.

## How to Add a New Event
1. Open `data/events.json`.
2. Copy an existing event block and paste it at the top or bottom of the list.
3. Update the details:
```json
{
    "id": "my-new-event",
    "title": "My New Event Title",
    "date": "20 August 2026",
    "time": "10:00 AM",
    "location": "Main Auditorium",
    "description": "A brief description of what the event is about.",
    "speaker": "John Doe",
    "status": "upcoming",
    "registrationUrl": "https://forms.gle/your-link",
    "imageUrl": "profiles/event-banner.jpg"
}
```
4. Save the file. The homepage and the dynamic `event.html?id=my-new-event` page will instantly update!

## How to Update the Committee
1. Open `data/team.json`.
2. Locate the person you want to update in the `coreMembers` or `wings` arrays.
3. Change their `name`, `role`, or `desc` fields.
4. Save the file.

## Pushing Changes to the Live Site
Once you have saved your JSON files, you need to push them to GitHub so Vercel can deploy them.
Open your terminal in the project folder and run:
```bash
git add data/
git commit -m "Updated website content"
git push
```
Within 1-2 minutes, the live website will be updated automatically!
