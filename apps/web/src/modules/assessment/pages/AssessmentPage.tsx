import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../components/ui';
import { Brain, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: "What activities make you lose track of time because you're so engaged?",
    hint: "Think about hobbies or tasks where you feel 'in the zone'",
  },
  {
    id: 2,
    text: "If you could solve one problem in the world, what would it be?",
    hint: "This helps us understand your values and motivation",
  },
  {
    id: 3,
    text: "What do people often thank you for or compliment you on?",
    hint: "These are often your natural strengths",
  },
];

export default function AssessmentPage() {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [messages, setMessages] = React.useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "Hi there! I'm your AI career companion. Let's discover your unique strengths and interests together. I'll ask you a few questions to understand you better. Ready to get started?" }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "That's a wonderful insight! Tell me more about what aspects of that interest you most.",
        "I see! Based on what you've shared, you seem to value creativity and helping others. Is that accurate?",
        "Great answer! You're doing wonderfully. Let's continue with another question.",
      ];
      const aiResponse = { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)] 
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: questions[currentQuestion + 1].text 
          }]);
          setCurrentQuestion((prev) => prev + 1);
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Brain className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="heading-2 mb-2">Career Discovery Assessment</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Let's explore your interests, strengths, and values through a friendly conversation. 
          There are no right or wrong answers!
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="min-h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' && (
                    <Sparkles className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer here..."
              className="input flex-1"
              disabled={isTyping}
            />
            <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Tips for the Assessment</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Be honest - there are no wrong answers</li>
                <li>Share specific examples when possible</li>
                <li>Feel free to take your time</li>
                <li>You can pause and resume anytime</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
