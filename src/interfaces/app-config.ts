import { IAuditInfo } from './audit-info';
export interface IAppConfig {
  AttributeName: string;
  AttributeValue: string;
  AuditInfo?: IAuditInfo;
}