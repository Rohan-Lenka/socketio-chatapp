'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Socket } from 'socket.io-client';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

interface RoomChatProps {
    socket: Socket;
    username: string;
}

export const RoomChat = ({ socket, username }: RoomChatProps) => {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [joinInput, setJoinInput] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        socket.on('private-chat', (data) => {
            setMessages((prev) => [...prev, data]);
        })
        return () => {
            if (!roomId) return;
            socket.emit('leave-room', roomId);
            socket.off('private-chat');
            socket.off('join-room');
            socket.off('leave-room');
        }
    }, [socket])

    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
        setRoomId(newRoomId);

        socket.emit('join-room', {
            id: '1',
            sender: 'System',
            content: `Room ${newRoomId} created! Share this ID to invite others.`,
            timestamp: new Date().toISOString(),
        }, newRoomId);

    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinInput.trim()) {
            setRoomId(joinInput.trim().toUpperCase());
            socket.emit('join-room', {
                id: '1',
                sender: 'System',
                content: `${username} joined the room`,
                timestamp: new Date().toISOString(),
            }, joinInput.trim().toUpperCase());
        }
    };

    const handleLeaveRoom = () => {
        socket.emit('leave-room', {
            id: '-1',
            sender: 'System',
            content: `${username} left the room`,
            timestamp: new Date().toISOString(),
        }, roomId);
        setRoomId(null);
        setMessages([]);
        setJoinInput('');
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now().toString(),
            sender: username,
            content: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        socket.emit('private-chat', message, roomId);
        setNewMessage('');
    };

    if (!roomId) {
        return (
            <div className="flex flex-col h-full bg-muted/30 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm p-8 justify-center items-center space-y-8">
                <div className="text-center space-y-2">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                        🏠
                    </div>
                    <h2 className="text-2xl font-bold">Room Chat</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Create a private space or join an existing one with your friends.
                    </p>
                </div>

                <div className="w-full max-w-xs space-y-4">
                    <Button onClick={handleCreateRoom} className="w-full" variant="primary">
                        Create New Room
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-muted/30 px-2 text-muted-foreground backdrop-blur-sm">Or join existing</span>
                        </div>
                    </div>

                    <form onSubmit={handleJoinRoom} className="flex gap-2">
                        <Input
                            placeholder="Enter Room ID"
                            value={joinInput}
                            onChange={(e) => setJoinInput(e.target.value)}
                            className="bg-background/50"
                        />
                        <Button type="submit" variant="secondary" disabled={!joinInput.trim()}>
                            Join
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-muted/30 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/5 bg-background/50 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        Test Room: {roomId}
                    </h2>
                    <p className="text-xs text-muted-foreground">Private Room</p>
                </div>
                <Button size="sm" variant="ghost" onClick={handleLeaveRoom} className="text-xs h-8">
                    Leave Room
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender === username;
                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`
                max-w-[80%] rounded-2xl px-4 py-3 
                ${isMe
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-muted text-foreground rounded-tl-none border border-white/5'}
              `}>
                                {!isMe && (
                                    <p className="text-xs text-muted-foreground mb-1 font-medium">{msg.sender}</p>
                                )}
                                <p className="text-sm">{msg.content}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-background/50 border-t border-white/5 flex gap-2">
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-background/80"
                />
                <Button type="submit" size="md" className="shrink-0 aspect-square px-0 w-11">
                    ➤
                </Button>
            </form>
        </div>
    );
};
