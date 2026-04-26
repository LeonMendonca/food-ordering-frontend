"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function SelectUser({ users, value, onChange }: { users: User[], value?: string, onChange?: (val: any) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select a User</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Select User" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
