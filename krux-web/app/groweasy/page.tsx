export const metadata = {
  title: "GrowEasy | Content Pipeline",
  description: "Analyse top creators and generate short-form video scripts.",
};

export default function GrowEasyPage() {
  const streamlitUrl = process.env.NEXT_PUBLIC_GROWEASY_URL ?? "";

  return (
    <main style={{ margin: 0, padding: 0, height: "100vh", overflow: "hidden" }}>
      <iframe
        src={`${streamlitUrl}?embed=true`}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          display: "block",
        }}
        allow="clipboard-write"
        title="GrowEasy Content Pipeline"
      />
    </main>
  );
}
