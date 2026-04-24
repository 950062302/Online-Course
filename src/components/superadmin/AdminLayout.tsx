"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Upload,
  BookOpen,
  GraduationCap,
  Menu as MenuIcon,
  X,
  Edit,
  MessageSquareText,
  Image as ImageIcon,
  FileText,
  Tag,
  BellRing,
  BarChart2,
  LogOut,
  MessageCircle,
  Store,
  Video,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import FinancePanel from './FinancePanel';
import TeachersPanel from './TeachersPanel';
import UploadCoursePanel from './UploadCoursePanel';
import CoursePreviewPanel from './CoursePreviewPanel';
import UsersPanel from './UsersPanel';
import EditCoursesPanel from './EditCoursesPanel';
import ReviewModerationPanel from './ReviewModerationPanel';
import ResultsImagesPanel from './ResultsImagesPanel';
import ApplicationsPanel from './ApplicationsPanel';
import TariffManagementPanel from './TariffManagementPanel';
import NotificationManagementPanel from './NotificationManagementPanel';
import StatsSummaryPanel from './StatsSummaryPanel';
import ReportsAndAnalyticsPanel from './ReportsAndAnalyticsPanel';
import EditMarketingCoursesPanel from './EditMarketingCoursesPanel';
import LandingAboutPanel from './LandingAboutPanel';
import ChatPage from '@/pages/ChatPage';
import { useSession } from "@/components/auth/SessionContextProvider";
import { showSuccess, showError } from '@/utils/toast';
import './AdminLayout.css';

type ConnectionStatus = 'online' | 'offline';

