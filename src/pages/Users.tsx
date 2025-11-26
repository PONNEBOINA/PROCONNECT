import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { UserPlus, Search, Check } from 'lucide-react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const { getAllUsers, sendFriendRequest, friendRequests } = useSocial();
  const { user } = useAuth();
  const { toast } = useToast();

  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter((u: any) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = (userId: string, userName: string) => {
    sendFriendRequest(userId);
    toast({ title: 'Friend request sent!', description: `Sent request to ${userName}` });
  };

  const isPending = (userId: string) => {
    return friendRequests.some(
      r => r.receiverId === userId && r.senderId === user?.id && r.status === 'pending'
    );
  };

  const isFriend = (userId: string) => {
    return user?.friends.includes(userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Discover Students
          </h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" size={20} />
            <Input
              placeholder="Search by name or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card/50 backdrop-blur-sm border-2 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((userItem: any, index) => (
            <Card 
              key={userItem.id} 
              className="p-4 hover-lift transition-all animate-slide-up bg-gradient-to-r from-card to-card/50 backdrop-blur-sm border-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <Link to={`/user/${userItem.id}`} className="flex items-center space-x-3 flex-1 group/link">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20 transition-all group-hover/link:ring-primary/40 group-hover/link:scale-105">
                    <AvatarImage src={userItem.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold">
                      {userItem.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold group-hover/link:text-primary transition-colors">{userItem.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />
                      {userItem.section}
                    </p>
                    {userItem.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{userItem.bio}</p>
                    )}
                  </div>
                </Link>

                {isFriend(userItem.id) ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="bg-primary/10 border-primary/30 text-primary"
                  >
                    <Check size={16} className="mr-2" />
                    Friends
                  </Button>
                ) : isPending(userItem.id) ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="bg-muted/50"
                  >
                    Pending
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(userItem.id, userItem.name)}
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all group"
                  >
                    <UserPlus size={16} className="mr-2 transition-transform group-hover:scale-110" />
                    Add Friend
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card className="p-12 text-center animate-bounce-in bg-gradient-to-br from-card to-muted/30">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-float">
                <Search className="text-primary" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try a different search term
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
