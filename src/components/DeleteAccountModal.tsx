"use client";

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isDeleting 
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_PHRASE = 'ELIMINAR';

  if (!isOpen) return null;

  const canConfirm = confirmText === CONFIRM_PHRASE && !isDeleting;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Eliminar Cuenta</h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            Esta acción es <strong className="text-red-600">permanente e irreversible</strong>.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-semibold mb-2">
              Se eliminarán todos tus datos:
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Datos personales y de negocio</li>
              <li>Servicios creados</li>
              <li>Empleados registrados</li>
              <li>Reservas y citas</li>
              <li>Perfil público y configuraciones</li>
            </ul>
            <p className="text-xs text-red-600 mt-3">
              ⚠️ Los registros de pagos se conservarán por obligación legal (Ley 25.326)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe <strong className="text-red-600">ELIMINAR</strong>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              disabled={isDeleting}
              placeholder="Escribe ELIMINAR"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!canConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
