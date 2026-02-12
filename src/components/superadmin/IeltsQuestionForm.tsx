"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle, PlusCircle } from 'lucide-react';

// Define IELTS Question Types
export const ieltsQuestionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'matching', label: 'Matching' },
  { value: 'diagram_labelling', label: 'Diagram Labelling' },
  { value: 'sentence_completion', label: 'Sentence Completion' },
  { value: 'summary_completion', label: 'Summary Completion' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'true_false_not_given', label: 'True/False/Not Given' },
  { value: 'table_completion', label: 'Table Completion' },
  { value: 'flow_chart_completion', label: 'Flow-chart Completion' },
  { value: 'form_completion', label: 'Form Completion' },
];

export interface IeltsQuestion {
  id: string; // Use UUID for unique key
  type: string;
  questionText: string;
  options?: string[];
  matchingPairs?: { prompt: string; answer: string }[];
  correctAnswer?: string | string[];
  audioFile?: File | null;
  imageFile?: File | null;
}

interface IeltsQuestionFormProps {
  question: IeltsQuestion;
  onQuestionChange: (question: IeltsQuestion) => void;
  onRemove: () => void;
}

const IeltsQuestionForm: React.FC<IeltsQuestionFormProps> = ({ question, onQuestionChange, onRemove }) => {

  const handleFieldChange = (field: keyof IeltsQuestion, value: any) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const renderQuestionFields = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <>
            <div className="grid gap-2 mt-2">
              <Label>Options (comma-separated)</Label>
              <Input
                value={question.options?.join(', ') || ''}
                onChange={(e) => handleFieldChange('options', e.target.value.split(',').map(s => s.trim()))}
                placeholder="Option A, Option B, Option C"
              />
            </div>
            <div className="grid gap-2 mt-2">
              <Label>Correct Answer</Label>
              <Input
                value={question.correctAnswer as string || ''}
                onChange={(e) => handleFieldChange('correctAnswer', e.target.value)}
                placeholder="Enter the correct option text"
              />
            </div>
          </>
        );
      case 'matching':
        return (
          <div className="grid gap-2 mt-2">
            <Label>Matching Pairs</Label>
            {question.matchingPairs?.map((pair, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={pair.prompt}
                  onChange={(e) => {
                    const newPairs = [...(question.matchingPairs || [])];
                    newPairs[index].prompt = e.target.value;
                    handleFieldChange('matchingPairs', newPairs);
                  }}
                  placeholder={`Prompt ${index + 1}`}
                />
                <Input
                  value={pair.answer}
                  onChange={(e) => {
                    const newPairs = [...(question.matchingPairs || [])];
                    newPairs[index].answer = e.target.value;
                    handleFieldChange('matchingPairs', newPairs);
                  }}
                  placeholder={`Answer ${index + 1}`}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFieldChange('matchingPairs', [...(question.matchingPairs || []), { prompt: '', answer: '' }])}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Pair
            </Button>
          </div>
        );
      // Add cases for other 8 question types here...
      default:
        return (
            <div className="grid gap-2 mt-2">
              <Label>Correct Answer</Label>
              <Input
                value={question.correctAnswer as string || ''}
                onChange={(e) => handleFieldChange('correctAnswer', e.target.value)}
                placeholder="Enter the correct answer"
              />
            </div>
        );
    }
  };

  return (
    <Card className="p-4 border-l-4 border-blue-400 relative mb-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        onClick={onRemove}
      >
        <XCircle className="h-5 w-5" />
      </Button>
      <div className="grid gap-4">
        <div>
          <Label>Question Type</Label>
          <Select
            value={question.type}
            onValueChange={(value) => handleFieldChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a question type" />
            </SelectTrigger>
            <SelectContent>
              {ieltsQuestionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Question Text/Instructions</Label>
          <Textarea
            value={question.questionText}
            onChange={(e) => handleFieldChange('questionText', e.target.value)}
            placeholder="Enter the main question or instructions..."
          />
        </div>
        {renderQuestionFields()}
        
        <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
                <Label>Audio File (for Listening)</Label>
                <Input type="file" accept="audio/*" onChange={(e) => handleFieldChange('audioFile', e.target.files ? e.target.files[0] : null)} />
            </div>
            <div>
                <Label>Image File (for Diagram)</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFieldChange('imageFile', e.target.files ? e.target.files[0] : null)} />
            </div>
        </div>
      </div>
    </Card>
  );
};

export default IeltsQuestionForm;