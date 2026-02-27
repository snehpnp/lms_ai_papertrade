import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { adminCourseContentService, adminCoursesService } from "@/services/admin.service";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
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
        search,
        status: statusFilter,
        courseId: courseFilter,
        moduleId: moduleFilter,
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
    const loadCourses = async () => {
      try {
        const res = await adminCoursesService.getFilterOptions();
        setAllCourses(res || []);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseFilter) {
      const course = allCourses.find((c) => c.id === courseFilter);
      // If course has modules already (from getAll include), use them, otherwise we might need to fetch
      // Let's check adminCoursesService.getAll backend to see if it includes modules.
      // If not, we can fetch course by ID.
      setAllModules(course?.modules || []);
    } else {
      setAllModules([]);
    }
    setModuleFilter("");
  }, [courseFilter, allCourses]);

  useEffect(() => {
    fetchLessons();
  }, [moduleId, page, search, statusFilter, courseFilter, moduleFilter]);

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


      <PageHeader title="Lessons" subtitle="Manage module lessons" />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm mb-6 mt-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons..."
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
            Total Records: {total}
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
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={courseFilter}
              onChange={(e) => {
                setPage(1);
                setCourseFilter(e.target.value);
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-[150px] md:max-w-[200px]"
            >
              <option value="">All Courses</option>
              {allCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              disabled={!courseFilter}
              onChange={(e) => {
                setPage(1);
                setModuleFilter(e.target.value);
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-[150px]"
            >
              <option value="">All Modules</option>
              {allModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <Link to={`${basePath}/lessons/add`}>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Lesson
            </Button>
          </Link>
        </div>
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
