import Modal from './Modal';

export default function ConfirmDialog({ open, onOpenChange, title = 'Confirm action', message, onConfirm, loading }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={() => onOpenChange(false)} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
        <button
          disabled={loading}
          onClick={onConfirm}
          className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
