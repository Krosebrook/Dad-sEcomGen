import React, { useState, useRef, useEffect } from 'react';
import { ProductPlan, ChatMessage } from '../types';
import { continueChat } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ChatCardProps {
  productPlan: ProductPlan;
  history: ChatMessage[];
  onHistoryChange: (newHistory: ChatMessage[]) => void;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const ChatCard: React.FC<ChatCardProps> = ({ productPlan, history, onHistoryChange }) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        const updatedHistory = [...history, newUserMessage];
        
        onHistoryChange(updatedHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const aiResponse = await continueChat(productPlan, updatedHistory);
            const newAiMessage: ChatMessage = { role: 'model', content: aiResponse };
            onHistoryChange([...updatedHistory, newAiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            onHistoryChange([...updatedHistory, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">AI Sounding Board</CardTitle>
                <CardDescription>Ask follow-up questions about your plan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        {history.length === 0 && !isLoading && (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-slate-500">Ask me anything about your plan, like "Suggest some blog post ideas" or "What are some potential risks?"</p>
                            </div>
                        )}
                        {history.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900' : 'bg-white dark:bg-slate-700'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-md p-3 rounded-lg bg-white dark:bg-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                        <Input 
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            disabled={isLoading}
                            className="h-10 flex-grow"
                        />
                        <Button type="submit" disabled={isLoading || !userInput.trim()} size="sm" className="h-10 w-10 p-0">
                           <SendIcon />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatCard;