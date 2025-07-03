export enum RideStatus {
  SEARCHING = "SEARCHING_FOR_RIDER",
  START = "START",
  ARRIVED = "ARRIVED",
  COMPLETED = "COMPLETED"
}

export type Ride = {
  _id: string;
  pickup: { address: string; latitude: number; longitude: number };
  drop: { address: string; latitude: number; longitude: number };
  fare: number;
  status: RideStatus;
};
