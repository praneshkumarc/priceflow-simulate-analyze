import { useState } from "react"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import { isMobile as isMobileFn } from "@/lib/utils"
import SidebarItem from "./SidebarItem"
import MobileNav from "./MobileNav"
import UserProfile from "@/components/UserProfile";

interface SidebarProps {
  navItems: { id: string; label: string; href: string }[]
  selectedItem: string
  handleItemClick: (id: string) => void
}

const Sidebar = ({ navItems, selectedItem, handleItemClick }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)") || isMobileFn()

return (
  <Sheet open={isOpen} onOpenChange={setIsOpen}>
    <SheetTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 md:hidden"
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="flex flex-col p-0">
      <div className="flex flex-col h-full">
        <MobileNav 
          navItems={navItems} 
          selectedItem={selectedItem} 
          handleItemClick={handleItemClick} 
          setIsOpen={setIsOpen} 
        />
      </div>
    </SheetContent>
    <div className={cn("h-full", isMobile ? "hidden" : "block")}>
      <nav className="grid gap-4 px-2 text-lg font-medium py-4">
        <div className="flex justify-between items-center px-2 mb-2">
          <div className="text-lg font-bold">SmartPriceAI</div>
          <div className="flex items-center">
            <UserProfile />
          </div>
        </div>
        <Separator />
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isSelected={selectedItem === item.id}
            handleItemClick={handleItemClick}
          />
        ))}
      </nav>
    </div>
  </Sheet>
);
}

export default Sidebar
