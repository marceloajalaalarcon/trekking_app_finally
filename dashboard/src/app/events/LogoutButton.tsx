'use client';

import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-[#1A201E] font-medium transition-all group"
        >
            <LogOut size={18} className="group-hover:text-rose-400 transition-colors" />
            <span>Sair</span>
        </button>
    );
}
