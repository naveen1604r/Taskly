import http from 'http';
import app from '../app.js';

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n====================================================`);
  console.log(`      TASKLY STEP 29 INTEGRATION TEST SUITE        `);
  console.log(`====================================================`);
  console.log(`Server listening on ephemeral port: ${port}\n`);

  let failedTests = 0;
  let passedTests = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✖ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failedTests++;
    }
  };

  try {
    // ----------------------------------------------------
    // 1. Auth Enforcement (401 without token)
    // ----------------------------------------------------
    const unauthFocus = await fetch(`${baseUrl}/focus/sessions`);
    assert(unauthFocus.status === 401, 'GET /api/focus/sessions without token returns 401');

    const unauthHabits = await fetch(`${baseUrl}/habits`);
    assert(unauthHabits.status === 401, 'GET /api/habits without token returns 401');

    const unauthRecurring = await fetch(`${baseUrl}/recurring-tasks`);
    assert(unauthRecurring.status === 401, 'GET /api/recurring-tasks without token returns 401');

    const unauthReminders = await fetch(`${baseUrl}/reminders`);
    assert(unauthReminders.status === 401, 'GET /api/reminders without token returns 401');

    const unauthNotifications = await fetch(`${baseUrl}/notifications`);
    assert(unauthNotifications.status === 401, 'GET /api/notifications without token returns 401');

    const unauthActivity = await fetch(`${baseUrl}/activity`);
    assert(unauthActivity.status === 401, 'GET /api/activity without token returns 401');

    const unauthInbox = await fetch(`${baseUrl}/inbox`);
    assert(unauthInbox.status === 401, 'GET /api/inbox without token returns 401');

    // ----------------------------------------------------
    // 2. Register User A and User B
    // ----------------------------------------------------
    const userAEmail = `step29_userA_${Date.now()}@example.com`;
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password: 'Password123!' }),
    }).then((r) => r.json());
    assert(regResA.success === true && regResA.data.token, 'Register User A succeeds with JWT');
    const tokenA = regResA.data?.token;

    const userBEmail = `step29_userB_${Date.now()}@example.com`;
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'Password123!' }),
    }).then((r) => r.json());
    assert(regResB.success === true && regResB.data.token, 'Register User B succeeds with JWT');
    const tokenB = regResB.data?.token;

    const authHeadersA = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    };
    const authHeadersB = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    };

    // ----------------------------------------------------
    // 3. Focus Sessions & Settings
    // ----------------------------------------------------
    console.log('\n--- Testing Focus Sessions & Settings ---');
    const settingsGet = await fetch(`${baseUrl}/focus/settings`, { headers: authHeadersA }).then((r) => r.json());
    assert(settingsGet.success === true && settingsGet.data.settings.pomodoroDuration === 25, 'GET /focus/settings returns defaults');

    const settingsUpdate = await fetch(`${baseUrl}/focus/settings`, {
      method: 'PUT',
      headers: authHeadersA,
      body: JSON.stringify({ pomodoroDuration: 30, shortBreakDuration: 6 }),
    }).then((r) => r.json());
    assert(settingsUpdate.success === true && settingsUpdate.data.settings.pomodoroDuration === 30, 'PUT /focus/settings updates settings');

    const createSessionRes = await fetch(`${baseUrl}/focus/sessions`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ durationMinutes: 30, completed: true, rating: 5, notes: 'Deep focus on Step 29' }),
    }).then((r) => r.json());
    assert(createSessionRes.success === true && createSessionRes.data.session.durationMinutes === 30, 'POST /focus/sessions creates session');

    const getStatsRes = await fetch(`${baseUrl}/focus/stats`, { headers: authHeadersA }).then((r) => r.json());
    assert(getStatsRes.data.stats.totalSessions === 1 && getStatsRes.data.stats.totalMinutes === 30, 'GET /focus/stats returns accurate statistics');

    // ----------------------------------------------------
    // 4. Habits & Habit Logs
    // ----------------------------------------------------
    console.log('\n--- Testing Habits & Habit Logs ---');
    const createHabitRes = await fetch(`${baseUrl}/habits`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ name: 'Morning Meditation', frequency: 'daily', targetPerDay: 1, streakGoal: 14 }),
    }).then((r) => r.json());
    assert(createHabitRes.success === true && createHabitRes.data.habit.name === 'Morning Meditation', 'POST /habits creates habit');
    const habitId = createHabitRes.data.habit.id;

    const todayStr = new Date().toISOString().slice(0, 10);
    const logHabitRes = await fetch(`${baseUrl}/habits/${habitId}/log`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ logDate: todayStr, completed: true, progressCount: 1 }),
    }).then((r) => r.json());
    assert(logHabitRes.success === true && logHabitRes.data.habit.currentStreak === 1, 'POST /habits/:id/log logs progress and computes streak');

    const getHabitLogsRes = await fetch(`${baseUrl}/habits/${habitId}/logs`, { headers: authHeadersA }).then((r) => r.json());
    assert(getHabitLogsRes.data.logs.length === 1, 'GET /habits/:id/logs returns logged entry');

    // ----------------------------------------------------
    // 5. Recurring Tasks & Idempotent Generation
    // ----------------------------------------------------
    console.log('\n--- Testing Recurring Tasks & Generation ---');
    const createRecRes = await fetch(`${baseUrl}/recurring-tasks`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        title: 'Review System Metrics',
        frequency: 'daily',
        priority: 'high',
        category: 'Engineering',
        startDate: todayStr,
      }),
    }).then((r) => r.json());
    assert(createRecRes.success === true && createRecRes.data.recurringTask.title === 'Review System Metrics', 'POST /recurring-tasks creates recurring task');
    const recId = createRecRes.data.recurringTask.id;

    // Generate occurrences
    const genRes1 = await fetch(`${baseUrl}/recurring-tasks/generate`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ targetDate: todayStr }),
    }).then((r) => r.json());
    assert(genRes1.success === true && genRes1.data.tasks.length === 1, 'POST /recurring-tasks/generate generates 1 task occurrence');

    // Generate again for the same date -> MUST NOT DUPLICATE
    const genRes2 = await fetch(`${baseUrl}/recurring-tasks/generate`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ targetDate: todayStr }),
    }).then((r) => r.json());
    assert(genRes2.success === true && genRes2.data.tasks.length === 0, 'POST /recurring-tasks/generate idempotently prevents duplicate task occurrences');

    // ----------------------------------------------------
    // 6. Reminders
    // ----------------------------------------------------
    console.log('\n--- Testing Reminders ---');
    const createRemRes = await fetch(`${baseUrl}/reminders`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ title: 'Drink Water', time: '14:00', date: todayStr }),
    }).then((r) => r.json());
    assert(createRemRes.success === true && createRemRes.data.reminder.title === 'Drink Water', 'POST /reminders creates reminder');
    const reminderId = createRemRes.data.reminder.id;

    const toggleRemRes = await fetch(`${baseUrl}/reminders/${reminderId}/toggle`, {
      method: 'PATCH',
      headers: authHeadersA,
    }).then((r) => r.json());
    assert(toggleRemRes.success === true && toggleRemRes.data.reminder.enabled === false, 'PATCH /reminders/:id/toggle toggles enabled state');

    const snoozeRemRes = await fetch(`${baseUrl}/reminders/${reminderId}/snooze`, {
      method: 'PATCH',
      headers: authHeadersA,
      body: JSON.stringify({ minutes: 15 }),
    }).then((r) => r.json());
    assert(snoozeRemRes.success === true && snoozeRemRes.data.reminder.snoozeUntil, 'PATCH /reminders/:id/snooze snoozes reminder');

    // ----------------------------------------------------
    // 7. Notifications & Deduplication
    // ----------------------------------------------------
    console.log('\n--- Testing Notifications & Deduplication ---');
    const notifEventKey = `habit_completed_${habitId}_${todayStr}`;
    const createNotif1 = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        title: 'Habit Completed',
        message: 'You completed Morning Meditation!',
        eventKey: notifEventKey,
      }),
    }).then((r) => r.json());
    assert(createNotif1.success === true && createNotif1.data.notification.id, 'POST /notifications creates notification');

    // Send again with same eventKey -> should return existing without duplicating
    const createNotif2 = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        title: 'Habit Completed Duplicate Attempt',
        message: 'Duplicate event should be ignored',
        eventKey: notifEventKey,
      }),
    }).then((r) => r.json());
    assert(createNotif2.data.notification.id === createNotif1.data.notification.id, 'POST /notifications deduplicates by eventKey');

    const getNotifsRes = await fetch(`${baseUrl}/notifications`, { headers: authHeadersA }).then((r) => r.json());
    assert(getNotifsRes.data.notifications.length === 1 && getNotifsRes.data.unreadCount === 1, 'GET /notifications returns list with unreadCount');

    const markReadRes = await fetch(`${baseUrl}/notifications/${createNotif1.data.notification.id}/read`, {
      method: 'PATCH',
      headers: authHeadersA,
    }).then((r) => r.json());
    assert(markReadRes.success === true && markReadRes.data.notification.isRead === true, 'PATCH /notifications/:id/read marks notification as read');

    // ----------------------------------------------------
    // 8. Activity
    // ----------------------------------------------------
    console.log('\n--- Testing Activities ---');
    const createActRes = await fetch(`${baseUrl}/activity`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        type: 'task_completed',
        description: 'Completed Step 29 backend tests',
        entityType: 'task',
      }),
    }).then((r) => r.json());
    assert(createActRes.success === true && createActRes.data.activity.description === 'Completed Step 29 backend tests', 'POST /activity logs activity');

    const getActRes = await fetch(`${baseUrl}/activity`, { headers: authHeadersA }).then((r) => r.json());
    assert(getActRes.data.activities.length === 1, 'GET /activity retrieves user activities');

    // ----------------------------------------------------
    // 9. Inbox Quick Capture & Conversion
    // ----------------------------------------------------
    console.log('\n--- Testing Inbox Quick Capture & Conversion ---');
    const createInboxRes = await fetch(`${baseUrl}/inbox`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        title: 'Call Accountant on Friday',
        notes: 'Review Q3 financial report',
      }),
    }).then((r) => r.json());
    assert(createInboxRes.success === true && createInboxRes.data.inboxItem.title === 'Call Accountant on Friday', 'POST /inbox creates inbox item');
    const inboxItemId = createInboxRes.data.inboxItem.id;

    // Convert to Task
    const convertRes = await fetch(`${baseUrl}/inbox/${inboxItemId}/process`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        type: 'task',
        taskDetails: { priority: 'high', category: 'Finance' },
      }),
    }).then((r) => r.json());
    assert(convertRes.success === true && convertRes.data.item.processed === true && convertRes.data.task.title === 'Call Accountant on Friday', 'POST /inbox/:id/process converts inbox item into Task');

    // ----------------------------------------------------
    // 10. User Isolation (User B cannot access User A's data)
    // ----------------------------------------------------
    console.log('\n--- Testing User Data Isolation ---');
    const getHabitB = await fetch(`${baseUrl}/habits/${habitId}`, { headers: authHeadersB });
    assert(getHabitB.status === 404, 'User B cannot access User A habit (returns 404)');

    const getRecB = await fetch(`${baseUrl}/recurring-tasks/${recId}`, { headers: authHeadersB });
    assert(getRecB.status === 404, 'User B cannot access User A recurring task (returns 404)');

    const getRemB = await fetch(`${baseUrl}/reminders/${reminderId}`, { headers: authHeadersB });
    assert(getRemB.status === 404, 'User B cannot access User A reminder (returns 404)');

    const getInboxB = await fetch(`${baseUrl}/inbox/${inboxItemId}`, { headers: authHeadersB });
    assert(getInboxB.status === 404, 'User B cannot access User A inbox item (returns 404)');

    const getNotifsB = await fetch(`${baseUrl}/notifications`, { headers: authHeadersB }).then((r) => r.json());
    assert(getNotifsB.data.notifications.length === 0, 'User B notifications list is empty');

    const getActB = await fetch(`${baseUrl}/activity`, { headers: authHeadersB }).then((r) => r.json());
    assert(getActB.data.activities.length === 0, 'User B activities list is empty');

  } catch (err) {
    console.error('Test execution error:', err);
    failedTests++;
  } finally {
    server.close();
    console.log(`\n====================================================`);
    console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed`);
    console.log(`====================================================\n`);
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests();
