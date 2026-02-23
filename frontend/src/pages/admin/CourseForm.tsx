import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminCoursesService } from "@/services/admin.service";

/* ===========================
   Types
=========================== */

type CourseStatus = "draft" | "published";

interface ModuleInput {
  title: string;
  order: number;
}

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  status: CourseStatus;
  modules: ModuleInput[];
}

const CourseWithModulesPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    price: 0,
    category: "Forex",
    status: "draft",
    modules: [{ title: "", order: 1 }],
  });

  /* ===========================
     Load For Edit
  =========================== */

  useEffect(() => {
    if (isEdit && id) {
      loadCourse(id);
    }
  }, [id]);

  const loadCourse = async (courseId: string) => {
    try {
      const data = await adminCoursesService.getById(courseId);

      setFormData({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        category: data.category || "Forex",
        status: data.isPublished ? "published" : "draft",
        modules:
          data.modules?.length > 0
            ? data.modules.map((m: any) => ({
                title: m.title,
                order: m.order,
              }))
            : [{ title: "", order: 1 }],
      });
    } catch {
      toast.error("Failed to load course");
    }
  };

  /* ===========================
     Handlers
  =========================== */

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", order: prev.modules.length + 1 }],
    }));
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const handleModuleChange = (
    index: number,
    field: keyof ModuleInput,
    value: string | number,
  ) => {
    const updated = [...formData.modules];
    updated[index][field] = value as never;

    setFormData((prev) => ({
      ...prev,
      modules: updated,
    }));
  };

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        slug: generateSlug(formData.title),
        price: Number(formData.price),
        isPublished: formData.status === "published",
        modules: formData.modules
          .filter((m) => m.title.trim())
          .map((m, index) => ({
            title: m.title,
            order: index + 1,
          })),
      };

      if (isEdit && id) {
        await adminCoursesService.update(id, payload);
        toast.success("Course updated successfully");
      } else {
        await adminCoursesService.create(payload);
        toast.success("Course created successfully");
      }

      navigate("/admin/courses");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-fade-in">
      <Link
        to="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <PageHeader
        title={isEdit ? "Edit Course" : "Create Course"}
        subtitle="Add course with multiple modules"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-6"
      >
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Course Title"
          required
        />

        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="min-h-[120px]"
        />

        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />

        {/* Modules */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="font-semibold">Modules</h3>
            <Button type="button" onClick={addModule} variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Module
            </Button>
          </div>

          {formData.modules.map((module, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 bg-muted/30 flex items-center gap-3"
            >
              {/* Module Input */}
              <div className="flex-1">
                <Input
                  value={module.title}
                  onChange={(e) =>
                    handleModuleChange(index, "title", e.target.value)
                  }
                  placeholder={`Module ${index + 1} Title`}
                />
              </div>

              {/* Remove Button */}
              {formData.modules.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeModule(index)}
                  className="shrink-0"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isEdit
              ? "Update Course"
              : "Create Course"}
        </Button>
      </form>
    </div>
  );
};

export default CourseWithModulesPage;
