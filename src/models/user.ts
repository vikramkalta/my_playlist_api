import { model as _model, Schema } from 'mongoose';

import { IUser } from '../interfaces';
import { ownerSchema, auditSchema, userClaimSchema } from './common-schema';
import { COLLECTIONS } from '../utility';

const schema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String },
  contact: { type: String, unique: true },
  email: { type: String, unique: true },
  dob: { type: Date },
  contactVerified: { type: Boolean },
  emailVerified: { type: Boolean },
  password: { type: String },
  salt: { type: String },
  owner: ownerSchema,
  claims: [userClaimSchema],
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

const name = COLLECTIONS.USER;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}