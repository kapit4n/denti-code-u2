'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useAdjustInventoryMutation,
  useCreateConsultoryMutation,
  useCreateInventoryLineMutation,
  useDeleteInventoryLineMutation,
  useGetConsultoriesQuery,
  useGetInventoryLinesQuery,
  useGetInventoryMovementsQuery,
} from '@/features/inventory/inventoryApiSlice';
import { useGetTreatmentFacilitiesQuery } from '@/features/procedures/proceduresApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import type { InventoryMovementType, MaterialInventoryLineDto } from '@/types';

export default function AdminInventoryPage() {
  const { t, intlLocale } = useTranslation();
  const [consultoryFilter, setConsultoryFilter] = useState<string>('all');
  const cid =
    consultoryFilter === '' || consultoryFilter === 'all' ? undefined : parseInt(consultoryFilter, 10);

  const { data: consultories = [], isLoading: loadingCons } = useGetConsultoriesQuery({
    includeInactive: true,
  });
  const { data: lines = [], isLoading: loadingLines, isError: linesError } = useGetInventoryLinesQuery(
    cid != null && !Number.isNaN(cid) ? { consultoryId: cid } : undefined,
  );
  const { data: movements = [], isLoading: loadingMov } = useGetInventoryMovementsQuery(
    cid != null && !Number.isNaN(cid) ? { consultoryId: cid, take: 60 } : { take: 60 },
  );
  const { data: facilities = [], isLoading: loadingFac } = useGetTreatmentFacilitiesQuery();

  const [createConsultory, { isLoading: savingCons }] = useCreateConsultoryMutation();
  const [createLine, { isLoading: savingLine }] = useCreateInventoryLineMutation();
  const [adjust, { isLoading: adjusting }] = useAdjustInventoryMutation();
  const [deleteLine, { isLoading: deleting }] = useDeleteInventoryLineMutation();

  const [newConsName, setNewConsName] = useState('');
  const [newConsCode, setNewConsCode] = useState('');
  const [regConsId, setRegConsId] = useState('');
  const [regFacId, setRegFacId] = useState('');
  const [regInit, setRegInit] = useState('0');

  const [adjustTarget, setAdjustTarget] = useState<{
    line: MaterialInventoryLineDto;
    type: InventoryMovementType;
  } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('1');
  const [adjustNote, setAdjustNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const activeConsultories = useMemo(
    () => [...consultories].filter((c) => c.IsActive).sort((a, b) => a.SortOrder - b.SortOrder),
    [consultories],
  );

  const facilityOptions = useMemo(() => {
    const regC = parseInt(regConsId, 10);
    if (Number.isNaN(regC)) return facilities;
    const used = new Set(lines.filter((l) => l.ConsultoryID === regC).map((l) => l.FacilityID));
    return facilities.filter((f) => !used.has(f.FacilityID));
  }, [facilities, lines, regConsId]);

  const handleCreateConsultory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newConsName.trim()) {
      setFormError(t('adminInventory.errName'));
      return;
    }
    try {
      await createConsultory({
        Name: newConsName.trim(),
        ShortCode: newConsCode.trim() || undefined,
      }).unwrap();
      setNewConsName('');
      setNewConsCode('');
    } catch {
      setFormError(t('adminInventory.errSave'));
    }
  };

  const handleRegisterLine = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const c = parseInt(regConsId, 10);
    const f = parseInt(regFacId, 10);
    const init = Math.max(0, parseInt(regInit, 10) || 0);
    if (Number.isNaN(c) || Number.isNaN(f)) {
      setFormError(t('adminInventory.errPick'));
      return;
    }
    try {
      await createLine({ consultoryId: c, facilityId: f, initialQuantity: init }).unwrap();
      setRegFacId('');
      setRegInit('0');
    } catch {
      setFormError(t('adminInventory.errLineExists'));
    }
  };

  const submitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    const amt = parseInt(adjustAmount, 10);
    if (Number.isNaN(amt) || amt < 1) {
      setFormError(t('adminInventory.errAmount'));
      return;
    }
    setFormError(null);
    try {
      await adjust({
        consultoryId: adjustTarget.line.ConsultoryID,
        facilityId: adjustTarget.line.FacilityID,
        amount: amt,
        type: adjustTarget.type,
        note: adjustNote.trim() || undefined,
      }).unwrap();
      setAdjustTarget(null);
      setAdjustAmount('1');
      setAdjustNote('');
    } catch {
      setFormError(t('adminInventory.errAdjust'));
    }
  };

  const handleDeleteLine = async (lineId: number) => {
    setFormError(null);
    try {
      await deleteLine(lineId).unwrap();
    } catch {
      setFormError(t('adminInventory.errDelete'));
    }
  };

  const loading = loadingCons || loadingLines || loadingFac;

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('adminInventory.title')}</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl">{t('adminInventory.intro')}</p>
      </div>

      {formError ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{formError}</p>
      ) : null}

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('adminInventory.sectionConsultories')}</h3>
        <form onSubmit={handleCreateConsultory} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.colConsName')}</label>
            <input
              value={newConsName}
              onChange={(e) => setNewConsName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56"
              placeholder={t('adminInventory.placeholderCons')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.colShortCode')}</label>
            <input
              value={newConsCode}
              onChange={(e) => setNewConsCode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
              placeholder="C3"
            />
          </div>
          <button
            type="submit"
            disabled={savingCons}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {savingCons ? t('common.loading') : t('adminInventory.addConsultory')}
          </button>
        </form>
        <ul className="text-sm text-gray-700 flex flex-wrap gap-2">
          {consultories.map((c) => (
            <li
              key={c.ConsultoryID}
              className={`px-3 py-1 rounded-full border ${c.IsActive ? 'bg-gray-50 border-gray-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}
            >
              {c.Name}
              {c.ShortCode ? ` (${c.ShortCode})` : ''}
              {!c.IsActive ? ` · ${t('adminInventory.inactive')}` : ''}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('adminInventory.sectionRegister')}</h3>
        <form onSubmit={handleRegisterLine} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.filterConsultory')}</label>
            <select
              value={regConsId}
              onChange={(e) => setRegConsId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">{t('adminInventory.pickConsultory')}</option>
              {activeConsultories.map((c) => (
                <option key={c.ConsultoryID} value={c.ConsultoryID}>
                  {c.Name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.material')}</label>
            <select
              value={regFacId}
              onChange={(e) => setRegFacId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">{t('adminInventory.pickMaterial')}</option>
              {facilityOptions.map((f) => (
                <option key={f.FacilityID} value={f.FacilityID}>
                  {f.DisplayName} ({f.FacilityCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.initialQty')}</label>
            <input
              type="number"
              min={0}
              value={regInit}
              onChange={(e) => setRegInit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="lg:col-span-4">
            <button
              type="submit"
              disabled={savingLine || loadingFac}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {savingLine ? t('common.loading') : t('adminInventory.registerLine')}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('adminInventory.sectionStock')}</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.filterConsultory')}</label>
            <select
              value={consultoryFilter}
              onChange={(e) => setConsultoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="all">{t('adminInventory.allConsultories')}</option>
              {activeConsultories.map((c) => (
                <option key={c.ConsultoryID} value={c.ConsultoryID}>
                  {c.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">{t('common.loading')}</p>
        ) : linesError ? (
          <p className="text-sm text-red-700">{t('admin.loadError')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[720px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('adminInventory.colConsultory')}</th>
                  <th className="px-3 py-2 font-medium">{t('adminInventory.colMaterial')}</th>
                  <th className="px-3 py-2 font-medium">{t('adminInventory.colCategory')}</th>
                  <th className="px-3 py-2 font-medium tabular-nums">{t('adminInventory.colQty')}</th>
                  <th className="px-3 py-2 font-medium">{t('adminInventory.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((row) => (
                  <tr key={row.LineID} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-3 py-2 text-gray-900">{row.consultory.Name}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{row.facility.DisplayName}</div>
                      <div className="text-xs text-gray-500 font-mono">{row.facility.FacilityCode}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{row.facility.CategoryKey}</td>
                    <td className="px-3 py-2 tabular-nums font-semibold text-gray-900">{row.Quantity}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                          onClick={() => {
                            setFormError(null);
                            setAdjustTarget({ line: row, type: 'RECEIVE' });
                            setAdjustAmount('1');
                            setAdjustNote('');
                          }}
                        >
                          {t('adminInventory.actionReceive')}
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200"
                          onClick={() => {
                            setFormError(null);
                            setAdjustTarget({ line: row, type: 'REMOVE' });
                            setAdjustAmount('1');
                            setAdjustNote('');
                          }}
                        >
                          {t('adminInventory.actionRemove')}
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold px-2 py-1 rounded-md bg-sky-100 text-sky-900 hover:bg-sky-200"
                          onClick={() => {
                            setFormError(null);
                            setAdjustTarget({ line: row, type: 'CONSUME' });
                            setAdjustAmount('1');
                            setAdjustNote('');
                          }}
                        >
                          {t('adminInventory.actionConsume')}
                        </button>
                        <button
                          type="button"
                          disabled={row.Quantity !== 0 || deleting}
                          className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                          onClick={() => void handleDeleteLine(row.LineID)}
                        >
                          {t('adminInventory.actionDeleteLine')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lines.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">{t('adminInventory.emptyLines')}</p>
            ) : null}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{t('adminInventory.sectionMovements')}</h3>
        {loadingMov ? (
          <p className="text-gray-500 text-sm">{t('common.loading')}</p>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs text-left min-w-[640px]">
              <thead className="bg-gray-50 text-gray-600 sticky top-0">
                <tr>
                  <th className="px-2 py-2 font-medium">{t('adminInventory.mWhen')}</th>
                  <th className="px-2 py-2 font-medium">{t('adminInventory.mCons')}</th>
                  <th className="px-2 py-2 font-medium">{t('adminInventory.mMat')}</th>
                  <th className="px-2 py-2 font-medium">{t('adminInventory.mType')}</th>
                  <th className="px-2 py-2 font-medium tabular-nums">{t('adminInventory.mDelta')}</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.MovementID} className="border-b border-gray-100">
                    <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString(intlLocale, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-2 py-1.5">{m.consultory.Name}</td>
                    <td className="px-2 py-1.5">{m.facility.DisplayName}</td>
                    <td className="px-2 py-1.5 font-mono">{m.Type}</td>
                    <td className="px-2 py-1.5 tabular-nums font-medium">{m.QuantityChange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 ? (
              <p className="text-sm text-gray-500 py-3">{t('adminInventory.emptyMovements')}</p>
            ) : null}
          </div>
        )}
      </section>

      {adjustTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-semibold text-gray-900">{t(`adminInventory.adjustTitle.${adjustTarget.type}`)}</h4>
            <p className="text-sm text-gray-600">
              {adjustTarget.line.consultory.Name} · {adjustTarget.line.facility.DisplayName}
            </p>
            <form onSubmit={submitAdjust} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.amount')}</label>
                <input
                  type="number"
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('adminInventory.noteOptional')}</label>
                <input
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={t('adminInventory.notePlaceholder')}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setAdjustTarget(null);
                    setFormError(null);
                  }}
                >
                  {t('adminInventory.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  {adjusting ? t('common.loading') : t('adminInventory.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
