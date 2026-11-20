import React, { useCallback, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Delete, Lock, X } from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  OperationType,
  PASSCODE_SUFFIX,
} from '../firebase';
import { DEFAULT_SHOP_SETTINGS } from '../data/defaults';
import { Language, ShopSettings } from '../types';
import { TRANSLATIONS } from '../i18n';

interface PinModalProps {
  open: boolean;
  lang: Language;
  settings: ShopSettings;
  onClose: () => void;
  onAuthenticated: () => void;
}

const ATTEMPTS_KEY = 'zt_pin_attempts';
const LOCK_UNTIL_KEY = 'zt_pin_lock_until';
const CONFIGURED_KEY = 'zt_pin_configured';

export const PinModal: React.FC<PinModalProps> = ({
  open,
  lang,
  settings,
  onClose,
  onAuthenticated,
}) => {
  const t = TRANSLATIONS[lang];
  const [pin, setPin] = useState('');
  const [firstSetupPin, setFirstSetupPin] = useState('');
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);

  // Determine whether setup should be shown or login pad
  useEffect(() => {
    if (!open) return;
    setPin('');
    setFirstSetupPin('');
    setSetupStep('create');
    setErrorMsg('');

    const accountKnown =
      Boolean(settings.adminInitialized) ||
      localStorage.getItem(CONFIGURED_KEY) === '1';
    setIsSetupMode(!accountKnown);
  }, [open, settings.adminInitialized]);

  // Countdown timer for 5-minute lockout
  useEffect(() => {
    if (!open) return;
    const tick = () => {
      const lockUntil = Number(localStorage.getItem(LOCK_UNTIL_KEY) || '0');
      const diff = Math.ceil((lockUntil - Date.now()) / 1000);
      if (diff > 0) {
        setLockSecondsLeft(diff);
      } else {
        setLockSecondsLeft(0);
        if (lockUntil > 0) {
          localStorage.removeItem(LOCK_UNTIL_KEY);
          localStorage.setItem(ATTEMPTS_KEY, '0');
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const submitPin = useCallback(
    async (enteredPin: string) => {
      if (enteredPin.length !== 4 || submitting || lockSecondsLeft > 0) return;

      if (isSetupMode) {
        if (setupStep === 'create') {
          setFirstSetupPin(enteredPin);
          setPin('');
          setSetupStep('confirm');
          setErrorMsg('');
          return;
        }

        // Confirm step
        if (enteredPin !== firstSetupPin) {
          setErrorMsg(t.pinMismatch);
          setPin('');
          setFirstSetupPin('');
          setSetupStep('create');
          return;
        }

        setSubmitting(true);
        setErrorMsg('');
        try {
          await createUserWithEmailAndPassword(
            auth,
            ADMIN_EMAIL,
            enteredPin + PASSCODE_SUFFIX
          );
          localStorage.setItem(CONFIGURED_KEY, '1');
          // Mark adminInitialized in Firestore settings/shop
          try {
            const shopRef = doc(db, 'settings', 'shop');
            const snap = await getDoc(shopRef);
            const base = snap.exists() ? snap.data() : DEFAULT_SHOP_SETTINGS;
            await setDoc(shopRef, {
              ...DEFAULT_SHOP_SETTINGS,
              ...base,
              adminInitialized: true,
              updatedAt: serverTimestamp(),
            });
          } catch (fsErr) {
            handleFirestoreError(fsErr, OperationType.WRITE, 'settings/shop');
          }
          onAuthenticated();
        } catch (err: unknown) {
          const code = (err as { code?: string })?.code || '';
          if (code === 'auth/email-already-in-use') {
            localStorage.setItem(CONFIGURED_KEY, '1');
            setIsSetupMode(false);
            setSetupStep('create');
            setFirstSetupPin('');
            setPin('');
            setErrorMsg(t.pinExistingSwitch);
          } else if (code === 'auth/operation-not-allowed') {
            setErrorMsg(
              'Enable Email/Password sign-in in Firebase Console -> Authentication -> Sign-in method.'
            );
            setPin('');
          } else {
            setErrorMsg((err as Error)?.message || 'Setup failed');
            setPin('');
          }
        } finally {
          setSubmitting(false);
        }
        return;
      }

      // Login mode
      setSubmitting(true);
      setErrorMsg('');
      try {
        await signInWithEmailAndPassword(
          auth,
          ADMIN_EMAIL,
          enteredPin + PASSCODE_SUFFIX
        );
        localStorage.setItem(CONFIGURED_KEY, '1');
        localStorage.setItem(ATTEMPTS_KEY, '0');
        localStorage.removeItem(LOCK_UNTIL_KEY);
        onAuthenticated();
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/user-not-found') {
          localStorage.removeItem(CONFIGURED_KEY);
          setIsSetupMode(true);
          setSetupStep('create');
          setPin('');
          setErrorMsg('');
        } else if (code === 'auth/operation-not-allowed') {
          setErrorMsg(
            'Enable Email/Password sign-in in Firebase Console -> Authentication -> Sign-in method.'
          );
          setPin('');
        } else {
          const prevAttempts = Number(localStorage.getItem(ATTEMPTS_KEY) || '0');
          const nextAttempts = prevAttempts + 1;
          localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts));

          if (nextAttempts >= 5) {
            const lockUntil = Date.now() + 5 * 60 * 1000;
            localStorage.setItem(LOCK_UNTIL_KEY, String(lockUntil));
            setLockSecondsLeft(300);
            setErrorMsg('');
          } else {
            setErrorMsg(t.pinWrong);
          }
          setPin('');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [
      firstSetupPin,
      isSetupMode,
      lockSecondsLeft,
      onAuthenticated,
      setupStep,
      submitting,
      t.pinExistingSwitch,
      t.pinMismatch,
      t.pinWrong,
    ]
  );

  const pressDigit = useCallback(
    (d: string) => {
      if (submitting || lockSecondsLeft > 0) return;
      setErrorMsg('');
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + d;
        if (next.length === 4) {
          window.setTimeout(() => submitPin(next), 80);
        }
        return next;
      });
    },
    [lockSecondsLeft, submitPin, submitting]
  );

  const pressBackspace = useCallback(() => {
    if (submitting || lockSecondsLeft > 0) return;
    setPin((prev) => prev.slice(0, -1));
  }, [lockSecondsLeft, submitting]);

  // Keyboard support
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        pressDigit(e.key);
      } else if (e.key === 'Backspace') {
        pressBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open, pressBackspace, pressDigit]);

  if (!open) return null;

  const mins = String(Math.floor(lockSecondsLeft / 60)).padStart(2, '0');
  const secs = String(lockSecondsLeft % 60).padStart(2, '0');

  const heading = isSetupMode
    ? setupStep === 'create'
      ? t.pinSetupTitle
      : t.pinSetupConfirm
    : t.pinEnterTitle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#26286B]/55 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl border border-[#26286B]/10"
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5F8] text-[#26286B]">
            <Lock className="h-5 w-5 text-[#1499D6]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F5F8] text-[#26286B] hover:bg-[#26286B]/10 cursor-pointer"
            aria-label={t.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <h2 className="font-display text-lg font-bold text-[#26286B]">{heading}</h2>
          {isSetupMode && (
            <p className="mt-1 text-xs text-[#26286B]/65">{t.pinSetupSub}</p>
          )}
        </div>

        {/* 4 PIN dots */}
        <div className="my-5 flex justify-center gap-3.5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                idx < pin.length
                  ? 'border-[#1499D6] bg-[#1499D6] scale-110'
                  : 'border-[#26286B]/25 bg-white'
              }`}
            />
          ))}
        </div>

        {lockSecondsLeft > 0 ? (
          <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-600 tabular-nums">
            {t.pinLocked} {mins}:{secs}
          </p>
        ) : errorMsg ? (
          <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-600">
            {errorMsg}
          </p>
        ) : (
          <div className="mb-4 h-6" />
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={submitting || lockSecondsLeft > 0}
              onClick={() => pressDigit(digit)}
              className="h-13 rounded-2xl bg-[#F3F5F8] font-display text-lg font-semibold text-[#26286B] hover:bg-[#1499D6]/12 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={submitting || lockSecondsLeft > 0}
            onClick={() => setPin('')}
            className="h-13 rounded-2xl bg-[#F3F5F8] text-xs font-semibold text-[#26286B]/70 hover:bg-[#26286B]/10 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            CLR
          </button>
          <button
            type="button"
            disabled={submitting || lockSecondsLeft > 0}
            onClick={() => pressDigit('0')}
            className="h-13 rounded-2xl bg-[#F3F5F8] font-display text-lg font-semibold text-[#26286B] hover:bg-[#1499D6]/12 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={submitting || lockSecondsLeft > 0}
            onClick={pressBackspace}
            className="flex h-13 items-center justify-center rounded-2xl bg-[#F3F5F8] text-[#26286B] hover:bg-[#26286B]/10 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            aria-label="Backspace"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
