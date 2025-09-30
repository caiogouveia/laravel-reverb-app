import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Chat',
        href: '/chat',
    },
];

interface Message {
    username: string;
    message: string;
    timestamp: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('Conectando ao canal messages...');

        // Conectar ao canal de mensagens
        const channel = window.Echo.channel('messages');

        channel
            .subscribed(() => {
                console.log('✅ Conectado ao canal messages');
                setIsConnected(true);
            })
            .listen('MessageSent', (e: Message) => {
                console.log('📨 Nova mensagem recebida:', e);
                setMessages((prev) => [...prev, e]);
            })
            .error((error: any) => {
                console.error('❌ Erro no canal:', error);
                setIsConnected(false);
            });

        // Cleanup ao desmontar
        return () => {
            console.log('Desconectando do canal messages...');
            window.Echo.leave('messages');
        };
    }, []);

    useEffect(() => {
        // Auto-scroll para última mensagem
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("message:", `${username}, enviou a mensagem: ${message}`);

        // if (!message.trim() || !username.trim()) return;

        router.post(
            '/messages',
            {
                message: message.trim(),
                username: username.trim(),
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setMessage('');
                },
                onError: (errors) => {
                    console.error('Erro ao enviar mensagem:', errors);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat em Tempo Real" />
            <div className="flex h-full flex-1 flex-col rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="text-lg font-semibold">
                        Chat em Tempo Real
                    </h2>
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-2 w-2 rounded-full ${
                                isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        />
                        <span className="text-sm text-muted-foreground">
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Nenhuma mensagem ainda. Seja o primeiro a enviar!
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-sidebar-border/70 bg-sidebar p-3 dark:border-sidebar-border"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-primary">
                                        {msg.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            msg.timestamp,
                                        ).toLocaleTimeString('pt-BR')}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm">{msg.message}</p>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSubmit}
                    className="border-t border-sidebar-border/70 p-4 dark:border-sidebar-border"
                >
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Seu nome..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-lg border border-sidebar-border/70 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-sidebar-border"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Digite sua mensagem..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 rounded-lg border border-sidebar-border/70 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-sidebar-border"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || !username.trim()}
                            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
