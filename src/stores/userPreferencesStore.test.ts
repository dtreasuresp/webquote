import { act } from '@testing-library/react'
import useUserPreferencesStore from './userPreferencesStore'

describe('userPreferencesStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserPreferencesStore.setState({
      id: '',
      userId: '',
      cerrarModalAlGuardar: true,
      mostrarConfirmacionGuardado: true,
      validarDatosAntes: true,
      limpiarFormulariosAlCrear: false,
      mantenerDatosAlCrearCotizacion: false,
      destinoGuardado: 'ambos',
      intervaloVerificacionConexion: 30,
      unidadIntervaloConexion: 'segundos',
      sincronizarAlRecuperarConexion: true,
      mostrarNotificacionCacheLocal: true,
      auditAutoPurgeFrequency: 'weekly',
      auditAutoReportEnabled: false,
      auditAutoReportPeriod: 'weekly',
      auditRetentionDays: 90,
      isLoading: false,
      error: null,
      isDirty: false,
    })

    // reset fetch mock
    // @ts-ignore
    global.fetch = jest.fn()
  })

  afterEach(() => {
    // @ts-ignore
    global.fetch.mockReset()
  })

  test('loadPreferences sets state from API', async () => {
    const fake = { id: '1', userId: 'u1', destinoGuardado: 'local' }
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: fake }) })

    await act(async () => {
      await useUserPreferencesStore.getState().loadPreferences()
    })

    const state = useUserPreferencesStore.getState()
    expect(state.destinoGuardado).toBe('local')
    expect(state.error).toBeNull()
  })

  test('updatePreferences optimistic update and revert on error', async () => {
    // first call will succeed
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: false })

    await act(async () => {
      await useUserPreferencesStore.getState().updatePreferences({ destinoGuardado: 'cloud' })
    })

    const state = useUserPreferencesStore.getState()
    // Since server failed, should revert to previous (default 'ambos')
    expect(state.destinoGuardado).toBe('ambos')
    expect(state.isDirty).toBe(false)
  })

  test('persistPreferences sends payload and updates state', async () => {
    const saved = { id: '1', userId: 'u1', destinoGuardado: 'cloud' }
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: saved }) })

    await act(async () => {
      await useUserPreferencesStore.getState().persistPreferences()
    })

    const state = useUserPreferencesStore.getState()
    expect(state.destinoGuardado).toBe('cloud')
    expect(state.isDirty).toBe(false)
  })
})