"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Use the Role type
interface Role {
  id: number;
  created_at: string;
  read: boolean;
  admin: boolean;
  role_name: string;
}

interface RolesListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onView: (role: Role) => void;
}

export function RolesList({ roles, onEdit, onView }: RolesListProps) {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">{role.role_name}</h3>
            <p className="text-sm text-muted-foreground">
              Read: {role.read ? "Yes" : "No"} | Admin: {role.admin ? "Yes" : "No"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onView(role)}>
                View Permissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(role)}>
                Edit Permissions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}