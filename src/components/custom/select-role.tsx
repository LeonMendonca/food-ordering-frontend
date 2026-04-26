"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectRole({ roles, value, onChange }: { roles: string[], value?: string, onChange?: (val: any) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select a Role</label>
      <Select value={value} onValueChange={onChange} defaultValue={!value ? roles[0] : undefined}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {roles.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
