import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-medium text-muted-foreground italic">
            "Every step forward is a step towards healing."
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-primary-foreground font-bold text-xs shadow-inner">
              DR
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

