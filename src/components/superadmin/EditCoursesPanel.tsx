"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Headphones, BookOpen, Pencil, Mic, Loader2 } from 'lucide-react';
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';
import CustomEditButton from '@/components/ui/CustomEditButton';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  user_id: string;
  duration_days: number;
  discount_percentage: number;
  created_at: string;
}

const courseCategories = [
  { name: 'LISTENING', icon: Headphones },
  { name: 'READING', icon: BookOpen },
  { name: 'WRITING', icon: Pencil },
  { name: 'SPEAKING', icon: Mic },
  { name: 'GENERAL', icon: BookOpen },
];

const courseEditSchema = z.object({
  title: z.string().min(1, "Kurs nomi majburiy"),
  description: z.string().min(1, "Tavsif majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  category: z.string().min(1, "Kategoriya majburiy"),
  duration_days: z.coerce.number().min(1, "Amal qilish muddati kamida 1 kun bo'lishi kerak"),
  discount_percentage: z.coerce.number().min(0, "Chegirma foizi manfiy bo'lishi mumkin emas").max(100, "Chegirma foizi 100% dan oshmasligi kerak"),
  image_file: z.any().optional(),
});

const EditCoursesPanel: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof courseEditSchema>>({
    resolver: zodResolver(courseEditSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      duration_days: 30,
      discount_percentage: 0,
    },
  });

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showError("Kurslarni yuklashda xato yuz berdi.");
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEditClick = (course: Course) => {
    setCurrentCourse(course);
    form.reset({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      duration_days: course.duration_days,
      discount_percentage: course.discount_percentage,
      image_file: undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCurrentCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!currentCourse) return;

    setIsSubmitting(true);
    const toastId = showLoading(`"${currentCourse.title}" kursi o'chirilmoqda...`);

    try {
      if (currentCourse.image_url) {
        const path = new URL(currentCourse.image_url).pathname.split('/course_images/')[1];
        if (path) {
          await supabase.storage.from('course_images').remove([path]);
        }
      }

      const { error } = await supabase.from('courses').delete().eq('id', currentCourse.id);
      if (error) throw error;

      showSuccess(`"${currentCourse.title}" kursi muvaffaqiyatli o'chirildi!`);
      fetchCourses();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      showError(`Kursni o'chirishda xato: ${error.message}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof courseEditSchema>) => {
    if (!currentCourse) return;

    setIsSubmitting(true);
    const toastId = showLoading(`"${values.title}" kursi yangilanmoqda...`);

    try {
      let newImageUrl = currentCourse.image_url;

      if (values.image_file && values.image_file.length > 0) {
        const imageFile = values.image_file[0];
        const filePath = `course_images/${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage.from('course_images').upload(filePath, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        
        newImageUrl = supabase.storage.from('course_images').getPublicUrl(filePath).data.publicUrl;

        if (currentCourse.image_url) {
          const oldPath = new URL(currentCourse.image_url).pathname.split('/course_images/')[1];
          if (oldPath && oldPath !== filePath) {
            await supabase.storage.from('course_images').remove([oldPath]);
          }
        }
      }

      const { error } = await supabase
        .from('courses')
        .update({
          title: values.title,
          description: values.description,
          price: values.price,
          category: values.category,
          duration_days: values.duration_days,
          discount_percentage: values.discount_percentage,
          image_url: newImageUrl,
        })
        .eq('id', currentCourse.id);

      if (error) throw error;

      showSuccess(`"${values.title}" kursi muvaffaqiyatli yangilandi!`);
      fetchCourses();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      showError(`Kursni yangilashda xato: ${error.message}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yuklangan Kurslarni Tahrirlash</CardTitle>
          <CardDescription>Kurs ma'lumotlari yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent><p className="text-center">Yuklanmoqda...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yuklangan Kurslarni Tahrirlash</CardTitle>
        <CardDescription>Platformadagi barcha kurslarni tahrirlash yoki o'chirish.</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha yuklangan kurslar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rasm</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Narxi</TableHead>
                  <TableHead>Muddati</TableHead>
                  <TableHead>Chegirma</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <img src={course.image_url || "https://placehold.co/50x30/FF2800/FFFFFF?text=Kurs"} alt={course.title} className="w-16 h-10 object-cover rounded-md" />
                    </TableCell>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>{course.price.toLocaleString()} UZS</TableCell>
                    <TableCell>{course.duration_days} kun</TableCell>
                    <TableCell className="text-green-500 font-bold">{course.discount_percentage}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CustomEditButton onClick={() => handleEditClick(course)} disabled={isSubmitting} />
                        <CustomDeleteButton onClick={() => handleDeleteClick(course)} disabled={isSubmitting} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Kursni Tahrirlash</DialogTitle>
            <DialogDescription>"{currentCourse?.title}" kursining ma'lumotlarini o'zgartiring.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Kurs Nomi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Tavsifi</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Narxi (UZS)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="duration_days" render={({ field }) => (
                  <FormItem><FormLabel>Muddati (kun)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="discount_percentage" render={({ field }) => (
                <FormItem><FormLabel>Chegirma (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Kategoriya</FormLabel><FormControl>
                  <div className="grid grid-cols-3 gap-2">
                    {courseCategories.map((cat) => (
                      <Button key={cat.name} type="button" variant={field.value === cat.name ? "default" : "outline"} onClick={() => field.onChange(cat.name)}>
                        <cat.icon className="w-4 h-4 mr-2" /> {cat.name}
                      </Button>
                    ))}
                  </div>
                </FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="image_file" render={({ field: { onChange, ...props }}) => (
                <FormItem>
                  <FormLabel>Yangi Rasm Yuklash</FormLabel>
                  <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...props} /></FormControl>
                  {currentCourse?.image_url && <p className="text-sm text-muted-foreground">Joriy rasm: <a href={currentCourse.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ko'rish</a></p>}
                  <FormMessage />
                </FormItem>
              )}/>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Bekor qilish</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Yangilanmoqda..." : "Saqlash"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kursni O'chirishni Tasdiqlaysizmi?</DialogTitle>
            <DialogDescription>
              Siz <strong>"{currentCourse?.title}"</strong> kursini butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Bekor qilish</Button></DialogClose>
            <Button type="button" variant="destructive" onClick={confirmDeleteCourse} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EditCoursesPanel;