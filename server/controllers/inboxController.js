import inboxService from '../services/inboxService.js';

export const createInboxItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inboxItem = await inboxService.createInboxItem(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Inbox item captured',
      data: { inboxItem },
    });
  } catch (error) {
    next(error);
  }
};

export const getInboxItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inboxItems = await inboxService.getInboxItems(userId, req.query);
    res.status(200).json({
      success: true,
      data: { inboxItems },
    });
  } catch (error) {
    next(error);
  }
};

export const getInboxItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inboxItem = await inboxService.getInboxItemById(req.params.id, userId);
    res.status(200).json({
      success: true,
      data: { inboxItem },
    });
  } catch (error) {
    next(error);
  }
};

export const updateInboxItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inboxItem = await inboxService.updateInboxItem(req.params.id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Inbox item updated',
      data: { inboxItem },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInboxItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await inboxService.deleteInboxItem(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Inbox item deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const processInboxItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await inboxService.processInboxItem(req.params.id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Inbox item processed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createInboxItem,
  getInboxItems,
  getInboxItem,
  updateInboxItem,
  deleteInboxItem,
  processInboxItem,
};
