import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CommunityPost } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.string().optional()
});

type PostFormValues = z.infer<typeof postSchema>;

const CommunityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: ""
    }
  });

  // Fetch community posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/community-posts"],
    queryFn: async () => {
      const res = await fetch("/api/community-posts");
      if (!res.ok) throw new Error('Failed to fetch community posts');
      return res.json();
    }
  });

  // Create post mutation
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async (data: PostFormValues) => {
      // Convert comma-separated tags to array
      const tagsArray = data.tags 
        ? data.tags.split(',').map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-'))
        : [];
      
      return apiRequest("POST", "/api/community-posts", {
        userId: user?.id,
        title: data.title,
        content: data.content,
        tags: tagsArray
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your post has been successfully published.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PostFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post.",
        variant: "destructive"
      });
      return;
    }
    
    createPost(data);
  };

  // Filter posts based on search and tab
  const filteredPosts = posts.filter((post: CommunityPost) => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "my" && post.userId === user?.id) return matchesSearch;
    
    // Filter by common tags
    if (activeTab === "period" && post.tags.includes("period")) return matchesSearch;
    if (activeTab === "symptoms" && post.tags.some(tag => ["symptoms", "cramps", "headache", "mood"].includes(tag))) return matchesSearch;
    
    return false;
  });

  // Helper function to format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-2">Community</h1>
        <p className="text-neutral-500">Connect with others, share experiences, and find support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Posts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Discussions</CardTitle>
                <div className="w-full sm:w-auto">
                  <Input
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="my">My Posts</TabsTrigger>
                  <TabsTrigger value="period">Period Talk</TabsTrigger>
                  <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600">Loading discussions...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post: CommunityPost) => (
                    <div key={post.id} className="rounded-lg border border-neutral-200 p-4 hover:border-primary/30 hover:bg-neutral-50 transition-all">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-medium text-neutral-800">{post.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {post.responseCount} {post.responseCount === 1 ? 'response' : 'responses'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-neutral-100 text-neutral-600">
                            {tag.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs text-neutral-500">
                        <span>Posted by {post.userId === user?.id ? 'you' : 'anonymous'}</span>
                        <span>Active {formatDate(post.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
                    <i className="ri-chat-3-line text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700">No discussions found</h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    {activeTab === "my" ? "You haven't created any posts yet." : "Try adjusting your search or filter criteria."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Create Post & Guidelines */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start a Discussion</CardTitle>
              <CardDescription>
                Share your experiences or ask questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What would you like to discuss?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your experience or question..." 
                            rows={5}
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. period, cramps, advice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isPending || !isAuthenticated}
                  >
                    {isPending ? "Posting..." : "Post to Community"}
                  </Button>
                  
                  {!isAuthenticated && (
                    <p className="text-xs text-red-500 text-center">
                      You must be logged in to post.
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li className="flex gap-2">
                  <i className="ri-check-line text-primary flex-shrink-0 mt-0.5"></i>
                  <span>Be respectful and supportive of others</span>
                </li>
                <li className="flex gap-2">
                  <i className="ri-check-line text-primary flex-shrink-0 mt-0.5"></i>
                  <span>Maintain privacy and confidentiality</span>
                </li>
                <li className="flex gap-2">
                  <i className="ri-check-line text-primary flex-shrink-0 mt-0.5"></i>
                  <span>Share personal experiences but avoid medical advice</span>
                </li>
                <li className="flex gap-2">
                  <i className="ri-check-line text-primary flex-shrink-0 mt-0.5"></i>
                  <span>Use content warnings for sensitive topics</span>
                </li>
                <li className="flex gap-2">
                  <i className="ri-check-line text-primary flex-shrink-0 mt-0.5"></i>
                  <span>Report any harmful or inappropriate content</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50" onClick={() => setActiveTab("period")}>
                  Period Management
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50" onClick={() => setSearchQuery("pcos")}>
                  PCOS
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50" onClick={() => setSearchQuery("endometriosis")}>
                  Endometriosis
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50" onClick={() => setSearchQuery("fertility")}>
                  Fertility
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50" onClick={() => setSearchQuery("birth control")}>
                  Birth Control
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50" onClick={() => setSearchQuery("mental health")}>
                  Mental Health
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
