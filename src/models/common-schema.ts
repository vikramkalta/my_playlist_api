import { Schema } from 'mongoose';

import { IAuditInfo } from '../interfaces';

const auditSchema = new Schema<IAuditInfo>({
  createdBy: { type: Number },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  archived: { type: Boolean, default: false }
}, {
  _id: false
});

export { auditSchema };