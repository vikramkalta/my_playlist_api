import { Schema } from 'mongoose';

import { IAuditInfo, IOwner, IUserClaims } from '../interfaces';
import { AUTH_USER_ROLES } from '../utility';

const auditSchema = new Schema<IAuditInfo>({
  createdBy: { type: Number },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  archived: { type: Boolean, default: false }
}, {
  _id: false
});

const ownerSchema = new Schema<IOwner>({
  type: { type: String },
  _id: { type: String },
  name: { type: String },
  imageUrl: { type: String },
  email: { type: String },
}, {
  _id: false
});

const userClaimSchema = new Schema<IUserClaims>({
  claimType: { type: String, required: true, enum: AUTH_USER_ROLES },
  claimValue: { type: String },
}, {
  _id: false
});

const permissionsSchema = new Schema({
  moduleName: { type: String, required: true },
  moduleCode: { type: Number, required: true },
  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  }
});

export { auditSchema, ownerSchema, userClaimSchema, permissionsSchema };