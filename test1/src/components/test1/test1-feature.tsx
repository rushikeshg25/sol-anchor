"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useTest1Program } from "./test1-data-access";
import { Test1Create, Test1List } from "./test1-ui";

export default function Test1Feature() {
  const { publicKey } = useWallet();
  const { programId } = useTest1Program();

  return publicKey ? (
    <div>
      <div title="Test1">
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <Test1Create />
      </div>
      <Test1List />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
