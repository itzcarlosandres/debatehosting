'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { useToast } from '@/context/ToastContext';
import { normalizeImageUrl } from '@/lib/imageHelper';

const AVAILABLE_CATEGORIES = [
  { id: 'hosting', label: 'Hosting web' },
  { id: 'vps', label: 'VPS' },
  { id: 'wordpress', label: 'WordPress' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'dominios', label: 'Dominios' },
];

const VALID_TABS = [
  'dashboard',
  'proveedores',
  'cupones',
  'categorias',
  'badges',
  'elegidos',
  'ticker',
  'suscriptores',
  'settings',
];

const VALID_SETTINGS_SUBTABS = ['general', 'seo', 'afiliacion', 'seguridad', 'sistema'];

const LOGO_ICONS = [
  { id: 'rocket', label: 'Cohete' },
  { id: 'flame', label: 'Fuego' },
  { id: 'sparkles', label: 'Brillo' },
  { id: 'zap', label: 'Rayo' },
  { id: 'globe', label: 'Mundo' },
  { id: 'compass', label: 'Brújula' },
  { id: 'layers', label: 'Capas' },
  { id: 'bot', label: 'Bot IA' },
  { id: 'code', label: 'Código' },
  { id: 'terminal', label: 'Consola' },
  { id: 'cpu', label: 'Chip' },
  { id: 'star', label: 'Estrella' },
  { id: 'shield', label: 'Escudo' },
  { id: 'target', label: 'Diana' },
  { id: 'gem', label: 'Gema' },
  { id: 'scale', label: 'Balanza' },
  { id: 'server', label: 'Servidor' },
];

const QUICK_BRAND_COLORS = [
  { label: 'Verde Editorial', hex: '#0E6B41' },
  { label: 'Verde Esmeralda', hex: '#46C285' },
  { label: 'Verde Bosque', hex: '#0A4E2F' },
  { label: 'Tinta Negra', hex: '#17140F' },
  { label: 'Rojo Imprenta', hex: '#B03A26' },
  { label: 'Naranja Alerta', hex: '#E4572E' },
  { label: 'Oro Balanza', hex: '#D97706' },
  { label: 'Azul Servidor', hex: '#2563EB' },
  { label: 'Índigo Cloud', hex: '#4F46E5' },
  { label: 'Púrpura IA', hex: '#8B5CF6' },
];

