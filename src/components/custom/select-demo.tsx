"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function SelectDemo({ countries, value, onChange }: { countries: string[], value?: string, onChange?: (val: any) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select a Country</label>
      <Select value={value} onValueChange={onChange} defaultValue={!value ? countries[0] : undefined}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {countries.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
