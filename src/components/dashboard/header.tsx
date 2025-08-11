'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/lib/actions/auth';
import { LogOut } from 'lucide-react';
import type { Session } from '@/lib/auth';

function BrandIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <path d="m12 8-8 5 8 5 8-5-8-5Z" />
        <path d="M20 13v4c0 1.1-.9 2-2 2H6a2 2 0 0 1-2-2v-4" />
        <path d="m4 13 8 5 8-5" />
      </svg>
    );
  }

export default function Header({ user }: { user: Session }) {
  const userInitials = user.email ? user.email.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-50">
      <nav className="flex-1">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <BrandIcon />
          <span className="font-bold">StreamLink</span>
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user.picture || `https://placehold.co/40x40.png`} alt={user.email} data-ai-hint="user avatar" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col">
              <span>My Account</span>
              <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={logout}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full flex items-center cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
