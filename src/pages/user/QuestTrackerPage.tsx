import UserLayout from "../../components/layout/UserLayout";

export default function QuestTrackerPage() {
  return (
    <UserLayout
      title="Quest Tracker"
      subtitle="Your Expedition Journey"
      topbarProps={{
        showSearch: false,
      }}
    >
      <section
        aria-label="Quest Tracker content"
        className="min-h-[calc(100vh-80px)] bg-ally-background"
      />
    </UserLayout>
  );
}