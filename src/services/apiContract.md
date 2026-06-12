# Future API Contract Draft

The frontend currently uses mock repositories. Future backend APIs should preserve these resource shapes.

- GET /api/classes?teacherId=:id
- GET /api/classes/:classId/students
- POST /api/sessions/start
- POST /api/sessions/:sessionId/end
- GET /api/sessions/:sessionId
- GET /api/students/:studentId
- GET /api/students/:studentId/metrics
- GET /api/students/:studentId/reports
- POST /api/notes
- GET /api/therapy-plans/:studentId
- PUT /api/therapy-plans/:studentId
- GET /api/recommendations?studentId=:id&audience=:role

Future live source:
- WebSocket /ws/sessions/:sessionId
- event types: metric_update, alert_created, robot_action, note_added, session_ended
