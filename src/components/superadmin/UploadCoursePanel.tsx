"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import {
  Headphones,
  BookOpen,
  Pencil,
  Mic,
  PlusCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import IeltsQuestionForm, { IeltsQuestion } from './IeltsQuestionForm'; // Import the new form
import { v4 as uuidv4 } from 'uuid';

const courseCategories = [
  { name: 'LISTENING', icon: Headphones },
  { name: 'READING', icon: BookOpen },
  { name: 'WRITING', icon: Pencil },
  { name: 'SPEAKING', icon: Mic },
];

const UploadCoursePanel: React.FC = () => {
  const { user, profile } = useSession();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const [coursePrice, setCoursePrice] = useState<number | ''>('');
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [courseDescription, setCourseDescription] = useState("");
  const [courseDurationDays, setCourseDurationDays] = useState<number | ''>(30);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideo, setLessonVideo] = useState<File | null>(null);
  const [lessonDescription, setLessonDescription] = useState("");
  const [createdLessonId, setCreatedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courseParts, setCourseParts] = useState<any[]>([]);
  const [ieltsQuestions, setIeltsQuestions] = useState<IeltsQuestion[]>([]); // Use new state for IELTS questions
  const [isSubmittingExercises, setIsSubmittingExercises] = useState(false);
  const lastQuestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastQuestionRef.current) {
      lastQuestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [ieltsQuestions.length]);


  useEffect(() => {
    if (profile) {
      console.log("Current user role (from context):", profile.role);
    }
  }, [profile]);

  const fetchCourseParts = useCallback(async (courseId: string) => {
    const { data, error } = await supabase
      .from('course_parts')
      .select('id, part_number, lessons(id)')
      .eq('course_id', courseId)
      .order('part_number', { ascending: true });

    if (error) {
      console.error("Error fetching course parts:", error);
      showError("Kurs bo'limlarini yuklashda xato yuz berdi.");
    } else {
      setCourseParts(data || []);
    }
  }, []);

  useEffect(() => {
    if (createdCourseId) {
      fetchCourseParts(createdCourseId);
    }
  }, [createdCourseId, fetchCourseParts]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCourseImage(event.target.files[0]);
    } else {
      setCourseImage(null);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLessonVideo(event.target.files[0]);
    } else {
      setLessonVideo(null);
    }
  };

  const handleCourseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCategory || !courseName || coursePrice === '' || !courseDescription || !courseImage || courseDurationDays === '') {
      showError("Iltimos, barcha maydonlarni to'ldiring va kurs rasmini tanlang.");
      return;
    }
    if (!user) {
      showError("Kurs yuklash uchun avval tizimga kiring.");
      return;
    }

    setLoading(true);
    const toastId = showLoading("Kurs kartochkasi yuklanmoqda...");

    try {
      const fileExtension = courseImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = `course_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course_images')
        .upload(filePath, courseImage);

      if (uploadError) throw uploadError;

      const publicImageUrl = supabase.storage.from('course_images').getPublicUrl(filePath).data.publicUrl;

      const { data: courseData, error: dbError } = await supabase
        .from('courses')
        .insert([{
            title: courseName,
            description: courseDescription,
            price: coursePrice,
            image_url: publicImageUrl,
            category: selectedCategory,
            user_id: user.id,
            duration_days: courseDurationDays,
        }])
        .select('id')
        .single();

      if (dbError) throw dbError;

      showSuccess("Kurs kartochkasi muvaffaqiyatli yuklandi!");
      setCreatedCourseId(courseData.id);
      setStep(3);
    } catch (error: any) {
      console.error("Kurs yuklashda xato:", error);
      showError(`Kurs yuklashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createdCourseId || selectedPartNumber === null || !lessonTitle || !lessonVideo) {
      showError("Iltimos, darslik nomini, video faylini tanlang va kurs bo'limini tanlaganingizga ishonch hos qiling.");
      return;
    }
    if (!user) {
      showError("Darslik yuklash uchun avval tizimga kiring.");
      return;
    }

    setLoading(true);
    const toastId = showLoading("Darslik yuklanmoqda...");

    try {
      let currentPart = courseParts.find(p => p.part_number === selectedPartNumber);
      let currentPartId = currentPart?.id;

      if (!currentPartId) {
        const { data: partData, error: partError } = await supabase
          .from('course_parts')
          .insert([{
              course_id: createdCourseId,
              part_number: selectedPartNumber,
              title: `Part ${selectedPartNumber}`,
              description: `This is Part ${selectedPartNumber} of the course.`,
          }])
          .select('id')
          .single();

        if (partError) throw partError;
        currentPartId = partData.id;
        await fetchCourseParts(createdCourseId);
      }

      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('part_id', currentPartId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrderIndex = (maxOrderError || !maxOrderData) ? 1 : (maxOrderData.order_index || 0) + 1;

      const fileExtension = lessonVideo.name.split('.').pop();
      const videoFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const videoFilePath = `lesson_videos/${videoFileName}`;

      const { error: videoUploadError } = await supabase.storage
        .from('lesson_videos')
        .upload(videoFilePath, lessonVideo);

      if (videoUploadError) throw videoUploadError;

      const videoPathToStore = videoFilePath;

      const { data: lessonData, error: lessonDbError } = await supabase
        .from('lessons')
        .insert([{
            part_id: currentPartId,
            title: lessonTitle,
            video_url: videoPathToStore,
            description: lessonDescription,
            order_index: nextOrderIndex,
        }])
        .select('id')
        .single();

      if (lessonDbError) throw lessonDbError;

      showSuccess(`Darslik "${lessonTitle}" muvaffaqiyatli yuklandi! Endi mashqlarni qo'shishingiz mumkin.`);
      setCreatedLessonId(lessonData.id);
      setStep(5);
      setIeltsQuestions([]);
    } catch (error: any) {
      console.error("Darslik yuklashda xato:", error);
      showError(`Darslik yuklashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setLoading(false);
    }
  };

  const handleAddIeltsQuestion = () => {
    setIeltsQuestions(prev => [
      ...prev,
      { id: uuidv4(), type: 'multiple_choice', questionText: '' },
    ]);
  };

  const handleIeltsQuestionChange = (index: number, updatedQuestion: IeltsQuestion) => {
    const newQuestions = [...ieltsQuestions];
    newQuestions[index] = updatedQuestion;
    setIeltsQuestions(newQuestions);
  };

  const handleRemoveIeltsQuestion = (index: number) => {
    setIeltsQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleExercisesSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createdLessonId) {
      showError("Darslik ID topilmadi. Iltimos, avval darslikni yuklang.");
      return;
    }
    if (ieltsQuestions.length === 0) {
      showError("Hech qanday savol qo'shilmagan.");
      return;
    }

    setIsSubmittingExercises(true);
    const toastId = showLoading("Mashqlar yuklanmoqda...");

    try {
      for (const [index, question] of ieltsQuestions.entries()) {
        let audio_url = null;
        let image_url = null;

        // Upload audio file if it exists
        if (question.audioFile) {
          const audioPath = `ielts_questions_media/${createdLessonId}/${uuidv4()}`;
          const { error: audioError } = await supabase.storage.from('course_images').upload(audioPath, question.audioFile);
          if (audioError) throw new Error(`Audio faylni yuklashda xato: ${audioError.message}`);
          audio_url = supabase.storage.from('course_images').getPublicUrl(audioPath).data.publicUrl;
        }

        // Upload image file if it exists
        if (question.imageFile) {
          const imagePath = `ielts_questions_media/${createdLessonId}/${uuidv4()}`;
          const { error: imageError } = await supabase.storage.from('course_images').upload(imagePath, question.imageFile);
          if (imageError) throw new Error(`Rasm faylini yuklashda xato: ${imageError.message}`);
          image_url = supabase.storage.from('course_images').getPublicUrl(imagePath).data.publicUrl;
        }

        const questionToInsert = {
          lesson_id: createdLessonId,
          question_type: question.type,
          question_text: question.questionText,
          options: question.options,
          matching_pairs: question.matchingPairs,
          correct_answer: question.correctAnswer,
          audio_url,
          image_url,
          order_index: index + 1,
        };

        const { error: insertError } = await supabase.from('ielts_questions').insert(questionToInsert);
        if (insertError) throw new Error(`Savolni saqlashda xato: ${insertError.message}`);
      }

      showSuccess("Barcha mashqlar muvaffaqiyatli yuklandi!");
      resetLessonForm();
      setStep(4); // Go back to add another lesson
    } catch (error: any) {
      console.error("Mashqlarni yuklashda xato:", error);
      showError(`Mashqlarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmittingExercises(false);
    }
  };

  const resetCourseForm = () => {
    setSelectedCategory(null);
    setCourseName("");
    setCoursePrice('');
    setCourseDescription("");
    setCourseDurationDays(30);
    setCourseImage(null);
    setCreatedCourseId(null);
    setSelectedPartNumber(null);
    resetLessonForm();
    setCourseParts([]);
    setStep(1);
  };

  const resetLessonForm = () => {
    setLessonTitle("");
    setLessonVideo(null);
    setLessonDescription("");
    setCreatedLessonId(null);
    setIeltsQuestions([]);
    const videoInput = document.getElementById('lesson-video') as HTMLInputElement;
    if (videoInput) videoInput.value = '';
  };

  const getPartNumbers = () => {
    if (selectedCategory === 'READING') {
      return [1, 2, 3, 4, 5];
    }
    return [1, 2, 3, 4, 5, 6];
  };

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {step === 1 && "1. Kurs Turini Tanlang"}
          {step === 2 && "2. Kurs Kartochkasini To'ldirish"}
          {step === 3 && `3. "${courseName}" Kursi uchun Bo'lim Tanlang`}
          {step === 4 && `4. Part ${selectedPartNumber} uchun Darslik Yuklash`}
          {step === 5 && `5. "${lessonTitle}" darsligi uchun Mashqlar Yuklash`}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {step === 1 && "Yuklamoqchi bo'lgan kursingizning asosiy kategoriyasini tanlang."}
          {step === 2 && "Tanlangan kategoriya bo'yicha kurs ma'lumotlarini kiriting."}
          {step === 3 && "Darslik yuklash uchun kurs bo'limini tanlang."}
          {step === 4 && "Tanlangan bo'limga yangi video darslik yuklang."}
          {step === 5 && "Tanlangan darslikka tegishli IELTS savollarini qo'shing."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div id="category-selection" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {courseCategories.map((cat) => (
              <div
                key={cat.name}
                className={`p-6 text-center bg-card rounded-xl shadow-md border-2 cursor-pointer transition-all duration-200
                  ${selectedCategory === cat.name ? 'border-ferrari-red bg-red-950' : 'border-transparent hover:shadow-lg hover:scale-[1.02] hover:bg-gray-800'}`}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setStep(2);
                }}
              >
                <cat.icon className="w-10 h-10 mx-auto text-ferrari-red mb-2" />
                <p className="font-bold text-foreground">{cat.name}</p>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div id="course-form-container" className="mt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kategoriyani o'zgartirish
            </Button>
            <form onSubmit={handleCourseSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="course-name">Kurs Nomi</Label>
                <Input id="course-name" placeholder="Masalan: IELTS Listening 7.0+" value={courseName} onChange={(e) => setCourseName(e.target.value)} disabled={loading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="course-price">Narxi (UZS)</Label>
                  <Input id="course-price" type="number" placeholder="250000" value={coursePrice} onChange={(e) => setCoursePrice(parseFloat(e.target.value) || '')} disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course-duration-days">Amal qilish muddati (kun)</Label>
                  <Input id="course-duration-days" type="number" placeholder="30" value={courseDurationDays} onChange={(e) => setCourseDurationDays(parseInt(e.target.value) || '')} min={1} disabled={loading} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-image">Kurs Rasmi (JPG/PNG)</Label>
                <Input id="course-image" type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
                {courseImage && <p className="text-sm text-muted-foreground">Tanlangan fayl: {courseImage.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-description">Tavsifi</Label>
                <Textarea id="course-description" rows={4} placeholder="Kurs haqida qisqacha, jozibali tavsif kiriting..." value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} disabled={loading} />
              </div>
              <Button type="submit" className="w-full bg-ferrari-red hover:bg-red-700" disabled={loading}>
                {loading ? "Yuklanmoqda..." : "Kurs Kartochkasini Yuklash"}
              </Button>
            </form>
          </div>
        )}

        {step === 3 && createdCourseId && (
          <div id="part-selection-container" className="mt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kurs ma'lumotlarini o'zgartirish
            </Button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getPartNumbers().map((partNum) => (
                <div
                  key={partNum}
                  className={`p-6 text-center bg-card rounded-xl shadow-md border-2 cursor-pointer transition-all duration-200
                    ${selectedPartNumber === partNum ? 'border-ferrari-red bg-red-950' : 'border-transparent hover:shadow-lg hover:scale-[1.02] hover:bg-gray-800'}`}
                  onClick={() => {
                    setSelectedPartNumber(partNum);
                    setStep(4);
                  }}
                >
                  <PlusCircle className="w-10 h-10 mx-auto text-ferrari-red mb-2" />
                  <p className="font-bold text-foreground">Part {partNum}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={resetCourseForm} className="text-ferrari-red hover:bg-red-950">
                Yangi kurs yuklashni boshlash
              </Button>
            </div>
          </div>
        )}

        {step === 4 && createdCourseId && selectedPartNumber !== null && (
          <div id="lesson-upload-container" className="mt-4">
            <Button variant="outline" onClick={() => setStep(3)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Bo'limni o'zgartirish
            </Button>
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Part {selectedPartNumber} uchun darslik yuklash
            </h3>
            <form onSubmit={handleLessonSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="lesson-title">Darslik Nomi</Label>
                <Input id="lesson-title" placeholder="Masalan: Part 1 - Introduction to Listening" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} disabled={loading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lesson-video">Video Fayl (MP4, MOV, AVI)</Label>
                <Input id="lesson-video" type="file" accept="video/*" onChange={handleVideoChange} disabled={loading} />
                {lessonVideo && <p className="text-sm text-muted-foreground">Tanlangan fayl: {lessonVideo.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lesson-description">Darslik Tavsifi (ixtiyoriy)</Label>
                <Textarea id="lesson-description" rows={3} placeholder="Darslik haqida qisqacha ma'lumot..." value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} disabled={loading} />
              </div>
              <Button type="submit" className="w-full bg-ferrari-red hover:bg-red-700" disabled={loading}>
                {loading ? "Yuklanmoqda..." : "Darslikni Yuklash"}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => setStep(3)} className="text-ferrari-red hover:bg-red-950">
                Boshqa bo'limga o'tish
              </Button>
            </div>
          </div>
        )}

        {step === 5 && createdLessonId && (
          <div id="exercise-upload-container" className="mt-4">
            <Button variant="outline" onClick={() => setStep(4)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Darslikni o'zgartirish
            </Button>
            <h3 className="text-xl font-semibold mt-6 mb-4 text-ferrari-red">
              "{lessonTitle}" darsligi uchun IELTS Savollari
            </h3>
            <form onSubmit={handleExercisesSubmit} className="space-y-6">
              <div className="space-y-4">
                {ieltsQuestions.map((question, index) => (
                  <div key={question.id} ref={index === ieltsQuestions.length - 1 ? lastQuestionRef : null} className="question-form-wrapper">
                    <IeltsQuestionForm
                      question={question}
                      onQuestionChange={(updatedQuestion) => handleIeltsQuestionChange(index, updatedQuestion)}
                      onRemove={() => handleRemoveIeltsQuestion(index)}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddIeltsQuestion}
                  className="w-full mt-4 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  disabled={isSubmittingExercises}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Yangi savol qo'shish
                </Button>
              </div>
              <Button type="submit" className="w-full bg-ferrari-red hover:bg-red-700" disabled={isSubmittingExercises}>
                {isSubmittingExercises ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuklanmoqda...
                  </>
                ) : (
                  "Barcha Savollarni Yuklash"
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => {
                resetLessonForm();
                setStep(4);
              }} className="text-blue-500 hover:bg-blue-950">
                Yana darslik yuklash
              </Button>
              <Button variant="outline" onClick={resetCourseForm} className="text-ferrari-red hover:bg-red-950 ml-2">
                Yangi kurs yuklashni boshlash
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadCoursePanel;