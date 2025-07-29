import { scope } from "hardhat/config";
import { spawn } from "child_process";
import fs from "fs";
import { University } from "../generated/deployments";
import { getContract } from "viem";
import { universityData } from "../seed/University";

const devScope = scope("dev", "Development tasks");

devScope
  .task("faucet", "Run faucet to fund accounts")
  .addParam("account", "Account address to fund")
  .setAction(async (args, hre) => {
    if (hre.network.name !== "localhost") {
      throw new Error(
        "This task can only be run on the localhost network. Please switch to the localhost network and try again.",
      );
    }

    const walletClients = await hre.viem.getWalletClients();

    try {
      await walletClients[0].sendTransaction({
        to: args.account,
        value: BigInt(1000000000000000000n), // 1 ETH
      });
    } catch (_error) {
      throw new Error(
        "Failed to send transaction. Please check the account address and try again.",
      );
    }

    console.log(`Faucet sent 1 ETH to ${args.account}`);
  });

devScope
  .task("node", "Run and prepare hardhat node")
  .setAction(async (_args, hre) => {
    if (hre.network.name !== "localhost") {
      throw new Error(
        "This task can only be run on the localhost network. Please switch to the localhost network and try again.",
      );
    }

    const hardhatNode = spawn("pnpm hardhat node", {
      shell: true,
    });

    const runSuptasks = async () => {
      await hre.run({
        scope: "dev",
        task: "deploy",
      });

      await hre.run({
        scope: "dev",
        task: "seed",
      });

      await hre.run({
        scope: "dev",
        task: "generate",
      });

      console.log("All sub-tasks completed successfully.");
    };

    hardhatNode.stdout.on("data", (data) => {
      const output = data.toString().trim();

      if (
        output ===
        "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
      ) {
        runSuptasks().catch(() => {
          console.error("Error running sub-tasks after starting Hardhat node.");
          hardhatNode.kill();
        });
      }

      console.log(output);
    });

    hardhatNode.stderr.on("data", (data) => {
      console.error(data.toString().trim());
    });

    hardhatNode.on("error", (error) => {
      console.error("Error starting Hardhat node:", error);
    });

    hardhatNode.on("exit", (code) => {
      console.log(`Hardhat node exited with code: ${code}`);
    });

    await new Promise((resolve) => {
      hardhatNode.on("close", resolve);
    });
  });

devScope.subtask("deploy", "Deploy contracts").setAction(async (_args, hre) => {
  const files = fs.readdirSync("./ignition/modules");

  for (const file of files) {
    await hre.run(
      {
        scope: "ignition",
        task: "deploy",
      },
      {
        modulePath: `./ignition/modules/${file}`,
      },
    );
  }

  console.log("All modules deployed successfully.");
});

devScope
  .subtask("seed", "Seed university contract")
  .setAction(async (_args, hre) => {
    const [client] = await hre.viem.getWalletClients();

    const university = getContract({
      address: University.address,
      abi: University.abi,
      client,
    });

    let campusId = await university.read.nextCampusId();
    let careerId = await university.read.nextCareerId();

    for (const campus of universityData.campuses) {
      await university.write.addCampus([campus.name]);

      for (const career of campus.careers) {
        await university.write.addCareer([campusId, career.name]);

        for (const pensum of career.pensums) {
          await university.write.addPensum([
            careerId,
            pensum.map((c) => ({
              ...c,
              id: BigInt(0),
            })),
          ]);
        }

        careerId++;
      }
      campusId++;
    }

    console.log("Seeding university contract...");
  });

devScope
  .subtask("generate", "Generate deployments files")
  .setAction(async () => {
    console.log("Generate file with abi and address of deployed contracts...");

    const deploymentsPath = "./ignition/deployments/chain-31337";

    const deploymentsFile = fs.readFileSync(
      `${deploymentsPath}/deployed_addresses.json`,
      "utf-8",
    );

    const deployments = JSON.parse(deploymentsFile);

    const contracts = Object.entries(deployments).reduce<
      Record<string, { address: `0x${string}`; abi: any }>
    >((acc, deployment) => {
      const [moduleName, address] = deployment;

      const artifactPath = `${deploymentsPath}/artifacts/${moduleName}.json`;
      const artifactFile = fs.readFileSync(artifactPath, "utf-8");
      const artifact = JSON.parse(artifactFile);

      const { contractName, abi } = artifact;

      acc[contractName] = {
        address: address as `0x${string}`,
        abi,
      };

      return acc;
    }, {});

    const outputPath = "./generated/deployments.ts";

    const outputContent = Object.entries(contracts)
      .map(
        ([contractName, { address, abi }]) =>
          `export const ${contractName} = {\n  address: "${address}" as \`0x\${string}\`,\n  abi: ${JSON.stringify(abi, null, 2)} as const\n};\n`,
      )
      .join("\n");

    const defaultExport = `export default {${Object.keys(contracts)
      .map((contractName) => contractName)
      .join(", ")}};\n`;

    fs.mkdirSync("./generated", { recursive: true });
    fs.writeFileSync(outputPath, outputContent + "\n" + defaultExport);

    console.log(`Deployments file generated at ${outputPath}`);
  });
