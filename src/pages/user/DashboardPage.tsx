import UserLayout from "../../components/layout/UserLayout";

export default function DashboardPage() {
  return (
    <UserLayout
      title="Expedition Headquarters"
      subtitle="Explorer Dashboard"
      topbarProps={{
        showSearch: false,
      }}
    >
      <section
        aria-label="Dashboard content"
        className="min-h-[calc(100vh-80px)] bg-ally-background"
      >
        {/* Dashboard content will be implemented here later. */}
      </section>
    </UserLayout>
  );
}