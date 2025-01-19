import {
  CalciteCard,
  CalciteButton,
  CalcitePopover
} from '@esri/calcite-components-react';
import esriConfig from '@arcgis/core/config';
import { useState } from 'react';

export interface ResultItem {
  id: string;
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  owner: string;
}

export interface AddDataCardProps {
  item: ResultItem;
  onAdd: (
    event: React.MouseEvent<HTMLCalciteButtonElement, MouseEvent>,
    item: ResultItem
  ) => void;
}

const ARCGIS_ITEM_TYPE_LOGO_BASE_URL =
  'https://www.arcgis.com/apps/mapviewer/node_modules/@arcgis/app-components/dist/arcgis-app/assets/arcgis-item-type/';
const ARCGIS_ITEM_TYPE_SVG = {
  FEATURE: 'featureshosted16.svg',
  MAP_IMAGE: 'mapimages16.svg',
  GROUP: 'layergroup2d16.svg',
  TILE: 'vectortile16.svg',
  IMAGERY: 'imagery16.svg'
};

export function AddDataCard(props: AddDataCardProps) {
  const [ownerRef, setOwnerRef] = useState<HTMLSpanElement | null>(null);

  const getResultTypeLogoUrl = (type: string) => {
    switch (type) {
      case 'Feature Service':
      case 'Feature Layer':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.FEATURE}`;
      case 'Map Service':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.MAP_IMAGE}`;
      case 'Group Layer':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.GROUP}`;
      case 'Vector Tile Service':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.TILE}`;
      case 'Image Service':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.IMAGERY}`;
      default:
        // TODO: Handle error
        return '';
    }
  };
  const handleAddClick = (
    event: React.MouseEvent<HTMLCalciteButtonElement, MouseEvent>
  ) => {
    props.onAdd(event, props.item);
  };

  return (
    <CalciteCard
      key={props.item.id}
      thumbnailPosition="inline-end"
      className="w-100"
    >
      <div
        slot="thumbnail"
        className="w-100"
      >
        <div
          className="ms-auto"
          style={{ width: '120px' }}
        >
          <img
            slot="thumbnail"
            alt="Sample image alt"
            className="w-100 object-fit-cover"
            src={`${esriConfig.portalUrl}/sharing/rest/content/items/${props.item.id}/info/${
              props.item.thumbnail
            }`}
          />
        </div>
      </div>
      <span slot="heading">{props.item.title}</span>
      <div
        slot="description"
        className="d-flex items-center"
      >
        <img
          alt="Layer type logo"
          src={getResultTypeLogoUrl(props.item.type)}
          width={16}
          height={16}
        />
        <span className="ms-3">{props.item.type}</span>
      </div>
      <div
        slot="footer-start"
        className="overflow-hidden"
      >
        <span
          ref={setOwnerRef}
          className="text-truncate cursor-pointer"
        >
          {props.item.owner}
        </span>
        <CalcitePopover
          heading={props.item.owner}
          label={props.item.owner}
          referenceElement={ownerRef || ''}
          closable
          autoClose
          overlayPositioning="fixed"
          placement="bottom"
          offsetSkidding={16}
          offsetDistance={16}
        >
          {/* // TODO: Add owner details */}
          <p>Owner details</p>
        </CalcitePopover>
      </div>
      <CalciteButton
        slot="footer-end"
        iconStart="plus"
        appearance="outline"
        kind="neutral"
        scale="s"
        onClick={handleAddClick}
      >
        Add
      </CalciteButton>
    </CalciteCard>
  );
}

export default AddDataCard;
