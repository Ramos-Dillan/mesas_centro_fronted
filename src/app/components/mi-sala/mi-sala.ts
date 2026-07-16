import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../service/ai.service';
import { AiChatService } from '../../service/ai-chat.service';
import { RecommendationResult } from '../../models/recommendation.model';
import { ChatMessage } from '../../models/message.model';

type ChatView = 'menu' | 'upload' | 'chat';

@Component({
  selector: 'app-mi-sala',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-sala.html',
  styleUrls: ['./mi-sala.scss']
})
export class MiSala implements OnInit {

  botName = 'Sofía';

  // ===== Un solo estado controla toda la vista del chat =====
  view: ChatView = 'menu';

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  loading = false;
  error: string | null = null;
  result: RecommendationResult | null = null;

  // ===== Chat =====
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;
  conversationId: number | null = null;

  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInputRef') chatInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private aiService: AiService,
    private aiChatService: AiChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chatMessages = [
      {
        role: 'assistant',
        content: `¡Hola! Soy ${this.botName}, tu asistente de Centro Home 👋 Puedo recomendarte la mesa de centro ideal para tu sala, o resolver dudas sobre precios y materiales del catálogo. ¿Qué quieres hacer?`
      }
    ];
    this.view = 'menu';
  }

  get isMenu(): boolean { return this.view === 'menu'; }
  get isUpload(): boolean { return this.view === 'upload'; }
  get isChat(): boolean { return this.view === 'chat'; }

  // ============ NAVEGACIÓN ============

  goToRecommendation(): void {
    this.result = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.error = null;
    this.view = 'upload';
    this.cdr.detectChanges();
    this.scrollChatToBottom();
  }

  askQuestion(): void {
    // Ya no exigimos foto: el usuario puede preguntar sobre
    // precios, materiales o el catálogo en general sin haber subido nada.
    this.view = 'chat';
    this.cdr.detectChanges();
    this.focusChatInput();
  }

  backToMenu(): void {
    this.view = 'menu';
    this.selectedFile = null;
    this.previewUrl = null;
    this.error = null;

    this.chatMessages.push({
      role: 'assistant',
      content: '¡Sin problema! ¿Qué te gustaría hacer?'
    });

    this.cdr.detectChanges();
    this.scrollChatToBottom();
  }

  // ============ UPLOAD ============

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFile = file;
    this.result = null;
    this.error = null;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.cdr.detectChanges();
      this.scrollChatToBottom();
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.error = '⚠️ Selecciona una foto de tu sala primero.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.result = null;
    this.cdr.detectChanges();
    this.scrollChatToBottom();

    this.aiService.recommend(this.selectedFile).subscribe({
      next: (response) => {
        this.result = response.data;
        this.loading = false;
        this.view = 'chat';

        this.chatMessages.push({
          role: 'assistant',
          content: `¡Listo! Analicé tu sala y esta es mi recomendación: ${this.result.table} (${this.result.score}% de compatibilidad). ${this.result.explanation}`,
          generated_image: this.result.generated_image
        });

        this.cdr.detectChanges();
        this.scrollChatToBottom();
      },
      error: (err) => {
        console.error('AI recommend error', err);

        if (err?.status === 401) {
          this.error = '🔒 Tu sesión expiró, inicia sesión de nuevo.';
        } else if (err?.status === 0) {
          this.error = '🌐 No hay conexión con el servidor.';
        } else {
          this.error = err?.error?.message || '❌ Ocurrió un error generando la recomendación.';
        }

        this.loading = false;
        this.cdr.detectChanges();
        this.scrollChatToBottom();
      }
    });
  }

  getImageUrl(path: string): string {
    return `http://localhost:5000/${path}`;
  }

  reset(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.result = null;
    this.error = null;
    this.conversationId = null;
    this.view = 'upload';

    this.chatMessages.push({
      role: 'assistant',
      content: 'Perfecto, sube una nueva foto de tu sala y te doy otra recomendación.'
    });

    this.cdr.detectChanges();
    this.scrollChatToBottom();
  }

  // ============ CHAT ============

  focusChatInput(): void {
    setTimeout(() => this.chatInputRef?.nativeElement.focus(), 0);
  }

  sendChatMessage(): void {
    const text = this.chatInput.trim();

    if (!text || this.chatLoading) return;

    this.chatMessages.push({ role: 'user', content: text });
    this.chatInput = '';
    this.chatLoading = true;
    this.cdr.detectChanges();
    this.scrollChatToBottom();

    // roomId es opcional: si el usuario todavía no subió una foto,
    // mandamos null y el backend debe responder con info general
    // del catálogo (precios, materiales, etc.) en vez de rechazar la petición.
    // ⚠️ Esto requiere que tu endpoint de chat (el que llama aiChatService.sendMessage)
    // acepte room_id = null/opcional y tenga un branch para responder sin contexto de sala.
    const roomId = this.result?.room ?? null;

    this.aiChatService.sendMessage(roomId, text, this.conversationId).subscribe({
      next: (response) => {
        const data = response.data;

        this.conversationId = data.conversation_id;

        this.chatMessages.push({
          role: 'assistant',
          content: data.reply,
          generated_image: data.generated_image
        });

        if (data.generated_image && this.result) {
          this.result.generated_image = data.generated_image;
        }

        this.chatLoading = false;
        this.cdr.detectChanges();
        this.scrollChatToBottom();
      },
      error: (err) => {
        console.error('AI chat error', err);

        this.chatMessages.push({
          role: 'assistant',
          content: '❌ Ocurrió un error respondiendo tu mensaje, intenta de nuevo.'
        });

        this.chatLoading = false;
        this.cdr.detectChanges();
        this.scrollChatToBottom();
      }
    });
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 50);
  }
}