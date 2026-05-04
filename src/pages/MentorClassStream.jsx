import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Loader2, Paperclip, Pin, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorClassStream({ classId, user }) {
  const [newPost, setNewPost] = useState({ content: '', post_type: 'announcement' });
  const [newComment, setNewComment] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUrls, setFileUrls] = useState([]);

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['stream-posts', classId],
    queryFn: async () => {
      const all = await base44.entities.StreamPost.list('-created_date', 100);
      return all.filter(p => p.class_id === classId);
    },
    enabled: !!classId,
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['stream-comments'],
    queryFn: () => base44.entities.StreamComment.list('-created_date', 500),
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-posts', classId] });
      setNewPost({ content: '', post_type: 'announcement' });
      setFileUrls([]);
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-comments'] });
      setNewComment({});
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFileUrls([...fileUrls, result.file_url]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;
    createPostMutation.mutate({
      class_id: classId,
      author_email: user.email,
      author_name: user.full_name || user.email,
      content: newPost.content,
      post_type: newPost.post_type,
      file_urls: fileUrls,
      pinned: false
    });
  };

  const handleCreateComment = (postId) => {
    const content = newComment[postId];
    if (!content?.trim()) return;
    createCommentMutation.mutate({
      post_id: postId,
      author_email: user.email,
      author_name: user.full_name || user.email,
      content
    });
  };

  const getPostComments = (postId) => {
    return allComments.filter(c => c.post_id === postId);
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Select value={newPost.post_type} onValueChange={(value) => setNewPost({ ...newPost, post_type: value })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="assignment_reminder">Assignment Reminder</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="Share an update with your class..."
            rows={3}
          />
          {fileUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fileUrls.map((url, i) => (
                <Badge key={i} variant="outline" className="gap-2">
                  File {i + 1}
                  <button onClick={() => setFileUrls(fileUrls.filter((_, idx) => idx !== i))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <label>
              <Button variant="outline" size="sm" disabled={uploadingFile} asChild>
                <span className="gap-2 cursor-pointer">
                  {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  Attach File
                </span>
              </Button>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            <Button 
              className="ml-auto gap-2"
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending || !newPost.content.trim()}
            >
              <Send className="w-4 h-4" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No posts yet</p>
            <p className="text-slate-500 text-sm mt-1">Be the first to post!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => {
            const comments = getPostComments(post.id);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {post.author_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{post.author_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {post.post_type?.replace('_', ' ')}
                          </Badge>
                          {post.pinned && <Pin className="w-3 h-3 text-blue-600" />}
                        </div>
                        <p className="text-sm text-slate-500">{new Date(post.created_date).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.content}</p>
                    {post.file_urls && post.file_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.file_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
                              <Paperclip className="w-3 h-3 mr-1" /> Attachment {i + 1}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {/* Comments */}
                    {comments.length > 0 && (
                      <div className="border-t pt-4 space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                              {comment.author_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-slate-900">{comment.author_name}</span>
                                <span className="text-xs text-slate-500">{new Date(comment.created_date).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-slate-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Comment */}
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateComment(post.id)}
                      />
                      <Button 
                        size="sm"
                        onClick={() => handleCreateComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}