export enum RideStatus {
  SEARCHING = "SEARCHING_FOR_RIDER",
  STARTED = "START",
  COMPLETED = "COMPLETED"
}

export type Ride = {
  _id: string;
  pickup: { address: string; latitude: number; longitude: number };
  drop: { address: string; latitude: number; longitude: number };
  fare: number;
  status: string;
};
