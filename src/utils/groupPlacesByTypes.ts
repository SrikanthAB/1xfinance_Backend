import { LocationType } from "../config/constants/enums";
import { Schema } from "mongoose";

export interface Place {
  assetId: string;
  locationType: LocationType;
  name: string;
  address: string;
  distanceInKm: number;
  isActive?: boolean;
  latitude: string;
  longitude: string;
  _id?: string;
}

function groupPlacesByType(places: Place[]): Record<string, Place[]> {
  return places.reduce((acc: Record<string, Place[]>, place) => {
    if (!acc[place.locationType]) {
      acc[place.locationType] = [];
    }
    acc[place.locationType].push(place);
    return acc;
  }, {});
}

export default groupPlacesByType;