import { cn } from "@/lib/utils"

interface TimeSlotProps {
  time: string
  selected: boolean
  onClick: () => void
}

export function TimeSlot({ time, selected, onClick }: TimeSlotProps) {
  return (
    <button
      type="button"
      className={cn(
        "py-2 px-4 rounded-md text-center transition-colors",
        selected ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200",
      )}
      onClick={onClick}
    >
      {time}
    </button>
  )
}

