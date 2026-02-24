import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { adminCourseContentService } from "@/services/admin.service";

/* ===========================
   Types
=========================== */

interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Exercise {
  id: string;
  type: string;
  question: string;
  options: ExerciseOption[];
}

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ";
  order: number;
  createdAt: string;
  exercises: Exercise[];
}

/* ===========================
   Component
=========================== */

const LessonsPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /* ===========================
     Fetch Lessons
  =========================== */

  const fetchLessons = async () => {
    try {
      setLoading(true);

      const response = await adminCourseContentService.getLessons({
        page,
        limit,
      });

      // Backend response expected:
      // { data: Lesson[], meta: { total, totalPages } }

      setLessons(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [moduleId, page]);

  /* ===========================
     Delete Lesson
  =========================== */

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await adminCourseContentService.deleteLesson(lessonId);
      toast.success("Lesson deleted successfully");
      fetchLessons();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  /* ===========================
     Columns
  =========================== */

  const columns = [
    {
      header: "#",
      render: (_row: Lesson, index: number) => (
        <span className="font-medium">{(page - 1) * limit + index + 1}</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Type",
      render: (row: Lesson) => (
        <Badge
          variant={
            row.type === "VIDEO"
              ? "default"
              : row.type === "TEXT"
                ? "secondary"
                : "destructive"
          }
        >
          {row.type}
        </Badge>
      ),
    },
    {
      header: "Exercises",
      render: (row: Lesson) => row.exercises?.length || 0,
    },
    {
      header: "Order",
      accessor: "order",
    },
    {
      header: "Created",
      render: (row: Lesson) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (row: Lesson) => (
        <div className="flex gap-2">
          <Link to={`/admin/lessons/edit/${row.id}`}>
            <Button size="icon" variant="outline">
              <Edit size={14} />
            </Button>
          </Link>

          <Button
            size="icon"
            variant="destructive"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  /* ===========================
     UI
  =========================== */

  return (
    <div className="animate-fade-in">
      <Link
        to="#"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <PageHeader title="Lessons" subtitle="Manage module lessons" />

      <div className="flex justify-end mb-4">
        <Link to={`/admin/lessons/add`}>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Add Lesson
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <DataTable
          columns={columns}
          data={lessons}
          isLoading={loading}
          emptyMessage="No lessons found"
        />

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} lessons
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;
