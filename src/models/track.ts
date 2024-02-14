import { model as _model, Schema } from 'mongoose';

import { ITrack } from '../interfaces';
import { auditSchema } from './common-schema';
import { COLLECTIONS } from '../utility/index';

const schema = new Schema<ITrack>({
  trackUrl: { type: String, required: true },
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

const name = COLLECTIONS.TRACK;
const model = _model(name, schema);

export {
  name,
  schema,
  model
}