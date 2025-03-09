import { CalciteButton, CalciteLoader } from '@esri/calcite-components-react';
import { v4 } from 'uuid';
import { useRef, useState } from 'react';
import styles from './Chatbot.module.scss';

interface ChatbotMessage {
  id: string;
  text: string;
  role: 'user' | 'system';
}

interface ChatbotProps {
  queryAction: (query: string) => Promise<string>;
}

export function Chatbot(props: ChatbotProps) {
  const chatFormRef = useRef<HTMLFormElement>(null);

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
    <div className="d-flex flex-column h-100 p-5">
      <div className="h-100 mb-10">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div
              key={message.id}
              className="d-flex justify-end w-100 mb-7"
            >
              <div
                className="py-3 px-5 border-1 border-color-1 rounded-round bg-1"
                style={{
                  maxWidth: '240px',
                  wordBreak: 'break-word'
                }}
              >
                {message.text}
              </div>
            </div>
          ) : (
            <div
              key={message.id}
              className="d-flex justify-start w-100 mb-5"
              style={{
                maxWidth: '240px',
                wordBreak: 'break-word'
              }}
            >
              <div className="py-2 px-5">{message.text}</div>
            </div>
          )
        )}
        {isChatFormLoading && (
          <div className="d-flex justify-start w-100 mb-5 items-center">
            <CalciteLoader inline />
            <span className="py-2 px-5">Thinking...</span>
          </div>
        )}
      </div>
      <form
        ref={chatFormRef}
        className="d-flex items-center gap-3"
        onSubmit={handleChatFormSubmit}
      >
        <label className={styles.label}>
          <textarea
            ref={queryRefCallback}
            name="query"
            rows={2}
            value={query}
            className={styles.textarea}
            onInput={handleQueryInput}
            onKeyDown={handleQueryKeyDown}
          />
          <CalciteButton
            slot="footer-end"
            type="submit"
            iconStart="send"
            scale="m"
            round
            appearance="transparent"
            disabled={!query || isChatFormLoading}
            className="absolute right-0 bottom-0 m-4"
          />
        </label>
      </form>
    </div>
  );
}

export default Chatbot;
