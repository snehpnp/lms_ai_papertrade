import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";
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
    const result = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(result);
  }, [search, courses]);

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
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${
              isPaid
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

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Link to={`${basePath}/courses/add`}>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Add Course
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl">
        {/* <DataTable
          columns={columns}
          data={filteredCourses}
          progressPending={loading}
          pagination
          highlightOnHover
          striped
          responsive
        /> */}

        <DataTable
          columns={columns}
          data={filteredCourses}
          isLoading={loading}
          emptyMessage="No courses found"
        />
      </div>
    </div>
  );
};

export default CoursesPage;