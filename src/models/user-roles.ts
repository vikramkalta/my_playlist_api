import { model as _model, Schema } from 'mongoose';

import { IUserRoles } from '../interfaces';
import { AUTH_USER_ROLES, COLLECTIONS } from '../utility';
import { auditSchema, permissionsSchema } from './common-schema';

const schema = new Schema<IUserRoles>({
  RoleName: { 
    type: String,
    required: true,
    unique: true,
    enum: AUTH_USER_ROLES
  },
  Permissions: [permissionsSchema],
  AuditInfo: auditSchema
});

schema.pre('save', function (next) {
  this.AuditInfo = {
    Active: true,
    CreatedTime: new Date(),
    UpdatedTime: new Date(),
    Archived: false
  };
  next();
});

schema.pre('updateOne', function () {
  this.set({ 'AuditInfo.UpdatedTime': new Date() });
});

const name = COLLECTIONS.USER_ROLES;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}