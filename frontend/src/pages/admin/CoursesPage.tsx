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

/* ===========================
   Types
=========================== */

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail: string | null;
  price: string; // coming as string
  isPublished: boolean;
  subadminId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    modules: number;
    enrollments: number;
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
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase())
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
    header: "Course",
    render: (row: Course) => (
      <div className="flex items-center gap-2">
        <BookOpen size={16} />
        {row.title}
      </div>
    ),
  },
  {
    header: "Price",
    render: (row: Course) => `₹${Number(row.price).toLocaleString()}`,
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
    header: "Actions",
    render: (row: Course) => (
      <div className="flex gap-2">
        <Link to={`/admin/courses/edit/${row.id}`}>
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

        <Link to="/admin/courses/add">
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