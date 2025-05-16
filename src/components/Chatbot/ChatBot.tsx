import { useState } from 'react';
import { v4 } from 'uuid';
interface ChatbotMessage {
  id: string;
  text: string;
  role: 'user' | 'system';
}

interface ChatbotProps {
  queryAction: (query: string) => Promise<string>;
}

export function Chatbot(props: ChatbotProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [query, setQuery] = useState<string>();
  const [isChatFormLoading, setIsChatFormLoading] = useState<boolean>(false);

  const submitQuery = async (newQuery: string) => {
    const message: ChatbotMessage = {
      id: v4(),
      text: newQuery,
      role: 'user'
    };
    setMessages((prevMessages) => [...prevMessages, message]);
    setQuery('');
    setIsChatFormLoading(true);
    const systemText = await props.queryAction(newQuery);
    setIsChatFormLoading(false);
    const systemMessage: ChatbotMessage = {
      id: v4(),
      text: systemText,
      role: 'system'
    };
    setMessages((prevMessages) => [...prevMessages, systemMessage]);
  };
  const adjustTextAreaHeight = (textArea: HTMLTextAreaElement) => {
    textArea.style.height = 'auto';
    textArea.style.height = `${textArea.scrollHeight}px`;
    textArea.scrollTop = textArea.scrollHeight;
  };
  const handleQueryInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    const value = target.value;
    setQuery(value);
    adjustTextAreaHeight(target);
  };
  const handleQueryKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (isChatFormLoading) {
        return;
      }
      const target = event.currentTarget;
      const value = target.value;
      if (!value) {
        return;
      }
      submitQuery(value);
    }
  };
  const handleChatFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newQuery = formData.get('query');
    if (typeof newQuery !== 'string') {
      return null;
    }
    await submitQuery(newQuery);
  };
  const queryRefCallback = (el: HTMLTextAreaElement) => {
    if (!el) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      adjustTextAreaHeight(el);
    });
    resizeObserver.observe(el);
    return () => {
      resizeObserver.unobserve(el);
    };
  };

  return (
    <div className="box-border flex h-full flex-col gap-3 p-2">
      <div className="h-full overflow-y-auto overflow-x-hidden">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div
              key={message.id}
              className="mb-3 flex w-full justify-end"
            >
              <div className="max-w-[15rem] rounded-sm border border-color-1 bg-foreground-1 px-3 py-2 word-break">
                {message.text}
              </div>
            </div>
          ) : (
            <div
              key={message.id}
              className="mb-3 flex w-full justify-start"
            >
              <div className="max-w-[15rem] px-3 py-2 word-break">
                {message.text}
              </div>
            </div>
          )
        )}
        {isChatFormLoading && (
          <div className="mb-3 flex w-full items-center justify-start">
            <calcite-loader
              inline
              label="Thinking..."
            />
            <span className="px-3 py-2">Thinking...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleChatFormSubmit}>
        <label className="relative block w-full bg-foreground-1 px-1.5 py-1 focus-within:focus-outset">
          <textarea
            ref={queryRefCallback}
            name="query"
            rows={2}
            value={query}
            className="box-border block max-h-[10rem] w-full resize-none text-pretty border-none bg-transparent pb-[2.5rem] font-inherit outline-none"
            onInput={handleQueryInput}
            onKeyDown={handleQueryKeyDown}
          />
          <calcite-button
            slot="footer-end"
            type="submit"
            iconStart="send"
            scale="m"
            round
            appearance="transparent"
            disabled={!query || isChatFormLoading}
            className="absolute bottom-0 right-0 m-1.5"
          />
        </label>
      </form>
    </div>
  );
}

export default Chatbot;
