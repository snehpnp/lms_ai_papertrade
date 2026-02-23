import PageHeader from "@/components/common/PageHeader";

const PlaceholderPage = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="animate-fade-in">
    <PageHeader title={title} subtitle={subtitle || `Manage your ${title.toLowerCase()}`} />
    <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
      <p className="text-muted-foreground">This page is ready for backend integration.</p>
    </div>
  </div>
);

export const AdminLessons = () => <PlaceholderPage title="Lessons" subtitle="Manage course lessons" />;
export const AdminQuiz = () => <PlaceholderPage title="Quiz" subtitle="Manage quiz questions" />;
export const AdminProfile = () => <PlaceholderPage title="Profile" subtitle="Manage your profile settings" />;

export const SubadminDashboard = () => <PlaceholderPage title="Dashboard" subtitle="Your trading overview" />;
export const SubadminUsers = () => <PlaceholderPage title="Users" subtitle="Manage assigned users" />;
export const SubadminCourses = () => <PlaceholderPage title="Courses" subtitle="Manage courses" />;
export const SubadminLessons = () => <PlaceholderPage title="Lessons" subtitle="Manage lessons" />;
export const SubadminQuiz = () => <PlaceholderPage title="Quiz" subtitle="Manage quizzes" />;
export const SubadminTradeAnalytics = () => <PlaceholderPage title="Trade Analytics" subtitle="View trade data" />;
export const SubadminProfile = () => <PlaceholderPage title="Profile" subtitle="Your profile settings" />;
