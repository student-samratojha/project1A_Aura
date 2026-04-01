const auditModel = require("../db/models/audit.model");
async function logAction(req, action) {
  try {
    const auditEntry = new auditModel({
      user: req.user ? req.user._id : null,
      action: action,
      method: req.method,
      route: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    await auditEntry.save();
  } catch (error) {
    console.error(error);
  }
}
module.exports = logAction;
