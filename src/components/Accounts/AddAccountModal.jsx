import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';
import { Input, Button } from '../ui';
import { ACCOUNT_TYPES, CURRENCIES } from '../../utils/constants';
import { listVariants, itemVariants } from '../../utils/animations';

const initial = { name: '', type: 'CHECKING', currency: 'UZS', initialBalance: '' };

export default function AddAccountModal({ open, onOpenChange, onSubmit, submitting, editData }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        type: editData.type || 'CHECKING',
        currency: editData.currency || 'UZS',
        initialBalance: editData.balance ?? editData.initialBalance ?? '',
      });
    } else {
      setForm(initial);
    }
    setErrors({});
  }, [editData, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Account name is required';
    if (!form.type) newErrors.type = 'Account type is required';
    if (!form.currency) newErrors.currency = 'Currency is required';
    if (form.initialBalance === '') {
      newErrors.initialBalance = 'Initial balance is required';
    } else if (Number(form.initialBalance) < 0) {
      newErrors.initialBalance = 'Balance cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ ...form, initialBalance: Number(form.initialBalance) });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={editData ? 'Edit Account' : 'Add Account'}>
      <motion.form
        onSubmit={submit}
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <Input
            label="Account Name"
            type="text"
            placeholder="e.g., My Checking Account"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              if (errors.name) setErrors((p) => ({ ...p, name: '' }));
            }}
            error={errors.name}
            required
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Account Type
              <span className="ml-1 text-red-500">*</span>
            </label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              value={form.type}
              onChange={(e) => {
                setForm((p) => ({ ...p, type: e.target.value }));
                if (errors.type) setErrors((p) => ({ ...p, type: '' }));
              }}
              className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                errors.type ? 'border-red-500 focus:ring-red-500/20' : ''
              }`}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </motion.select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Currency
              <span className="ml-1 text-red-500">*</span>
            </label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              value={form.currency}
              onChange={(e) => {
                setForm((p) => ({ ...p, currency: e.target.value }));
                if (errors.currency) setErrors((p) => ({ ...p, currency: '' }));
              }}
              className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                errors.currency ? 'border-red-500 focus:ring-red-500/20' : ''
              }`}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </motion.select>
            {errors.currency && <p className="text-xs text-red-500 mt-1">{errors.currency}</p>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="Initial Balance"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.initialBalance}
            onChange={(e) => {
              setForm((p) => ({ ...p, initialBalance: e.target.value }));
              if (errors.initialBalance) setErrors((p) => ({ ...p, initialBalance: '' }));
            }}
            error={errors.initialBalance}
            required
          />
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            isLoading={submitting}
            disabled={submitting}
          >
            {editData ? 'Update Account' : 'Create Account'}
          </Button>
        </motion.div>
      </motion.form>
    </Modal>
  );
}
