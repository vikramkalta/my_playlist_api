import { model as _model, Schema } from 'mongoose';

import { IAppConfig } from '../interfaces';
import { COLLECTIONS } from '../utility';
import { auditSchema } from './common-schema';

const schema = new Schema<IAppConfig>({
  AttributeName: { type: String, required: true },
  AttributeValue: { type: String, required: true },
  AuditInfo: auditSchema
});

const name = COLLECTIONS.APP_CONFIG;
const model = _model(name, schema);

export {
  name,
  schema,
  model,
};