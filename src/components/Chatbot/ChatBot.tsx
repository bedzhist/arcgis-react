import { TargetedEvent } from '@arcgis/map-components';
import {
  CalciteButton,
  CalciteLabel,
  CalciteLoader,
  CalciteTextArea
} from '@esri/calcite-components-react';
import _ from 'lodash';
import { useRef, useState } from 'react';

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
  const [query, setQuery] = useState<string>('');
  const [isChatFormLoading, setIsChatFormLoading] = useState<boolean>(false);

  const submitQuery = async (newQuery: string) => {
    const message: ChatbotMessage = {
      id: _.uniqueId(),
      text: newQuery,
      role: 'user'
    };
    setMessages((prevMessages) => [...prevMessages, message]);
    setQuery('');
    setIsChatFormLoading(true);
    const systemText = await props.queryAction(newQuery);
    setIsChatFormLoading(false);
    const systemMessage: ChatbotMessage = {
      id: _.uniqueId(),
      text: systemText,
      role: 'system'
    };
    setMessages((prevMessages) => [...prevMessages, systemMessage]);
  };
  const handleQueryInput = (
    event: TargetedEvent<HTMLCalciteTextAreaElement, undefined>
  ) => {
    const target = event.currentTarget;
    const value = target.value;
    setQuery(value);
  };
  const handleQueryKeyDown = (
    event: React.KeyboardEvent<HTMLCalciteTextAreaElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (isChatFormLoading) {
        return;
      }
      const value = event.currentTarget.value;
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
        onSubmit={handleChatFormSubmit}
      >
        <CalciteLabel>
          <CalciteTextArea
            resize="none"
            rows={2}
            value={query}
            onCalciteTextAreaInput={handleQueryInput}
            onKeyDown={handleQueryKeyDown}
          >
            <CalciteButton
              slot="footer-end"
              type="submit"
              iconStart="send"
              scale="m"
              round
              appearance="transparent"
              disabled={!query || isChatFormLoading}
            />
          </CalciteTextArea>
        </CalciteLabel>
      </form>
    </div>
  );
}

export default Chatbot;
