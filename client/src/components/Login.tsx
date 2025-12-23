'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginProps {
    onLogin: (username: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/20">
            <div className="w-full max-w-md space-y-8 p-8 bg-background/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-2xl">
                        👋
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your name to join the conversation
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <Input
                        label="Display Name"
                        placeholder="e.g., Alex"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!username.trim()}
                    >
                        Enter Chat
                    </Button>
                </form>
            </div>
        </div>
    );
};
