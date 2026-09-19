/**
 * Demo mode, switched on with "Load sample data" in Settings.
 *
 * It only affects two things: the sample products/orders in the catalogue, and
 * the photo studio, which returns a prepared example shot after a realistic
 * pause instead of calling the paid image model. Speech, listing and pricing
 * (including AI market research) always run on the live models.
 */

let active = false;

export const setDemoMode = (on: boolean) => {
  active = on;
};

export const isDemoMode = () => active;

export const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
