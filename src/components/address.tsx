import { truncateMiddle } from '../lib/truncate-middle';
import Copy from "./copy";

interface Address {
  prefix: string;
  address: string;
}

export default function Address({ prefix, address }: Address) {
  const truncatedAddress = truncateMiddle(address, 8, 8);

  return (
    <span className="flex items-center space-x-0">
      <p className="mr-3">{prefix}: <span className="font-bold">{truncatedAddress}</span></p>
      <Copy data={address} info={prefix} title="Copied!" />
    </span>
  );
}
