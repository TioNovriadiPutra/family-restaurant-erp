import { useFormModal } from "@/hooks/ui/use-form-modal";
import type { FormModalProps } from "@/interfaces/form-surface";
export function FormModal({ label, children, onClose }: FormModalProps) {
  const { ref, close, onKeyDown } = useFormModal(onClose);
  return (
    <dialog
      ref={ref}
      onKeyDown={onKeyDown}
      aria-label={label}
      className="ui-dialog !m-auto !p-0 sm:!w-[min(42rem,calc(100vw-2rem))] [&>form]:!border-0 [&>form]:!shadow-none"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      {children}
    </dialog>
  );
}
