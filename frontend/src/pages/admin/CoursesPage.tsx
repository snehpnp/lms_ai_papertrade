import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";

const mockCourses = [
  { id: "1", title: "Forex Trading Fundamentals", instructor: "James Carter", lessons: 24, students: 156, status: "published" },
  { id: "2", title: "Technical Analysis Mastery", instructor: "Sarah Lee", lessons: 18, students: 89, status: "published" },
  { id: "3", title: "Risk Management Pro", instructor: "Mike Johnson", lessons: 12, students: 210, status: "draft" },
  { id: "4", title: "Cryptocurrency Trading", instructor: "Alex Kim", lessons: 20, students: 134, status: "published" },
];

const CoursesPage = () => {
  const [search, setSearch] = useState("");
  const filtered = mockCourses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Courses"
        subtitle="Manage trading courses"
        action={
          <Button asChild>
            <Link to="/admin/courses/add"><Plus className="w-4 h-4 mr-2" /> Add Course</Link>
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {course.title}
                  </div>
                </TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>{course.lessons}</TableCell>
                <TableCell>{course.students}</TableCell>
                <TableCell>
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/courses/edit/${course.id}`}><Edit className="w-4 h-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-loss-foreground hover:text-loss-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CoursesPage;
