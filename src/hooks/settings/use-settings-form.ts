import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { useSettingsCommand } from "./use-settings-command";
import type { SettingsFormHookProps } from "@/interfaces/settings";
export function useSettingsForm<T extends FieldValues>(
  p: SettingsFormHookProps<T>,
) {
  const form = useForm<T>({ defaultValues: p.defaults });
  const command = useSettingsCommand(p.outletId);
  const submit = form.handleSubmit(async (values) => {
    try {
      await command.run(p.action, p.map ? p.map(values) : { ...values });
      p.onSaved();
    } catch {
      /* command.error is rendered */
    }
  });
  return { form, command, submit };
}
