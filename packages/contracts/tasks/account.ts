import { task } from "hardhat/config";
import { mnemonicToAccount } from "viem/accounts"

task("account", "Prints main account's info").setAction(async () => {
  const mnemonic = process.env.MNEMONIC as string
  const account = mnemonicToAccount(mnemonic)

  console.log("Account")
  console.log("=========")
  console.log("Address:", account.address)
  console.log("Public Key:", account.publicKey)
  console.log("Mnemonic Key:", mnemonic)
});

