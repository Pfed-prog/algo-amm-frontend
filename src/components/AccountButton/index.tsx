import { Button, Menu } from "@mantine/core";
import { Door } from "tabler-icons-react";
import { connectToMyAlgo } from "../../lib/connectWallet";
import { useStore } from "../../store";
const AccountButton = () => {
  const addresses = useStore((state) => state.addresses);
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const selectedAddress = useStore((state) => state.selectedAddress);
  function truncate(text: string) {
    if (text.length > 12) {
      var start = text.substring(0, 4);
      var end = text.substring(text.length - 4, text.length);
      return start + "..." + end;
    }
    return text;
  }
  const listAddresses = addresses.map((x, i) => (
    <Menu.Item key={i} onClick={() => selectAddress(i)}>
      {truncate(x)}
    </Menu.Item>
  ));
  if (selectedAddress)
    return (
      <Menu control={<Button radius="xl">{truncate(selectedAddress)}</Button>}>
        {addresses.length >= 2 && (
          <>
            <Menu.Label>Accounts</Menu.Label>
            {listAddresses}
          </>
        )}
        <Menu.Label>Options</Menu.Label>
        <Menu.Item
          onClick={() => {
            setAddresses([]);
            selectAddress(0);
          }}
          color="red"
          icon={<Door size={14} />}
        >
          Disconnect
        </Menu.Item>
      </Menu>
    );
  return (
    <>
      <Button
        radius="xl"
        onClick={() => connectToMyAlgo(setAddresses, selectAddress)}
      >
        Connect
      </Button>
    </>
  );
};

export default AccountButton;
