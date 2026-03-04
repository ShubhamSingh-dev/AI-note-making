What You Can Add
Here's a prioritized list from most impactful to nice-to-have:
🔴 High Priority (Core gaps)
1.✅ Refresh Token endpoint
You generate refresh tokens but never use them. Add POST /users/refresh-token to issue new access tokens without re-login.
2. Note tagging / categorization
Add a Tag model and many-to-many relation with Note. Filter notes by tag. The AI agent can also tag notes automatically.
3.✅ Pagination on getUserNotes
Right now it fetches all notes at once — this will break at scale. Add ?page= and ?limit= query params.
4.✅ Rate limiting
No rate limiting on chat or auth endpoints. Add express-rate-limit — especially important for the AI endpoint since Groq calls are expensive.
🟡 Medium Priority (Feature expansion)
5. Note sharing / collaboration
Add a SharedNote model so users can share notes with others (read-only or editable).
6. File/image attachments on notes
Integrate with S3 or Cloudinary. Store attachment URLs in a NoteAttachment model.
7. Reminders / due dates
Add dueAt DateTime? to the Note model. Add a background job (e.g. with node-cron) to send email reminders — pair with Nodemailer or Resend.
8.✅ AI-powered note summarization tool
Add a summarize_note tool to ai.tools.ts — the agent can condense long notes on request. Very easy to add given your existing architecture.
9.✅ Conversation management endpoints
Users can't currently list, switch, or delete conversations. Add GET /ai/conversations, DELETE /ai/conversations/:id, and let the chat endpoint accept an optional conversationId.
10. Note versioning / history
Add a NoteHistory model that snapshots content on every update — lets users roll back changes.
🟢 Nice to Have (Polish)
11. Search improvements
Current search uses SQL LIKE. Switch to PostgreSQL full-text search (tsvector) or add a tool like Meilisearch for much better results.
12. WebSocket / streaming AI responses
Right now the AI response is one big HTTP response. Stream it with SSE (text/event-stream) so the frontend feels faster.
13. Audit logging
Track who did what and when — useful if you add sharing/multi-user features.
14. Soft deletes
Add deletedAt DateTime? to Note instead of hard-deleting, so users can recover accidentally deleted notes.