import CSVLayer from '@arcgis/core/layers/CSVLayer';
import Layer from '@arcgis/core/layers/Layer';
import {
  CalciteButton,
  CalciteInput,
  CalciteLabel,
  CalciteTab,
  CalciteTabNav,
  CalciteTabs,
  CalciteTabTitle
} from '@esri/calcite-components-react';
import { useActionState, useRef } from 'react';

export interface AddDataProps {
  view?: __esri.MapView;
}

export function AddData(props: AddDataProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [, fileFormAction, isFileFormLoading] = useActionState<null, FormData>(
    async () => {
      const view = props.view;
      if (!view) {
        // TODO: Handle error
        return null;
      }
      const file = inputFileRef.current?.files?.[0];
      if (!(file instanceof File) || file.size === 0) {
        // TODO: Handle error
        return null;
      }
      let layer: Layer | null = null;
      switch (file.type) {
        case 'text/csv': {
          layer = new CSVLayer({
            url: URL.createObjectURL(file)
          });
          break;
        }
        default:
          //TODO: Handle error
          return null;
      }
      view.map.add(layer);
      await view.whenLayerView(layer);
      view.goTo(layer.fullExtent);
      return null;
    },
    null
  );
  const [, urlFormAction, isUrlFormLoading] = useActionState<null, FormData>(
    async (_, formData) => {
      const view = props.view;
      if (!view) {
        // Handle error
        return null;
      }
      const url = formData.get('url');
      if (typeof url !== 'string') {
        // Handle error
        return null;
      }
      const layer = await Layer.fromArcGISServerUrl({ url });
      view.map.add(layer);
      await view.whenLayerView(layer);
      view.goTo(layer.fullExtent);
      return null;
    },
    null
  );

  return (
    <CalciteTabs
      layout="center"
      className="p-3"
    >
      <CalciteTabNav slot="title-group">
        <CalciteTabTitle selected>File</CalciteTabTitle>
        <CalciteTabTitle>URL</CalciteTabTitle>
      </CalciteTabNav>
      <CalciteTab>
        <form
          className="p-7"
          action={fileFormAction}
        >
          <CalciteLabel>
            Select File
            {/*
              // TODO: Replace this with CalciteInput when the bug has been fixed
              // TODO: (https://github.com/Esri/calcite-design-system/issues/9319) 
            */}
            <input
              ref={inputFileRef}
              type="file"
              // name="file"
              accept=".csv"
            />
          </CalciteLabel>
          <CalciteButton
            type="submit"
            disabled={isFileFormLoading}
            width="full"
          >
            Add Layer
          </CalciteButton>
        </form>
      </CalciteTab>
      <CalciteTab>
        <form
          className="p-7"
          action={urlFormAction}
        >
          <CalciteLabel>
            Enter URL
            <CalciteInput
              type="url"
              required
              name="url"
            />
          </CalciteLabel>
          <CalciteButton
            type="submit"
            disabled={isUrlFormLoading}
            width="full"
          >
            Add Layer
          </CalciteButton>
        </form>
      </CalciteTab>
    </CalciteTabs>
  );
}

export default AddData;
