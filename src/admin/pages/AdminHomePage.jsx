import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Home, Sparkles, Heart, Shield, Activity, ExternalLink, Clock } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getHomeContent } from '../../services/homeContentService';
import { DEFAULT_HOME } from '../../context/HomeContentContext';
import HeroEditor from '../components/home/HeroEditor';
import PhilosophyEditor from '../components/home/PhilosophyEditor';
import WhyChooseUsEditor from '../components/home/WhyChooseUsEditor';
import FeaturesEditor from '../components/home/FeaturesEditor';

const TABS = [
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'philosophy', label: 'Filosofía', icon: Heart },
  { id: 'why_choose_us', label: 'Diferenciador', icon: Shield },
  { id: 'features', label: 'Servicios', icon: Activity },
];

export default function AdminHomePage() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    getHomeContent()
      .then((data) => {
        if (data) {
          setContent({
            hero: { ...DEFAULT_HOME.hero, ...(data.hero || {}) },
            philosophy: { ...DEFAULT_HOME.philosophy, ...(data.philosophy || {}) },
            why_choose_us: { ...DEFAULT_HOME.why_choose_us, ...(data.why_choose_us || {}) },
            features: { ...DEFAULT_HOME.features, ...(data.features || {}) },
          });
          setUpdatedAt(data.updated_at);
        } else {
          setContent(DEFAULT_HOME);
        }
      })
      .catch(() => {
        setContent(DEFAULT_HOME);
      })
      .finally(() => setLoading(false));
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.home-admin-el');
    const ctx = gsap.context(() => {
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const handleSectionSaved = (sectionKey, newData) => {
    setContent((prev) => ({ ...prev, [sectionKey]: newData }));
    setUpdatedAt(new Date().toISOString());
  };

  if (loading) {
    return (
      <AdminLayout title="Página Principal">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const renderEditor = () => {
    if (!content) return null;
    switch (activeTab) {
      case 'hero':
        return <HeroEditor data={content.hero} onSaved={(d) => handleSectionSaved('hero', d)} />;
      case 'philosophy':
        return <PhilosophyEditor data={content.philosophy} onSaved={(d) => handleSectionSaved('philosophy', d)} />;
      case 'why_choose_us':
        return <WhyChooseUsEditor data={content.why_choose_us} onSaved={(d) => handleSectionSaved('why_choose_us', d)} />;
      case 'features':
        return <FeaturesEditor data={content.features} onSaved={(d) => handleSectionSaved('features', d)} />;
      default:
        return null;
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'hace un momento';
    if (diff < 60) return `hace ${diff} min`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString('es-SV', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout title="Página Principal">
      <div ref={containerRef}>
        {/* Header */}
        <div className="home-admin-el flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Home size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-primary">Contenido de la Home</h2>
              <p className="font-body text-xs text-primary/50">Editá textos, imágenes, tarjetas y contenido visible de la página principal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {updatedAt && (
              <div className="flex items-center gap-1.5 text-xs font-body text-primary/40">
                <Clock size={12} />
                Última edición: {formatDate(updatedAt)}
              </div>
            )}
            <a
              href="/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
            >
              <ExternalLink size={12} />
              Ver sitio
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="home-admin-el flex gap-1 p-1 bg-white border border-primary/5 rounded-2xl mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-primary/50 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Editor Panel */}
        <div className="home-admin-el bg-white border border-primary/5 rounded-2xl p-6 md:p-8">
          {renderEditor()}
        </div>
      </div>
    </AdminLayout>
  );
}
