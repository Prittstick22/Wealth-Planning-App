import React, { useState } from "react";
import { Layout } from "./components/layout/Layout";
import { GrowthCalculator } from "./components/calculators/GrowthCalculator";
import { WithdrawalCalculator } from "./components/calculators/WithdrawalCalculator";
import { TimeToTargetCalculator } from "./components/calculators/TimeToTargetCalculator";

const TABS = [
  { id: "growth", label: "Growth Calculator" },
  { id: "withdrawal", label: "Withdrawal Calculator" },
  { id: "time-to-target", label: "Time to Target" },
];

function App() {
  const [activeTab, setActiveTab] = useState("growth");

  const renderContent = () => {
    switch (activeTab) {
      case "growth":
        return <GrowthCalculator />;
      case "withdrawal":
        return <WithdrawalCalculator />;
      case "time-to-target":
        return <TimeToTargetCalculator />;
      default:
        return null;
    }
  };

  return (
    <Layout
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
