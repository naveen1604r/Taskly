import http from 'http';
import app from '../app.js';

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n====================================================`);
  console.log(`      TASKLY STEP 28 INTEGRATION TEST SUITE        `);
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
    // 1. Authentication Enforcement (401 without token)
    // ----------------------------------------------------
    const unauthProjects = await fetch(`${baseUrl}/projects`);
    assert(unauthProjects.status === 401, 'GET /api/projects without token returns 401');

    const unauthGoals = await fetch(`${baseUrl}/goals`);
    assert(unauthGoals.status === 401, 'GET /api/goals without token returns 401');

    const unauthNotes = await fetch(`${baseUrl}/notes`);
    assert(unauthNotes.status === 401, 'GET /api/notes without token returns 401');

    // ----------------------------------------------------
    // 2. Register User A and User B
    // ----------------------------------------------------
    const userAEmail = `step28_userA_${Date.now()}@example.com`;
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password: 'Password123!' }),
    }).then((r) => r.json());
    assert(regResA.success === true && regResA.data.token, 'Register User A succeeds with JWT');
    const tokenA = regResA.data?.token;

    const userBEmail = `step28_userB_${Date.now()}@example.com`;
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'Password123!' }),
    }).then((r) => r.json());
    assert(regResB.success === true && regResB.data.token, 'Register User B succeeds with JWT');
    const tokenB = regResB.data?.token;

    // ----------------------------------------------------
    // 3. Goals CRUD & Lifecycle for User A
    // ----------------------------------------------------
    const createGoalRes = await fetch(`${baseUrl}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Master Full Stack TypeScript',
        description: 'Complete all backend microservices and modern React components',
        category: 'Career',
        priority: 'high',
        progressMode: 'manual',
        progress: 25,
        milestones: [{ id: 'm1', title: 'Finish API layer', completed: false }],
      }),
    }).then((r) => r.json());
    assert(createGoalRes.success === true && createGoalRes.data.goal.id, 'User A creates Goal successfully');
    const goalAId = createGoalRes.data.goal.id;

    // Update goal progress
    const progRes = await fetch(`${baseUrl}/goals/${goalAId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ progress: 50 }),
    }).then((r) => r.json());
    assert(progRes.success === true && progRes.data.goal.progress === 50, 'User A updates Goal progress to 50%');

    // Archive & Restore Goal
    const archiveGoalRes = await fetch(`${baseUrl}/goals/${goalAId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(archiveGoalRes.success === true && archiveGoalRes.data.goal.status === 'archived', 'User A archives Goal');

    const restoreGoalRes = await fetch(`${baseUrl}/goals/${goalAId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(restoreGoalRes.success === true && restoreGoalRes.data.goal.status === 'active', 'User A restores Goal');

    // ----------------------------------------------------
    // 4. Projects CRUD & Task Statistics for User A
    // ----------------------------------------------------
    const createProjRes = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: 'Taskly Backend Architecture',
        description: 'Implement Express REST API with MySQL persistence',
        priority: 'high',
        goalId: goalAId,
        color: '#7C3AED',
      }),
    }).then((r) => r.json());
    assert(createProjRes.success === true && createProjRes.data.project.id, 'User A creates Project linked to Goal A');
    const projAId = createProjRes.data.project.id;

    // User A creates a task linked to Project A
    const createTaskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Implement Project Repository',
        projectId: projAId,
        goalId: goalAId,
        priority: 'high',
      }),
    }).then((r) => r.json());
    assert(createTaskRes.success === true && createTaskRes.data.task.id, 'User A creates Task linked to Project A');
    const taskAId = createTaskRes.data.task.id;

    // Verify Project reports 1 task, 0% progress
    const projDetailRes1 = await fetch(`${baseUrl}/projects/${projAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      projDetailRes1.data.project.totalTasks === 1 && projDetailRes1.data.project.progress === 0,
      'Project statistics reflect 1 pending task (0% progress)'
    );

    // Complete the task and verify Project updates to 100% progress
    await fetch(`${baseUrl}/tasks/${taskAId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const projDetailRes2 = await fetch(`${baseUrl}/projects/${projAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      projDetailRes2.data.project.completedTasks === 1 && projDetailRes2.data.project.progress === 100,
      'Project statistics dynamically reflect completed task (100% progress)'
    );

    // Complete, Archive, Restore Project
    const completeProjRes = await fetch(`${baseUrl}/projects/${projAId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(completeProjRes.data.project.status === 'completed', 'User A marks Project as completed');

    const archiveProjRes = await fetch(`${baseUrl}/projects/${projAId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(archiveProjRes.data.project.status === 'archived', 'User A archives Project');

    const restoreProjRes = await fetch(`${baseUrl}/projects/${projAId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(restoreProjRes.data.project.status === 'active', 'User A restores Project');

    // ----------------------------------------------------
    // 5. Notes CRUD & Flags (Pin, Archive) for User A
    // ----------------------------------------------------
    const createNoteRes = await fetch(`${baseUrl}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Project Architecture Notes',
        content: 'Remember that foreign key deletion safety prevents accidental data loss.',
        category: 'Architecture',
        tags: ['mysql', 'express', 'node'],
        pinned: false,
      }),
    }).then((r) => r.json());
    assert(createNoteRes.success === true && createNoteRes.data.note.id, 'User A creates Note successfully');
    const noteAId = createNoteRes.data.note.id;

    // Pin Note
    const pinRes = await fetch(`${baseUrl}/notes/${noteAId}/pin`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(pinRes.data.note.pinned === true, 'User A pins Note');

    // Unpin Note
    const unpinRes = await fetch(`${baseUrl}/notes/${noteAId}/unpin`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(unpinRes.data.note.pinned === false, 'User A unpins Note');

    // Archive & Restore Note
    const archiveNoteRes = await fetch(`${baseUrl}/notes/${noteAId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(archiveNoteRes.data.note.archived === true, 'User A archives Note');

    const restoreNoteRes = await fetch(`${baseUrl}/notes/${noteAId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(restoreNoteRes.data.note.archived === false, 'User A restores Note');

    // ----------------------------------------------------
    // 6. Multi-User Isolation
    // ----------------------------------------------------
    // User B cannot access User A's Goal, Project, or Note (must return 404)
    const userBGetGoal = await fetch(`${baseUrl}/goals/${goalAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBGetGoal.status === 404, 'User B GET User A Goal returns 404');

    const userBGetProj = await fetch(`${baseUrl}/projects/${projAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBGetProj.status === 404, 'User B GET User A Project returns 404');

    const userBGetNote = await fetch(`${baseUrl}/notes/${noteAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBGetNote.status === 404, 'User B GET User A Note returns 404');

    // User B cannot link project to User A's goal
    const userBCrossLink = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ name: 'User B Cross Project', goalId: goalAId }),
    });
    assert(userBCrossLink.status === 400, 'User B cannot link their project to User A Goal (returns 400)');

    // ----------------------------------------------------
    // 7. Filtering and Pagination
    // ----------------------------------------------------
    const pagedProjects = await fetch(`${baseUrl}/projects?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      pagedProjects.data.pagination && pagedProjects.data.pagination.limit === 1,
      'GET /api/projects supports pagination (?page=1&limit=1)'
    );

    const filteredNotes = await fetch(`${baseUrl}/notes?category=Architecture`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      filteredNotes.data.notes.length === 1 && filteredNotes.data.notes[0].category === 'Architecture',
      'GET /api/notes supports category filter'
    );

    // ----------------------------------------------------
    // 8. Relational Delete Safety (Requirements 12, 47, 48)
    // ----------------------------------------------------
    // Deleting Project must unassign task (tasks.project_id = null) without deleting the task
    const delProjRes = await fetch(`${baseUrl}/projects/${projAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delProjRes.status === 200, 'User A deletes Project A');

    const taskCheckAfterProjDel = await fetch(`${baseUrl}/tasks/${taskAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      taskCheckAfterProjDel.data.task && taskCheckAfterProjDel.data.task.projectId === null,
      'Task remains intact with projectId unassigned (NULL) after Project deletion'
    );

    // Deleting Goal must unassign goal from task (tasks.goal_id = null) without deleting the task
    const delGoalRes = await fetch(`${baseUrl}/goals/${goalAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delGoalRes.status === 200, 'User A deletes Goal A');

    const taskCheckAfterGoalDel = await fetch(`${baseUrl}/tasks/${taskAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    }).then((r) => r.json());
    assert(
      taskCheckAfterGoalDel.data.task && taskCheckAfterGoalDel.data.task.goalId === null,
      'Task remains intact with goalId unassigned (NULL) after Goal deletion'
    );

    // Deleting Note only deletes the note
    const delNoteRes = await fetch(`${baseUrl}/notes/${noteAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delNoteRes.status === 200, 'User A deletes Note A');

    const noteCheck = await fetch(`${baseUrl}/notes/${noteAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(noteCheck.status === 404, 'Note is completely deleted (returns 404)');

    // Verify task still exists and user still exists
    const finalTaskCheck = await fetch(`${baseUrl}/tasks/${taskAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(finalTaskCheck.status === 200, 'Task remains fully operational and intact after all deletions');
  } catch (error) {
    console.error('Fatal error during test run:', error);
    failedTests++;
  } finally {
    server.close();
  }

  console.log(`\n====================================================`);
  console.log(`              STEP 28 TEST SUMMARY                  `);
  console.log(`====================================================`);
  console.log(`  Total Passed: ${passedTests}`);
  console.log(`  Total Failed: ${failedTests}`);
  console.log(`====================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
