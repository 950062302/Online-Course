"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface CoursePartFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  part?: {
    id: string;
    title: string;
    description?: string;
    part_number: number;
  } | null;
  onPartSaved: () => void;
}

const CoursePartForm: React.FC<CoursePartFormProps> = ({
  isOpen,
  onClose,
  courseId,
  part,
  onPartSaved,
}) => {
  const [title, setTitle] = useState(part?.title || '');
  const [description, setDescription] = useState(part?.description || '');
  const [partNumber, setPartNumber] = useState<number | ''>(part?.part_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!part;

  useEffect(() => {
    if (isOpen) {
      setTitle(part?.title || '');
      setDescription(part?.description || '');
      setPartNumber(part?.part_number || '');
    }
  }, [isOpen, part]);

  const handleSubmit = async () => {
    if (!title || typeof partNumber !== 'number' || partNumber <= 0) {
      showError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading(isEditing ? "Kurs qismi yangilanmoqda..." : "Kurs qismi yaratilmoqda...");

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('course_parts')
          .update({
            title,
            description,
            part_number: partNumber,
          })
          .eq('id', part.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('course_parts')
          .insert({
            course_id: courseId,
            title,
            description,
            part_number: partNumber,
          });

        if (error) throw error;
      }

      showSuccess(isEditing ? "Kurs qismi muvaffaqiyatli yangilandi!" : "Kurs qismi muvaffaqiyatli yaratildi!");
      onPartSaved();
      onClose();
    } catch (error: any) {
      console.error("Kurs qismini saqlashda xato:", error);
      showError(`Kurs qismini saqlashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-ferrari-red">{isEditing ? "Kurs qismini tahrirlash" : "Yangi kurs qismi yaratish"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Kurs qismi ma'lumotlarini kiriting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Sarlavha</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Tavsif (ixtiyoriy)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="partNumber" className="text-right">Qism raqami</Label>
            <Input
              id="partNumber"
              type="number"
              value={partNumber}
              onChange={(e) => setPartNumber(parseFloat(e.target.value) || '')}
              className="col-span-3"
              min={1}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-ferrari-red hover:bg-red-700 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...
              </>
            ) : (
              isEditing ? "Yangilash" : "Yaratish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePartForm;