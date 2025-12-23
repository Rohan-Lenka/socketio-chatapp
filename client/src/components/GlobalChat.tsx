"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Socket } from "socket.io-client";

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

interface GlobalChatProps {
    username: string;
    socket: Socket;
}

export const GlobalChat = ({ username, socket }: GlobalChatProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "System",
            content: "Welcome to Global Chat!",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        socket.on("global-chat", (data: any) => {
            console.log(data);
            setMessages((prev) => prev = [...prev, data]);
            console.log(messages);
        });
        return () => {
            socket.off("global-chat");
        }
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const msg = newMessage.trim();
        if (!msg) return;

        const message: Message = {
            id: Date.now().toString(),
            sender: username,
            content: msg,
            timestamp: new Date().toISOString(),
        };
        setNewMessage("");
        socket.emit("global-chat", message);
    };

    return (
        <div className="flex flex-col h-full bg-muted/30 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/5 bg-background/50 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Global Chat
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Live interactions with everyone
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender === username;
                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"
                                } animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div
                                className={`
                max-w-[80%] rounded-2xl px-4 py-3 
                ${isMe
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted text-foreground rounded-tl-none border border-white/5"
                                    }
              `}
                            >
                                {!isMe && (
                                    <p className="text-xs text-muted-foreground mb-1 font-medium">
                                        {msg.sender}
                                    </p>
                                )}
                                <p className="text-sm">{msg.content}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSendMessage}
                className="p-4 bg-background/50 border-t border-white/5 flex gap-2"
            >
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-background/80"
                />
                <Button
                    type="submit"
                    size="md"
                    className="shrink-0 aspect-square px-0 w-11"
                >
                    ➤
                </Button>
            </form>
        </div>
    );
};
