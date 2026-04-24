"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Phone, User as UserIcon, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';

interface Application {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  phone: string;
  message: string;
  status: 'pending' | 'contacted' | 'rejected';
}

const ApplicationsPanel: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error("Arizalarni yuklashda xato:", error);
      showError(`Arizalarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: 'pending' | 'contacted' | 'rejected') => {
    setIsUpdating(true);
    const toastId = showLoading(`Ariza holati yangilanmoqda...`);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      showSuccess(`Ariza holati muvaffaqiyatli yangilandi!`);
      fetchApplications();
    } catch (error: any) {
      console.error("Ariza holatini yangilashda xato:", error);
      showError(`Holatni yangilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsUpdating(false);
    }
  };

  const handleViewMessage = (message: string) => {
    setCurrentMessage(message);
    setIsMessageDialogOpen(true);
  };

  const handleDeleteClick = (application: Application) => {
    setApplicationToDelete(application);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);
    const toastId = showLoading(`Ariza o'chirilmoqda...`);

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationToDelete.id);

      if (error) throw error;

      showSuccess(`Ariza muvaffaqiyatli o'chirildi!`);
      fetchApplications();
      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } catch (error: any) {
      console.error("Arizani o'chirishda xato:", error);
      showError(`Arizani o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  const getStatusBadgeClass = (status: Application['status']) => {
    switch (status) {
      case 'contacted':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-950">Arizalar boshqaruvi</CardTitle>
          <CardDescription className="text-gray-600">Arizalar yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-950">Arizalar boshqaruvi</CardTitle>
        <CardDescription className="text-gray-600">Foydalanuvchi so‘rovlarini ko‘rib chiqing va holatini boshqaring.</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="py-10 text-center text-gray-500">Hozircha arizalar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-gray-700">Ism</TableHead>
                  <TableHead className="text-gray-700">Telefon</TableHead>
                  <TableHead className="text-gray-700">Xabar</TableHead>
                  <TableHead className="text-gray-700">Holat</TableHead>
                  <TableHead className="text-gray-700">Sana</TableHead>
                  <TableHead className="text-right text-gray-700">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-cyan-50/50 transition duration-150">
                    <TableCell className="font-medium text-gray-900 flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      {application.name}
                    </TableCell>
                    <TableCell className="text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${application.phone}`} className="text-primary hover:underline">{application.phone}</a>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewMessage(application.message)} className="flex items-center gap-1 rounded-full border-cyan-200 text-gray-700 hover:bg-cyan-50 hover:text-primary">
                        <MessageSquare className="h-4 w-4" /> Ko'rish
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(application.status)}>
                        {application.status === 'pending' ? 'Kutilmoqda' : application.status === 'contacted' ? 'Bog' + `'` + 'lanildi' : 'Rad etilgan'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{format(new Date(application.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Select onValueChange={(value: 'pending' | 'contacted' | 'rejected') => handleUpdateApplicationStatus(application.id, value)} value={application.status} disabled={isUpdating}>
                        <SelectTrigger className="w-[180px] rounded-full border-cyan-200 bg-white text-gray-700">
                          <SelectValue placeholder="Holat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Kutilmoqda</SelectItem>
                          <SelectItem value="contacted">Bog'lanildi</SelectItem>
                          <SelectItem value="rejected">Rad etilgan</SelectItem>
                        </SelectContent>
                      </Select>
                      <CustomDeleteButton onClick={() => handleDeleteClick(application)} disabled={isDeleting} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-cyan-100 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-950">Foydalanuvchi xabari</DialogTitle>
            <DialogDescription className="text-gray-600">Foydalanuvchi yuborgan xabar matni.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="whitespace-pre-wrap text-gray-800">{currentMessage}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full">Yopish</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-cyan-100 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-950">Arizani o'chirishni tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Siz <strong>"{applicationToDelete?.name}"</strong> arizasini butunlay o'chirmoqchisiz. Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteApplication} disabled={isDeleting} className="bg-destructive text-white hover:bg-red-700">
              {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ApplicationsPanel;