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
  const [activePanel, setActivePanel] = useState('finance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const navigate = useNavigate();
  const { logout } = useSession();

  const navItems = [
    { id: 'finance', label: 'MOLIYA & SOTUV', icon: DollarSign, component: <FinancePanel />, group: 'main' },
    { id: 'users', label: 'FOYDALANUVCHILAR', icon: Users, component: <UsersPanel />, group: 'main' },
    { id: 'reports-analytics', label: 'HISOBOTLAR & TAHLIL', icon: BarChart2, component: <ReportsAndAnalyticsPanel />, group: 'main' },
    { id: 'teachers', label: 'USTOZLAR PANELI', icon: Users, component: <TeachersPanel />, group: 'content' },
    { id: 'upload-course', label: 'YANGI KURS YUKLASH', icon: Upload, component: <UploadCoursePanel />, group: 'content' },
    { id: 'course-preview', label: 'YUKLANGAN KURSLAR', icon: BookOpen, component: <CoursePreviewPanel />, group: 'content' },
    { id: 'edit-courses', label: 'KURSLARNI TAHRIRLASH', icon: Edit, component: <EditCoursesPanel />, group: 'content' },
    { id: 'edit-marketing-courses', label: 'MARKETING KURSLARI', icon: Store, component: <EditMarketingCoursesPanel />, group: 'content' },
    { id: 'landing-about', label: 'BIZ HAQIMIZDA (LANDING)', icon: Video, component: <LandingAboutPanel />, group: 'content' },
    { id: 'review-moderation', label: 'IZOHLAR MODERATSIYASI', icon: MessageSquareText, component: <ReviewModerationPanel />, group: 'communication' },
    { id: 'results-images', label: 'NATIJALAR RASMLARI', icon: ImageIcon, component: <ResultsImagesPanel />, group: 'communication' },
    { id: 'applications', label: 'ARIZALAR', icon: FileText, component: <ApplicationsPanel />, group: 'communication' },
    { id: 'chat', label: 'CHAT', icon: MessageCircle, component: <ChatPage />, group: 'communication' },
    { id: 'tariffs', label: 'TARIFLARNI BOSHQARISH', icon: Tag, component: <TariffManagementPanel />, group: 'system' },
    { id: 'notifications', label: 'BILDIRISHNOMALAR', icon: BellRing, component: <NotificationManagementPanel />, group: 'system' },
  ];

  const getPanelTitle = (panelId: string) => {
    const item = navItems.find(item => item.id === panelId);
    return item ? item.label : 'Boshqaruv Paneli';
  };

  const renderActivePanel = () => {
    const activeComponent = navItems.find(item => item.id === activePanel)?.component;
    return activeComponent;
  };

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
      if (typeof navigator !== 'undefined') {
        setConnectionStatus(navigator.onLine ? 'online' : 'offline');
      }
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const connectionLabel = connectionStatus === 'online' ? "Siz online siz" : "Offline";
  const connectionClasses =
    connectionStatus === 'online'
      ? 'bg-green-100 text-green-700 border border-green-200'
      : 'bg-white text-gray-800 border border-primary';

  const renderNavGroup = (group: string) => {
    return navItems
      .filter(item => item.group === group)
      .map(item => (
        <button
          key={item.id}
          onClick={() => {
            setActivePanel(item.id);
            setIsMobileMenuOpen(false);
          }}
          className={`menu-item ${activePanel === item.id ? 'active' : ''}`}
        >
          <item.icon className="w-5 h-5 mr-3" />
          {item.label}
        </button>
      ));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden antialiased bg-gray-50">
      <header className="bg-white p-4 flex justify-between items-center z-10 shadow-sm border-b border-gray-200">
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
              >
                <MenuIcon className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-7 border-b border-gray-100">
                  <Link to="/" className="flex items-center space-x-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold text-primary">EduDars.uz</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex-1 py-4 px-2 space-y-1">
                  <Accordion type="multiple" defaultValue={['group-main', 'group-content']} className="w-full">
                    <AccordionItem value="group-main">
                      <AccordionTrigger className="accordion-trigger">Asosiy Boshqaruv</AccordionTrigger>
                      <AccordionContent className="accordion-content">
                        {renderNavGroup('main')}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="group-content">
                      <AccordionTrigger className="accordion-trigger">Ta'lim Kontenti</AccordionTrigger>
                      <AccordionContent className="accordion-content">
                        {renderNavGroup('content')}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="group-communication">
                      <AccordionTrigger className="accordion-trigger">Aloqa & Natija</AccordionTrigger>
                      <AccordionContent className="accordion-content">
                        {renderNavGroup('communication')}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="group-system">
                      <AccordionTrigger className="accordion-trigger">Tizim Sozlamalari</AccordionTrigger>
                      <AccordionContent className="accordion-content">
                        {renderNavGroup('system')}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-2xl font-extrabold text-gray-800 ml-4">EduDars.uz ADMIN</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 hidden sm:inline text-sm">
            Administrator: User ID
          </span>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            AD
          </div>
          <button onClick={handleLogout} className="Btn">
            <div className="sign">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="text-logout">Chiqish</div>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          id="sidebar-desktop"
          className="bg-white text-gray-800 w-64 p-4 flex-shrink-0 hidden lg:block h-full z-20 shadow-xl overflow-y-auto border-r border-gray-200"
        >
          <div className="p-2 mb-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-primary">EduDars.uz</h2>
          </div>

          <Accordion type="multiple" defaultValue={['group-main', 'group-content', 'group-communication', 'group-system']} className="w-full">
            <AccordionItem value="group-main">
              <AccordionTrigger className="accordion-trigger">Asosiy Boshqaruv</AccordionTrigger>
              <AccordionContent className="accordion-content">
                {renderNavGroup('main')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-content">
              <AccordionTrigger className="accordion-trigger">Ta'lim Kontenti</AccordionTrigger>
              <AccordionContent className="accordion-content">
                {renderNavGroup('content')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-communication">
              <AccordionTrigger className="accordion-trigger">Aloqa & Natija</AccordionTrigger>
              <AccordionContent className="accordion-content">
                {renderNavGroup('communication')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-system">
              <AccordionTrigger className="accordion-trigger">Tizim Sozlamalari</AccordionTrigger>
              <AccordionContent className="accordion-content">
                {renderNavGroup('system')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gray-50">
          <h2
            id="main-title"
            className="text-3xl font-extrabold text-gray-800 mb-4 border-b pb-4 border-gray-200"
          >
            {getPanelTitle(activePanel)}
          </h2>

          <div className="mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${connectionClasses}`}
            >
              {connectionLabel}
            </span>
          </div>

          {activePanel === 'finance' && <StatsSummaryPanel />}

          <div
            id="content-area"
            className="bg-white p-8 rounded-xl shadow-md min-h-[60vh] border border-gray-100"
          >
            {renderActivePanel()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;