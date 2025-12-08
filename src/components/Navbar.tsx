import { cn } from '../lib/utils';

export function Navbar() {
  return (
    <div className="w-full flex justify-center pt-6">
      <nav
        className={cn(
          'px-4 py-2 rounded-full bg-neutral-900 text-white shadow/20 shadow-lg',
          'flex items-center gap-6'
        )}
      >
        <div className="w-7 h-7 rounded-full ring-2 ring-white/40 flex items-center justify-center bg-neutral-800" />
        <a href="#pricing" className="text-sm hover:text-white/80">Pricing</a>
        <a href="#docs" className="text-sm hover:text-white/80">Docs</a>
        <a href="#login" className="text-sm hover:text-white/80">Login</a>
        <a
          href="#register"
          className="ml-2 text-sm bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-full shadow-inner"
        >
          Register
        </a>
      </nav>
    </div>
  );
}

