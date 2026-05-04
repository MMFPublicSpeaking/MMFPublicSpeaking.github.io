import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import SubmissionGradingDialog from '../components/SubmissionGradingDialog';

export default function MentorSubmissions({ classId, classData }) {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const { data: assignments = [] } = useQuery({
    queryKey: ['class-assignments', classId],
    queryFn: async () => {
      const all = await base44.entities.Assignment.list('-created_date', 200);
      return all.filter(a => a.class_id === classId && a.status === 'published');
    },
    enabled: !!classId,
  });

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions', classId],
    queryFn: async () => {
      const all = await base44.entities.Submission.list('-submitted_date', 500);
      const assignmentIds = assignments.map(a => a.id);
      return all.filter(s => assignmentIds.includes(s.assignment_id));
    },
    enabled: !!classId && assignments.length > 0,
  });

  const handleGradeClick = (submission, assignment) => {
    setSelectedSubmission(submission);
    setSelectedAssignment(assignment);
    setIsGradingOpen(true);
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  const renderSubmissionsList = (subs, showGradeButton = false) => (
    <div className="space-y-3">
      {subs.map((submission) => {
        const assignment = assignments.find(a => a.id === submission.assignment_id);
        if (!assignment) return null;
        
        return (
          <Card key={submission.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-slate-900">{assignment.title}</p>
                    <Badge className={
                      submission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }>
                      {submission.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Student: {submission.student_email}</p>
                  {submission.submitted_date && (
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted: {new Date(submission.submitted_date).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGradeClick(submission, assignment)}
                  className={showGradeButton ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  variant={showGradeButton ? 'default' : 'outline'}
                >
                  {showGradeButton ? 'Grade' : 'View'}
                </Button>
              </div>
              
              {submission.status === 'graded' && (
                <div className="flex items-center gap-4 text-sm">
                  {submission.grade !== null && (
                    <span className="text-slate-600">
                      Grade: <span className="font-semibold">{submission.grade}/{assignment.points}</span>
                    </span>
                  )}
                  {submission.graded_date && (
                    <span className="text-slate-500">
                      Graded: {new Date(submission.graded_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Student Submissions</h3>
        <p className="text-sm text-slate-600">Review and grade student work</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Graded ({gradedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No pending submissions</p>
              </CardContent>
            </Card>
          ) : (
            renderSubmissionsList(pendingSubmissions, true)
          )}
        </TabsContent>

        <TabsContent value="graded" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : gradedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No graded submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            renderSubmissionsList(gradedSubmissions, false)
          )}
        </TabsContent>
      </Tabs>

      {selectedSubmission && selectedAssignment && (
        <SubmissionGradingDialog
          submission={selectedSubmission}
          assignment={selectedAssignment}
          isOpen={isGradingOpen}
          onClose={() => {
            setIsGradingOpen(false);
            setSelectedSubmission(null);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}