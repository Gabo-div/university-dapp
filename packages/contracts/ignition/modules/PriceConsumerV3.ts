import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MockV3AggregatorModule = buildModule("MockV3AggregatorModule", (m) => {
  const DECIMALS = "18";
  const INITIAL_PRICE = "200000000000000000000";

  const mockV3Aggregator = m.contract("MockV3Aggregator", [
    DECIMALS,
    INITIAL_PRICE,
  ]);

  return { mockV3Aggregator };
});

const PriceConsumerV3Module = buildModule("PriceConsumerV3Module", (m) => {
  const { mockV3Aggregator } = m.useModule(MockV3AggregatorModule);

  const priceConsumerV3 = m.contract("PriceConsumerV3", [mockV3Aggregator]);

  return { priceConsumerV3, conract: priceConsumerV3 };
});

export default PriceConsumerV3Module;
