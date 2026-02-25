import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { adminCourseContentService } from "@/services/admin.service";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Exercise {
  id: string;
  type: string;
  question: string;
  course_name?: string;
  lesson_title?: string;
  subadminId?: string | null;
  subadmin?: {
    name: string;
  };
}

const QuizzesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();
  const basePath = `/${user?.role}`;
  const limit = 10;

  const loadExercises = async () => {
    try {
      setLoading(true);
      const res = await adminCourseContentService.getExercises({
        page,
        limit,
        search,
      });
      setExercises(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch {
      toast.error("Failed to load quizzes/exercises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz/exercise?")) return;
    try {
      await adminCourseContentService.deleteExercise(id);
      toast.success("Quiz/Exercise deleted");
      loadExercises();
    } catch {
      toast.error("Failed to delete quiz/exercise");
    }
  };

  const columns = [
    {
      header: "#",
      render: (_row: Exercise, index: number) => (
        <span className="font-medium">{(page - 1) * limit + index + 1}</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "Question",
      accessor: "question" as keyof Exercise,
      render: (row: Exercise) => (
        <span className="font-medium text-sm max-w-sm truncate inline-block">
          {row.question}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: "type" as keyof Exercise,
      render: (row: Exercise) => (
        <span className="px-2 py-1 bg-muted rounded-md text-xs font-semibold">
          {row.type === "FILL_IN_BLANKS" ? "TEXT ANSWER" : row.type}
        </span>
      ),
    },
    {
      header: "Course",
      accessor: "course_name" as keyof Exercise,
      render: (row: Exercise) => (
        <span className="text-muted-foreground">{row.course_name || "-"}</span>
      ),
    },
    {
      header: "Lesson",
      accessor: "lesson_title" as keyof Exercise,
      render: (row: Exercise) => (
        <span className="text-muted-foreground">{row.lesson_title || "General Course Quiz"}</span>
      ),
    },
    {
      header: "Created By",
      render: (row: Exercise) => (
        <span className="text-muted-foreground">
          {row.subadmin?.name || "Unknown"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof Exercise,
      render: (row: Exercise) => {
        const canEdit = user?.id === row.subadminId || user?.role === 'admin' && !row.subadminId;

        return (
          <div className="flex items-center gap-2">
            {canEdit ? (
              <>
                <Link to={`${basePath}/quizzes/edit/${row.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic px-2">View Only</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in pb-12">
      <div>
        <PageHeader
          title="Quizzes & Exercises"
          subtitle="Manage multiple choice and short answer questions."
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm mb-6 mt-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            Current Page: {page}
          </span>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          <Link to={`${basePath}/quizzes/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">

        <DataTable
          columns={columns}
          data={exercises}
          isLoading={loading}
        />

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-card">
          <span className="text-sm text-muted-foreground">
            Showing Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
