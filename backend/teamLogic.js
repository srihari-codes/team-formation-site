const { Student, Preference, Team, Settings } = require('./models');

/**
 * Check if selection is open for a batch
 */
async function isSelectionOpen(batch) {
  const settings = await Settings.findOne({ batch });
  if (!settings) return true; // Default open if no settings exist
  return settings.selectionOpen;
}

/**
 * Auto-match logic: Check if 3 students mutually selected each other
 * Triggered after every valid preference save
 */
async function tryFormTeam(rollNo) {
  const student = await Student.findOne({ rollNo });
  if (!student || student.teamId) return null;

  const pref = await Preference.findOne({ rollNo });
  if (!pref || pref.choices.length !== 2) return null;

  const [choice1, choice2] = pref.choices;

  const [student1, student2] = await Promise.all([
    Student.findOne({ rollNo: choice1 }),
    Student.findOne({ rollNo: choice2 })
  ]);

  if (!student1 || !student2) return null;
  if (student1.batch !== student.batch || student2.batch !== student.batch) return null;
  if (student1.teamId || student2.teamId) return null;

  const [pref1, pref2] = await Promise.all([
    Preference.findOne({ rollNo: choice1 }),
    Preference.findOne({ rollNo: choice2 })
  ]);

  if (!pref1 || !pref2) return null;

  const aChoseBC = pref.choices.includes(choice1) && pref.choices.includes(choice2);
  const bChoseAC = pref1.choices.includes(rollNo) && pref1.choices.includes(choice2);
  const cChoseAB = pref2.choices.includes(rollNo) && pref2.choices.includes(choice1);

  if (aChoseBC && bChoseAC && cChoseAB) {
    const members = [rollNo, choice1, choice2].sort();
    
    const team = await Team.create({
      batch: student.batch,
      members
    });

    await Student.updateMany(
      { rollNo: { $in: members } },
      { $set: { teamId: team._id } }
    );

    // CLEANUP: Delete preferences for formed team (no dirty data)
    await Preference.deleteMany({ rollNo: { $in: members } });

    return team;
  }

  return null;
}

/**
 * Get all students in a batch with selectability status
 */
async function getStudentsByBatch(batch) {
  const students = await Student.find({ batch }).select('rollNo name teamId -_id');
  return students.map(s => ({
    rollNo: s.rollNo,
    name: s.name,
    selectable: s.teamId === null
  }));
}

/**
 * Validate and save preference
 */
async function savePreference(rollNo, choices) {
  const student = await Student.findOne({ rollNo });
  if (!student) throw { code: 404, message: 'Student not found' };
  if (student.teamId) throw { code: 400, message: 'Already in a team' };
  if (student.editAttemptsLeft <= 0) throw { code: 400, message: 'No edit attempts left' };

  // Check if selection is open
  const open = await isSelectionOpen(student.batch);
  if (!open) throw { code: 403, message: 'Selection phase is closed' };

  if (!Array.isArray(choices) || choices.length !== 2) {
    throw { code: 400, message: 'Must select exactly 2 teammates' };
  }

  if (choices.includes(rollNo)) {
    throw { code: 400, message: 'Cannot select yourself' };
  }

  const chosen = await Student.find({ rollNo: { $in: choices } });
  if (chosen.length !== 2) throw { code: 400, message: 'One or more choices not found' };

  for (const c of chosen) {
    if (c.batch !== student.batch) throw { code: 400, message: 'Cross-batch selection not allowed' };
    if (c.teamId) throw { code: 400, message: `${c.rollNo} is already in a team` };
  }

  await Preference.findOneAndUpdate(
    { rollNo },
    { rollNo, batch: student.batch, choices, updatedAt: new Date() },
    { upsert: true }
  );

  await Student.updateOne({ rollNo }, { $inc: { editAttemptsLeft: -1 } });

  const team = await tryFormTeam(rollNo);

  return {
    saved: true,
    editAttemptsLeft: student.editAttemptsLeft - 1,
    teamFormed: team !== null
  };
}

/**
 * Get team status for a student
 */
async function getTeamStatus(rollNo) {
  const student = await Student.findOne({ rollNo });
  if (!student) throw { code: 404, message: 'Student not found' };

  if (student.teamId) {
    const team = await Team.findById(student.teamId);
    return {
      state: 'formed',
      batch: student.batch,
      team: team.members
    };
  }

  return {
    state: 'pending',
    batch: student.batch
  };
}

/**
 * Admin: Close selection for a batch
 */
async function closeSelection(batch) {
  await Settings.findOneAndUpdate(
    { batch },
    { batch, selectionOpen: false },
    { upsert: true }
  );
  return { batch, selectionOpen: false };
}

/**
 * Admin: Open selection for a batch
 */
async function openSelection(batch) {
  await Settings.findOneAndUpdate(
    { batch },
    { batch, selectionOpen: true },
    { upsert: true }
  );
  return { batch, selectionOpen: true };
}

/**
 * Admin: Finalize unassigned students into teams
 */
async function finalizeTeams(batch) {
  // Auto-close selection when finalizing
  await closeSelection(batch);

  const unassigned = await Student.find({ batch, teamId: null }).select('rollNo');
  const rollNos = unassigned.map(s => s.rollNo);

  if (rollNos.length === 0) return { finalized: true, teamsCreated: 0 };

  let teamsCreated = 0;

  while (rollNos.length >= 3) {
    const members = rollNos.splice(0, 3);
    const team = await Team.create({ batch, members });
    await Student.updateMany(
      { rollNo: { $in: members } },
      { $set: { teamId: team._id } }
    );
    // Cleanup leftover preferences
    await Preference.deleteMany({ rollNo: { $in: members } });
    teamsCreated++;
  }

  if (rollNos.length > 0) {
    const team = await Team.create({ batch, members: rollNos });
    await Student.updateMany(
      { rollNo: { $in: rollNos } },
      { $set: { teamId: team._id } }
    );
    await Preference.deleteMany({ rollNo: { $in: rollNos } });
    teamsCreated++;
  }

  return { finalized: true, teamsCreated };
}

/**
 * Admin: Get formatted data for Excel export
 */
async function getExportData(batch) {
  const teams = await Team.find({ batch }).sort({ createdAt: 1 });
  const students = await Student.find({ batch }).select('rollNo name');
  const studentMap = students.reduce((acc, s) => {
    acc[s.rollNo] = s.name;
    return acc;
  }, {});

  const data = teams.map((t, index) => {
    const row = {
      'Team No': index + 1,
      'Batch': t.batch,
      'Member 1 Roll': t.members[0] || '',
      'Member 1 Name': studentMap[t.members[0]] || '',
      'Member 2 Roll': t.members[1] || '',
      'Member 2 Name': studentMap[t.members[1]] || '',
      'Member 3 Roll': t.members[2] || '',
      'Member 3 Name': studentMap[t.members[2]] || ''
    };
    return row;
  });

  return data;
}

module.exports = {
  isSelectionOpen,
  tryFormTeam,
  getStudentsByBatch,
  savePreference,
  getTeamStatus,
  closeSelection,
  openSelection,
  finalizeTeams,
  getExportData
};
