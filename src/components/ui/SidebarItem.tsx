
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

interface SidebarItemProps {
  item: {
    id: string
    label: string
    href: string
  }
  isSelected: boolean
  handleItemClick: (id: string) => void
}

const SidebarItem = ({ item, isSelected, handleItemClick }: SidebarItemProps) => {
  return (
    <div
      className={cn(
        "rounded-md px-2 py-2 cursor-pointer",
        isSelected ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={() => handleItemClick(item.id)}
    >
      <Link to={item.href} className="flex items-center">
        {item.label}
      </Link>
    </div>
  )
}

export default SidebarItem
