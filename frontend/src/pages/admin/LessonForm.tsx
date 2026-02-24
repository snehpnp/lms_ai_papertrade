import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { adminCourseContentService } from "@/services/admin.service";


interface Module {
  id: string;
  title: string;
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

interface LessonFormData {
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl: string;
  pdfUrl?: string;
  content: string;
  duration: number;
  order: number;
}

const LessonForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [formData, setFormData] = useState<LessonFormData>({
    courseId: "",
    moduleId: "",
    title: "",
    description: "",
    thumbnail: "",
    videoUrl: "",
    pdfUrl: "",
    content: "",
    duration: 0,
    order: 1,
  });

  useEffect(() => {
    loadCourses();
    if (isEdit && id) loadLesson(id);
  }, [id]);

  // ✅ Load courses with modules
  const loadCourses = async () => {
    try {
      const res = await adminCourseContentService.coursewithmodule();
      setCourses(res || []);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  // ✅ Load lesson for edit
  const loadLesson = async (lessonId: string) => {
    try {
      const data = await adminCourseContentService.getOneLesson(lessonId);
    
      setFormData({
        courseId: data.course_id,
        moduleId: data.module_id,
        title: data.title,
        description: data.description || "",
        thumbnail: data.thumbnail || "",
        videoUrl: data.videoUrl || "",
        pdfUrl: data.pdfUrl || "",
        content: data.content || "",
        duration: data.duration || 0,
        order: data.order || 1
      });
    } catch {
      toast.error("Failed to load lesson");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "courseId") {
      setFormData((prev) => ({
        ...prev,
        courseId: value,
        moduleId: "", // reset module
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" || name === "duration" ? Number(value) : value,
    }));
  };

  // ✅ Proper request structure
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || !formData.moduleId)
      return toast.error("Select course & module");

    if (!formData.title.trim()) return toast.error("Title is required");
    if (!formData.content.trim()) return toast.error("Content is required");
    if (!formData.videoUrl.trim()) return toast.error("Video URL is required");

    let payload: any = {
      title: formData.title,
      order: formData.order,
      videoUrl: formData.videoUrl,
      duration: formData.duration,
      content: formData.content,
      pdfUrl: formData.pdfUrl || null,
      description: formData.description || null,
      thumbnail: formData.thumbnail || null,
    };

    try {
      setLoading(true);

      if (isEdit) {
        if (id) {
          await adminCourseContentService.updateLesson(id, payload);
        }
        toast.success("Lesson updated successfully");
      } else {
        await adminCourseContentService.createLesson(
          formData.moduleId,
          payload,
        );
        toast.success("Lesson created successfully");
      }

      navigate(-1);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === formData.courseId);

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

      <PageHeader
        title={isEdit ? "Edit Lesson" : "Add Lesson"}
        subtitle="Manage lesson inside module"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="grid grid-cols-12 gap-5">
          {/* Course */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">
              Select Course
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
              disabled={isEdit}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Module */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">
              Select Module
            </label>
            <select
              name="moduleId"
              value={formData.moduleId}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="">Select Module</option>
              {selectedCourse?.modules?.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">
              Lesson Title
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Order */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Order</label>
            <Input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
            />
          </div>

          {/* Thumbnail */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">
              Lesson Banner / Thumbnail URL (Optional)
            </label>
            <Input
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5">
              Short Description (Optional)
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[80px]"
            />
          </div>

          {/* Video URL & Duration */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">
              Video URL
            </label>
            <Input
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">
              Duration (Minutes)
            </label>
            <Input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5">
              Content
            </label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="min-h-[120px]"
            />
          </div>

          {/* pdfUrl */}
          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5">
              PDF URL (Optional)
            </label>
            <Input
              name="pdfUrl"
              value={formData.pdfUrl}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-12 flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isEdit
                  ? "Update Lesson"
                  : "Create Lesson"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LessonForm;
