import {
  CalciteCard,
  CalciteButton,
  CalcitePopover,
  CalciteAvatar,
  CalciteLink,
  CalciteLoader
} from '@esri/calcite-components-react';
import esriConfig from '@arcgis/core/config';
import { useState } from 'react';
import esriRequest from '@arcgis/core/request';

interface User {
  access: string;
  created: number;
  culture: string;
  cultureFormat: string;
  description?: string;
  firstName: string;
  fullName: string;
  id: string;
  lastName: string;
  modified: number;
  provider: string;
  region: string;
  tags: string[];
  thumbnail: string;
  udn: string | null;
  units: string;
  username: string;
}

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
  IMAGERY: 'imagery16.svg',
  GEOJSON: 'data16.svg',
  MEDIA: 'medialayer16.svg',
  KML: 'features16.svg'
};
const USER_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/community/users`;
const DEFAULT_RESULTS_THUMBNAIL_URL =
  'https://www.arcgis.com/apps/mapviewer/node_modules/@arcgis/app-components/dist/arcgis-app/assets/arcgis-item-thumbnail/default_thumb.png';

export function AddDataCard(props: AddDataCardProps) {
  const [ownerRef, setOwnerRef] = useState<HTMLSpanElement | null>(null);
  const [ownerUser, setOwnerUser] = useState<User | null>(null);
  const [isOwnerLoading, setIsOwnerLoading] = useState<boolean>(false);

  const getResultTypeLogoUrl = (type: string) => {
    switch (type) {
      case 'Feature Service':
      case 'Feature Layer':
      case 'WFS':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.FEATURE}`;
      case 'Map Service':
      case 'WMS':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.MAP_IMAGE}`;
      case 'Group Layer':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.GROUP}`;
      case 'Vector Tile Service':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.TILE}`;
      case 'Image Service':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.IMAGERY}`;
      case 'GeoJson':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.GEOJSON}`;
      case 'Media Layer':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.MEDIA}`;
      case 'KML':
        return `${ARCGIS_ITEM_TYPE_LOGO_BASE_URL}${ARCGIS_ITEM_TYPE_SVG.KML}`;
      default:
        console.error(`Unknown item type: ${type}`);
        return undefined;
    }
  };
  const handleAddClick = (
    event: React.MouseEvent<HTMLCalciteButtonElement, MouseEvent>
  ) => {
    props.onAdd(event, props.item);
  };
  const handleOwnerPopoverOpen = async () => {
    setIsOwnerLoading(true);
    const response = await esriRequest(
      `${USER_SERVICE_URL}/${props.item.owner}`,
      {
        query: {
          f: 'json'
        }
      }
    );
    setIsOwnerLoading(false);
    setOwnerUser(response.data);
  };
  const renderOwnerDescriptionContent = (description?: string) => {
    if (!description) {
      return null;
    }
    const parts = description.split(/(&#13;)/);
    const content = parts.map((part, index) => {
      if (part === '&#13;') {
        return <br key={`br-${index}`} />;
      } else {
        return part.split(/(https?:\/\/[^\s]+)/g).map((segment, i) => {
          if (/https?:\/\/[^\s]+/.test(segment)) {
            return (
              <CalciteLink
                key={`link-${index}-${i}`}
                href={segment}
                target="_blank"
                rel="noopener noreferrer"
              >
                {segment}
              </CalciteLink>
            );
          }
          return segment;
        });
      }
    });
    return content;
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
          className="ms-auto bg-2"
          style={{ width: '120px', height: '80px' }}
        >
          <img
            slot="thumbnail"
            alt="Sample image alt"
            className="w-100 object-fit-cover"
            src={
              props.item.thumbnail
                ? `${esriConfig.portalUrl}/sharing/rest/content/items/${props.item.id}/info/${
                    props.item.thumbnail
                  }`
                : DEFAULT_RESULTS_THUMBNAIL_URL
            }
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
          label={props.item.owner}
          referenceElement={ownerRef || ''}
          autoClose
          overlayPositioning="fixed"
          placement="bottom"
          offsetSkidding={16}
          offsetDistance={16}
          onCalcitePopoverOpen={handleOwnerPopoverOpen}
        >
          <div style={{ width: '300px' }}>
            {isOwnerLoading && !ownerUser && <CalciteLoader label="" />}
            {ownerUser && (
              <>
                <div className="d-flex items-center gap-5 p-7">
                  <CalciteAvatar
                    className="flex-none"
                    scale="m"
                    thumbnail={`https://www.arcgis.com/sharing/rest/community/users/${ownerUser.username}/info/${ownerUser.thumbnail}`}
                  />
                  <div>
                    <div className="text-4 font-bold">{ownerUser.fullName}</div>
                    <div>Item managed by: {ownerUser.username}</div>
                  </div>
                </div>
                <div
                  className="text-2 leading-relaxed overflow-auto pt-0 p-7"
                  style={{ maxHeight: '15.5rem' }}
                >
                  {renderOwnerDescriptionContent(ownerUser.description)}
                </div>
              </>
            )}
          </div>
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
