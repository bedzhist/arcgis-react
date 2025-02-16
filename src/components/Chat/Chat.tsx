import { CalciteTextAreaCustomEvent } from '@esri/calcite-components';
import { CalciteButton, CalciteTextArea } from '@esri/calcite-components-react';
import _ from 'lodash';
import { useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'system';
}

interface ChatProps {
  queryAction: (query: string) => Promise<string>;
}

export function Chat(props: ChatProps) {
  const chatFormRef = useRef<HTMLFormElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isChatFormLoading, setIsChatFormLoading] = useState<boolean>(false);

  const submitQuery = async (newQuery: string) => {
    const message: ChatMessage = {
      id: _.uniqueId(),
      text: newQuery,
      role: 'user'
    };
    setMessages((prevMessages) => [...prevMessages, message]);
    setQuery('');
    setIsChatFormLoading(true);
    const systemText = await props.queryAction(newQuery);
    setIsChatFormLoading(false);
    const systemMessage: ChatMessage = {
      id: _.uniqueId(),
      text: systemText,
      role: 'system'
    };
    setMessages((prevMessages) => [...prevMessages, systemMessage]);
  };
  const handleQueryInput = (event: CalciteTextAreaCustomEvent<void>) => {
    const value = event.target.value;
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
              <span className="py-3 px-5 border-1 border-color-1 rounded-round bg-1">
                {message.text}
              </span>
            </div>
          ) : (
            <div
              key={message.id}
              className="d-flex justify-start w-100 mb-5"
            >
              <span className="py-2 px-5">{message.text}</span>
            </div>
          )
        )}
        {isChatFormLoading && (
          <div className="d-flex justify-start w-100 mb-5">
            <span className="py-2 px-5">Thinking...</span>
          </div>
        )}
      </div>
      <form
        ref={chatFormRef}
        className="d-flex items-center gap-3"
        onSubmit={handleChatFormSubmit}
      >
        <CalciteTextArea
          name="query"
          resize="none"
          placeholder="Enter a query"
          style={{ height: '66px' }}
          value={query}
          onCalciteTextAreaInput={handleQueryInput}
          onKeyDown={handleQueryKeyDown}
        />
        <CalciteButton
          type="submit"
          iconStart="send"
          scale="l"
          round
          appearance="transparent"
          disabled={!query || isChatFormLoading}
        />
      </form>
    </div>
  );
}

export default Chat;
