"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Loader2, PlusCircle } from 'lucide-react';
import CustomEditButton from '@/components/ui/CustomEditButton';
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';

interface MarketingCourse {
  id: string;
  title: string;
  description: string;
  image_src: string;
  lessons_count: string;
  level: string;
  price: string;
  button_text: string;
}

const marketingCourseSchema = z.object({
  title: z.string().min(1, "Sarlavha majburiy"),
  description: z.string().min(1, "Tavsif majburiy"),
  image_src: z.string().url("To'g'ri URL kiriting"),
  lessons_count: z.string().min(1, "Darslar soni majburiy"),
  level: z.string().min(1, "Daraja majburiy"),
  price: z.string().min(1, "Narx majburiy"),
  button_text: z.string().min(1, "Tugma matni majburiy"),
});

const EditMarketingCoursesPanel: React.FC = () => {
  const [courses, setCourses] = useState<MarketingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<MarketingCourse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const form = useForm<z.infer<typeof marketingCourseSchema>>({
    resolver: zodResolver(marketingCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      image_src: "",
      lessons_count: "",
      level: "",
      price: "",
      button_text: "Sotib olish",
    }
  });

  const fetchMarketingCourses = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('marketing_courses')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      showError("Marketing kurslarini yuklashda xato.");
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMarketingCourses();
  }, [fetchMarketingCourses]);

  const handleEditClick = (course: MarketingCourse) => {
    setDialogMode('edit');
    setCurrentCourse(course);
    form.reset(course);
    setIsEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setDialogMode('create');
    setCurrentCourse(null);
    form.reset({
      title: "",
      description: "",
      image_src: "",
      lessons_count: "",
      level: "",
      price: "",
      button_text: "Sotib olish",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (course: MarketingCourse) => {
    setCurrentCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentCourse) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('marketing_courses').delete().eq('id', currentCourse.id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Kurs muvaffaqiyatli o'chirildi.");
      fetchMarketingCourses();
      setIsDeleteDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const onSubmit = async (values: z.infer<typeof marketingCourseSchema>) => {
    setIsSubmitting(true);
    const toastId = showLoading("Ma'lumotlar saqlanmoqda...");

    try {
      let error;
      if (dialogMode === 'edit' && currentCourse) {
        ({ error } = await supabase.from('marketing_courses').update(values).eq('id', currentCourse.id));
      } else {
        ({ error } = await supabase.from('marketing_courses').insert([values]));
      }

      if (error) throw error;

      showSuccess(`Kurs muvaffaqiyatli ${dialogMode === 'edit' ? 'yangilandi' : 'yaratildi'}!`);
      fetchMarketingCourses();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      showError(`Xato: ${error.message}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Yuklanmoqda...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Landing Page Kurslari</CardTitle>
          <CardDescription>Bosh sahifada ko'rinadigan marketing kurs kartochkalarini boshqaring.</CardDescription>
        </div>
        <Button onClick={handleCreateClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yangi Kurs Qo'shish
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rasm</TableHead>
              <TableHead>Nomi</TableHead>
              <TableHead>Daraja</TableHead>
              <TableHead>Narxi</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <img src={course.image_src} alt={course.title} className="w-24 h-16 object-cover rounded-md" />
                </TableCell>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.level}</TableCell>
                <TableCell>{course.price}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <CustomEditButton onClick={() => handleEditClick(course)} />
                    <CustomDeleteButton onClick={() => handleDeleteClick(course)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Marketing Kursini Tahrirlash' : 'Yangi Marketing Kursi Yaratish'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Nomi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Tavsifi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="image_src" render={({ field }) => (
                <FormItem><FormLabel>Rasm URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="lessons_count" render={({ field }) => (
                <FormItem><FormLabel>Darslar Soni</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="level" render={({ field }) => (
                <FormItem><FormLabel>Daraja</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Narxi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="button_text" render={({ field }) => (
                <FormItem><FormLabel>Tugma Matni</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Bekor qilish</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Saqlash
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'chirishni tasdiqlaysizmi?</DialogTitle>
            <DialogDescription>
              "{currentCourse?.title}" kursini o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Bekor qilish</Button></DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EditMarketingCoursesPanel;