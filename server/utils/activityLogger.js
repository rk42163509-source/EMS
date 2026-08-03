import Activity from "../models/Activity.js";

export const logActivity = async ({ userId, action, entity = "", entityId = null, message }) => {
  try {
    await Activity.create({ userId, action, entity, entityId, message });
  } catch {
    // Non-critical
  }
};
