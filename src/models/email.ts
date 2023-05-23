import { model as _model, Schema } from 'mongoose';

import { IEmail } from '../interfaces';
import { auditSchema } from './common-schema';
import { COLLECTIONS } from '../utility';

const schema = new Schema<IEmail>({
  Email: { type: String, required: true, unique: true },
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

const name = COLLECTIONS.EMAIL;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}