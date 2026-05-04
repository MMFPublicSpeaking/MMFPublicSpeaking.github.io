import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export default function StudentSubmissionForm({ assignment, existingSubmission, studentEmail, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState(existingSubmission?.submission_text || '');
  const [videoLink, setVideoLink] = useState(existingSubmission?.video_link || '');
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(existingSubmission?.file_url || '');
  
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSubmission) {
        return base44.entities.Submission.update(existingSubmission.id, data);
      } else {
        return base44.entities.Submission.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      setIsOpen(false);
      if (onSuccess) onSuccess();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const submissionData = {
      assignment_id: assignment.id,
      student_email: studentEmail,
      submission_text: submissionText,
      video_link: videoLink,
      file_url: fileUrl,
      status: 'submitted',
      submitted_date: new Date().toISOString(),
    };
    submitMutation.mutate(submissionData);
  };

  const canSubmit = () => {
    const type = assignment.submission_type;
    if (type === 'text') return submissionText.trim().length > 0;
    if (type === 'file') return fileUrl;
    if (type === 'video_link') return videoLink.trim().length > 0;
    if (type === 'both') return submissionText.trim().length > 0 || fileUrl;
    return false;
  };

  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'graded';

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className={isSubmitted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}
        size="sm"
      >
        {isSubmitted ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            View Submission
          </>
        ) : (
          'Submit Assignment'
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isSubmitted ? 'Your Submission' : `Submit: ${assignment.title}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {(assignment.submission_type === 'text' || assignment.submission_type === 'both') && (
              <div>
                <Label>Your Response</Label>
                <Textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={8}
                  disabled={existingSubmission?.status === 'graded'}
                />
              </div>
            )}

            {(assignment.submission_type === 'file' || assignment.submission_type === 'both') && (
              <div>
                <Label>Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading || existingSubmission?.status === 'graded'}
                  />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {fileUrl && (
                  <p className="text-sm text-emerald-600 mt-2">
                    ✓ File uploaded successfully
                  </p>
                )}
              </div>
            )}

            {assignment.submission_type === 'video_link' && (
              <div>
                <Label>Video Link (YouTube, Vimeo, etc.)</Label>
                <Input
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://..."
                  disabled={existingSubmission?.status === 'graded'}
                />
              </div>
            )}

            {existingSubmission?.status === 'graded' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-slate-900 mb-2">Mentor Feedback</p>
                <p className="text-slate-700 whitespace-pre-wrap mb-2">{existingSubmission.feedback}</p>
                {existingSubmission.grade !== null && (
                  <p className="text-sm text-slate-600">
                    Grade: {existingSubmission.grade} / {assignment.points}
                  </p>
                )}
              </div>
            )}

            {existingSubmission?.status !== 'graded' && (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !canSubmit()}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}