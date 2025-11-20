import {
  Sparkles,
  Wand2,
  CheckCircle,
  Minimize2,
  Maximize2,
  FileText,
  ArrowRight,
  MessageSquare,
  Smile,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Pilcrow,
} from 'lucide-react';

export interface SlashCommandItem {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'ai' | 'formatting';
  action: string;
  requiresSelection?: boolean;
}

export const slashCommandItems: SlashCommandItem[] = [
  // AI Commands
  {
    label: 'AI Generate',
    description: 'Generate content with AI',
    icon: Wand2,
    category: 'ai',
    action: 'generate',
    requiresSelection: false,
  },
  {
    label: 'AI Improve',
    description: 'Improve selected text',
    icon: Sparkles,
    category: 'ai',
    action: 'improve',
    requiresSelection: true,
  },
  {
    label: 'AI Fix Grammar',
    description: 'Fix grammar and spelling',
    icon: CheckCircle,
    category: 'ai',
    action: 'fix',
    requiresSelection: true,
  },
  {
    label: 'AI Simplify',
    description: 'Simplify language',
    icon: Minimize2,
    category: 'ai',
    action: 'simplify',
    requiresSelection: true,
  },
  {
    label: 'AI Make Formal',
    description: 'Make text more formal',
    icon: FileText,
    category: 'ai',
    action: 'formal',
    requiresSelection: true,
  },
  {
    label: 'AI Add Emojis',
    description: 'Add emojis to text',
    icon: Smile,
    category: 'ai',
    action: 'emojify',
    requiresSelection: true,
  },
  {
    label: 'AI Make Longer',
    description: 'Expand and add detail',
    icon: Maximize2,
    category: 'ai',
    action: 'expand',
    requiresSelection: true,
  },
  {
    label: 'AI Make Shorter',
    description: 'Make text more concise',
    icon: Minimize2,
    category: 'ai',
    action: 'shorten',
    requiresSelection: true,
  },
  {
    label: 'AI Summarize',
    description: 'Summarize text',
    icon: Minimize2,
    category: 'ai',
    action: 'summarize',
    requiresSelection: true,
  },
  {
    label: 'AI Continue',
    description: 'Continue writing',
    icon: ArrowRight,
    category: 'ai',
    action: 'continue',
    requiresSelection: true,
  },
  {
    label: 'AI Explain',
    description: 'Explain in simpler terms',
    icon: MessageSquare,
    category: 'ai',
    action: 'explain',
    requiresSelection: true,
  },

  // Formatting Commands
  {
    label: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    category: 'formatting',
    action: 'h1',
    requiresSelection: false,
  },
  {
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    category: 'formatting',
    action: 'h2',
    requiresSelection: false,
  },
  {
    label: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    category: 'formatting',
    action: 'h3',
    requiresSelection: false,
  },
  {
    label: 'Paragraph',
    description: 'Normal text paragraph',
    icon: Pilcrow,
    category: 'formatting',
    action: 'p',
    requiresSelection: false,
  },
  {
    label: 'Bulleted List',
    description: 'Create a bulleted list',
    icon: List,
    category: 'formatting',
    action: 'ul',
    requiresSelection: false,
  },
  {
    label: 'Numbered List',
    description: 'Create a numbered list',
    icon: ListOrdered,
    category: 'formatting',
    action: 'ol',
    requiresSelection: false,
  },
  {
    label: 'Quote',
    description: 'Create a blockquote',
    icon: Quote,
    category: 'formatting',
    action: 'blockquote',
    requiresSelection: false,
  },
];

// Helper to filter commands by category
export const getAICommands = () => slashCommandItems.filter(item => item.category === 'ai');
export const getFormattingCommands = () => slashCommandItems.filter(item => item.category === 'formatting');
