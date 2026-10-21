// Singleton accessor for real-time wave charge calculation

let activeDensityGetter: ((x: number, y: number) => number) | null = null;

export const setWaveChargeGetter = (getter: ((x: number, y: number) => number) | null) => {
  activeDensityGetter = getter;
};

export const getWaveCharge = (x: number, y: number): number => {
  if (activeDensityGetter) {
    return activeDensityGetter(x, y);
  }
  return 0.3;
};
