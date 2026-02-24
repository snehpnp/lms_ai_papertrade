import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { adminCourseContentService } from "@/services/admin.service";
import { useAuth } from "@/contexts/AuthContext";

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
  content: string;
  videoUrl: string;
  duration: number;
  pdfUrl?: string;
  order: number;
  createdAt: string;
  exercises: Exercise[];
  module?: {
    title: string;
    course?: {
      title: string;
      subadminId?: string | null;
      subadmin?: {
        name: string;
      };
    };
  };
}

/* ===========================
   Component
=========================== */

const LessonsPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const basePath = `/${user?.role}`;

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

  const columns: Column<Lesson>[] = [
    {
      header: "#",
      render: (_row: Lesson, index: number) => (
        <span className="font-medium">{(page - 1) * limit + index + 1}</span>
      ),
      className: "w-16 text-center",
    },
     {
      header: "Course Name",
      render: (row: Lesson, index: number) => (
        <span className="font-medium">{row.module?.course?.title}</span>
      ),
    },
     {
      header: "Module Name",
      render: (row: Lesson, index: number) => (
        <span className="font-medium">{row.module?.title}</span>
      ),
    },
    {
      header: "Title",
      accessor: "title",
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
    header: "Created By",
    render: (row: Lesson) => (
      <span className="text-muted-foreground">
        {row.module?.course?.subadmin?.name || "Unknown"}
      </span>
    ),
  },
  {
    header: "Actions",
    render: (row: Lesson) => {
      const canEdit = user?.id === row.module?.course?.subadminId || user?.role === 'admin' && !row.module?.course?.subadminId; 

      return (
        <div className="flex gap-2">
          {canEdit ? (
            <>
              <Link to={`${basePath}/lessons/edit/${row.id}`}>
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
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic px-2">View Only</span>
          )}
        </div>
      );
    },
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
        <Link to={`${basePath}/lessons/add`}>
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
