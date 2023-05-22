export interface IPermission {
  ModuleName: string;
  ModuleCode: number;
  Permissions: Permission;
}

export interface Permission {
  Created: boolean;
  Read: boolean;
  Update: boolean;
  Delete: boolean;
}