
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Calendar, Trash2 } from "lucide-react";
import { ChatConversation, deleteChatConversation } from "@/utils/supabase/chatHelpers";
import { toast } from "sonner";

interface ConversationListProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
  onConversationDeleted: (id: string) => void;
}

const ConversationList = ({ 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onCreateNew,
  onConversationDeleted 
}: ConversationListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (conversations.length === 1) {
      toast.error("Cannot delete the last conversation. Create a new one first.");
      return;
    }

    setDeletingId(conversationId);
    try {
      await deleteChatConversation(conversationId);
      onConversationDeleted(conversationId);
      toast.success("Conversation deleted successfully!");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-clari-darkCard border-r border-clari-darkAccent flex flex-col">
      <div className="p-4 border-b border-clari-darkAccent">
        <Button
          onClick={onCreateNew}
          className="w-full bg-clari-gold text-black hover:bg-clari-gold/90 gap-2"
        >
          <Plus size={16} />
          New Conversation
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-clari-muted py-8">
              <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Create your first conversation</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-colors hover:bg-clari-darkAccent/50 ${
                  currentConversationId === conversation.id
                    ? 'bg-clari-gold/10 border-clari-gold'
                    : 'bg-clari-darkBg border-clari-darkAccent'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate mb-1">
                        {conversation.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-clari-muted">
                        <Calendar size={12} />
                        {formatDate(conversation.updated_at)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          conversation.mode === 'survey' 
                            ? 'bg-clari-gold/20 text-clari-gold'
                            : conversation.mode === 'chart'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {conversation.mode}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:bg-red-500/20"
                      onClick={(e) => handleDelete(conversation.id, e)}
                      disabled={deletingId === conversation.id}
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
