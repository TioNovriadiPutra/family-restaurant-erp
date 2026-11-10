import type { SettingsGenericFormProps } from "./settings-ui";
import type { SettingsPermission } from "./settings";
export interface SettingsRoleUiProps extends SettingsGenericFormProps {
  permissions: SettingsPermission[];
}
