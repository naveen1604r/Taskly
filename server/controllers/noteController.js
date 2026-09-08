import noteService from '../services/noteService.js';

export const createNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const note = await noteService.createNote(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await noteService.getNotes(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const note = await noteService.getNoteById(noteId, userId);

    res.status(200).json({
      success: true,
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const note = await noteService.updateNote(noteId, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    await noteService.deleteNote(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const pinNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const note = await noteService.pinNote(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note pinned',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const unpinNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const note = await noteService.unpinNote(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note unpinned',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const archiveNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const note = await noteService.archiveNote(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note archived',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const restoreNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const note = await noteService.restoreNote(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note restored to active',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  pinNote,
  unpinNote,
  archiveNote,
  restoreNote,
};
