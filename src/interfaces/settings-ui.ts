import type {
  SettingsAction,
  SettingsChoice,
  SettingsSection,
} from "./settings";
export interface SettingsField {
  key: string;
  label: string;
  required?: boolean;
  type?:
    | "text"
    | "number"
    | "checkbox"
    | "textarea"
    | "datetime-local"
    | "currency";
  choices?: SettingsChoice[];
  disabled?: boolean;
  maxLength?: number;
}
export interface SettingsEditSpec {
  action: SettingsAction;
  title: string;
  values: Record<string, unknown>;
  fields: SettingsField[];
}
export interface SettingsGenericFormProps {
  outletId: string;
  spec: SettingsEditSpec;
  onSaved: () => void;
  onCancel: () => void;
}
export interface SettingsSectionRoute {
  view: SettingsSection;
}
