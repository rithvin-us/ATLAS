'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2, FileText, Briefcase, DollarSign, Gavel, Users, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Topic {
  icon: any;
  title: string;
  description: string;
  color: string;
}

const popularTopics: Topic[] = [
  {
    icon: FileText,
    title: 'RFQ Management',
    description: 'Create & track quotes',
    color: 'text-primary',
  },
  {
    icon: Briefcase,
    title: 'Projects',
    description: 'Manage your work',
    color: 'text-success',
  },
  {
    icon: DollarSign,
    title: 'Invoicing',
    description: 'Billing & payments',
    color: 'text-primary',
  },
  {
    icon: Gavel,
    title: 'Auctions',
    description: 'Competitive bidding',
    color: 'text-warning',
  },
  {
    icon: Users,
    title: 'Contractors',
    description: 'Find & manage vendors',
    color: 'text-primary',
  },
];

const quickQuestions = [
  'How do I create a new RFQ?',
  'What is the auction process?',
  'How to track project progress?',
  'How do I send an invoice?',
  'How to find reliable contractors?',
  'What are the payment terms?',
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your ATLAS AI assistant! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message?: string) => {
    const textToSend = message || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(textToSend),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleTopicClick = (topic: Topic) => {
    handleSend(`Tell me about ${topic.title}`);
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('create') && input.includes('rfq')) {
      return 'To create a new RFQ:\n1. Navigate to the RFQ section from your dashboard\n2. Click "New RFQ" button\n3. Fill in project details, requirements, and specifications\n4. Set your deadline and budget range\n5. Click "Publish" to send it to contractors\n\nYou can save drafts and come back to edit before publishing';
    } else if (input.includes('rfq')) {
      return 'RFQ (Request for Quotation) allows you to collect detailed quotes from contractors for your projects. You can specify materials, labor requirements, timelines, and budget. Contractors can then submit competitive bids for your review.';
    } else if (input.includes('auction')) {
      return 'The auction process on ATLAS:\n1. Create an auction linked to your RFQ\n2. Set start/end dates and auction type (open/sealed)\n3. Contractors submit their bids\n4. Review all bids in real-time (for open auctions)\n5. Award the project to the best bidder\n\nAuctions help you get the most competitive pricing';
    } else if (input.includes('track') && input.includes('project')) {
      return 'Track your projects easily:\n• Dashboard shows all active projects\n• View progress milestones and completion percentages\n• Check contractor activity and updates\n• Monitor budget vs actual spending\n• Receive notifications for important events\n\nClick on any project card to see detailed progress reports';
    } else if (input.includes('invoice') || input.includes('send')) {
      return 'To send an invoice:\n1. Go to Invoices section\n2. Click "New Invoice"\n3. Select the project and contractor\n4. Add line items with descriptions and amounts\n5. Set payment terms and due date\n6. Click "Send" to deliver via email\n\nYou can track payment status and send reminders for overdue invoices.';
    } else if (input.includes('contractor') || input.includes('vendor') || input.includes('find')) {
      return 'Finding reliable contractors:\n• Browse our verified contractor directory\n• Check credibility scores and ratings\n• View past project history and reviews\n• Filter by specialty, location, and availability\n• Send direct RFQ invitations to specific contractors\n\nATLAS helps you build a trusted network of professionals';
    } else if (input.includes('payment')) {
      return 'Payment terms on ATLAS:\n• Standard terms: Net 30 days\n• Custom payment schedules available\n• Milestone-based payments supported\n• Secure payment processing\n• Automatic payment reminders\n• Track payment history and receipts\n\nYou can set specific terms for each project or invoice.';
    } else if (input.includes('project') && input.includes('management')) {
      return 'ATLAS provides comprehensive project management:\n• Create and track multiple projects\n• Assign contractors and manage teams\n• Set milestones and deadlines\n• Monitor budgets and expenses\n• Share documents and specifications\n• Real-time communication with contractors\n• Generate progress reports';
    } else if (input.includes('help') || input.includes('support')) {
      return 'I can help you with:\n✓ Creating and managing RFQs\n✓ Running auctions and reviewing bids\n✓ Tracking project progress\n✓ Invoicing and payments\n✓ Finding contractors\n✓ Platform navigation\n\nJust ask me anything or click on the topics on the right';
    } else {
      return 'I\'m here to help with your needs! You can ask me about RFQs, projects, invoices, auctions, contractors, or browse the Popular Topics on the right. What would you like to know?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[60] h-14 w-14 rounded-full bg-primary text-white transition-colors flex items-center justify-center group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>

      {/* Chat Window - Centered */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Centered Chat Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="flex gap-3 max-w-full" onClick={(e) => e.stopPropagation()}>
              {/* Main Chat Area */}
              <Card className="border-0 w-[420px]">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-xl py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                    <span className="text-lg font-medium">A</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">ATLAS AI</CardTitle>
                    <p className="text-xs text-primary-foreground/80">Procurement assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-secondary">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-card border border-border text-foreground rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-xl rounded-bl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-card border-t">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask ATLAS anything"
                    className="flex-1 rounded-full border-border focus:border-primary h-11 px-4 text-sm"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="rounded-full h-11 w-11 p-0 bg-primary hover:border-foreground/25 transition-colors flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar with Topics and Questions */}
          <Card className="border-0 w-[300px] max-h-[550px] overflow-y-auto">
            <CardContent className="p-4">
              {/* Popular Topics */}
              <div className="mb-5">
                <h3 className="text-base font-medium text-foreground mb-3">Popular Topics</h3>
                <div className="space-y-1.5">
                  {popularTopics.map((topic, index) => {
                    const Icon = topic.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleTopicClick(topic)}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left group"
                      >
                        <div className={`${topic.color} bg-opacity-10 p-1.5 rounded-lg transition-transform flex-shrink-0`}>
                          <Icon className={`h-4 w-4 ${topic.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-xs leading-tight">{topic.title}</p>
                          <p className="text-xs text-muted-foreground leading-tight">{topic.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Questions */}
              <div>
                <h3 className="text-base font-medium text-foreground mb-3">Quick Questions</h3>
                <div className="space-y-1.5">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-secondary hover:bg-secondary text-primary text-xs transition-colors leading-snug"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </>
      )}
    </>
  );
}
