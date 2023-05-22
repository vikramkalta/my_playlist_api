import { Schema } from 'mongoose';

import { IAuditInfo, IOwner, IUserClaims } from '../interfaces';
import { AUTH_USER_ROLES } from '../utility';

const auditSchema = new Schema<IAuditInfo>({
  CreatedBy: { type: Number },
  CreatedTime: { type: Date, default: Date.now },
  UpdatedTime: { type: Date, default: Date.now },
  Active: { type: Boolean, default: true },
  Archived: { type: Boolean, default: false }
}, {
  _id: false
});

const ownerSchema = new Schema<IOwner>({
  Type: { type: String },
  _id: { type: String },
  Name: { type: String },
  ImageUrl: { type: String },
  Email: { type: String },
}, {
  _id: false
});

const userClaimSchema = new Schema<IUserClaims>({
  ClaimType: { type: String, required: true, enum: AUTH_USER_ROLES },
  ClaimValue: { type: String },
}, {
  _id: false
});

const permissionsSchema = new Schema({
  ModuleName: { type: String, required: true },
  ModuleCode: { type: Number, required: true },
  Permissions: {
    Create: { type: Boolean, default: false },
    Read: { type: Boolean, default: false },
    Update: { type: Boolean, default: false },
    Delete: { type: Boolean, default: false },
  }
});

export { auditSchema, ownerSchema, userClaimSchema, permissionsSchema };