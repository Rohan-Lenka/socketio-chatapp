'use client';

import React, { useEffect, useState } from 'react';
import { GlobalChat } from './GlobalChat';
import { RoomChat } from './RoomChat';
import { Button } from './ui/Button';
import { io, Socket } from 'socket.io-client';

interface DashboardProps {
    username: string;
    onLogout: () => void;
}

export const Dashboard = ({ username, onLogout }: DashboardProps) => {

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socket = io('http://localhost:8080', {
            query: {
                username
            }
        });
        socket.on('connect', () => {
            setSocket(socket);
            console.log('Connected to server !');
        });
        return () => {
            setSocket(null);
            socket?.off('connect');
            socket?.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
                        ⚡
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">socket.io chatapp</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-muted-foreground">
                            {username}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLogout}
                        className="text-muted-foreground hover:text-red-400"
                    >
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Content - Split View */}
            <main className="flex-1 p-4 md:p-6 grid md:grid-cols-2 gap-4 md:gap-6 overflow-hidden min-h-0">
                {/* Global Chat Section */}
                <section className="flex flex-col min-h-0">
                    <GlobalChat socket={socket!} username={username} />
                </section>

                {/* Room Chat Section */}
                <section className="flex flex-col min-h-0">
                    <RoomChat socket={socket!} username={username} />
                </section>
            </main>
        </div>
    );
};
