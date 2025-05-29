import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { query } from "@/convex/_generated/server";
const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});
const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { data: searchResults, isLoading: isSearching } = useConvexQuery(
    api.users.searchUsers,{query:searchQuery}
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const handleClose = () => {
    onClose();
  };
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter group name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter group description"
                {...register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label>Members</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentUser && (
                  <Badge variant="secondary" className="px-3 py-1">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={currentUser.imageUrl} />
                      <AvatarFallback>
                        {currentUser.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{currentUser.name}(You)</span>
                  </Badge>
                )}
              </div>
            </div>
          </form>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGroupModal;
