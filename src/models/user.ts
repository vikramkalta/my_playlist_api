import { model as _model, Schema } from 'mongoose';

import { IUser } from '../interfaces';
import { ownerSchema, auditSchema, userClaimSchema } from './common-schema';
import { COLLECTIONS } from '../utility';

const schema = new Schema<IUser>({
  Name: { type: String, required: true },
  Username: { type: String },
  Mobile: { type: String, unique: true },
  Email: { type: String, unique: true },
  MobileVerified: { type: Boolean },
  EmailVerified: { type: Boolean },
  Password: { type: String },
  Salt: { type: String },
  Owner: ownerSchema,
  Claims: [userClaimSchema],
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

const name = COLLECTIONS.USER;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}