const AdminLayout: React.FC = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const navigate = useNavigate();
  const { logout, profile } = useSession();

  const navItems = [
    { id: 'dashboard', label: 'Umumiy holat', icon: LayoutDashboard, component: <StatsSummaryPanel />, group: 'main' },
    { id: 'finance', label: 'Moliya & Sotuv', icon: DollarSign, component: <FinancePanel />, group: 'main' },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users, component: <UsersPanel />, group: 'main' },
    { id: 'reports-analytics', label: 'Hisobotlar & Tahlil', icon: BarChart2, component: <ReportsAndAnalyticsPanel />, group: 'main' },
    { id: 'teachers', label: 'Ustozlar', icon: Users, component: <TeachersPanel />, group: 'content' },
    { id: 'upload-course', label: 'Yangi kurs', icon: Upload, component: <UploadCoursePanel />, group: 'content' },
    { id: 'course-preview', label: 'Yuklangan kurslar', icon: BookOpen, component: <CoursePreviewPanel />, group: 'content' },
    { id: 'edit-courses', label: 'Kurslarni tahrirlash', icon: Edit, component: <EditCoursesPanel />, group: 'content' },
    { id: 'edit-marketing-courses', label: 'Marketing kurslari', icon: Store, component: <EditMarketingCoursesPanel />, group: 'content' },
    { id: 'landing-about', label: 'Biz haqimizda', icon: Video, component: <LandingAboutPanel />, group: 'content' },
    { id: 'review-moderation', label: 'Izohlar', icon: MessageSquareText, component: <ReviewModerationPanel />, group: 'communication' },
    { id: 'results-images', label: 'Natijalar rasmlari', icon: ImageIcon, component: <ResultsImagesPanel />, group: 'communication' },
    { id: 'applications', label: 'Arizalar', icon: FileText, component: <ApplicationsPanel />, group: 'communication' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, component: <ChatPage />, group: 'communication' },
    { id: 'tariffs', label: 'Tariflar', icon: Tag, component: <TariffManagementPanel />, group: 'system' },
    { id: 'notifications', label: 'Bildirishnomalar', icon: BellRing, component: <NotificationManagementPanel />, group: 'system' },
  ];

  const activeItem = navItems.find(item => item.id === activePanel);
  const getPanelTitle = () => activeItem?.label || 'Boshqaruv paneli';

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Muvaffaqiyatli chiqish!");
      navigate("/login");
    } catch (error: any) {
      console.error("Unexpected logout error:", error);
      showError(`Chiqishda xato: ${error.message}`);
    }
  };

  useEffect(() => {
    const updateStatus = () => {
      if (typeof navigator !== 'undefined') setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const connectionLabel = connectionStatus === 'online' ? 'Online rejim' : 'Offline';
  const connectionClasses = connectionStatus === 'online'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-white text-gray-800 border border-primary';

  const renderNavGroup = (group: string) => navItems.filter(item => item.group === group).map(item => (
    <button
      key={item.id}
      onClick={() => {
        setActivePanel(item.id);
        setIsMobileMenuOpen(false);
      }}
      className={`flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${activePanel === item.id ? 'bg-primary text-white shadow-md shadow-cyan-200' : 'text-gray-700 hover:bg-cyan-50 hover:text-primary'}`}
    >
      <item.icon className="mr-3 h-5 w-5" />
      {item.label}
    </button>
  ));

  const profileName = profile?.username || 'Admin';

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 antialiased">
      <header className="sticky top-0 z-30 border-b border-cyan-100 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full border border-cyan-100 bg-white text-gray-700 hover:bg-cyan-50">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-white p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-cyan-100 px-5 py-6">
                    <Link to="/" className="flex items-center gap-2">
                      <GraduationCap className="h-8 w-8 text-primary" />
                      <span className="text-xl font-bold text-primary">EduDars.uz</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800">
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <Accordion type="multiple" defaultValue={['group-main', 'group-content']} className="w-full">
                      <AccordionItem value="group-main">
                        <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Asosiy boshqaruv</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">{renderNavGroup('main')}</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="group-content">
                        <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Ta'lim kontenti</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">{renderNavGroup('content')}</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="group-communication">
                        <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Aloqa & natija</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">{renderNavGroup('communication')}</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="group-system">
                        <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Tizim sozlamalari</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">{renderNavGroup('system')}</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 p-2 text-white shadow-md shadow-cyan-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">EduDars.uz Admin</h1>
              <p className="text-sm text-gray-500">Salom, {profileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${connectionClasses}`}>{connectionLabel}</span>
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">{profileName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-cyan-200">
              AD
            </div>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-gray-800">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-cyan-100 bg-white/90 p-5 shadow-[0_20px_60px_rgba(26,255,255,0.06)] lg:block">
          <div className="mb-6 rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5">
            <h2 className="text-2xl font-black text-primary">Boshqaruv paneli</h2>
            <p className="mt-1 text-sm text-gray-500">Modullarni tez boshqaring</p>
          </div>

          <Accordion type="multiple" defaultValue={['group-main', 'group-content', 'group-communication', 'group-system']} className="w-full space-y-2">
            <AccordionItem value="group-main">
              <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Asosiy boshqaruv</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">{renderNavGroup('main')}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-content">
              <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Ta'lim kontenti</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">{renderNavGroup('content')}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-communication">
              <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Aloqa & natija</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">{renderNavGroup('communication')}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-system">
              <AccordionTrigger className="rounded-xl px-2 hover:bg-cyan-50">Tizim sozlamalari</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">{renderNavGroup('system')}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
            <section className="rounded-[2rem] border border-cyan-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{getPanelTitle()}</p>
                  <h2 className="mt-2 text-3xl font-black text-gray-950">Admin boshqaruv markazi</h2>
                  <p className="mt-2 max-w-2xl text-gray-600">Tizimning barcha bo‘limlari bir xil premium uslubda boshqariladi.</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 px-5 py-4 text-white shadow-lg shadow-cyan-200">
                  <p className="text-sm opacity-90">Faol modul</p>
                  <p className="text-xl font-bold">{getPanelTitle()}</p>
                </div>
              </div>
            </section>

            {activePanel === 'dashboard' && <StatsSummaryPanel />}

            <section className="rounded-[2rem] border border-cyan-100 bg-white p-4 sm:p-6 shadow-sm">
              {activeItem?.component}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;