const slugify = (text) =>
  (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  // Estados de Login
  const [email, setEmail] = useState('admin@debatehosting.com');
  const [password, setPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estados de datos
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [picks, setPicks] = useState([]);
  const [tickerItems, setTickerItems] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modales y confirmaciones
  const [provModalOpen, setProvModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [provForm, setProvForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    plan: '',
    priceFrom: 2.99,
    priceBefore: 9.99,
    period: 'mes',
    categories: ['hosting'],
    scorePrecio: 8.5,
    scoreRendimiento: 8.0,
    scoreSoporte: 8.0,
    scoreFacilidad: 8.5,
    uptime: 99.95,
    affiliateUrl: 'https://',
    active: true,
    badge: '',
    badgeColor: 'green',
    description: '',
    pros: '',
    cons: '',
    verdict: '',
    metaTitle: '',
    metaDescription: '',
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  const handleGenerateAI = async () => {
    if (!provForm.name || !provForm.name.trim()) {
      toast.error('Por favor escribe primero el Nombre del Proveedor (ej. Alexhost, BanaHosting, etc.)');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await authFetch('/api/admin/providers/generate-ai', {
        method: 'POST',
        body: JSON.stringify({
          name: provForm.name,
          plan: provForm.plan,
          categories: provForm.categories,
          priceFrom: provForm.priceFrom,
        }),
      });
      if (res && res.ok && res.data) {
        const d = res.data;
        const formatLines = (val) => (Array.isArray(val) ? val.join('\n') : (val || ''));
        setProvForm((prev) => ({
          ...prev,
          slug: prev.slug || slugify(d.name),
          description: d.description || prev.description,
          pros: formatLines(d.pros) || prev.pros,
          cons: formatLines(d.cons) || prev.cons,
          verdict: d.verdict || prev.verdict,
          metaTitle: d.metaTitle || prev.metaTitle,
          metaDescription: d.metaDescription || prev.metaDescription,
          scoreRendimiento: d.scoreRendimiento || prev.scoreRendimiento,
          scoreSoporte: d.scoreSoporte || prev.scoreSoporte,
          scorePrecio: d.scorePrecio || prev.scorePrecio,
          scoreFacilidad: d.scoreFacilidad || prev.scoreFacilidad,
          uptime: d.uptime || prev.uptime,
        }));
        toast.success(`¡Ficha editorial y SEO generados con éxito para ${d.name}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Error al generar contenido con IA.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingLogo(true);
    try {
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen.');

      setProvForm((prev) => ({ ...prev, logoUrl: normalizeImageUrl(data.url) }));
      setLogoPreviewError(false);
      toast.success('Logo subido correctamente.');
    } catch (err) {
      toast.error(err.message || 'Error al subir la imagen.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const [customCatInput, setCustomCatInput] = useState('');

  const toggleCategory = (catId) => {
    const current = Array.isArray(provForm.categories) ? [...provForm.categories] : [];
    if (current.includes(catId)) {
      setProvForm({ ...provForm, categories: current.filter((c) => c !== catId) });
    } else {
      setProvForm({ ...provForm, categories: [...current, catId] });
    }
  };

  const handleAddCustomCategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = customCatInput.trim().toLowerCase();
    if (!trimmed) return;
    const current = Array.isArray(provForm.categories) ? [...provForm.categories] : [];
    if (!current.includes(trimmed)) {
      setProvForm({ ...provForm, categories: [...current, trimmed] });
    }
    setCustomCatInput('');
  };

  // Categorías y Badges dinámicos
  const [dbCategories, setDbCategories] = useState([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: 'server', order: 0 });

  const [dbBadges, setDbBadges] = useState([]);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ label: '', slug: '', color: 'green', order: 0 });

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount: '−10% extra',
    condition: 'Válido para nuevas contrataciones',
    providerId: '',
    expiresAt: '',
    verified: true,
  });

  const [newTickerText, setNewTickerText] = useState('');
  const [newTickerHot, setNewTickerHot] = useState(false);

  const [editingPickId, setEditingPickId] = useState(null);
  const [pickForm, setPickForm] = useState({ providerId: '', tag: '', titulo: '', veredicto: '' });
  const [isAddingPick, setIsAddingPick] = useState(false);
  const [newPickForm, setNewPickForm] = useState({ providerId: '', tag: '', titulo: '', veredicto: '' });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Estados de Configuración (Settings)
  const [settingsData, setSettingsData] = useState({
    siteName: 'Debatehosting',
    siteTagline: 'El Gran Observatorio de Hosting, VPS y Cupones',
    siteUrl: 'https://debatehosting.com',
    contactEmail: 'redaccion@debatehosting.com',
    currency: '$',
    faviconUrl: '/favicon.ico',
    logoUrl: '',
    iconUrl: '/icon.png',
    ogImageUrl: '/og-image.png',
    logoType: 'icon_text', // 'icon_text' | 'image' | 'text'
    logoIcon: 'rocket',
    logoTextPrefix: 'Debate',
    logoTextHighlight: 'hosting',
    logoColor: '#0E6B41',
    defaultMetaDescription:
      'Medio editorial y comparador técnico independiente de hosting web, servidores VPS, cloud y cupones verificados. Medición real de latencia TTFB, uptime y relación calidad-precio sin tapujos.',
    defaultKeywords:
      'hosting web, mejor hosting espana, comparativa hosting, vps baratos, cupones hosting, hosting wordpress, test ttfb',
    affiliateRel: 'sponsored noopener noreferrer',
    disclosureNotice:
      'Debatehosting se financia mediante enlaces de afiliación regulados. Al contratar a través de nuestros enlaces, podemos recibir una comisión sin coste adicional para ti. Esto nunca afecta a la objetividad de nuestros análisis ni a las posiciones del ranking.',
    ttfbEngineVersion: 'v2.4 (OpenTelemetry Engine)',
    maintenanceMode: false,
    enableComments: false,
    autoVerifyCoupons: true,
    googleAnalyticsId: '',
    googleSearchConsoleCode: '',
    customHeadCode: '',
    customBodyCode: '',
  });
  const [settingsSubtab, setSettingsSubtab] = useState('general');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [resettingContent, setResettingContent] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(null); // 'faviconUrl' | 'logoUrl' | 'iconUrl' | null

  // Estados de Seguridad del Perfil Admin
  const [profileForm, setProfileForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const toast = useToast();

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('debatehosting_token');
    const savedUser = localStorage.getItem('debatehosting_user');
    const savedTheme = localStorage.getItem('debatehosting_admin_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    }
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }

    // 1. Restaurar pestaña y subpestaña al cargar o recargar (F5) con máxima fiabilidad
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const savedTab = localStorage.getItem('debatehosting_admin_tab');
      const savedSubtab = localStorage.getItem('debatehosting_admin_settings_subtab') || 'general';

      let tabToSet = 'dashboard';
      let subtabToSet = savedSubtab;

      if (hash) {
        const [tab, sub] = hash.split('/');
        if (tab && VALID_TABS.includes(tab)) tabToSet = tab;
        if (sub && VALID_SETTINGS_SUBTABS.includes(sub)) subtabToSet = sub;
      } else if (savedTab && VALID_TABS.includes(savedTab)) {
        tabToSet = savedTab;
      }

      setActiveTab(tabToSet);
      setSettingsSubtab(subtabToSet);
      localStorage.setItem('debatehosting_admin_tab', tabToSet);
      localStorage.setItem('debatehosting_admin_settings_subtab', subtabToSet);

      const targetHash = tabToSet === 'settings' ? `#settings/${subtabToSet}` : `#${tabToSet}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }

    setCheckingAuth(false);
  }, []);

  // Escuchar cambios de hash para navegación con historial atrás/adelante
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [tab, sub] = hash.split('/');
        if (tab && VALID_TABS.includes(tab)) {
          setActiveTab(tab);
          localStorage.setItem('debatehosting_admin_tab', tab);
        }
        if (sub && VALID_SETTINGS_SUBTABS.includes(sub)) {
          setSettingsSubtab(sub);
          localStorage.setItem('debatehosting_admin_settings_subtab', sub);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sincronizar dinámicamente el favicon del navegador cuando se actualiza en ajustes
  useEffect(() => {
    if (typeof document !== 'undefined' && settingsData?.faviconUrl) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      const raw = settingsData.faviconUrl;
      link.href = raw.startsWith('/') || raw.startsWith('http') ? raw : `/${raw}`;
    }
  }, [settingsData?.faviconUrl]);

  // Manejar cambio de pestaña principal con persistencia
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    localStorage.setItem('debatehosting_admin_tab', newTab);
    const hash = newTab === 'settings' ? `#settings/${settingsSubtab}` : `#${newTab}`;
    window.history.replaceState(null, '', hash);
  };

  // Manejar cambio de subpestaña de configuración con persistencia
  const handleSettingsSubtabChange = (newSubtab) => {
    setSettingsSubtab(newSubtab);
    localStorage.setItem('debatehosting_admin_settings_subtab', newSubtab);
    window.history.replaceState(null, '', `#settings/${newSubtab}`);
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('debatehosting_admin_theme', next ? 'dark' : 'light');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas.');

      localStorage.setItem('debatehosting_token', data.token);
      localStorage.setItem('debatehosting_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success('Sesión iniciada correctamente.');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('debatehosting_token');
    localStorage.removeItem('debatehosting_user');
    localStorage.removeItem('debatehosting_admin_tab');
    localStorage.removeItem('debatehosting_admin_settings_subtab');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
    setSettingsSubtab('general');
    window.history.replaceState(null, '', '/admin');
  };

  // Helper para llamadas autenticadas
  const authFetch = async (url, options = {}) => {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      handleLogout();
      throw new Error('Sesión expirada.');
    }

    return res;
  };

  // Cargar datos según pestaña
  const loadCurrentData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      if (activeTab === 'dashboard') {
        const [resStats, resP, resC, resPk, resSub] = await Promise.all([
          authFetch('/api/admin/stats'),
          authFetch('/api/admin/providers'),
          authFetch('/api/admin/coupons'),
          authFetch('/api/admin/picks'),
          authFetch('/api/admin/subscribers'),
        ]);
        setStats(await resStats.json());
        setProviders((await resP.json()) || []);
        setCoupons((await resC.json()) || []);
        setPicks((await resPk.json()) || []);
        setSubscribers((await resSub.json()) || []);
      } else if (activeTab === 'proveedores') {
        const [resP, resCat, resB] = await Promise.all([
          authFetch('/api/admin/providers'),
          authFetch('/api/admin/categories'),
          authFetch('/api/admin/badges'),
        ]);
        setProviders((await resP.json()) || []);
        setDbCategories((await resCat.json()) || []);
        setDbBadges((await resB.json()) || []);
      } else if (activeTab === 'categorias') {
        const res = await authFetch('/api/admin/categories');
        setDbCategories((await res.json()) || []);
      } else if (activeTab === 'badges') {
        const res = await authFetch('/api/admin/badges');
        setDbBadges((await res.json()) || []);
      } else if (activeTab === 'cupones') {
        const [resC, resP] = await Promise.all([
          authFetch('/api/admin/coupons'),
          authFetch('/api/admin/providers'),
        ]);
        setCoupons((await resC.json()) || []);
        setProviders((await resP.json()) || []);
      } else if (activeTab === 'elegidos') {
        const res = await authFetch('/api/admin/picks');
        setPicks((await res.json()) || []);
      } else if (activeTab === 'ticker') {
        const res = await authFetch('/api/admin/ticker');
        setTickerItems((await res.json()) || []);
      } else if (activeTab === 'suscriptores') {
        const res = await authFetch('/api/admin/subscribers');
        setSubscribers((await res.json()) || []);
      } else if (activeTab === 'settings') {
        const res = await authFetch('/api/admin/settings');
        const data = await res.json();
        if (res.ok && data) {
          setSettingsData(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar la configuración');
      toast.success('Configuración guardada correctamente.');
    } catch (err) {
      toast.error(err.message || 'Error al guardar configuración.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResetContent = async () => {
    const confirmed = window.confirm(
      '⚠️ ¿Estás completamente seguro de vaciar todo el contenido de la web a 0?\n\nSe eliminarán todos los proveedores de prueba, cupones, elegidos del podio, suscriptores y métricas.\n\n✓ Tu cuenta de administrador se mantendrá intacta.'
    );
    if (!confirmed) return;

    setResettingContent(true);
    try {
      const res = await authFetch('/api/admin/reset-content', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al vaciar contenido');

      toast.success('¡Web reseteada a 0 exitosamente! Todo el contenido de prueba ha sido eliminado.');
      await loadCurrentData();
    } catch (err) {
      toast.error(err.message || 'Error al resetear la base de datos.');
    } finally {
      setResettingContent(false);
    }
  };

  const handleSettingsAssetUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingAsset(key);
    try {
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen.');

      setSettingsData((prev) => ({ ...prev, [key]: normalizeImageUrl(data.url) }));
      toast.success('Asset visual subido correctamente.');
    } catch (err) {
      toast.error(err.message || 'Error al subir el archivo.');
    } finally {
      setUploadingAsset(null);
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('La confirmación de la nueva contraseña no coincide.');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await authFetch('/api/admin/profile', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword || undefined,
          newEmail: profileForm.newEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar credenciales.');
      toast.success(data.message || 'Credenciales actualizadas correctamente.');
      if (data.user) {
        setUser((prev) => ({ ...prev, email: data.user.email }));
        localStorage.setItem('debatehosting_user', JSON.stringify({ ...user, email: data.user.email }));
      }
      setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '', newEmail: '' });
    } catch (err) {
      toast.error(err.message || 'Error al actualizar credenciales.');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCurrentData();
    }
  }, [token, activeTab]);

  // Mientras se valida la sesión en localStorage, evitar parpadeo de la pantalla de login
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#090807' : '#FAF7EE',
        color: isDark ? '#FAF7EE' : '#17140F',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Icon name="scale" size={24} color={isDark ? '#46C285' : '#0E6B41'} />
          <span style={{ letterSpacing: '0.05em' }}>Cargando panel de administración...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, renderizar login en Dark Black
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#090807' : 'var(--bg-paper)',
        color: isDark ? '#FAF7EE' : 'var(--text-ink)',
        padding: '1.5rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: isDark ? '#12100D' : 'var(--bg-surface)',
          border: isDark ? '1.5px solid #2B251D' : 'var(--border-width) solid var(--border-ink)',
          boxShadow: isDark ? '8px 8px 0 #000000' : 'var(--shadow-huge)',
          padding: '2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Icon name="scale" size={28} color={isDark ? '#46C285' : '#0E6B41'} />
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: isDark ? '#FAF7EE' : 'var(--text-ink)' }}>
                Debatehosting
              </h2>
            </div>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.6rem',
                backgroundColor: isDark ? '#1A1713' : '#FAF7EE',
                color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                borderColor: isDark ? '#383025' : 'var(--border-ink)',
              }}
              title="Alternar tema"
            >
              {isDark ? '🌙 Dark Black' : '☀ Crema'}
            </button>
          </div>

          <div className="kicker" style={{ color: isDark ? 'var(--green-bright)' : 'var(--green-primary)' }}>
            CONSOLA DE REDACCIÓN — DARK BLACK
          </div>
          <p style={{ fontSize: '0.92rem', marginBottom: '1.8rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
            Introduce tus credenciales para acceder al panel editorial nocturno.
          </p>

          {loginError && (
            <div style={{
              backgroundColor: 'var(--red-soft)',
              color: 'var(--red-accent)',
              border: '1.5px solid var(--red-accent)',
              padding: '0.75rem 1rem',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              marginBottom: '1.5rem',
            }}>
              ⚠ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                Correo de Administrador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-editorial"
                style={{
                  width: '100%',
                  backgroundColor: isDark ? '#1A1713' : '#FFFFFF',
                  color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                  borderColor: isDark ? '#383025' : 'var(--border-ink)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-editorial"
                style={{
                  width: '100%',
                  backgroundColor: isDark ? '#1A1713' : '#FFFFFF',
                  color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                  borderColor: isDark ? '#383025' : 'var(--border-ink)',
                }}
              />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={loginLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  backgroundColor: isDark ? 'var(--green-bright)' : 'var(--green-primary)',
                  color: isDark ? '#0A2E1C' : '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                <span>{loginLoading ? 'Comprobando clave...' : 'Acceder al Panel'}</span>
                <Icon name="arrowRight" size={14} color={isDark ? '#0A2E1C' : '#fff'} />
              </button>
            </div>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.2rem', borderTop: isDark ? '1px solid #2B251D' : '1px solid rgba(23,20,15,0.15)', textAlign: 'center' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
              ← Volver al sitio público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${isDark ? '' : 'theme-light'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Icon name="scale" size={22} color={isDark ? '#46C285' : '#0E6B41'} />
          <span>Debate Admin</span>
        </div>

        <nav className="admin-nav">
          {/* GRUPO 1: RESUMEN & MÉTRICAS */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-title">Métricas & Resumen</span>
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Icon name="sliders" size={16} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* GRUPO 2: CATÁLOGO Y OFERTAS */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-title">Catálogo</span>
            <button
              onClick={() => handleTabChange('proveedores')}
              className={`admin-nav-item ${activeTab === 'proveedores' ? 'active' : ''}`}
            >
              <Icon name="shield" size={16} />
              <span>Proveedores</span>
              {providers.length > 0 && <span className="admin-nav-badge">{providers.length}</span>}
            </button>

            <button
              onClick={() => handleTabChange('cupones')}
              className={`admin-nav-item ${activeTab === 'cupones' ? 'active' : ''}`}
            >
              <Icon name="ticket" size={16} />
              <span>Cupones</span>
              {coupons.length > 0 && <span className="admin-nav-badge">{coupons.length}</span>}
            </button>

            <button
              onClick={() => handleTabChange('categorias')}
              className={`admin-nav-item ${activeTab === 'categorias' ? 'active' : ''}`}
            >
              <Icon name="server" size={16} />
              <span>Categorías</span>
            </button>

            <button
              onClick={() => handleTabChange('badges')}
              className={`admin-nav-item ${activeTab === 'badges' ? 'active' : ''}`}
            >
              <Icon name="flame" size={16} />
              <span>Badges</span>
            </button>
          </div>

          {/* GRUPO 3: CURATORÍA EDITORIAL */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-title">Editorial</span>
            <button
              onClick={() => handleTabChange('elegidos')}
              className={`admin-nav-item ${activeTab === 'elegidos' ? 'active' : ''}`}
            >
              <Icon name="trophy" size={16} />
              <span>Los Elegidos</span>
              {picks.length > 0 && <span className="admin-nav-badge">{picks.length}</span>}
            </button>

            <button
              onClick={() => handleTabChange('ticker')}
              className={`admin-nav-item ${activeTab === 'ticker' ? 'active' : ''}`}
            >
              <Icon name="flame" size={16} />
              <span>Cinta / Ticker</span>
            </button>

            <button
              onClick={() => handleTabChange('suscriptores')}
              className={`admin-nav-item ${activeTab === 'suscriptores' ? 'active' : ''}`}
            >
              <Icon name="clock" size={16} />
              <span>Suscriptores</span>
              {subscribers.length > 0 && <span className="admin-nav-badge">{subscribers.length}</span>}
            </button>
          </div>

          {/* GRUPO 4: SISTEMA Y AJUSTES */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-title">Sistema</span>
            <button
              onClick={() => handleTabChange('settings')}
              className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Icon name="settings" size={16} />
              <span>Configuración</span>
            </button>
          </div>
        </nav>

        <div className="admin-user-footer">
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              marginBottom: '0.6rem',
              fontSize: '0.78rem',
              justifyContent: 'center',
              backgroundColor: isDark ? '#1A1713' : '#FFFFFF',
              color: isDark ? '#FAF7EE' : 'var(--text-ink)',
              borderColor: isDark ? '#383025' : 'var(--border-ink)'
            }}
            title="Cambiar entre Dark Black y Crema"
          >
            {isDark ? '🌙 Modo Dark Black' : '☀ Modo Crema'}
          </button>

          <div className="admin-user-email">
            {user?.email || 'admin@debatehosting.com'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
            <Link href="/" target="_blank" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              <Icon name="external" size={12} />
              <span>Ver Web</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-dark btn-sm" title="Cerrar sesión">
              <Icon name="logout" size={12} color="#FAF7EE" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="admin-content">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">MÉTRICAS EDITORIALES EN TIEMPO REAL</div>
                <h1>Dashboard de Rendimiento</h1>
              </div>
              <button onClick={loadCurrentData} className="btn btn-secondary btn-sm">
                <Icon name="sliders" size={14} />
                <span>Actualizar Datos</span>
              </button>
            </div>

            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.2rem' }}>
              <div className="metric-card" style={{ borderLeft: '4px solid var(--green-primary)' }}>
                <div className="title">⚡ Clics de Hoy (24h)</div>
                <div className="value" style={{ color: 'var(--green-primary)' }}>{stats?.clicksHoy || 0}</div>
              </div>
              <div className="metric-card" style={{ borderLeft: '4px solid #D97706' }}>
                <div className="title">📅 Últimos 7 Días</div>
                <div className="value">{stats?.clicks7dias || 0}</div>
              </div>
              <div className="metric-card" style={{ borderLeft: '4px solid #2563EB' }}>
                <div className="title">📈 Últimos 30 Días</div>
                <div className="value">{stats?.clicks30dias || 0}</div>
              </div>
              <div className="metric-card" style={{ borderLeft: '4px solid var(--text-ink)' }}>
                <div className="title">🌐 Histórico Total</div>
                <div className="value">{stats?.clicksTotales || 0}</div>
              </div>
            </div>

            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
              <div className="metric-card" style={{ padding: '1rem' }}>
                <div className="title" style={{ fontSize: '0.78rem' }}>🔗 Salidas a Hosting (/go/)</div>
                <div className="value" style={{ fontSize: '1.4rem' }}>{stats?.clicsRedireccion || 0}</div>
              </div>
              <div className="metric-card" style={{ padding: '1rem' }}>
                <div className="title" style={{ fontSize: '0.78rem' }}>🎟️ Copias de Cupón</div>
                <div className="value" style={{ fontSize: '1.4rem' }}>{stats?.clicsCupones || 0}</div>
              </div>
              <div className="metric-card" style={{ padding: '1rem' }}>
                <div className="title" style={{ fontSize: '0.78rem' }}>📬 Suscriptores Newsletter</div>
                <div className="value" style={{ fontSize: '1.4rem' }}>{stats?.suscriptores || 0}</div>
              </div>
              <div className="metric-card" style={{ padding: '1rem' }}>
                <div className="title" style={{ fontSize: '0.78rem' }}>🏷️ Cupones Verificados</div>
                <div className="value" style={{ fontSize: '1.4rem' }}>{stats?.cuponesActivos || 0}</div>
              </div>
            </div>

            {/* Gráfico de barras de tendencia últimos 7 días */}
            <div className="admin-table-card" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem' }}>📊 Actividad Diaria de Clics (Últimos 7 Días)</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total 7 días: <strong>{stats?.clicks7dias || 0}</strong> clics
                </span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  height: '140px',
                  paddingTop: '20px',
                  borderBottom: isDark ? '1px solid #383025' : '1px solid var(--border-ink)'
                }}>
                  {(stats?.clicksDailyTrend || []).map((day) => {
                    const maxTrend = Math.max(
                      ...(stats?.clicksDailyTrend?.map((x) => x.total) || [1]),
                      5
                    );
                    const barHeightPct = Math.max(Math.round((day.total / maxTrend) * 100), 4);
                    return (
                      <div
                        key={day.date}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '0.4rem'
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: day.total > 0 ? (isDark ? 'var(--green-bright)' : 'var(--green-primary)') : 'var(--text-light)'
                        }}>
                          {day.total}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '42px',
                            height: `${barHeightPct}%`,
                            backgroundColor: day.total > 0 ? (isDark ? 'var(--green-bright)' : 'var(--green-primary)') : (isDark ? '#2B251D' : 'rgba(23,20,15,0.08)'),
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.4s ease',
                          }}
                          title={`${day.date}: ${day.total} clics (${day.redirects} enlaces, ${day.coupons} cupones)`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {(stats?.clicksDailyTrend || []).map((day) => (
                    <div key={day.date} style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-table-card" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem' }}>🏆 Top Proveedores por Tráfico de Afiliados</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enlaces Limpios (/go/[slug])
                </span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {(stats?.clicksPorProveedor || []).map((p) => {
                  const maxC = Math.max(
                    ...(stats?.clicksPorProveedor?.map((x) => x.clicks) || [1]),
                    1
                  );
                  const totalC = stats?.clicksTotales || 1;
                  const pct = Math.round((p.clicks / maxC) * 100);
                  const sharePct = Math.round((p.clicks / totalC) * 100);
                  return (
                    <div key={p.id} style={{ marginBottom: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <a
                            href={`/go/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--green-primary)',
                              textDecoration: 'underline',
                              opacity: 0.85
                            }}
                            title="Probar redirección limpia /go/[slug]"
                          >
                            /go/{p.slug}
                          </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sharePct}% del total</span>
                          <span style={{ fontWeight: 700 }}>{p.clicks} clics</span>
                        </div>
                      </div>
                      <div style={{ height: '10px', backgroundColor: isDark ? '#2B251D' : 'rgba(23,20,15,0.08)', border: isDark ? '1px solid #383025' : '1px solid var(--border-ink)', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${Math.max(pct, 2)}%`, backgroundColor: isDark ? 'var(--green-bright)' : 'var(--green-primary)', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-card-header">
                <h3 style={{ fontSize: '1.25rem' }}>Últimos Clics y Conversiones Registradas</h3>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Tipo de Evento</th>
                    <th>Proveedor</th>
                    <th>Cupón Involucrado</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.ultimosEventos || []).map((ev) => (
                    <tr key={ev.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {new Date(ev.createdAt).toLocaleString('es-ES')}
                      </td>
                      <td>
                        <span className={`badge-tag ${ev.type === 'coupon_copy' ? 'badge-hot' : 'badge-green'}`}>
                          {ev.type === 'coupon_copy' ? 'Copia Cupón' : ev.type === 'coupon_link' ? 'Cupón + Enlace' : 'Redirección /go/'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {ev.provider ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{ev.provider.name}</span>
                            {ev.provider.slug && (
                              <a
                                href={`/go/${ev.provider.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.72rem', color: 'var(--green-primary)' }}
                                title="Ver redirección"
                              >
                                ↗
                              </a>
                            )}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ev.coupon?.code || '—'}</td>
                    </tr>
                  ))}
                  {(!stats?.ultimosEventos || stats.ultimosEventos.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Aún no se han registrado eventos de tracking.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PROVEEDORES */}
        {activeTab === 'proveedores' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">CATÁLOGO EDITORIAL</div>
                <h1>Gestión de Proveedores</h1>
              </div>
              <button
                onClick={() => {
                  setEditingProvider(null);
                  setProvForm({
                    name: '',
                    slug: '',
                    logoUrl: '',
                    plan: '',
                    priceFrom: 2.99,
                    priceBefore: 9.99,
                    period: 'mes',
                    categories: ['hosting'],
                    scorePrecio: 8.5,
                    scoreRendimiento: 8.0,
                    scoreSoporte: 8.0,
                    scoreFacilidad: 8.5,
                    uptime: 99.95,
                    affiliateUrl: 'https://',
                    active: true,
                    badge: '',
                    badgeColor: 'green',
                    description: '',
                    pros: '',
                    cons: '',
                    verdict: '',
                    metaTitle: '',
                    metaDescription: '',
                  });
                  setCustomCatInput('');
                  setLogoPreviewError(false);
                  setProvModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Icon name="plus" size={16} color="#fff" />
                <span>Añadir Proveedor</span>
              </button>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-card-header">
                <h3 style={{ fontSize: '1.25rem' }}>Proveedores Registrados ({providers.length})</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Proveedor / Plan</th>
                      <th>Categorías</th>
                      <th>Precio ($)</th>
                      <th>Uptime</th>
                      <th>Clics</th>
                      <th>Activo</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {p.logoUrl ? (
                              <img
                                src={normalizeImageUrl(p.logoUrl)}
                                alt={p.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  objectFit: 'contain',
                                  borderRadius: '4px',
                                  backgroundColor: '#FFFFFF',
                                  padding: '2px',
                                  border: isDark ? '1px solid #383025' : '1px solid rgba(23,20,15,0.15)',
                                  flexShrink: 0,
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '4px',
                                backgroundColor: isDark ? '#1F1B15' : 'rgba(23,20,15,0.06)',
                                color: isDark ? '#46C285' : 'var(--green-primary)',
                                border: isDark ? '1px solid #383025' : '1px solid rgba(23,20,15,0.15)',
                                display: p.logoUrl ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</span>
                                {p.badge && (
                                  <span className={`badge-editorial-pill color-${p.badgeColor || 'green'}`}>
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {p.plan} ({p.slug})
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {(p.categories || []).map((c, i) => (
                              <span key={i} className="badge-tag" style={{ fontSize: '0.68rem' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          ${p.priceFrom.toFixed(2)}/{p.period}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.uptime}%</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.clicks}</td>
                        <td>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={p.active}
                              onChange={async () => {
                                try {
                                  const res = await authFetch(`/api/admin/providers/${p.id}/toggle`, {
                                    method: 'PATCH',
                                  });
                                  const updated = await res.json();
                                  setProviders((prev) =>
                                    prev.map((item) => (item.id === p.id ? { ...item, active: updated.active } : item))
                                  );
                                  toast.success(updated.message);
                                } catch (e) {
                                  toast.error('Error al alternar estado.');
                                }
                              }}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {deleteConfirmId === p.id ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <button
                                onClick={async () => {
                                  try {
                                    await authFetch(`/api/admin/providers/${p.id}`, { method: 'DELETE' });
                                    setProviders((prev) => prev.filter((item) => item.id !== p.id));
                                    setDeleteConfirmId(null);
                                    toast.success('Proveedor eliminado.');
                                  } catch (e) {
                                    toast.error('Error al eliminar.');
                                  }
                                }}
                                className="btn btn-sm"
                                style={{ backgroundColor: 'var(--red-accent)', color: '#fff', padding: '0.2rem 0.5rem' }}
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.5rem' }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  setEditingProvider(p);
                                  setProvForm({
                                    name: p.name,
                                    slug: p.slug,
                                    logoUrl: p.logoUrl || '',
                                    plan: p.plan,
                                    priceFrom: p.priceFrom,
                                    priceBefore: p.priceBefore,
                                    period: p.period || 'mes',
                                    categories: Array.isArray(p.categories) ? p.categories : [p.categories],
                                    scorePrecio: p.scorePrecio,
                                    scoreRendimiento: p.scoreRendimiento,
                                    scoreSoporte: p.scoreSoporte,
                                    scoreFacilidad: p.scoreFacilidad,
                                    uptime: p.uptime,
                                    affiliateUrl: p.affiliateUrl,
                                    active: p.active,
                                    badge: p.badge || '',
                                    badgeColor: p.badgeColor || 'green',
                                    description: p.description || '',
                                    pros: (() => {
                                      try {
                                        const parsed = JSON.parse(p.pros);
                                        return Array.isArray(parsed) ? parsed.join('\n') : (p.pros || '');
                                      } catch (e) {
                                        return p.pros || '';
                                      }
                                    })(),
                                    cons: (() => {
                                      try {
                                        const parsed = JSON.parse(p.cons);
                                        return Array.isArray(parsed) ? parsed.join('\n') : (p.cons || '');
                                      } catch (e) {
                                        return p.cons || '';
                                      }
                                    })(),
                                    verdict: p.verdict || '',
                                    metaTitle: p.metaTitle || '',
                                    metaDescription: p.metaDescription || '',
                                  });
                                  setCustomCatInput('');
                                  setLogoPreviewError(false);
                                  setProvModalOpen(true);
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                <Icon name="edit" size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--red-accent)' }}
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Crear/Editar Proveedor */}
            {provModalOpen && (
              <div className="modal-overlay">
                <div className="modal-dialog">
                  <div className="modal-header">
                    <h3>{editingProvider ? `Editar ${editingProvider.name}` : 'Nuevo Proveedor'}</h3>
                    <button onClick={() => setProvModalOpen(false)}>
                      <Icon name="close" size={20} />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        if (editingProvider) {
                          await authFetch(`/api/admin/providers/${editingProvider.id}`, {
                            method: 'PUT',
                            body: JSON.stringify(provForm),
                          });
                          toast.success('Proveedor actualizado.');
                        } else {
                          await authFetch('/api/admin/providers', {
                            method: 'POST',
                            body: JSON.stringify(provForm),
                          });
                          toast.success('Proveedor añadido.');
                        }
                        setProvModalOpen(false);
                        loadCurrentData();
                      } catch (err) {
                        toast.error(err.message || 'Error al guardar.');
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    {/* Asistente IA Generador de Ficha y SEO */}
                    <div
                      style={{
                        backgroundColor: isDark ? '#1C2E24' : '#E8F5EE',
                        border: `1.5px solid ${isDark ? '#2E5940' : '#86EFAC'}`,
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: isDark ? '#46C285' : '#0E6B41',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Icon name="bot" size={16} />
                          <span>Asistente IA: Generador Editorial & SEO</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: isDark ? '#A3D9BE' : '#1E5839' }}>
                          Ingresa el nombre del proveedor y genera con IA la descripción, pros, contras, veredicto y metadatos SEO.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={aiGenerating || !provForm.name}
                        className="btn btn-primary btn-sm"
                        style={{
                          backgroundColor: '#0E6B41',
                          borderColor: '#0E6B41',
                          opacity: aiGenerating || !provForm.name ? 0.6 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Icon name={aiGenerating ? 'clock' : 'zap'} size={14} color="#fff" />
                        <span>{aiGenerating ? 'Generando contenido...' : '⚡ Generar Ficha y SEO con IA'}</span>
                      </button>
                    </div>

                    {/* Logo / Ícono del Proveedor */}
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.4rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                        Ícono / Logo del Proveedor
                      </label>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        backgroundColor: isDark ? '#1A1713' : '#FAF7EE',
                        border: `1px solid ${isDark ? '#383025' : 'rgba(23,20,15,0.15)'}`,
                        padding: '0.9rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {/* Preview */}
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          border: `1.5px solid ${isDark ? '#383025' : 'var(--border-ink)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                        }}>
                          {provForm.logoUrl && !logoPreviewError ? (
                            <img
                              src={normalizeImageUrl(provForm.logoUrl)}
                              alt="Preview Logo"
                              onError={() => setLogoPreviewError(true)}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                            />
                          ) : (
                            <Icon name="shield" size={24} color={isDark ? '#46C285' : '#0E6B41'} />
                          )}
                        </div>

                        {/* Controles de Subida */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label
                              className="btn btn-secondary btn-sm"
                              style={{
                                cursor: uploadingLogo ? 'wait' : 'pointer',
                                fontSize: '0.76rem',
                                padding: '0.4rem 0.8rem',
                                backgroundColor: isDark ? '#24201B' : '#FFFFFF',
                                color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                                borderColor: isDark ? '#4F4535' : 'var(--border-ink)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <Icon name="download" size={13} />
                              <span>{uploadingLogo ? 'Subiendo imagen...' : 'Subir archivo de imagen'}</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,image/x-icon"
                                onChange={handleLogoUpload}
                                disabled={uploadingLogo}
                                style={{ display: 'none' }}
                              />
                            </label>

                            {provForm.logoUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProvForm({ ...provForm, logoUrl: '' });
                                  setLogoPreviewError(false);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.74rem', padding: '0.4rem 0.6rem', color: 'var(--red-accent)' }}
                                title="Quitar logo"
                              >
                                Quitar
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder="O pega una URL directa de imagen (ej: https://...)"
                            value={provForm.logoUrl || ''}
                            onChange={(e) => {
                              setProvForm({ ...provForm, logoUrl: e.target.value });
                              setLogoPreviewError(false);
                            }}
                            className="input-editorial"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={provForm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const shouldAutoSlug = !editingProvider || !provForm.slug || provForm.slug === slugify(provForm.name);
                            setProvForm((prev) => ({
                              ...prev,
                              name: val,
                              slug: shouldAutoSlug ? slugify(val) : prev.slug,
                            }));
                          }}
                          className="input-editorial"
                          style={{ width: '100%' }}
                          placeholder="Ej: Hostinger"
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                            Slug URL *
                          </label>
                          <button
                            type="button"
                            onClick={() => setProvForm((prev) => ({ ...prev, slug: slugify(prev.name) }))}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.68rem',
                              color: isDark ? '#46C285' : '#0E6B41',
                              fontFamily: 'var(--font-mono)',
                              textDecoration: 'underline',
                              padding: 0,
                            }}
                            title="Regenerar slug automáticamente a partir del nombre"
                          >
                            ⚡ Auto
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={provForm.slug}
                          onChange={(e) => setProvForm({ ...provForm, slug: slugify(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                          placeholder="ej: hostinger"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Plan Destacado *
                      </label>
                      <input
                        type="text"
                        required
                        value={provForm.plan}
                        onChange={(e) => setProvForm({ ...provForm, plan: e.target.value })}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.4rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                        Categorías del Proveedor * (Selecciona las aplicables para los filtros)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                        {(dbCategories.length > 0 ? dbCategories : AVAILABLE_CATEGORIES).map((cat) => {
                          const catId = cat.slug || cat.id;
                          const catLabel = cat.name || cat.label;
                          const isSelected = (provForm.categories || []).includes(catId);
                          return (
                            <button
                              key={catId}
                              type="button"
                              onClick={() => toggleCategory(catId)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: isSelected
                                  ? (isDark ? 'rgba(70, 194, 133, 0.2)' : 'var(--green-soft)')
                                  : (isDark ? '#1A1713' : '#FFFFFF'),
                                color: isSelected
                                  ? (isDark ? 'var(--green-bright)' : 'var(--green-primary)')
                                  : (isDark ? '#FAF7EE' : 'var(--text-ink)'),
                                border: isSelected
                                  ? `1.5px solid ${isDark ? 'var(--green-bright)' : 'var(--green-primary)'}`
                                  : `1px solid ${isDark ? '#383025' : 'rgba(23,20,15,0.2)'}`,
                              }}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{catLabel}</span>
                            </button>
                          );
                        })}

                        {/* Categorías adicionales personalizadas añadidas */}
                        {(provForm.categories || [])
                          .filter((c) => !(dbCategories.length > 0 ? dbCategories : AVAILABLE_CATEGORIES).some((ac) => (ac.slug || ac.id) === c))
                          .map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCategory(c)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                backgroundColor: isDark ? 'rgba(70, 194, 133, 0.2)' : 'var(--green-soft)',
                                color: isDark ? 'var(--green-bright)' : 'var(--green-primary)',
                                border: `1.5px solid ${isDark ? 'var(--green-bright)' : 'var(--green-primary)'}`,
                              }}
                              title="Clic para remover"
                            >
                              <span>✓ {c}</span>
                              <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>✕</span>
                            </button>
                          ))}
                      </div>

                      {/* Campo para añadir otra categoría personalizada */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Añadir otra categoría personalizada..."
                          value={customCatInput}
                          onChange={(e) => setCustomCatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCategory(e);
                            }
                          }}
                          className="input-editorial"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.74rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: isDark ? '#1A1713' : '#FAF7EE',
                            color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                            borderColor: isDark ? '#383025' : 'var(--border-ink)'
                          }}
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>

                    {/* Badge del Proveedor */}
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.4rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                        Badge / Distintivo del Proveedor (Opcional)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setProvForm({ ...provForm, badge: '', badgeColor: 'green' })}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: !provForm.badge ? (isDark ? '#383025' : '#17140F') : 'transparent',
                            color: !provForm.badge ? '#FAF7EE' : (isDark ? '#9E9687' : 'var(--text-muted)'),
                            border: `1px solid ${isDark ? '#4A3E31' : 'rgba(23,20,15,0.2)'}`,
                          }}
                        >
                          {!provForm.badge ? '✓ Sin Badge' : 'Sin Badge'}
                        </button>
                        {dbBadges.map((b) => {
                          const isSelected = provForm.badge === b.label;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setProvForm({ ...provForm, badge: b.label, badgeColor: b.color })}
                              className={`badge-editorial-pill color-${b.color}`}
                              style={{
                                cursor: 'pointer',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.74rem',
                                opacity: isSelected ? 1 : 0.65,
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isSelected ? (isDark ? '0 0 0 2px #FAF7EE' : '0 0 0 2px #17140F') : 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span>{isSelected ? '✓ ' : ''}{b.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Precio Desde ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={provForm.priceFrom}
                          onChange={(e) => setProvForm({ ...provForm, priceFrom: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Precio Antes ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={provForm.priceBefore}
                          onChange={(e) => setProvForm({ ...provForm, priceBefore: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Período
                        </label>
                        <select
                          value={provForm.period}
                          onChange={(e) => setProvForm({ ...provForm, period: e.target.value })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        >
                          <option value="mes">mes</option>
                          <option value="año">año</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Score Precio</label>
                        <input
                          type="number"
                          step="0.1"
                          value={provForm.scorePrecio}
                          onChange={(e) => setProvForm({ ...provForm, scorePrecio: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Rendimiento</label>
                        <input
                          type="number"
                          step="0.1"
                          value={provForm.scoreRendimiento}
                          onChange={(e) => setProvForm({ ...provForm, scoreRendimiento: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Soporte</label>
                        <input
                          type="number"
                          step="0.1"
                          value={provForm.scoreSoporte}
                          onChange={(e) => setProvForm({ ...provForm, scoreSoporte: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Facilidad</label>
                        <input
                          type="number"
                          step="0.1"
                          value={provForm.scoreFacilidad}
                          onChange={(e) => setProvForm({ ...provForm, scoreFacilidad: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Uptime %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={provForm.uptime}
                          onChange={(e) => setProvForm({ ...provForm, uptime: parseFloat(e.target.value) })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>URL Afiliado *</label>
                        <input
                          type="url"
                          required
                          value={provForm.affiliateUrl}
                          onChange={(e) => setProvForm({ ...provForm, affiliateUrl: e.target.value })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* SECCIÓN EDITORIAL: INFORMACIÓN DEL PROVEEDOR */}
                    <div
                      style={{
                        backgroundColor: isDark ? '#1C1914' : '#FAF7EE',
                        border: `1.5px solid ${isDark ? '#383025' : 'var(--border-ink)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon name="server" size={16} color={isDark ? '#46C285' : '#0E6B41'} />
                          <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                            Información Editorial y Ficha Técnica
                          </h4>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            color: isDark ? '#46C285' : '#0E6B41',
                            fontWeight: 700,
                          }}
                        >
                          PÁGINA PÚBLICA (/proveedores/[slug])
                        </span>
                      </div>

                      {/* Descripción de la Empresa */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                            Descripción Completa de la Empresa *
                          </label>
                          <span style={{ fontSize: '0.7rem', color: isDark ? '#9E9687' : 'var(--text-light)' }}>
                            Historia, tecnología, servidores y centro de datos
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={provForm.description}
                          onChange={(e) => setProvForm({ ...provForm, description: e.target.value })}
                          placeholder="Escribe la descripción de la empresa o usa el botón '⚡ Generar con IA' arriba..."
                          className="input-editorial"
                          style={{ width: '100%', resize: 'vertical', lineHeight: 1.5 }}
                        />
                      </div>

                      {/* Pros y Contras en 2 columnas */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: '#16A34A' }}>
                              ✓ Puntos Fuertes (Pros)
                            </label>
                            <span style={{ fontSize: '0.68rem', color: isDark ? '#9E9687' : 'var(--text-light)' }}>
                              1 por línea
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={provForm.pros}
                            onChange={(e) => setProvForm({ ...provForm, pros: e.target.value })}
                            placeholder="Servidores LiteSpeed ultrarrápidos&#10;Soporte 24/7 en español&#10;Discos NVMe de alta velocidad"
                            className="input-editorial"
                            style={{ width: '100%', resize: 'vertical' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: '#DC2626' }}>
                              ⚠️ Aspectos a Considerar (Contras)
                            </label>
                            <span style={{ fontSize: '0.68rem', color: isDark ? '#9E9687' : 'var(--text-light)' }}>
                              1 por línea
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={provForm.cons}
                            onChange={(e) => setProvForm({ ...provForm, cons: e.target.value })}
                            placeholder="Renovación a precio estándar&#10;Límite de buzones en plan básico"
                            className="input-editorial"
                            style={{ width: '100%', resize: 'vertical' }}
                          />
                        </div>
                      </div>

                      {/* Veredicto Editorial */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                            Veredicto Editorial (¿Para quién se recomienda?)
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={provForm.verdict}
                          onChange={(e) => setProvForm({ ...provForm, verdict: e.target.value })}
                          placeholder="Recomendado especialmente para blogs de WordPress, tiendas WooCommerce y proyectos que requieran..."
                          className="input-editorial"
                          style={{ width: '100%', resize: 'vertical', lineHeight: 1.5 }}
                        />
                      </div>
                    </div>

                    {/* SECCIÓN SEO: METADATOS Y BÚSQUEDA */}
                    <div
                      style={{
                        backgroundColor: isDark ? '#1C1914' : '#FAF7EE',
                        border: `1.5px solid ${isDark ? '#383025' : 'var(--border-ink)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon name="globe" size={16} color={isDark ? '#46C285' : '#0E6B41'} />
                          <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                            Optimización SEO para Google
                          </h4>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          GOOGLE SEARCH & SOCIAL CARDS
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                            Meta Título SEO (Title Tag)
                          </label>
                          <span style={{ fontSize: '0.7rem', color: isDark ? '#9E9687' : 'var(--text-light)' }}>
                            {(provForm.metaTitle || '').length}/60 caracteres
                          </span>
                        </div>
                        <input
                          type="text"
                          value={provForm.metaTitle}
                          onChange={(e) => setProvForm({ ...provForm, metaTitle: e.target.value })}
                          placeholder="Ej. Alexhost Hosting: Análisis, Opiniones y Descuentos (2026)"
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                            Meta Descripción SEO (Snippet)
                          </label>
                          <span style={{ fontSize: '0.7rem', color: isDark ? '#9E9687' : 'var(--text-light)' }}>
                            {(provForm.metaDescription || '').length}/160 caracteres
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={provForm.metaDescription}
                          onChange={(e) => setProvForm({ ...provForm, metaDescription: e.target.value })}
                          placeholder="Descripción persuasiva para los resultados de Google..."
                          className="input-editorial"
                          style={{ width: '100%', resize: 'vertical' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setProvModalOpen(false)} className="btn btn-secondary">
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Guardar Proveedor
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">CLASIFICACIÓN Y TAXONOMÍA EDITORIAL</div>
                <h1>Categorías de Proveedor</h1>
              </div>
              <button
                onClick={() => {
                  setEditingCat(null);
                  setCatForm({ name: '', slug: '', icon: 'server', order: dbCategories.length + 1 });
                  setCatModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Icon name="plus" size={16} color="#fff" />
                <span>Añadir Categoría</span>
              </button>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-card-header">
                <h3 style={{ fontSize: '1.25rem' }}>Categorías Activas ({dbCategories.length})</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Slug Identificador</th>
                      <th>Ícono</th>
                      <th>Proveedores</th>
                      <th>Orden</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              backgroundColor: isDark ? '#1F1B15' : 'var(--green-tint)',
                              border: `1px solid ${isDark ? '#383025' : 'rgba(14, 107, 65, 0.2)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Icon name={cat.icon || 'server'} size={16} color={isDark ? '#46C285' : '#0E6B41'} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</span>
                          </div>
                        </td>
                        <td>
                          <code style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            backgroundColor: isDark ? '#1F1B15' : 'rgba(23,20,15,0.06)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '3px',
                            border: `1px solid ${isDark ? '#383025' : 'rgba(23,20,15,0.1)'}`,
                          }}>
                            {cat.slug}
                          </code>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {cat.icon || 'server'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: cat.providersCount > 0 ? (isDark ? '#46C285' : 'var(--green-primary)') : 'var(--text-muted)'
                          }}>
                            {cat.providersCount || 0} proveedores
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{cat.order}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => {
                                setEditingCat(cat);
                                setCatForm({
                                  name: cat.name,
                                  slug: cat.slug,
                                  icon: cat.icon || 'server',
                                  order: cat.order || 0,
                                });
                                setCatModalOpen(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              title="Editar categoría"
                            >
                              <Icon name="edit" size={13} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
                                  try {
                                    await authFetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
                                    setDbCategories((prev) => prev.filter((c) => c.id !== cat.id));
                                    toast.success('Categoría eliminada.');
                                  } catch (e) {
                                    toast.error('Error al eliminar categoría.');
                                  }
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--red-accent)' }}
                              title="Eliminar categoría"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Crear/Editar Categoría */}
            {catModalOpen && (
              <div className="modal-overlay">
                <div className="modal-dialog" style={{ maxWidth: '480px' }}>
                  <div className="modal-header">
                    <h3>{editingCat ? `Editar Categoría: ${editingCat.name}` : 'Nueva Categoría'}</h3>
                    <button onClick={() => setCatModalOpen(false)}>
                      <Icon name="close" size={20} />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        if (editingCat) {
                          await authFetch(`/api/admin/categories/${editingCat.id}`, {
                            method: 'PUT',
                            body: JSON.stringify(catForm),
                          });
                          toast.success('Categoría actualizada.');
                        } else {
                          await authFetch('/api/admin/categories', {
                            method: 'POST',
                            body: JSON.stringify(catForm),
                          });
                          toast.success('Categoría añadida.');
                        }
                        setCatModalOpen(false);
                        const res = await authFetch('/api/admin/categories');
                        setDbCategories((await res.json()) || []);
                      } catch (err) {
                        toast.error(err.message || 'Error al guardar categoría.');
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Nombre Visible * (ej: Servidores Cloud)
                      </label>
                      <input
                        type="text"
                        required
                        value={catForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const autoSlug = !editingCat ? slugify(val) : catForm.slug;
                          setCatForm({ ...catForm, name: val, slug: autoSlug });
                        }}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Slug Identificador * (ej: cloud, vps, hosting)
                      </label>
                      <input
                        type="text"
                        required
                        value={catForm.slug}
                        onChange={(e) => setCatForm({ ...catForm, slug: slugify(e.target.value) })}
                        className="input-editorial"
                        style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Ícono
                        </label>
                        <select
                          value={catForm.icon}
                          onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        >
                          <option value="server">Servidor (server)</option>
                          <option value="ticket">Ticket / Descuento (ticket)</option>
                          <option value="shield">Seguridad / Escudo (shield)</option>
                          <option value="scale">Balanza (scale)</option>
                          <option value="trophy">Trofeo (trophy)</option>
                          <option value="flame">Fuego / Hot (flame)</option>
                          <option value="sliders">Filtros (sliders)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Orden
                        </label>
                        <input
                          type="number"
                          value={catForm.order}
                          onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value, 10) || 0 })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setCatModalOpen(false)} className="btn btn-secondary">
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Guardar Categoría
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: BADGES */}
        {activeTab === 'badges' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">DISTINTIVOS E INSIGNIAS DE PROVEEDOR</div>
                <h1>Gestión de Badges</h1>
              </div>
              <button
                onClick={() => {
                  setEditingBadge(null);
                  setBadgeForm({ label: '', slug: '', color: 'green', order: dbBadges.length + 1 });
                  setBadgeModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Icon name="plus" size={16} color="#fff" />
                <span>Añadir Badge</span>
              </button>
            </div>

            {/* Vitrina de Badges en Vivo */}
            <div style={{
              backgroundColor: isDark ? '#14120F' : 'var(--bg-surface)',
              border: `var(--border-width) solid ${isDark ? '#383025' : 'var(--border-ink)'}`,
              boxShadow: 'var(--shadow-solid)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Previsualización en tiempo real de distintivos disponibles:
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {dbBadges.map((b) => (
                  <span key={b.id} className={`badge-editorial-pill color-${b.color}`}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-card-header">
                <h3 style={{ fontSize: '1.25rem' }}>Badges Registrados ({dbBadges.length})</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Insignia Visual</th>
                      <th>Etiqueta / Texto</th>
                      <th>Identificador Slug</th>
                      <th>Tema Cromático</th>
                      <th>Proveedores</th>
                      <th>Orden</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbBadges.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span className={`badge-editorial-pill color-${b.color}`}>
                            {b.label}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.label}</td>
                        <td>
                          <code style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            backgroundColor: isDark ? '#1F1B15' : 'rgba(23,20,15,0.06)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '3px',
                            border: `1px solid ${isDark ? '#383025' : 'rgba(23,20,15,0.1)'}`,
                          }}>
                            {b.slug}
                          </code>
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            textTransform: 'capitalize',
                          }}>
                            {b.color === 'green' ? '🟢 Verde Editorial' : b.color === 'red' ? '🔴 Rojo Hot' : b.color === 'gold' ? '🟡 Dorado Podio' : '⚫ Negro Tinta'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: b.providersCount > 0 ? (isDark ? '#46C285' : 'var(--green-primary)') : 'var(--text-muted)'
                          }}>
                            {b.providersCount || 0} proveedores
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{b.order}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => {
                                setEditingBadge(b);
                                setBadgeForm({
                                  label: b.label,
                                  slug: b.slug,
                                  color: b.color || 'green',
                                  order: b.order || 0,
                                });
                                setBadgeModalOpen(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              title="Editar badge"
                            >
                              <Icon name="edit" size={13} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`¿Eliminar el badge "${b.label}"?`)) {
                                  try {
                                    await authFetch(`/api/admin/badges/${b.id}`, { method: 'DELETE' });
                                    setDbBadges((prev) => prev.filter((item) => item.id !== b.id));
                                    toast.success('Badge eliminado.');
                                  } catch (e) {
                                    toast.error('Error al eliminar badge.');
                                  }
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--red-accent)' }}
                              title="Eliminar badge"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Crear/Editar Badge */}
            {badgeModalOpen && (
              <div className="modal-overlay">
                <div className="modal-dialog" style={{ maxWidth: '480px' }}>
                  <div className="modal-header">
                    <h3>{editingBadge ? `Editar Badge: ${editingBadge.label}` : 'Nuevo Badge'}</h3>
                    <button onClick={() => setBadgeModalOpen(false)}>
                      <Icon name="close" size={20} />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        if (editingBadge) {
                          await authFetch(`/api/admin/badges/${editingBadge.id}`, {
                            method: 'PUT',
                            body: JSON.stringify(badgeForm),
                          });
                          toast.success('Badge actualizado.');
                        } else {
                          await authFetch('/api/admin/badges', {
                            method: 'POST',
                            body: JSON.stringify(badgeForm),
                          });
                          toast.success('Badge añadido.');
                        }
                        setBadgeModalOpen(false);
                        const res = await authFetch('/api/admin/badges');
                        setDbBadges((await res.json()) || []);
                      } catch (err) {
                        toast.error(err.message || 'Error al guardar badge.');
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Texto de la Insignia * (ej: MEJOR PRECIO, HOT, RECOMENDADO)
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeForm.label}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          const autoSlug = !editingBadge ? slugify(val) : badgeForm.slug;
                          setBadgeForm({ ...badgeForm, label: val, slug: autoSlug });
                        }}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Slug Identificador * (ej: mejor-precio, hot, vps-top)
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeForm.slug}
                        onChange={(e) => setBadgeForm({ ...badgeForm, slug: slugify(e.target.value) })}
                        className="input-editorial"
                        style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Estilo / Tema Cromático
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {[
                          { id: 'green', label: 'Verde Editorial', class: 'color-green' },
                          { id: 'red', label: 'Rojo Hot', class: 'color-red' },
                          { id: 'gold', label: 'Dorado Podio', class: 'color-gold' },
                          { id: 'dark', label: 'Negro Tinta', class: 'color-dark' },
                        ].map((theme) => {
                          const isSelected = badgeForm.color === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setBadgeForm({ ...badgeForm, color: theme.id })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: isSelected ? (isDark ? '2px solid #46C285' : '2px solid var(--green-primary)') : `1px solid ${isDark ? '#383025' : 'rgba(23,20,15,0.2)'}`,
                                backgroundColor: isDark ? '#1F1B15' : '#FFFFFF',
                                color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              <span className={`badge-editorial-pill ${theme.class}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>Aa</span>
                              <span>{theme.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Previsualización */}
                    <div style={{
                      backgroundColor: isDark ? '#1F1B15' : 'var(--bg-surface)',
                      border: `1px dashed ${isDark ? '#383025' : 'rgba(23,20,15,0.2)'}`,
                      padding: '0.8rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vista previa:</span>
                      <span className={`badge-editorial-pill color-${badgeForm.color}`}>
                        {badgeForm.label || 'VISTA PREVIA'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setBadgeModalOpen(false)} className="btn btn-secondary">
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Guardar Badge
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUPONES */}
        {activeTab === 'cupones' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">DESCUENTOS Y PROMOCIONES</div>
                <h1>Gestión de Cupones</h1>
              </div>
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setCouponForm({
                    code: '',
                    discount: '−10% extra',
                    condition: 'Válido para nuevas contrataciones',
                    providerId: providers[0]?.id || '',
                    expiresAt: '',
                    verified: true,
                  });
                  setCouponModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Icon name="plus" size={16} color="#fff" />
                <span>Añadir Cupón</span>
              </button>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-card-header">
                <h3 style={{ fontSize: '1.25rem' }}>Códigos Registrados ({coupons.length})</h3>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Proveedor</th>
                    <th>Descuento</th>
                    <th>Caducidad</th>
                    <th>Estado</th>
                    <th>Clics</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, backgroundColor: isDark ? '#1F1B15' : '#fff', color: isDark ? '#FAF7EE' : 'var(--text-ink)', border: isDark ? '1px solid #383025' : '1px solid #17140F', padding: '0.2rem 0.5rem' }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.provider?.name || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-primary)', fontWeight: 700 }}>
                        {c.discount}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-ES') : 'Permanente'}
                      </td>
                      <td>
                        {c.verified ? (
                          <span className="badge-tag badge-green">✓ Verificado</span>
                        ) : (
                          <span className="badge-tag">No verificado</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.clicks}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={async () => {
                            try {
                              await authFetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
                              setCoupons((prev) => prev.filter((item) => item.id !== c.id));
                              toast.success('Cupón eliminado.');
                            } catch (e) {
                              toast.error('Error al eliminar cupón.');
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--red-accent)' }}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Crear Cupón */}
            {couponModalOpen && (
              <div className="modal-overlay">
                <div className="modal-dialog">
                  <div className="modal-header">
                    <h3>Nuevo Cupón</h3>
                    <button onClick={() => setCouponModalOpen(false)}>
                      <Icon name="close" size={20} />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await authFetch('/api/admin/coupons', {
                          method: 'POST',
                          body: JSON.stringify(couponForm),
                        });
                        toast.success('Cupón creado.');
                        setCouponModalOpen(false);
                        loadCurrentData();
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Proveedor *
                      </label>
                      <select
                        required
                        value={couponForm.providerId}
                        onChange={(e) => setCouponForm({ ...couponForm, providerId: e.target.value })}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      >
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Código *
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          Descuento *
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.discount}
                          onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                          className="input-editorial"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Condición
                      </label>
                      <input
                        type="text"
                        value={couponForm.condition}
                        onChange={(e) => setCouponForm({ ...couponForm, condition: e.target.value })}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setCouponModalOpen(false)} className="btn btn-secondary">
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Guardar Cupón
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ELEGIDOS */}
        {activeTab === 'elegidos' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">PODIO EDITORIAL</div>
                <h1>Gestión de Los Elegidos (El Podio)</h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Selecciona y asigna manualmente qué proveedor ocupa cada puesto del podio en la portada web.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewPickForm({
                    providerId: providers[0]?.id || '',
                    tag: 'Selección Editorial',
                    titulo: providers[0] ? `${providers[0].name}: Rendimiento Comprobado` : '',
                    veredicto: '',
                  });
                  setIsAddingPick(true);
                }}
                className="btn btn-primary"
              >
                <Icon name="plus" size={16} />
                <span>Asignar Nuevo Puesto</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {picks.map((pick, idx) => {
                const isEditing = editingPickId === pick.id;
                const prov = pick.provider;
                const selectedEditProv = providers.find((p) => p.id === pickForm.providerId) || prov;

                const getPositionBadge = (i) => {
                  if (i === 0) {
                    return (
                      <span className="badge-tag badge-green" style={{ fontSize: '0.75rem' }}>
                        🏆 Puesto 01 — Líder del Podio (Centro Elevado)
                      </span>
                    );
                  }
                  if (i === 1) {
                    return (
                      <span
                        className="badge-tag"
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(37, 99, 235, 0.1)',
                          color: '#2563eb',
                          borderColor: '#2563eb',
                        }}
                      >
                        🥈 Puesto 02 — Columna Izquierda
                      </span>
                    );
                  }
                  if (i === 2) {
                    return (
                      <span
                        className="badge-tag"
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(217, 119, 6, 0.1)',
                          color: '#d97706',
                          borderColor: '#d97706',
                        }}
                      >
                        🥉 Puesto 03 — Columna Derecha
                      </span>
                    );
                  }
                  return (
                    <span
                      className="badge-tag"
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(107, 101, 93, 0.1)',
                        color: 'var(--text-muted)',
                        borderColor: 'var(--border-ink)',
                      }}
                    >
                      🎖️ Puesto 0{i + 1} — Mención de Honor
                    </span>
                  );
                };

                return (
                  <div
                    key={pick.id}
                    className="admin-table-card"
                    style={{
                      borderLeft:
                        idx === 0
                          ? '6px solid var(--green-primary)'
                          : isDark
                          ? '1.5px solid #2B251D'
                          : 'var(--border-width) solid var(--border-ink)',
                    }}
                  >
                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                      {/* Controles de orden */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                        <button
                          disabled={idx === 0}
                          onClick={async () => {
                            const newPicks = [...picks];
                            const [moved] = newPicks.splice(idx, 1);
                            newPicks.splice(idx - 1, 0, moved);
                            setPicks(newPicks);
                            await authFetch('/api/admin/picks-reorder', {
                              method: 'PUT',
                              body: JSON.stringify({ orderedIds: newPicks.map((x) => x.id) }),
                            });
                            toast.success('Orden actualizado.');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', opacity: idx === 0 ? 0.3 : 1 }}
                          title="Subir posición"
                        >
                          <Icon name="chevronUp" size={14} />
                        </button>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 800 }}>
                          0{idx + 1}
                        </span>
                        <button
                          disabled={idx === picks.length - 1}
                          onClick={async () => {
                            const newPicks = [...picks];
                            const [moved] = newPicks.splice(idx, 1);
                            newPicks.splice(idx + 1, 0, moved);
                            setPicks(newPicks);
                            await authFetch('/api/admin/picks-reorder', {
                              method: 'PUT',
                              body: JSON.stringify({ orderedIds: newPicks.map((x) => x.id) }),
                            });
                            toast.success('Orden actualizado.');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', opacity: idx === picks.length - 1 ? 0.3 : 1 }}
                          title="Bajar posición"
                        >
                          <Icon name="chevronDown" size={14} />
                        </button>
                      </div>

                      {/* Contenido del Pick */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 800 }}>
                            {prov?.name || 'Sin Proveedor Asignado'}
                          </span>
                          {getPositionBadge(idx)}
                          {prov && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Plan: {prov.plan} • ${prov.priceFrom?.toFixed(2)}/{prov.period}
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem',
                              marginTop: '0.8rem',
                              background: isDark ? 'rgba(255,255,255,0.02)' : 'var(--bg-paper)',
                              padding: '1.25rem',
                              border: '1.5px solid var(--border-ink)',
                              borderRadius: '4px',
                            }}
                          >
                            {/* Selector Manual de Proveedor */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="label-editorial" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                Proveedor Asignado a esta posición *
                              </label>
                              <select
                                value={pickForm.providerId}
                                onChange={(e) => {
                                  const pId = e.target.value;
                                  const chosen = providers.find((p) => p.id === pId);
                                  setPickForm({
                                    ...pickForm,
                                    providerId: pId,
                                    titulo: chosen ? `${chosen.name}: ${chosen.plan || 'Selección Editorial'}` : pickForm.titulo,
                                  });
                                }}
                                className="input-editorial"
                                style={{ width: '100%', fontWeight: 600 }}
                              >
                                <option value="">-- Selecciona un Proveedor Registrado --</option>
                                {providers.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.plan} — ${p.priceFrom?.toFixed(2)}/{p.period})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Preview del proveedor seleccionado */}
                            {selectedEditProv && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1rem',
                                  padding: '0.6rem 0.8rem',
                                  background: isDark ? '#1a1815' : '#ffffff',
                                  border: '1px dashed var(--border-ink)',
                                  borderRadius: '4px',
                                }}
                              >
                                {selectedEditProv.logoUrl ? (
                                  <img
                                    src={normalizeImageUrl(selectedEditProv.logoUrl)}
                                    alt={selectedEditProv.name}
                                    style={{ maxHeight: '30px', maxWidth: '90px', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--green-primary)' }}>
                                    ● {selectedEditProv.name}
                                  </span>
                                )}
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                  <strong>{selectedEditProv.name}</strong> • ${selectedEditProv.priceFrom?.toFixed(2)}/{selectedEditProv.period} • Uptime: {selectedEditProv.uptime}%
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="label-editorial" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                  Distintivo / Tag *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Mejor calidad-precio"
                                  value={pickForm.tag}
                                  onChange={(e) => setPickForm({ ...pickForm, tag: e.target.value })}
                                  className="input-editorial"
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="label-editorial" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                  Título Editorial *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Hostinger: El equilibrio imbatible"
                                  value={pickForm.titulo}
                                  onChange={(e) => setPickForm({ ...pickForm, titulo: e.target.value })}
                                  className="input-editorial"
                                  style={{ width: '100%' }}
                                />
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="label-editorial" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                Veredicto Técnico (Texto con checkmark en la tarjeta pública) *
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Ej: Almacenamiento NVMe, soporte 24/7 en español y panel intuitivo..."
                                value={pickForm.veredicto}
                                onChange={(e) => setPickForm({ ...pickForm, veredicto: e.target.value })}
                                className="input-editorial"
                                style={{ width: '100%' }}
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.3rem' }}>
                              <button
                                onClick={async () => {
                                  if (!pickForm.providerId) {
                                    toast.error('Debes seleccionar un proveedor.');
                                    return;
                                  }
                                  const res = await authFetch(`/api/admin/picks/${pick.id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify(pickForm),
                                  });
                                  if (res && !res.error) {
                                    setPicks((prev) =>
                                      prev.map((item) => (item.id === pick.id ? res : item))
                                    );
                                    setEditingPickId(null);
                                    toast.success('Puesto del podio actualizado.');
                                  } else {
                                    toast.error(res?.error || 'Error al actualizar.');
                                  }
                                }}
                                className="btn btn-primary btn-sm"
                              >
                                Guardar Cambios
                              </button>
                              <button
                                onClick={() => setEditingPickId(null)}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                              <span className="badge-tag badge-green" style={{ margin: 0 }}>
                                {pick.tag}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.3rem', color: 'var(--text-ink)' }}>
                              {pick.titulo}
                            </h4>
                            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.45 }}>
                              "{pick.veredicto}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción */}
                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                          <button
                            onClick={() => {
                              setEditingPickId(pick.id);
                              setPickForm({
                                providerId: pick.providerId || pick.provider?.id || '',
                                tag: pick.tag,
                                titulo: pick.titulo,
                                veredicto: pick.veredicto,
                              });
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Cambiar proveedor o veredicto"
                          >
                            <Icon name="edit" size={13} />
                            <span>Editar</span>
                          </button>
                          {picks.length > 3 && (
                            <button
                              onClick={async () => {
                                if (!confirm(`¿Eliminar la posición ${idx + 1} (${prov?.name}) del podio?`)) return;
                                const res = await authFetch(`/api/admin/picks/${pick.id}`, { method: 'DELETE' });
                                if (res && !res.error) {
                                  setPicks((prev) => prev.filter((p) => p.id !== pick.id));
                                  toast.success('Posición eliminada del podio.');
                                } else {
                                  toast.error(res?.error || 'Error al eliminar.');
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#ef4444' }}
                              title="Eliminar posición"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal para Asignar Nuevo Proveedor al Podio */}
            {isAddingPick && (
              <div className="modal-overlay">
                <div className="modal-dialog" style={{ maxWidth: '560px' }}>
                  <div className="modal-header">
                    <h2>Asignar Proveedor al Podio</h2>
                    <button
                      onClick={() => setIsAddingPick(false)}
                      className="modal-close-btn"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                  <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="label-editorial">Seleccionar Proveedor *</label>
                      <select
                        value={newPickForm.providerId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const chosen = providers.find((p) => p.id === pId);
                          setNewPickForm({
                            ...newPickForm,
                            providerId: pId,
                            titulo: chosen ? `${chosen.name}: ${chosen.plan || 'Selección Editorial'}` : newPickForm.titulo,
                          });
                        }}
                        className="input-editorial"
                        style={{ width: '100%', fontWeight: 600 }}
                      >
                        <option value="">-- Elige un Proveedor --</option>
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.plan} — ${p.priceFrom?.toFixed(2)}/{p.period})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label-editorial">Distintivo / Tag Editorial *</label>
                      <input
                        type="text"
                        placeholder="Ej: Mejor opción para proyectos grandes"
                        value={newPickForm.tag}
                        onChange={(e) => setNewPickForm({ ...newPickForm, tag: e.target.value })}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="label-editorial">Título Editorial *</label>
                      <input
                        type="text"
                        placeholder="Ej: Contabo: Potencia bruta desmedida"
                        value={newPickForm.titulo}
                        onChange={(e) => setNewPickForm({ ...newPickForm, titulo: e.target.value })}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="label-editorial">Veredicto Técnico (Texto en tarjeta) *</label>
                      <textarea
                        rows={3}
                        placeholder="Ej: Rendimiento extremo con 4 vCPU y 8 GB RAM a precio imbatible..."
                        value={newPickForm.veredicto}
                        onChange={(e) => setNewPickForm({ ...newPickForm, veredicto: e.target.value })}
                        className="input-editorial"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                    <button
                      onClick={() => setIsAddingPick(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (!newPickForm.providerId || !newPickForm.tag || !newPickForm.titulo || !newPickForm.veredicto) {
                          toast.error('Completa todos los campos obligatorios.');
                          return;
                        }
                        const res = await authFetch('/api/admin/picks', {
                          method: 'POST',
                          body: JSON.stringify(newPickForm),
                        });
                        if (res && !res.error) {
                          setPicks((prev) => [...prev, res]);
                          setIsAddingPick(false);
                          toast.success('Proveedor añadido al podio con éxito.');
                        } else {
                          toast.error(res?.error || 'Error al añadir al podio.');
                        }
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Guardar y Asignar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TICKER */}
        {activeTab === 'ticker' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">MARQUESINA SUPERIOR</div>
                <h1>Gestión de Titulares</h1>
              </div>
            </div>

            <div className="admin-table-card" style={{ marginBottom: '2rem' }}>
              <div className="admin-table-card-header">
                <h3 style={{ fontSize: '1.2rem' }}>Publicar Nuevo Titular</h3>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newTickerText.trim()) return;
                  await authFetch('/api/admin/ticker', {
                    method: 'POST',
                    body: JSON.stringify({ text: newTickerText, hot: newTickerHot }),
                  });
                  setNewTickerText('');
                  setNewTickerHot(false);
                  toast.success('Titular añadido.');
                  loadCurrentData();
                }}
                style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
              >
                <input
                  type="text"
                  required
                  placeholder="Ej: SiteGround lanza nuevos servidores..."
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  className="input-editorial"
                  style={{ flex: 1 }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <input
                    type="checkbox"
                    checked={newTickerHot}
                    onChange={(e) => setNewTickerHot(e.target.checked)}
                  />
                  <span style={{ color: 'var(--red-accent)', fontWeight: 700 }}>Marcar HOT</span>
                </label>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Icon name="plus" size={14} color="#fff" />
                  <span>Publicar</span>
                </button>
              </form>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Texto</th>
                    <th>Etiqueta</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {tickerItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                      <td>{item.text}</td>
                      <td>
                        <button
                          onClick={async () => {
                            await authFetch(`/api/admin/ticker/${item.id}`, {
                              method: 'PUT',
                              body: JSON.stringify({ hot: !item.hot }),
                            });
                            setTickerItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, hot: !it.hot } : it))
                            );
                            toast.success('Estado HOT modificado.');
                          }}
                          className={`badge-tag ${item.hot ? 'badge-hot' : ''}`}
                        >
                          {item.hot ? '🔥 HOT' : 'Normal'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={async () => {
                            await authFetch(`/api/admin/ticker/${item.id}`, { method: 'DELETE' });
                            setTickerItems((prev) => prev.filter((it) => it.id !== item.id));
                            toast.success('Titular borrado.');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--red-accent)' }}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SUSCRIPTORES */}
        {activeTab === 'suscriptores' && (
          <div>
            <div className="admin-topbar">
              <div>
                <div className="kicker">AUDIENCIA Y NEWSLETTER</div>
                <h1>Lista de Suscriptores</h1>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await authFetch('/api/admin/subscribers?format=csv');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `suscriptores_debatehosting_${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    toast.success('CSV descargado con éxito.');
                  } catch (e) {
                    toast.error('Error al exportar.');
                  }
                }}
                className="btn btn-primary"
              >
                <Icon name="download" size={16} color="#fff" />
                <span>Exportar CSV</span>
              </button>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Fecha</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{sub.email}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {new Date(sub.createdAt).toLocaleString('es-ES')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={async () => {
                            await authFetch(`/api/admin/subscribers/${sub.id}`, { method: 'DELETE' });
                            setSubscribers((prev) => prev.filter((it) => it.id !== sub.id));
                            toast.success('Suscriptor eliminado.');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--red-accent)' }}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay suscriptores aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CONFIGURACIÓN / SETTINGS */}
        {activeTab === 'settings' && (
          <div className="settings-container">
            <div className="admin-topbar" style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#1C1813' : '#F0ECE1',
                  border: '1.5px solid ' + (isDark ? '#2B251D' : 'rgba(23, 20, 15, 0.15)'),
                  color: isDark ? '#46C285' : '#0E6B41',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name="globe" size={24} color={isDark ? '#46C285' : '#0E6B41'} />
                </div>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.55rem', margin: 0, color: isDark ? '#FAF7EE' : 'var(--text-ink)' }}>
                    Identidad de Marca, Logo & SEO
                  </h1>
                  <p style={{ color: isDark ? '#9E9687' : 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem', margin: 0 }}>
                    Personaliza la marca, formato del logo (Texto + Ícono o Imagen), posicionamiento en buscadores y redes sociales.
                  </p>
                </div>
              </div>
            </div>

            {/* Subnavegación de Ajustes con persistencia */}
            <div className="settings-subnav">
              <button
                onClick={() => handleSettingsSubtabChange('general')}
                className={`settings-subnav-btn ${settingsSubtab === 'general' ? 'active' : ''}`}
              >
                <Icon name="sparkles" size={14} />
                <span>Identidad de Marca & Logo</span>
              </button>

              <button
                onClick={() => handleSettingsSubtabChange('seo')}
                className={`settings-subnav-btn ${settingsSubtab === 'seo' ? 'active' : ''}`}
              >
                <Icon name="external" size={14} />
                <span>SEO & Indexación</span>
              </button>

              <button
                onClick={() => handleSettingsSubtabChange('afiliacion')}
                className={`settings-subnav-btn ${settingsSubtab === 'afiliacion' ? 'active' : ''}`}
              >
                <Icon name="shield" size={14} />
                <span>Afiliación & Ética</span>
              </button>

              <button
                onClick={() => handleSettingsSubtabChange('seguridad')}
                className={`settings-subnav-btn ${settingsSubtab === 'seguridad' ? 'active' : ''}`}
              >
                <Icon name="lock" size={14} />
                <span>Cuenta & Seguridad</span>
              </button>

              <button
                onClick={() => handleSettingsSubtabChange('sistema')}
                className={`settings-subnav-btn ${settingsSubtab === 'sistema' ? 'active' : ''}`}
              >
                <Icon name="server" size={14} />
                <span>Motor & Base de Datos</span>
              </button>
            </div>

            {/* 1. GENERAL & EDITORIAL */}
            {settingsSubtab === 'general' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 className="settings-card-title">Parámetros Editoriales</h2>
                    <p className="settings-card-desc">
                      Identidad pública de Debatehosting, denominación editorial y formato de precios.
                    </p>
                  </div>
                  <span className="settings-pill-status">
                    <Icon name="checkCircle" size={13} />
                    Activo
                  </span>
                </div>

                <div className="settings-grid-2">
                  <div className="settings-field">
                    <label className="settings-label">Nombre del Medio / Publicación</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={settingsData.siteName || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, siteName: e.target.value })}
                      placeholder="Debatehosting"
                    />
                    <span className="settings-hint">Utilizado en títulos, marcas de agua y esquemas OpenGraph.</span>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">URL Canónica Oficial</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={settingsData.siteUrl || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, siteUrl: e.target.value })}
                      placeholder="https://debatehosting.com"
                    />
                    <span className="settings-hint">Dominio raíz para generación de sitemap y canonical links.</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Eslogan / Subtítulo Institucional</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settingsData.siteTagline || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, siteTagline: e.target.value })}
                    placeholder="El Gran Observatorio de Hosting, VPS y Cupones"
                  />
                  <span className="settings-hint">Aparece en el encabezado principal y pie de imprenta.</span>
                </div>

                <div className="settings-grid-2">
                  <div className="settings-field">
                    <label className="settings-label">Email de Contacto de Redacción</label>
                    <input
                      type="email"
                      className="settings-input"
                      value={settingsData.contactEmail || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
                      placeholder="redaccion@debatehosting.com"
                    />
                    <span className="settings-hint">Dirección para comunicaciones institucionales y prensa.</span>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">Símbolo de Moneda Oficial</label>
                    <select
                      className="settings-select"
                      value={settingsData.currency || '$'}
                      onChange={(e) => setSettingsData({ ...settingsData, currency: e.target.value })}
                    >
                      <option value="$">$ (Dólar estadounidense - USD)</option>
                      <option value="€">€ (Euro - EUR)</option>
                    </select>
                    <span className="settings-hint">Moneda por defecto mostrada en comparadores y podio.</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Compromiso de Independencia Editorial</label>
                  <textarea
                    rows={3}
                    className="settings-textarea"
                    value={settingsData.editorialIndependenceText || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, editorialIndependenceText: e.target.value })}
                    placeholder="Medición real de latencia TTFB, uptime y relación calidad-precio sin tapujos."
                  />
                </div>

                {/* ==========================================================================
                    SECCIÓN: FORMATO Y PRESENTACIÓN DEL LOGO (MODELO SEGÚN REFERENCIA)
                    ========================================================================== */}
                <div style={{ borderTop: '1px solid ' + (isDark ? '#241F18' : 'rgba(23, 20, 15, 0.1)'), paddingTop: '1.6rem', marginTop: '0.6rem' }}>
                  
                  {/* Encabezado: 1. FORMATO Y PRESENTACIÓN DEL LOGO */}
                  <div className="brand-section-header">
                    <Icon name="sparkles" size={17} color={isDark ? '#46C285' : '#0E6B41'} />
                    <span>1. Formato y Presentación del Logo</span>
                  </div>

                  {/* Tarjetas de Selección de Formato (3 Columnas) */}
                  <div className="brand-format-grid">
                    {/* Opción 1: Texto + Ícono */}
                    <div
                      className={`brand-format-card ${(!settingsData.logoType || settingsData.logoType === 'icon_text') ? 'active' : ''}`}
                      onClick={() => setSettingsData({ ...settingsData, logoType: 'icon_text' })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: settingsData.logoColor || '#0E6B41',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon name={settingsData.logoIcon || 'rocket'} size={18} color="#FFFFFF" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: isDark ? '#FAF7EE' : 'var(--text-ink)' }}>
                          Texto + Ícono
                        </h4>
                      </div>

                      {(!settingsData.logoType || settingsData.logoType === 'icon_text') && (
                        <div className="brand-format-check">
                          <Icon name="check" size={13} color="#FFFFFF" />
                        </div>
                      )}

                      <p style={{ margin: 0, fontSize: '0.8rem', color: isDark ? '#9E9687' : 'var(--text-muted)', lineHeight: 1.45 }}>
                        Ícono dinámico + nombre con sufijo resaltado. Moderno y personalizable.
                      </p>

                      <span className="brand-badge-rec">Recomendado</span>
                    </div>

                    {/* Opción 2: Logo en Imagen */}
                    <div
                      className={`brand-format-card ${settingsData.logoType === 'image' ? 'active' : ''}`}
                      onClick={() => setSettingsData({ ...settingsData, logoType: 'image' })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? '#1C1914' : '#F0ECE1',
                          color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon name="image" size={18} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: isDark ? '#FAF7EE' : 'var(--text-ink)' }}>
                          Logo en Imagen
                        </h4>
                      </div>

                      {settingsData.logoType === 'image' && (
                        <div className="brand-format-check">
                          <Icon name="check" size={13} color="#FFFFFF" />
                        </div>
                      )}

                      <p style={{ margin: 0, fontSize: '0.8rem', color: isDark ? '#9E9687' : 'var(--text-muted)', lineHeight: 1.45 }}>
                        Carga tu logotipo vectorizado en formato SVG, PNG o WebP desde una URL o archivo.
                      </p>
                    </div>

                    {/* Opción 3: Solo Texto */}
                    <div
                      className={`brand-format-card ${settingsData.logoType === 'text' ? 'active' : ''}`}
                      onClick={() => setSettingsData({ ...settingsData, logoType: 'text' })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? '#1C1914' : '#F0ECE1',
                          color: isDark ? '#FAF7EE' : 'var(--text-ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon name="type" size={18} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: isDark ? '#FAF7EE' : 'var(--text-ink)' }}>
                          Solo Texto
                        </h4>
                      </div>

                      {settingsData.logoType === 'text' && (
                        <div className="brand-format-check">
                          <Icon name="check" size={13} color="#FFFFFF" />
                        </div>
                      )}

                      <p style={{ margin: 0, fontSize: '0.8rem', color: isDark ? '#9E9687' : 'var(--text-muted)', lineHeight: 1.45 }}>
                        Muestra únicamente el texto de la marca con tipografía limpia y minimalista.
                      </p>
                    </div>
                  </div>

                  {/* Configuración de Texto + Ícono */}
                  {(!settingsData.logoType || settingsData.logoType === 'icon_text') && (
                    <div style={{ marginBottom: '1.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                        <label className="settings-label" style={{ fontSize: '0.82rem' }}>
                          Seleccionar Ícono del Logo
                        </label>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: isDark ? '#46C285' : '#0E6B41', fontWeight: 700 }}>
                          Ícono actual: {LOGO_ICONS.find(i => i.id === (settingsData.logoIcon || 'rocket'))?.label || 'Cohete'}
                        </span>
                      </div>

                      {/* Grid de Íconos */}
                      <div className="brand-icons-grid">
                        {LOGO_ICONS.map((ic) => {
                          const isSelected = (settingsData.logoIcon || 'rocket') === ic.id;
                          return (
                            <button
                              key={ic.id}
                              type="button"
                              className={`brand-icon-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => setSettingsData({ ...settingsData, logoIcon: ic.id })}
                            >
                              <Icon name={ic.id} size={20} color={isSelected ? '#FFFFFF' : 'currentColor'} />
                              <span>{ic.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Inputs: Prefijo, Sufijo Destacado y Color */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginTop: '1.3rem' }}>
                        <div className="settings-field">
                          <label className="settings-label">Texto Base (Prefijo)</label>
                          <input
                            type="text"
                            className="settings-input"
                            value={settingsData.logoTextPrefix !== undefined ? settingsData.logoTextPrefix : 'Debate'}
                            onChange={(e) => setSettingsData({ ...settingsData, logoTextPrefix: e.target.value })}
                            placeholder="Debate"
                          />
                        </div>

                        <div className="settings-field">
                          <label className="settings-label">Texto Destacado (Color Primario)</label>
                          <input
                            type="text"
                            className="settings-input"
                            value={settingsData.logoTextHighlight !== undefined ? settingsData.logoTextHighlight : 'hosting'}
                            onChange={(e) => setSettingsData({ ...settingsData, logoTextHighlight: e.target.value })}
                            placeholder="hosting"
                          />
                        </div>

                        <div className="settings-field">
                          <label className="settings-label">Color del Contenedor del Ícono</label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '6px',
                                backgroundColor: settingsData.logoColor || '#0E6B41',
                                cursor: 'pointer',
                                border: '2px solid rgba(255,255,255,0.2)',
                                flexShrink: 0,
                                display: 'block',
                                position: 'relative',
                              }}
                              title="Haz clic para elegir color libremente"
                            >
                              <input
                                type="color"
                                value={settingsData.logoColor || '#0E6B41'}
                                onChange={(e) => setSettingsData({ ...settingsData, logoColor: e.target.value })}
                                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                              />
                            </label>
                            <input
                              type="text"
                              className="settings-input"
                              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                              value={settingsData.logoColor || '#0E6B41'}
                              onChange={(e) => setSettingsData({ ...settingsData, logoColor: e.target.value })}
                              placeholder="#0E6B41"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Paleta de colores rápidos */}
                      <div style={{ marginTop: '1rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                          Paleta de colores rápidos para el ícono:
                        </span>
                        <div className="brand-swatches-row">
                          {QUICK_BRAND_COLORS.map((sw) => {
                            const isSelected = (settingsData.logoColor || '#0E6B41').toLowerCase() === sw.hex.toLowerCase();
                            return (
                              <button
                                key={sw.hex}
                                type="button"
                                className={`brand-swatch-pill ${isSelected ? 'active' : ''}`}
                                onClick={() => setSettingsData({ ...settingsData, logoColor: sw.hex })}
                              >
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sw.hex }} />
                                <span>{sw.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configuración cuando selecciona "Logo en Imagen" */}
                  {settingsData.logoType === 'image' && (
                    <div style={{ marginBottom: '1.6rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.9rem', alignItems: 'flex-end' }}>
                      <div className="settings-field" style={{ flex: 1 }}>
                        <label className="settings-label">URL del Logotipo Oficial (.SVG, .PNG o .WebP)</label>
                        <input
                          type="text"
                          className="settings-input"
                          value={settingsData.logoUrl || ''}
                          onChange={(e) => setSettingsData({ ...settingsData, logoUrl: e.target.value })}
                          placeholder="/logo.png o https://debatehosting.com/logo.svg"
                        />
                        <span className="settings-hint">Para mayor nitidez, se recomienda un archivo SVG vectorizado o PNG transparente.</span>
                      </div>
                      <label
                        className="btn btn-secondary"
                        style={{
                          height: '42px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          cursor: uploadingAsset === 'logoUrl' ? 'wait' : 'pointer',
                        }}
                      >
                        <Icon name="download" size={15} />
                        <span>{uploadingAsset === 'logoUrl' ? 'Subiendo...' : 'Subir Logotipo'}</span>
                        <input
                          type="file"
                          accept=".png,.svg,.webp,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          disabled={uploadingAsset === 'logoUrl'}
                          onChange={(e) => handleSettingsAssetUpload(e, 'logoUrl')}
                        />
                      </label>
                    </div>
                  )}

                  {/* Configuración cuando selecciona "Solo Texto" */}
                  {settingsData.logoType === 'text' && (
                    <div style={{ marginBottom: '1.6rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
                      <div className="settings-field">
                        <label className="settings-label">Texto Base (Prefijo)</label>
                        <input
                          type="text"
                          className="settings-input"
                          value={settingsData.logoTextPrefix !== undefined ? settingsData.logoTextPrefix : 'Debate'}
                          onChange={(e) => setSettingsData({ ...settingsData, logoTextPrefix: e.target.value })}
                          placeholder="Debate"
                        />
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Texto Destacado (Color Primario)</label>
                        <input
                          type="text"
                          className="settings-input"
                          value={settingsData.logoTextHighlight !== undefined ? settingsData.logoTextHighlight : 'hosting'}
                          onChange={(e) => setSettingsData({ ...settingsData, logoTextHighlight: e.target.value })}
                          placeholder="hosting"
                        />
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Color del Texto Destacado</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <label
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              backgroundColor: settingsData.logoColor || '#0E6B41',
                              cursor: 'pointer',
                              border: '2px solid rgba(255,255,255,0.2)',
                              flexShrink: 0,
                              display: 'block',
                              position: 'relative',
                            }}
                          >
                            <input
                              type="color"
                              value={settingsData.logoColor || '#0E6B41'}
                              onChange={(e) => setSettingsData({ ...settingsData, logoColor: e.target.value })}
                              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            />
                          </label>
                          <input
                            type="text"
                            className="settings-input"
                            style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                            value={settingsData.logoColor || '#0E6B41'}
                            onChange={(e) => setSettingsData({ ...settingsData, logoColor: e.target.value })}
                            placeholder="#0E6B41"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==========================================================================
                      SECCIÓN: VISTA PREVIA DEL LOGO EN LA BARRA DE NAVEGACIÓN
                      ========================================================================== */}
                  <div style={{ borderTop: '1px solid ' + (isDark ? '#241F18' : 'rgba(23, 20, 15, 0.1)'), paddingTop: '1.4rem', marginTop: '0.8rem' }}>
                    <div className="brand-section-header">
                      <Icon name="sliders" size={17} color={isDark ? '#46C285' : '#0E6B41'} />
                      <span>Vista Previa del Logo en la Barra de Navegación</span>
                    </div>

                    <div className="brand-preview-row">
                      {/* Vista Previa MODO CLARO */}
                      <div className="brand-preview-card light">
                        <span className="brand-preview-tag">MODO CLARO</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                          {settingsData.logoType === 'image' && settingsData.logoUrl ? (
                            <img
                              src={normalizeImageUrl(settingsData.logoUrl)}
                              alt="Logo Preview Claro"
                              style={{ maxHeight: '38px', maxWidth: '220px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                            />
                          ) : settingsData.logoType === 'text' ? (
                            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#17140F' }}>
                              {settingsData.logoTextPrefix || 'Debate'}
                              <span style={{ color: settingsData.logoColor || '#0E6B41' }}>
                                {settingsData.logoTextHighlight || 'hosting'}
                              </span>
                            </span>
                          ) : (
                            <>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  backgroundColor: settingsData.logoColor || '#0E6B41',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#FFFFFF',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                  flexShrink: 0,
                                }}
                              >
                                <Icon name={settingsData.logoIcon || 'rocket'} size={22} color="#FFFFFF" />
                              </div>
                              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#17140F' }}>
                                {settingsData.logoTextPrefix || 'Debate'}
                                <span style={{ color: settingsData.logoColor || '#0E6B41' }}>
                                  {settingsData.logoTextHighlight || 'hosting'}
                                </span>
                              </span>
                            </>
                          )}
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            backgroundColor: '#17140F',
                            color: '#FAF7EE',
                            marginLeft: '0.25rem',
                          }}>
                            EDITORIAL
                          </span>
                        </div>
                      </div>

                      {/* Vista Previa MODO OSCURO */}
                      <div className="brand-preview-card dark">
                        <span className="brand-preview-tag">MODO OSCURO</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                          {settingsData.logoType === 'image' && settingsData.logoUrl ? (
                            <img
                              src={normalizeImageUrl(settingsData.logoUrl)}
                              alt="Logo Preview Oscuro"
                              style={{ maxHeight: '38px', maxWidth: '220px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                            />
                          ) : settingsData.logoType === 'text' ? (
                            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FAF7EE' }}>
                              {settingsData.logoTextPrefix || 'Debate'}
                              <span style={{ color: settingsData.logoColor || '#0E6B41' }}>
                                {settingsData.logoTextHighlight || 'hosting'}
                              </span>
                            </span>
                          ) : (
                            <>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  backgroundColor: settingsData.logoColor || '#0E6B41',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#FFFFFF',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                  flexShrink: 0,
                                }}
                              >
                                <Icon name={settingsData.logoIcon || 'rocket'} size={22} color="#FFFFFF" />
                              </div>
                              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FAF7EE' }}>
                                {settingsData.logoTextPrefix || 'Debate'}
                                <span style={{ color: settingsData.logoColor || '#0E6B41' }}>
                                  {settingsData.logoTextHighlight || 'hosting'}
                                </span>
                              </span>
                            </>
                          )}
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            backgroundColor: '#FAF7EE',
                            color: '#17140F',
                            marginLeft: '0.25rem',
                          }}>
                            EDITORIAL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ==========================================================================
                      SECCIÓN: FAVICON DEL SITIO & IMAGEN COMPARTIR (OG)
                      ========================================================================== */}
                  <div className="brand-assets-row">
                    {/* 1. FAVICON */}
                    <div className="brand-asset-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Icon name="sparkles" size={16} color={isDark ? '#46C285' : '#0E6B41'} />
                          <label className="settings-label" style={{ marginBottom: 0 }}>Favicon del Sitio</label>
                        </div>
                        <span className="asset-preview-badge" style={{ position: 'static' }}>ICO, PNG o SVG</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? '#14110C' : '#FFFFFF',
                          border: '1.5px solid ' + (isDark ? '#2B251D' : 'rgba(23, 20, 15, 0.15)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {settingsData.faviconUrl ? (
                            <img
                              key={settingsData.faviconUrl}
                              src={normalizeImageUrl(settingsData.faviconUrl)}
                              alt="Favicon"
                              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                              onError={(e) => {
                                // Evitar sustituir por otro favicon falso; indicar que no cargó
                                e.currentTarget.style.opacity = '0.35';
                              }}
                            />
                          ) : (
                            <Icon name="sparkles" size={20} color="#7A7265" />
                          )}
                        </div>

                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            cursor: uploadingAsset === 'faviconUrl' ? 'wait' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Icon name="download" size={14} />
                          <span>{uploadingAsset === 'faviconUrl' ? 'Subiendo...' : 'Subir Favicon'}</span>
                          <input
                            type="file"
                            accept=".ico,.png,.svg"
                            style={{ display: 'none' }}
                            disabled={uploadingAsset === 'faviconUrl'}
                            onChange={(e) => handleSettingsAssetUpload(e, 'faviconUrl')}
                          />
                        </label>

                        {settingsData.faviconUrl && (
                          <button
                            type="button"
                            onClick={() => setSettingsData({ ...settingsData, faviconUrl: '/favicon.svg' })}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--text-muted)', padding: '0.45rem' }}
                            title="Restablecer favicon por defecto"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        )}
                      </div>

                      <div className="settings-field">
                        <input
                          type="text"
                          className="settings-input"
                          style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                          value={settingsData.faviconUrl || ''}
                          onChange={(e) => setSettingsData({ ...settingsData, faviconUrl: e.target.value })}
                          placeholder="/favicon.ico o /uploads/..."
                        />
                      </div>
                    </div>

                    {/* 2. IMAGEN COMPARTIR (OG) */}
                    <div className="brand-asset-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Icon name="share" size={16} color={isDark ? '#46C285' : '#0E6B41'} />
                          <label className="settings-label" style={{ marginBottom: 0 }}>Imagen Compartir (OG)</label>
                        </div>
                        <span className="asset-preview-badge" style={{ position: 'static' }}>1200 x 630 px</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <div style={{
                          width: '80px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? '#14110C' : '#FFFFFF',
                          border: '1.5px solid ' + (isDark ? '#2B251D' : 'rgba(23, 20, 15, 0.15)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {settingsData.ogImageUrl ? (
                            <img
                              src={normalizeImageUrl(settingsData.ogImageUrl)}
                              alt="OG Image"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.src = '/og-image.png'; }}
                            />
                          ) : (
                            <Icon name="image" size={20} color="#7A7265" />
                          )}
                        </div>

                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            cursor: uploadingAsset === 'ogImageUrl' ? 'wait' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Icon name="download" size={14} />
                          <span>{uploadingAsset === 'ogImageUrl' ? 'Subiendo...' : 'Subir Imagen OG'}</span>
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
                            style={{ display: 'none' }}
                            disabled={uploadingAsset === 'ogImageUrl'}
                            onChange={(e) => handleSettingsAssetUpload(e, 'ogImageUrl')}
                          />
                        </label>

                        {settingsData.ogImageUrl && (
                          <button
                            type="button"
                            onClick={() => setSettingsData({ ...settingsData, ogImageUrl: '/og-image.png' })}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--text-muted)', padding: '0.45rem' }}
                            title="Restablecer imagen OG por defecto"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        )}
                      </div>

                      <div className="settings-field">
                        <input
                          type="text"
                          className="settings-input"
                          style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                          value={settingsData.ogImageUrl || ''}
                          onChange={(e) => setSettingsData({ ...settingsData, ogImageUrl: e.target.value })}
                          placeholder="/og-image.png o https://..."
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="settings-footer-actions">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="btn btn-primary btn-sm"
                  >
                    <span>{settingsSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. SEO & INDEXACIÓN */}
            {settingsSubtab === 'seo' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 className="settings-card-title">SEO Técnico & Motores de Búsqueda</h2>
                    <p className="settings-card-desc">
                      Supervisa el sitemap dinámico XML, las directivas de robots y los metadatos globales.
                    </p>
                  </div>
                  <span className="settings-pill-status">
                    <Icon name="checkCircle" size={13} />
                    Googlebot Optimizado
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Meta Descripción Predeterminada</label>
                  <textarea
                    rows={3}
                    className="settings-textarea"
                    value={settingsData.defaultMetaDescription || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, defaultMetaDescription: e.target.value })}
                  />
                  <span className="settings-hint">Descripción para fragmentos de resultados de Google (SERP).</span>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Palabras Clave de Indexación (Keywords)</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settingsData.defaultKeywords || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, defaultKeywords: e.target.value })}
                  />
                  <span className="settings-hint">Separadas por comas. Utilizadas en los metatags principales.</span>
                </div>

                <div className="settings-field" style={{ marginTop: '1rem' }}>
                  <label className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="globe" size={14} />
                    <span>Google Search Console (Código o Meta Tag)</span>
                  </label>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Pega el código de verificación o la etiqueta completa <meta name='google-site-verification' content='...' />"
                    value={settingsData.googleSearchConsoleCode || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, googleSearchConsoleCode: e.target.value })}
                  />
                  <span className="settings-hint">
                    Se inyectará automáticamente en el <code>&lt;head&gt;</code> de la web para verificar la propiedad en Google Search Console.
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="barChart" size={14} />
                    <span>Google Analytics 4 (Measurement ID)</span>
                  </label>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="ej. G-XXXXXXXXXX"
                    value={settingsData.googleAnalyticsId || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, googleAnalyticsId: e.target.value })}
                  />
                  <span className="settings-hint">
                    ID de medición oficial de GA4. Cargará el script gtag.js de Google Tag Manager de manera asíncrona y optimizada.
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="code" size={14} />
                    <span>Código Personalizado en &lt;head&gt; (Scripts, Píxeles, Verificaciones)</span>
                  </label>
                  <textarea
                    rows={4}
                    className="settings-textarea"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                    placeholder="<!-- Pega aquí scripts de Meta Pixel, Microsoft Clarity, Hotjar, estilos CSS adicionales o etiquetas <meta> -->"
                    value={settingsData.customHeadCode || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, customHeadCode: e.target.value })}
                  />
                  <span className="settings-hint">
                    Cualquier etiqueta que requiera ubicarse dentro de <code>&lt;head&gt;</code>.
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="terminal" size={14} />
                    <span>Código Personalizado antes de &lt;/body&gt; (Scripts de Body / Widgets)</span>
                  </label>
                  <textarea
                    rows={3}
                    className="settings-textarea"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                    placeholder="<!-- Pega aquí scripts de widgets de chat, noscript, o herramientas que carguen al final -->"
                    value={settingsData.customBodyCode || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, customBodyCode: e.target.value })}
                  />
                  <span className="settings-hint">
                    Código que se ejecutará justo antes del cierre de <code>&lt;/body&gt;</code>.
                  </span>
                </div>

                <div className="settings-grid-2" style={{ marginTop: '0.5rem' }}>
                  <div style={{
                    padding: '1.1rem',
                    backgroundColor: isDark ? '#171410' : '#F4EFE6',
                    border: '1px solid ' + (isDark ? '#2B251D' : 'var(--border-ink)'),
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>SITEMAP DINÁMICO</strong>
                      <span className="settings-pill-status">200 OK</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                      Generación nativa en <code>/sitemap.xml</code> con prioridades y frecuencias automáticas.
                    </span>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                    >
                      <span>Ver Sitemap XML</span>
                      <Icon name="external" size={12} />
                    </a>
                  </div>

                  <div style={{
                    padding: '1.1rem',
                    backgroundColor: isDark ? '#171410' : '#F4EFE6',
                    border: '1px solid ' + (isDark ? '#2B251D' : 'var(--border-ink)'),
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>ROBOTS & NOINDEX</strong>
                      <span className="settings-pill-status">Protegido</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                      Ruta <code>/robots.txt</code> con exclusión de <code>/admin/</code> y directivas <code>noindex</code> activas.
                    </span>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                    >
                      <span>Ver Robots.txt</span>
                      <Icon name="external" size={12} />
                    </a>
                  </div>
                </div>

                <div className="settings-footer-actions">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="btn btn-primary btn-sm"
                  >
                    <span>{settingsSaving ? 'Guardando...' : 'Guardar Configuración SEO'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. AFILIACIÓN & ÉTICA */}
            {settingsSubtab === 'afiliacion' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 className="settings-card-title">Políticas de Afiliación & Transparencia</h2>
                    <p className="settings-card-desc">
                      Normativas de enlaces patrocinados y cumplimiento con las directrices contra spam de Google.
                    </p>
                  </div>
                  <span className="settings-pill-status">
                    <Icon name="shield" size={13} />
                    Cumplimiento Ético
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Atributo de Enlace Obligatorio (Google Sponsored)</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settingsData.affiliateRel || 'sponsored noopener noreferrer'}
                    onChange={(e) => setSettingsData({ ...settingsData, affiliateRel: e.target.value })}
                  />
                  <span className="settings-hint">
                    Garantiza que Google identifique los enlaces comerciales sin penalizar la autoridad del sitio.
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Texto del Aviso de Afiliación (Footer & Legal)</label>
                  <textarea
                    rows={4}
                    className="settings-textarea"
                    value={settingsData.disclosureNotice || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, disclosureNotice: e.target.value })}
                  />
                  <span className="settings-hint">
                    Declaración pública visible en el pie de página de todas las vistas del observatorio.
                  </span>
                </div>

                <div style={{
                  padding: '1rem 1.2rem',
                  backgroundColor: 'rgba(70, 194, 133, 0.08)',
                  border: '1.5px solid rgba(70, 194, 133, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: isDark ? '#FAF7EE' : 'var(--text-ink)' }}>
                      Página Pública de Afiliados y Ética
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: isDark ? '#9E9687' : 'var(--text-muted)', margin: 0 }}>
                      Explica a los lectores nuestro modelo de financiación y auditoría independiente.
                    </p>
                  </div>
                  <Link href="/afiliados" target="_blank" className="btn btn-secondary btn-sm">
                    <span>Visitar /afiliados</span>
                    <Icon name="external" size={12} />
                  </Link>
                </div>

                <div className="settings-footer-actions">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="btn btn-primary btn-sm"
                  >
                    <span>{settingsSaving ? 'Guardando...' : 'Guardar Políticas'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. CUENTA & SEGURIDAD */}
            {settingsSubtab === 'seguridad' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 className="settings-card-title">Seguridad y Credenciales</h2>
                    <p className="settings-card-desc">
                      Actualiza el correo de acceso a la redacción y cambia la contraseña de administrador.
                    </p>
                  </div>
                  <span className="settings-pill-status">
                    <Icon name="lock" size={13} />
                    Autenticación JWT
                  </span>
                </div>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                  <div className="settings-grid-2">
                    <div className="settings-field">
                      <label className="settings-label">Correo Electrónico Actual</label>
                      <input
                        type="email"
                        className="settings-input"
                        disabled
                        value={user?.email || 'admin@debatehosting.com'}
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">Nuevo Correo Electrónico (Opcional)</label>
                      <input
                        type="email"
                        className="settings-input"
                        value={profileForm.newEmail}
                        onChange={(e) => setProfileForm({ ...profileForm, newEmail: e.target.value })}
                        placeholder="nuevo-admin@debatehosting.com"
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid ' + (isDark ? '#241F18' : 'rgba(23, 20, 15, 0.1)'), paddingTop: '1.2rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.85rem' }}>
                      Modificar Contraseña
                    </h3>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">Contraseña Actual *</label>
                    <input
                      type="password"
                      className="settings-input"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      required
                    />
                    <span className="settings-hint">Requerida para autorizar cualquier cambio en la cuenta.</span>
                  </div>

                  <div className="settings-grid-2">
                    <div className="settings-field">
                      <label className="settings-label">Nueva Contraseña</label>
                      <input
                        type="password"
                        className="settings-input"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        className="settings-input"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                  </div>

                  <div className="settings-footer-actions">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="btn btn-primary btn-sm"
                    >
                      <Icon name="lock" size={13} />
                      <span>{profileSaving ? 'Actualizando...' : 'Actualizar Credenciales'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 5. MOTOR & BASE DE DATOS */}
            {settingsSubtab === 'sistema' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 className="settings-card-title">Infraestructura y Telemetría</h2>
                    <p className="settings-card-desc">
                      Detalles técnicos del entorno de ejecución, estado de la base de datos y motor TTFB.
                    </p>
                  </div>
                  <span className="settings-pill-status">
                    <Icon name="server" size={13} />
                    Salud Operativa: 100%
                  </span>
                </div>

                <div className="settings-grid-2">
                  <div style={{
                    padding: '1.2rem',
                    backgroundColor: isDark ? '#171410' : '#FFFFFF',
                    border: '1.5px solid ' + (isDark ? '#2B251D' : 'var(--border-ink)'),
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                      ARQUITECTURA DEL SISTEMA
                    </strong>
                    <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div><strong>Framework:</strong> Next.js 14+ (App Router)</div>
                      <div><strong>ORM:</strong> Prisma Client (PostgreSQL)</div>
                      <div><strong>Estilos:</strong> CSS Puro Editorial (Bordes tinta & sombras duras)</div>
                      <div><strong>Tema Consola:</strong> Dark Black (#090807) & Papel Crema</div>
                    </div>
                  </div>

                  <div style={{
                    padding: '1.2rem',
                    backgroundColor: isDark ? '#171410' : '#FFFFFF',
                    border: '1.5px solid ' + (isDark ? '#2B251D' : 'var(--border-ink)'),
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: isDark ? '#9E9687' : 'var(--text-muted)' }}>
                      REGISTROS EN BASE DE DATOS
                    </strong>
                    <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div><strong>Proveedores Activos:</strong> {providers.length} registros</div>
                      <div><strong>Cupones Verificados:</strong> {coupons.length} cupones</div>
                      <div><strong>Picks en Podio:</strong> {picks.length} posiciones</div>
                      <div><strong>Suscriptores Newsletter:</strong> {subscribers.length} lectores</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem 1.2rem',
                  backgroundColor: isDark ? '#171410' : '#F4EFE6',
                  border: '1px solid ' + (isDark ? '#2B251D' : 'var(--border-ink)'),
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>Motor de Auditoría TTFB: {settingsData.ttfbEngineVersion}</strong>
                    <p style={{ fontSize: '0.78rem', color: isDark ? '#9E9687' : 'var(--text-muted)', margin: 0 }}>
                      Monitoreo activo de latencia en milisegundos y firmas de servidores LiteSpeed, Nginx y Apache.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      loadCurrentData();
                      toast.success('Telemetría y datos sincronizados con éxito.');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Sincronizar Datos</span>
                  </button>
                </div>

                {/* ZONA DE PELIGRO: VACIAR A 0 */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: isDark ? 'rgba(176, 58, 38, 0.08)' : '#FFF5F5',
                  border: '1.5px solid ' + (isDark ? '#B03A26' : '#E53E3E'),
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B03A26' }}>
                    <Icon name="alertTriangle" size={18} />
                    <strong style={{ fontSize: '0.95rem' }}>Zona de Peligro: Vaciar la Web a 0</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: isDark ? '#D19288' : '#742A2A', margin: 0, lineHeight: 1.5 }}>
                    Esta acción eliminará todos los proveedores de muestra, cupones, elegidos del podio, noticias del ticker, suscriptores y eventos de clics.
                    <strong> Tu usuario administrador se mantendrá intacto</strong> para que sigas teniendo acceso al panel.
                  </p>
                  <button
                    onClick={handleResetContent}
                    disabled={resettingContent}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: '#B03A26',
                      color: '#FFFFFF',
                      border: 'none',
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      cursor: resettingContent ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Icon name="trash" size={13} />
                    <span>{resettingContent ? 'Vaciando base de datos...' : 'Resetear Todo el Contenido a 0'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
