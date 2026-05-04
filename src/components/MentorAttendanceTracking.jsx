import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function MentorAttendanceTracking({ classId, classData, userEmail }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [notes, setNotes] = useState({});
  
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['attendance', classId, selectedDate],
    queryFn: async () => {
      const all = await base44.entities.Attendance.list('-created_date', 500);
      return all.filter(a => a.class_id === classId && a.date === selectedDate);
    },
    enabled: !!classId,
  });

  const { data: allAttendanceHistory = [] } = useQuery({
    queryKey: ['attendance-history', classId],
    queryFn: async () => {
      const all = await base44.entities.Attendance.list('-date', 1000);
      return all.filter(a => a.class_id === classId);
    },
    enabled: !!classId,
  });

  const saveMutation = useMutation({
    mutationFn: async (records) => {
      return base44.entities.Attendance.bulkCreate(records);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setAttendanceData({});
      setNotes({});
    },
  });

  React.useEffect(() => {
    // Initialize attendance data from existing records
    const data = {};
    const noteData = {};
    attendanceRecords.forEach(record => {
      data[record.student_email] = record.status;
      noteData[record.student_email] = record.notes || '';
    });
    setAttendanceData(data);
    setNotes(noteData);
  }, [attendanceRecords]);

  const handleSave = async () => {
    const records = [];
    classData.student_emails?.forEach((email) => {
      const status = attendanceData[email] || 'present';
      const existing = attendanceRecords.find(r => r.student_email === email);
      
      if (existing) {
        records.push({ type: 'update', id: existing.id, status, notes: notes[email] || '' });
      } else {
        records.push({
          type: 'create',
          class_id: classId,
          student_email: email,
          date: selectedDate,
          status,
          notes: notes[email] || '',
          marked_by: userEmail,
        });
      }
    });

    if (records.length > 0) {
      const newRecords = records.filter(r => r.type === 'create').map(({ type, ...rest }) => rest);
      const updates = records.filter(r => r.type === 'update');
      
      try {
        await Promise.all([
          newRecords.length > 0 ? base44.entities.Attendance.bulkCreate(newRecords) : Promise.resolve(),
          ...updates.map(r => base44.entities.Attendance.update(r.id, { status: r.status, notes: r.notes }))
        ]);
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      } catch (error) {
        console.error('Error saving attendance:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'excused': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle2 className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-100 text-emerald-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-amber-100 text-amber-700';
      case 'excused': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Class Attendance</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Attendance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!classData.student_emails || classData.student_emails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No students enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classData.student_emails.map((email) => {
                const user = allUsers.find(u => u.email === email);
                const studentHistory = allAttendanceHistory.filter(a => a.student_email === email);
                const presentCount = studentHistory.filter(a => a.status === 'present').length;
                const absentCount = studentHistory.filter(a => a.status === 'absent').length;
                const lateCount = studentHistory.filter(a => a.status === 'late').length;
                
                return (
                <div key={email} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-slate-900">{user?.full_name || email}</p>
                        <p className="text-xs text-slate-500">{email}</p>
                      </div>
                      {studentHistory.length > 0 && (
                        <div className="text-xs text-slate-600 space-x-2">
                          <span className="text-emerald-600">P: {presentCount}</span>
                          <span className="text-red-600">A: {absentCount}</span>
                          <span className="text-amber-600">L: {lateCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mb-3">
                      {['present', 'absent', 'late', 'excused'].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={attendanceData[email] === status ? 'default' : 'outline'}
                          className={attendanceData[email] === status ? getStatusColor(status) : ''}
                          onClick={() => setAttendanceData({ ...attendanceData, [email]: status })}
                        >
                          {getStatusIcon(status)}
                          <span className="ml-2 capitalize">{status}</span>
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Notes (optional)..."
                      value={notes[email] || ''}
                      onChange={(e) => setNotes({ ...notes, [email]: e.target.value })}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summaries */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Summary */}
        {classData.student_emails && classData.student_emails.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected Day Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {Object.values(attendanceData).filter(s => s === 'present').length}
                  </p>
                  <p className="text-sm text-slate-600">Present</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {Object.values(attendanceData).filter(s => s === 'absent').length}
                  </p>
                  <p className="text-sm text-slate-600">Absent</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {Object.values(attendanceData).filter(s => s === 'late').length}
                  </p>
                  <p className="text-sm text-slate-600">Late</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {Object.values(attendanceData).filter(s => s === 'excused').length}
                  </p>
                  <p className="text-sm text-slate-600">Excused</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Summary */}
        {allAttendanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Class Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {allAttendanceHistory.filter(a => a.status === 'present').length}
                  </p>
                  <p className="text-sm text-slate-600">Present</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {allAttendanceHistory.filter(a => a.status === 'absent').length}
                  </p>
                  <p className="text-sm text-slate-600">Absent</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {allAttendanceHistory.filter(a => a.status === 'late').length}
                  </p>
                  <p className="text-sm text-slate-600">Late</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {allAttendanceHistory.filter(a => a.status === 'excused').length}
                  </p>
                  <p className="text-sm text-slate-600">Excused</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}