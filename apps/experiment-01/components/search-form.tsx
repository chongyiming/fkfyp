import { useId, useState } from "react";
import { SidebarInput } from "@/components/ui/sidebar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { RiSearch2Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const id = useId();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Example sidebar options
  const sidebarOptions = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Contacts", path: "/contact" },
    { label: "Integration", path: "1" },
    { label: "Reports", path: "2" },
    { label: "Settings", path: "3" },
    { label: "Help Center", path: "4" },
  ];

  const filteredOptions = sidebarOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionClick = (path: string) => {
    router.push(path);
    setIsDropdownOpen(false);
  };
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <div className="relative">
            <SidebarInput
              id={id}
              className="ps-9 pe-9"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
              <RiSearch2Line size={20} aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
              <kbd className="inline-flex size-5 max-h-full items-center justify-center rounded bg-input px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                /
              </kbd>
            </div>
          </div>
          {isDropdownOpen && filteredOptions.length > 0 && (
            <div className="absolute z-10 mt-2 w-full rounded-md bg-sidebar shadow-lg">
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li
                    key={option.path}
                    className="px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                    onMouseDown={() => handleOptionClick(option.path)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
