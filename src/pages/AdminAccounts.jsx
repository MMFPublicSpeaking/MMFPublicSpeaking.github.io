import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, Mail, Loader2, CheckCircle2, XCircle, Shield, GraduationCap
} from 'lucide-react';

export default function AdminAccounts() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'student' });
  const [inviteStatus, setInviteStatus] = useState(null);
  const [isInviting, setIsInviting] = useState(false);

  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const handleInviteUser = async () => {
    if (!inviteData.email || !inviteData.email.includes('@')) {
      setInviteStatus({ type: 'error', message: 'Please enter a valid email' });
      return;
    }

    setIsInviting(true);
    setInviteStatus(null);

    try {
      await base44.users.inviteUser(inviteData.email, inviteData.role);
      setInviteStatus({ type: 'success', message: `${inviteData.role} invited successfully!` });
      setInviteData({ email: '', role: 'student' });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setTimeout(() => {
        setIsInviteDialogOpen(false);
        setInviteStatus(null);
      }, 2000);
    } catch (error) {
      setInviteStatus({ type: 'error', message: error.message || 'Failed to invite user' });
    } finally {
      setIsInviting(false);
    }
  };

  const mentors = allUsers.filter(u => u.role === 'mentor');
  const students = allUsers.filter(u => u.role === 'student');
  const admins = allUsers.filter(u => u.role === 'admin');

  const UserCard = ({ user }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
          user.role === 'admin' ? 'bg-indigo-600' : 
          user.role === 'mentor' ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-medium text-slate-900">{user.full_name || user.email}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
          {user.phone && (
            <p className="text-xs text-slate-500">{user.phone}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={
          user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
        }>
          {user.status || 'active'}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Account Management</h1>
            <p className="text-slate-600 mt-1">Invite and manage mentors, students, and admins</p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <UserPlus className="w-4 h-4" /> Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Email Address*</Label>
                  <Input 
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="user@example.com"
                    onKeyDown={(e) => e.key === 'Enter' && handleInviteUser()}
                  />
                </div>
                <div>
                  <Label>Role*</Label>
                  <Select 
                    value={inviteData.role} 
                    onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {inviteStatus && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    inviteStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {inviteStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {inviteStatus.message}
                  </div>
                )}
                
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleInviteUser}
                  disabled={isInviting}
                >
                  {isInviting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Mentors</p>
                  <p className="text-3xl font-bold">{mentors.length}</p>
                </div>
                <Shield className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Students</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                </div>
                <GraduationCap className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Admins</p>
                  <p className="text-3xl font-bold">{admins.length}</p>
                </div>
                <Shield className="w-10 h-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mentors">Mentors ({mentors.length})</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="mentors">
            <Card>
              <CardHeader>
                <CardTitle>All Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                {mentors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No mentors yet</p>
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                      Invite First Mentor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentors.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No students yet</p>
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                      Invite First Student
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>All Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {admins.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}