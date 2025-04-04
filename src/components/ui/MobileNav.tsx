
import React from "react"
import { Link } from "react-router-dom"
import { Separator } from "@/components/ui/separator"

interface MobileNavProps {
  navItems: {
    id: string
    label: string
    href: string
  }[]
  selectedItem: string
  handleItemClick: (id: string) => void
  setIsOpen: (isOpen: boolean) => void
}

const MobileNav = ({ navItems, selectedItem, handleItemClick, setIsOpen }: MobileNavProps) => {
  return (
    <div className="flex flex-col p-4 h-full">
      <div className="flex justify-between items-center px-2 mb-2">
        <div className="text-lg font-bold">SmartPriceAI</div>
      </div>
      <Separator className="mb-4" />
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`block px-2 py-2 rounded-md ${
              selectedItem === item.id
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
            onClick={() => {
              handleItemClick(item.id)
              setIsOpen(false)
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default MobileNav
