import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { adminCourseContentService } from "@/services/admin.service";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Exercise {
  id: string;
  type: string;
  question: string;
  course_name?: string;
  lesson_title?: string;
}

const QuizzesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
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
      header: "Actions",
      accessor: "id" as keyof Exercise,
      render: (row: Exercise) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/quizzes/edit/${row.id}`}>
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
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Quizzes & Exercises"
          subtitle="Manage multiple choice and short answer questions."
        />
        <Link to="/admin/quizzes/new">
          <Button className="hover:scale-105 transition-transform">
            <Plus className="h-4 w-4 mr-2" />
            Add New Quiz/Exercise
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

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
