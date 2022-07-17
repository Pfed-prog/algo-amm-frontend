import create, { State } from "zustand";

export interface StoreState extends State {
  open: boolean;
  addresses: string[];
  selectedAddress: string;
  yesToken: number;
  noToken: number;
  poolToken: number;
  yesTokenReserves: number;
  noTokenReserves: number;
  setYesToken: (yesToken: number) => void;
  setNoToken: (noToken: number) => void;
  setPoolToken: (poolToken: number) => void;
  setYesTokenReserves: (yesToken: number) => void;
  setNoTokenReserves: (yesToken: number) => void;
  selectAddress: (n: number) => void;
  toggleOpen: () => void;
  setAddresses: (addresses: string[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  open: false,
  addresses: [],
  selectedAddress: "",
  yesToken: 0,
  noToken: 0,
  poolToken: 0,
  yesTokenReserves: 0,
  noTokenReserves: 0,
  setYesToken: (yesToken: number) => set(() => ({ yesToken: yesToken })),
  setNoToken: (noToken: number) => set(() => ({ noToken: noToken })),
  setPoolToken: (poolToken: number) => set(() => ({ poolToken: poolToken })),
  setYesTokenReserves: (yesTokenReserves: number) =>
    set(() => ({ yesTokenReserves: yesTokenReserves })),
  setNoTokenReserves: (noTokenReserves: number) =>
    set(() => ({ noTokenReserves: noTokenReserves })),
  setAddresses: (addresses) => set(() => ({ addresses: addresses })),
  toggleOpen: () => set((state) => ({ open: !state.open })),
  selectAddress: (n) =>
    set((state) => ({ selectedAddress: state.addresses[n] })),
}));
