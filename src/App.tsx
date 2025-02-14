import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import {
  CalciteButton,
  CalciteShell,
  CalciteShellPanel,
  CalciteTextArea
} from '@esri/calcite-components-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { CalciteTextAreaCustomEvent } from '@esri/calcite-components';
import lodash from 'lodash';

interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'system';
}

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const [, chatFormAction, isChatFormLoading] = useActionState<null, FormData>(
    async (_, formData) => {
      const query = formData.get('query');
      if (typeof query !== 'string') {
        return null;
      }
      const message: ChatMessage = {
        id: lodash.uniqueId(),
        text: query,
        role: 'user'
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      return null;
    },
    null
  );

  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleQueryInput = (event: CalciteTextAreaCustomEvent<void>) => {
    const value = event.target.value;
    setQuery(value);
  };

  useEffect(() => {
    const vielEl = viewRef.current;
    if (!vielEl) {
      return;
    }
    const map = new Map({
      basemap: 'dark-gray-vector'
    });
    const mapView = new MapView({
      container: vielEl,
      map
    });
    return () => {
      mapView.destroy();
    };
  }, []);

  return (
    <CalciteShell>
      <CalciteShellPanel
        slot="panel-start"
        position="start"
        layout="vertical"
        resizable
      >
        <div className="d-flex flex-column h-100 p-5">
          <div className="h-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className="d-flex justify-end w-100 mb-5"
              >
                <span className="py-3 px-5 border-1 rounded-round bg-2">
                  {message.text}
                </span>
              </div>
            ))}
          </div>
          <form
            className="d-flex items-center gap-3"
            action={chatFormAction}
          >
            <CalciteTextArea
              name="query"
              resize="none"
              placeholder="Enter a query"
              style={{ height: '52px' }}
              value={query}
              onCalciteTextAreaInput={handleQueryInput}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
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
      </CalciteShellPanel>
      <div
        ref={viewRef}
        className="h-100"
      />
    </CalciteShell>
  );
}

export default App;
