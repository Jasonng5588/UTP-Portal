"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { nexusApi } from "@/lib/api";
import {
    Users,
    Search,
    UserPlus,
    MessageSquare,
    Heart,
    Share2,
    Image,
    Smile,
    Send,
    Bell,
    Calendar,
    MapPin,
    Link2,
    MoreHorizontal,
    ThumbsUp,
    MessageCircle,
    Repeat2,
    BookOpen,
    GraduationCap,
    Briefcase,
    Globe,
    Award,
    Loader2,
} from "lucide-react";

type UserProfile = {
    id: string;
    name: string;
    avatar: string | null;
    course: string;
    year: string;
    bio: string;
    followers: number;
    following: number;
    posts: number;
};


const posts = [
    {
        id: "post1",
        author: { name: "Dr. Sarah Ahmad", avatar: "/api/placeholder/40/40", title: "Senior Lecturer, Computer Science" },
        content: "Excited to announce that our AI Research Lab is accepting applications for the upcoming semester! If you're interested in machine learning and neural networks, this is your chance. DM for more info! 🚀 #UTPAI #Research",
        timestamp: "2 hours ago",
        likes: 45,
        comments: 12,
        shares: 8,
        image: null,
    },
    {
        id: "post2",
        author: { name: "Nurul Aisyah", avatar: "/api/placeholder/40/40", title: "Petroleum Engineering, Year 4" },
        content: "Just completed my internship at PETRONAS! Amazing 6 months of learning and growth. Thank you to everyone who supported me along the way. 💚 #SIIP #PETRONAS",
        timestamp: "5 hours ago",
        likes: 128,
        comments: 24,
        shares: 15,
        image: null,
    },
    {
        id: "post3",
        author: { name: "GDSC UTP", avatar: "/api/placeholder/40/40", title: "Google Developer Student Club" },
        content: "🎉 Hackathon 2025 registrations are now OPEN! Build innovative solutions and win amazing prizes. Register at the link below! Don't miss out!\n\n📅 March 1-2, 2025\n📍 Pocket D, UTP",
        timestamp: "1 day ago",
        likes: 89,
        comments: 31,
        shares: 45,
        image: null,
    },
    {
        id: "post4",
        author: { name: "Ahmad Faiz", avatar: "/api/placeholder/40/40", title: "Mechanical Engineering, Year 3" },
        content: "Finally submitted my FYP proposal! Can't wait to start working on my autonomous drone project. Any feedback or collaboration opportunities are welcome! 🛸",
        timestamp: "2 days ago",
        likes: 67,
        comments: 18,
        shares: 5,
        image: null,
    },
];

const suggestedConnections = [
    { id: "u1", name: "Lee Wei Ming", course: "Electrical Engineering", year: "Year 3", mutualFriends: 12 },
    { id: "u2", name: "Siti Fatimah", course: "Chemical Engineering", year: "Year 2", mutualFriends: 8 },
    { id: "u3", name: "Raj Kumar", course: "Computer Science", year: "Year 4", mutualFriends: 15 },
    { id: "u4", name: "Chen Mei Ling", course: "Petroleum Engineering", year: "Year 3", mutualFriends: 6 },
];

const groups = [
    { id: "g1", name: "UTP Mechanical Engineers", members: 450, type: "Academic" },
    { id: "g2", name: "GDSC UTP", members: 320, type: "Club" },
    { id: "g3", name: "Photography Society", members: 180, type: "Hobby" },
    { id: "g4", name: "Badminton Club UTP", members: 150, type: "Sports" },
];

const events = [
    { id: "e1", title: "Career Fair 2025", date: "Mar 5-6, 2025", attendees: 500 },
    { id: "e2", title: "Hackathon 2025", date: "Mar 1-2, 2025", attendees: 150 },
];

const notifications = [
    { id: "n1", message: "Dr. Sarah Ahmad liked your post", time: "2h ago" },
    { id: "n2", message: "Nurul Aisyah started following you", time: "5h ago" },
    { id: "n3", message: "You have a new message from Lee Wei Ming", time: "1d ago" },
];

