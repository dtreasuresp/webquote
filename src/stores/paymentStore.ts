/**
 * Payment Store
 * Centralized state management for payment information
 * Replaces 5 useState hooks from AdminPage
 *
 * Mapped useState:
 * - paqueteActual → currentPackage
 * - opcionesPagoActual → paymentOptions[]
 * - metodoPagoPreferido → preferredMethod
 * - notasPago → notes
 * - metodosPreferidos → preferredMethods[]
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PaymentStore, DEFAULT_PAYMENT_STATE, OpcionPago, MetodoPreferido } from './types/payment.types'
import { paymentApi } from './utils/paymentApi'

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_PAYMENT_STATE,

      // Set current package
      setCurrentPackage: (pkg: any) => {
        set({ currentPackage: pkg, errors: {} })
      },

      // Set payment options
      setPaymentOptions: (options: OpcionPago[]) => {
        set({ paymentOptions: options })
      },

      // Set preferred payment method
      setPreferredMethod: (method: string) => {
        set({ preferredMethod: method, errors: {} })
      },

      // Set preferred methods
      setPreferredMethods: (methods: MetodoPreferido[]) => {
        set({ preferredMethods: methods })
      },

      // Update notes
      updateNotes: (notes: string) => {
        set({ notes })
      },

      // Load payment methods and options
      loadPaymentMethods: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const [options, methods] = await Promise.all([
            paymentApi.getPaymentOptions(),
            paymentApi.getPreferredMethods(),
          ])

          set({
            paymentOptions: options,
            preferredMethods: methods,
            isLoading: false,
          })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error loading payment methods'
          set({
            isLoading: false,
            errors: { _global: msg },
          })
        }
      },

      // Save payment preferences
      savePaymentPreferences: async () => {
        set({ isLoading: true, errors: {} })
        try {
          await paymentApi.savePaymentPreferences({
            preferredMethod: usePaymentStore.getState().preferredMethod || undefined,
            notes: usePaymentStore.getState().notes,
          })

          set({ isLoading: false, errors: {} })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error saving payment preferences'
          set({
            isLoading: false,
            errors: { _global: msg },
          })
        }
      },

      // Clear errors
      clearErrors: () => {
        set({ errors: {} })
      },

      // Reset store
      resetPayment: () => {
        set(DEFAULT_PAYMENT_STATE)
      },
    }),
    {
      name: 'payment-store',
      partialize: (state) => ({
        currentPackage: state.currentPackage,
        preferredMethod: state.preferredMethod,
        notes: state.notes,
        preferredMethods: state.preferredMethods,
      }),
    }
  )
)

// Optimized selectors
export const useCurrentPackage = () => usePaymentStore((state) => state.currentPackage)
export const usePaymentOptions = () => usePaymentStore((state) => state.paymentOptions)
export const usePreferredMethod = () => usePaymentStore((state) => state.preferredMethod)
export const usePaymentNotes = () => usePaymentStore((state) => state.notes)
export const usePreferredMethods = () => usePaymentStore((state) => state.preferredMethods)
export const usePaymentLoading = () => usePaymentStore((state) => state.isLoading)
export const usePaymentErrors = () => usePaymentStore((state) => state.errors)
