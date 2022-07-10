import create, { State } from "zustand";

export interface StoreState extends State {
  open: boolean;
  addresses: string[];
  selectedAddress: string;
  selectAddress: (n: number) => void;
  toggleOpen: () => void;
  setAddresses: (addresses: string[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  open: false,
  addresses: [],
  selectedAddress: "",
  toggleOpen: () => set((state) => ({ open: !state.open })),
  setAddresses: (addresses) => set(() => ({ addresses: addresses })),
  selectAddress: (n) =>
    set((state) => ({ selectedAddress: state.addresses[n] })),
}));
