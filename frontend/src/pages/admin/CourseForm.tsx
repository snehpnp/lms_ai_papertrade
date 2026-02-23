import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? "Course updated" : "Course created");
    navigate("/admin/courses");
  };

  return (
    <div className="animate-fade-in">
      <Link to="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <PageHeader title={isEdit ? "Edit Course" : "Add Course"} subtitle={isEdit ? "Update course details" : "Create a new trading course"} />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Course Title</label>
            <Input placeholder="e.g. Forex Trading Fundamentals" defaultValue={isEdit ? "Forex Trading Fundamentals" : ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Instructor</label>
            <Input placeholder="Instructor name" defaultValue={isEdit ? "James Carter" : ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <Textarea placeholder="Course description..." className="min-h-[120px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Thumbnail</label>
            <Input type="file" accept="image/*" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Forex</option>
                <option>Crypto</option>
                <option>Options</option>
                <option>Technical Analysis</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">{isEdit ? "Update Course" : "Create Course"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/courses")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;
