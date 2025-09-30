<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Send a message and broadcast it.
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'username' => 'required|string|max:100',
        ]);

        // Dispara o evento que será transmitido via Reverb
        $event = new MessageSent(
            message: $validated['message'],
            username: $validated['username']
        );

        \Log::info('Broadcasting message', [
            'username' => $validated['username'],
            'message' => $validated['message']
        ]);

        event($event);

        \Log::info('Event dispatched');

        return back();
    }

    /**
     * Get messages history (exemplo de integração com DB).
     */
    public function index()
    {
        // Aqui você poderia buscar mensagens do banco de dados
        return response()->json([
            'messages' => [
                ['username' => 'System', 'message' => 'Welcome to the chat!', 'timestamp' => now()],
            ],
        ]);
    }
}
