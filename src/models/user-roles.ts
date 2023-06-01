import { model as _model, Schema } from 'mongoose';

import { IUserRoles } from '../interfaces';
import { AUTH_USER_ROLES, COLLECTIONS } from '../utility';
import { auditSchema, permissionsSchema } from './common-schema';

const schema = new Schema<IUserRoles>({
  roleName: { 
    type: String,
    required: true,
    unique: true,
    enum: AUTH_USER_ROLES
  },
  permissions: [permissionsSchema],
  auditInfo: auditSchema,
});

schema.pre('save', function (next) {
  this.auditInfo = {
    active: true,
    createdTime: new Date(),
    updatedTime: new Date(),
    archived: false,
  };
  next();
});

schema.pre('updateOne', function () {
  this.set({ 'auditInfo.updatedTime': new Date() });
});

const name = COLLECTIONS.USER_ROLES;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}