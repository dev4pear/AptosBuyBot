type DepositEvent = {
  counter: string;
  guid: {
    id: {
      addr: string;
      creation_num: string;
    };
  };
};

type WithdrawEvent = {
  counter: string;
  guid: {
    id: {
      addr: string;
      creation_num: string;
    };
  };
};

export type AptosTransaction = {
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes?: Change[];
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: Payload;
  signature: Signature;
  events: TxEvent[];
  timestamp: string;
  type: string;
};

type Change = {
  address: string;
  state_key_hash: string;
  data?: {
    type: string;
    data: {
      deposit_events?: DepositEvent;
      withdraw_events?: WithdrawEvent;
    };
  };
  type: string;
  handle?: string;
  key?: string;
  value?: string;
};

type Payload = {
  function: string;
  type_arguments: any[];
  arguments: any[];
  type: string;
};

type Signature = {
  public_key: string;
  signature: string;
  type: string;
};

type TxEvent = {
  guid: {
    creation_number: string;
    account_address: string;
  };
  sequence_number: string;
  type: string;
  data: { amount?: string };
};
