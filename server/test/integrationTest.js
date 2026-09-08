import http from 'http';
import app from '../app.js';

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n====================================================`);
  console.log(`      TASKLY STEP 27 INTEGRATION TEST SUITE        `);
  console.log(`====================================================`);
  console.log(`Server listening on ephemeral port: ${port}`);

  let failedTests = 0;
  let passedTests = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✖ [FAIL] ${testName}`);
      failedTests++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert(healthRes.database === 'connected' || healthRes.database === 'disconnected', 'GET /api/health reports system status');

    // 2. Register User A
    const userAEmail = `usera_${Date.now()}@example.com`;
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password: 'Password123!' }),
    }).then((r) => r.json());
    assert(regResA.success === true && regResA.data.token, 'Register User A succeeds with JWT');
    const tokenA = regResA.data?.token;

    // 3. Register User B
    const userBEmail = `userb_${Date.now()}@example.com`;
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'Password123!' }),
    }).then((r) => r.json());
    assert(regResB.success === true && regResB.data.token, 'Register User B succeeds with JWT');
    const tokenB = regResB.data?.token;

    // 4. Fresh accounts start with 0 tasks
    const tasksResA0 = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(tasksResA0.success === true && tasksResA0.data.tasks.length === 0, 'User A fresh account starts with 0 tasks');

    // 5. User A creates Task A
    const taskACreateRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Task A - High Priority Mission',
        description: 'First real task for User A',
        priority: 'high',
        category: 'Work',
        duration: 45,
        dueDate: '2026-09-10',
      }),
    }).then((r) => r.json());
    assert(taskACreateRes.success === true && taskACreateRes.data.task.id, 'User A creates Task A successfully');
    const taskAId = taskACreateRes.data.task.id;

    // 6. User B creates Task B
    const taskBCreateRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        title: 'Task B - Secret user B task',
        description: 'User B confidential task',
        priority: 'low',
        category: 'Personal',
      }),
    }).then((r) => r.json());
    assert(taskBCreateRes.success === true && taskBCreateRes.data.task.id, 'User B creates Task B successfully');
    const taskBId = taskBCreateRes.data.task.id;

    // 7. Data Isolation - User A list contains only Task A
    const listResA = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      listResA.data.tasks.length === 1 && listResA.data.tasks[0].id === taskAId,
      'User A list returns exactly 1 task (Task A)'
    );

    // 8. Data Isolation - User B list contains only Task B
    const listResB = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    }).then((r) => r.json());
    assert(
      listResB.data.tasks.length === 1 && listResB.data.tasks[0].id === taskBId,
      'User B list returns exactly 1 task (Task B)'
    );

    // 9. Security Isolation - User A CANNOT GET Task B (must return 404)
    const unauthorizedGet = await fetch(`${baseUrl}/tasks/${taskBId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(unauthorizedGet.status === 404, 'User A cannot GET Task B (404 Not Found)');

    // 10. Security Isolation - User A CANNOT UPDATE Task B (must return 404)
    const unauthorizedUpdate = await fetch(`${baseUrl}/tasks/${taskBId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ title: 'Hacked title' }),
    });
    assert(unauthorizedUpdate.status === 404, 'User A cannot UPDATE Task B (404 Not Found)');

    // 11. Security Isolation - User A CANNOT DELETE Task B (must return 404)
    const unauthorizedDelete = await fetch(`${baseUrl}/tasks/${taskBId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(unauthorizedDelete.status === 404, 'User A cannot DELETE Task B (404 Not Found)');

    // 12. Subtasks - User A adds subtask to Task A
    const subtaskCreateRes = await fetch(`${baseUrl}/tasks/${taskAId}/subtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Subtask 1 for Task A',
        priority: 'high',
      }),
    }).then((r) => r.json());
    assert(subtaskCreateRes.success === true && subtaskCreateRes.data.subtask.id, 'User A adds subtask to Task A');
    const subtaskId = subtaskCreateRes.data.subtask.id;

    // 13. Subtasks - User A gets subtasks for Task A
    const getSubtasksRes = await fetch(`${baseUrl}/tasks/${taskAId}/subtasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      getSubtasksRes.success === true && getSubtasksRes.data.subtasks.length === 1,
      'User A retrieves subtasks list for Task A'
    );

    // 14. Security Isolation - User B CANNOT access User A subtasks
    const unauthSubtaskGet = await fetch(`${baseUrl}/tasks/${taskAId}/subtasks`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(unauthSubtaskGet.status === 404, 'User B cannot view User A subtasks (404)');

    // 15. Complete task endpoint
    const completeRes = await fetch(`${baseUrl}/tasks/${taskAId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      completeRes.success === true && completeRes.data.task.status === 'completed' && completeRes.data.task.completedAt,
      'PATCH /api/tasks/:id/complete marks status as completed with completedAt'
    );

    // 16. Update status endpoint
    const statusRes = await fetch(`${baseUrl}/tasks/${taskAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ status: 'in_progress' }),
    }).then((r) => r.json());
    assert(
      statusRes.success === true && statusRes.data.task.status === 'in_progress',
      'PATCH /api/tasks/:id/status updates status to in_progress'
    );

    // 17. User A deletes Task A
    const deleteRes = await fetch(`${baseUrl}/tasks/${taskAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(deleteRes.success === true, 'DELETE /api/tasks/:id deletes Task A');

    // 18. User A task count is 0 after delete
    const finalTasksA = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(finalTasksA.data.tasks.length === 0, 'User A task count returns to 0');
  } catch (err) {
    console.error('Integration test exception:', err);
    failedTests++;
  } finally {
    server.close();
  }

  console.log(`----------------------------------------------------`);
  console.log(`Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log(`====================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
