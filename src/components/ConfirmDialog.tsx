"use client";
import Modal from "./Modal";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      actions={
        <>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="text-sm text-slate-700">{message}</div>
    </Modal>
  );
}
