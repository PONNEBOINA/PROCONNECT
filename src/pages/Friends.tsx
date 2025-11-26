import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Friends() {
  const { friendRequests, respondToFriendRequest, getFriendsList } = useSocial();
  const { user } = useAuth();
  const { toast } = useToast();

  const pendingRequests = friendRequests.filter(
    r => r.receiverId === user?.id && r.status === 'pending'
  );

  const friends = getFriendsList();

  const handleRespond = (requestId: string, accept: boolean, senderName: string) => {
    respondToFriendRequest(requestId, accept);
    toast({
      title: accept ? 'Friend request accepted!' : 'Friend request rejected',
      description: accept ? `You are now friends with ${senderName}` : undefined
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-3 mt-4">
            {friends.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No friends yet</p>
              </Card>
            ) : (
              friends.map((friend: any) => (
                <Card key={friend.id} className="p-4 hover:shadow-md transition-all">
                  <Link to={`/user/${friend.id}`} className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.avatarUrl} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.section}</p>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3 mt-4">
            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.senderAvatar} />
                        <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.senderName}</p>
                        <p className="text-sm text-muted-foreground">wants to be friends</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(request.id, true, request.senderName)}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(request.id, false, request.senderName)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