export default function UNexusPage() {
    const [activeTab, setActiveTab] = useState("feed");
    const [newPostContent, setNewPostContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [composeDialogOpen, setComposeDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserProfile>({
        id: "",
        name: "",
        avatar: null,
        course: "",
        year: "",
        bio: "",
        followers: 0,
        following: 0,
        posts: 0,
    });
    const [feedPosts, setFeedPosts] = useState(posts);

    const supabase = createClient();

    // Fetch real user data
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Fetch profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        // Get follower/following counts
                        const { count: followersCount } = await supabase
                            .from('connections')
                            .select('*', { count: 'exact', head: true })
                            .eq('following_id', user.id);

                        const { count: followingCount } = await supabase
                            .from('connections')
                            .select('*', { count: 'exact', head: true })
                            .eq('follower_id', user.id);

                        const { count: postsCount } = await supabase
                            .from('posts')
                            .select('*', { count: 'exact', head: true })
                            .eq('author_id', user.id);

                        setCurrentUser({
                            id: user.id,
                            name: profile.full_name || user.user_metadata?.full_name || 'Student',
                            avatar: profile.avatar_url,
                            course: profile.programme || 'Computer Science',
                            year: profile.year_of_study ? `Year ${profile.year_of_study}` : 'Year 1',
                            bio: profile.bio || '',
                            followers: followersCount || 0,
                            following: followingCount || 0,
                            posts: postsCount || 0,
                        });
                    }

                    // Fetch posts from database
                    const { data: dbPosts } = await supabase
                        .from('posts')
                        .select(`
                            *,
                            author:profiles!posts_author_id_fkey(full_name, avatar_url, programme)
                        `)
                        .order('created_at', { ascending: false })
                        .limit(20);

                    if (dbPosts && dbPosts.length > 0) {
                        // Transform to expected format
                        const formattedPosts = dbPosts.map((p: any) => ({
                            id: p.id,
                            author: {
                                name: p.author?.full_name || 'Unknown',
                                avatar: p.author?.avatar_url,
                                title: p.author?.programme || 'Student'
                            },
                            content: p.content,
                            timestamp: new Date(p.created_at).toLocaleString(),
                            likes: p.likes_count || 0,
                            comments: p.comments_count || 0,
                            shares: 0,
                            image: p.image_url
                        }));
                        setFeedPosts(formattedPosts);
                    }
                }
            } catch (error) {
                console.error('Error fetching UNexus data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const createPost = async () => {
        if (!newPostContent.trim()) {
            toast.error("Please write something to post");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to post");
                return;
            }

            const { error } = await supabase
                .from('posts')
                .insert({
                    author_id: user.id,
                    content: newPostContent,
                });

            if (error) throw error;

            toast.success("Post published!");
            setNewPostContent("");
            setComposeDialogOpen(false);

            // Refresh posts
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || "Failed to publish post");
        }
    };

    const likePost = async (postId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to like posts");
                return;
            }

            const { error } = await supabase
                .from('post_likes')
                .insert({ post_id: postId, user_id: user.id });

            if (error) {
                if (error.code === '23505') { // Unique violation - already liked
                    // Unlike
                    await supabase
                        .from('post_likes')
                        .delete()
                        .match({ post_id: postId, user_id: user.id });
                    toast.success("Post unliked");
                } else {
                    throw error;
                }
            } else {
                toast.success("Post liked!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to like post");
        }
    };

    const sharePost = (postId: string) => {
        toast.success("Post shared!");
    };

    const followUser = async (userId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to follow users");
                return;
            }

            const { error } = await supabase
                .from('connections')
                .insert({ follower_id: user.id, following_id: userId });

            if (error) throw error;
            toast.success("Connection request sent!");
        } catch (error: any) {
            toast.error(error.message || "Failed to follow user");
        }
    };

    const joinGroup = async (groupId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to join groups");
                return;
            }

            const { error } = await supabase
                .from('group_members')
                .insert({ group_id: groupId, user_id: user.id });

            if (error) throw error;
            toast.success("Joined group!");
        } catch (error: any) {
            toast.error(error.message || "Failed to join group");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (

        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UNexus</h1>
                        <p className="text-muted-foreground">Campus Social Network</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people, groups..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Send className="h-4 w-4" />
                                Post
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Post</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <Avatar>
                                        <AvatarFallback>AF</AvatarFallback>
                                    </Avatar>
                                    <Textarea
                                        placeholder="What's on your mind?"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        rows={4}
                                        className="flex-1"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost"><Image className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="ghost"><Smile className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="ghost"><MapPin className="h-4 w-4" /></Button>
                                    </div>
                                    <Button onClick={createPost}>Publish</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Profile Summary */}
            <Card className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border-2 border-white">
                            <AvatarFallback className="text-lg">{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{currentUser.name}</h2>
                            <p className="text-cyan-100">{currentUser.course} • {currentUser.year}</p>
                        </div>
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-2xl font-bold">{currentUser.posts}</p>
                                <p className="text-cyan-100 text-sm">Posts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{currentUser.followers}</p>
                                <p className="text-cyan-100 text-sm">Followers</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{currentUser.following}</p>
                                <p className="text-cyan-100 text-sm">Following</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="feed">Feed</TabsTrigger>
                            <TabsTrigger value="groups">Groups</TabsTrigger>
                            <TabsTrigger value="events">Events</TabsTrigger>
                        </TabsList>

                        {/* Feed Tab */}
                        <TabsContent value="feed" className="space-y-4">
                            {/* Compose Box */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <Input
                                            placeholder="What's on your mind?"
                                            className="flex-1"
                                            onClick={() => setComposeDialogOpen(true)}
                                            readOnly
                                        />
                                        <Button variant="ghost" size="icon">
                                            <Image className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Posts */}
                            {feedPosts.map((post) => (
                                <Card key={post.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{post.author.name}</p>
                                                    <p className="text-sm text-muted-foreground">{post.author.title}</p>
                                                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="mt-4 whitespace-pre-wrap">{post.content}</p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => likePost(post.id)}>
                                                <ThumbsUp className="h-4 w-4" />
                                                {post.likes}
                                            </Button>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                                <MessageCircle className="h-4 w-4" />
                                                {post.comments}
                                            </Button>
                                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => sharePost(post.id)}>
                                                <Share2 className="h-4 w-4" />
                                                {post.shares}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        {/* Groups Tab */}
                        <TabsContent value="groups" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Groups</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {groups.map((group) => (
                                        <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{group.name}</p>
                                                    <p className="text-sm text-muted-foreground">{group.members} members • {group.type}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">View</Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Events Tab */}
                        <TabsContent value="events" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Events</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="p-4 rounded-lg border">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {event.date}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {event.attendees} attending
                                                    </p>
                                                </div>
                                                <Button size="sm">Interested</Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                                    <p>{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Suggested Connections */}
                    <Card>
                        <CardHeader>
                            <CardTitle>People You May Know</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {suggestedConnections.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.course}</p>
                                            <p className="text-xs text-muted-foreground">{user.mutualFriends} mutual</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => followUser(user.id)}>
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
