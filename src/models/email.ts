import { model as _model, Schema } from 'mongoose';

import { IEmail } from '../interfaces';
import { auditSchema } from './common-schema';
import { COLLECTIONS } from '../utility';

const schema = new Schema<IEmail>({
  email: { type: String, required: true, unique: true },
  auditInfo: auditSchema
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

const name = COLLECTIONS.EMAIL;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}