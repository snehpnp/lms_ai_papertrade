import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, BookOpen, Filter, Eye } from "lucide-react";
import { toast } from "sonner";
import { adminCoursesService } from "@/services/admin.service";
import { useAuth } from "@/contexts/AuthContext";

/* ===========================
   Types
=========================== */

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail: string | null;
  price: string;
  isPublished: boolean;
  subadminId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    modules: number;
    enrollments: number;
  };
  subadmin?: {
    name: string;
  };
}

/* ===========================
   Component
=========================== */

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();
  const basePath = `/${user?.role}`;

  /* ===========================
     Fetch Courses
  =========================== */

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await adminCoursesService.getAll();

      setCourses(data?.items || []);
      setFilteredCourses(data?.items || []);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ===========================
     Search Filter
  =========================== */

  useEffect(() => {
    const result = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && course.isPublished) ||
        (statusFilter === "DRAFT" && !course.isPublished);

      return matchesSearch && matchesStatus;
    });
    setFilteredCourses(result);
  }, [search, statusFilter, courses]);

  /* ===========================
     Delete Course
  =========================== */

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await adminCoursesService.delete(id);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  /* ===========================
     Columns
  =========================== */

  const columns = [
    {
      header: "#",
      render: (_row: Course, index: number) => (
        <span className="font-medium text-sm">{index + 1}</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "Banner",
      render: (row: Course) =>
        row.thumbnail ? (
          <img
            src={row.thumbnail}
            alt={row.title}
            className="w-20 h-12 object-cover rounded-md border border-border"
          />
        ) : (
          <div className="w-20 h-12 rounded-md bg-muted/60 flex items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        ),
    },
    {
      header: "Course",
      render: (row: Course) => (
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          {row.title}
        </div>
      ),
    },
    {
      header: "Type",
      render: (row: Course) => {
        const isPaid = Number(row.price) > 0;
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${isPaid
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "bg-green-500/10 text-green-600 border border-green-500/20"
                }`}
            >
              {isPaid ? `₹${Number(row.price).toLocaleString()}` : "FREE"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Modules",
      render: (row: Course) => row._count.modules,
    },
    {
      header: "Enrollments",
      render: (row: Course) => row._count.enrollments,
    },
    {
      header: "Status",
      render: (row: Course) => (
        <Badge variant={row.isPublished ? "default" : "secondary"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Created",
      render: (row: Course) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Created By",
      render: (row: Course) => (
        <span className="text-muted-foreground">
          {row.subadmin?.name || "Unknown"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row: Course) => {
        const canEdit = user?.id === row.subadminId || user?.role === 'admin' && !row.subadminId;
        // If admin created it, subadminId might be their ID.

        return (
          <div className="flex gap-2">
            <Link to={`${basePath}/courses/view/${row.id}`}>
              <Button size="icon" variant="outline" title="View as Student">
                <Eye size={14} />
              </Button>
            </Link>
            {canEdit ? (
              <>
                <Link to={`${basePath}/courses/edit/${row.id}`}>
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
      <PageHeader
        title="Courses"
        subtitle="Manage your trading courses"
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            Total Records: {filteredCourses.length}
          </span>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <Link to={`${basePath}/courses/add`}>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Course
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCourses}
        isLoading={loading}
        emptyMessage="No courses found"
        className="mt-6"
      />
    </div>
  );
};

export default CoursesPage;