import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { UserPlus, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Discover Students</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search by name or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((userItem: any) => (
            <Card key={userItem.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <Link to={`/user/${userItem.id}`} className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userItem.avatarUrl} />
                    <AvatarFallback>{userItem.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{userItem.name}</p>
                    <p className="text-sm text-muted-foreground">{userItem.section}</p>
                    {userItem.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{userItem.bio}</p>
                    )}
                  </div>
                </Link>

                {isFriend(userItem.id) ? (
                  <Button variant="outline" size="sm" disabled>
                    Friends
                  </Button>
                ) : isPending(userItem.id) ? (
                  <Button variant="outline" size="sm" disabled>
                    Pending
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(userItem.id, userItem.name)}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Add Friend
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
