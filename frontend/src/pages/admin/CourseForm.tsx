import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ImagePlus,
  X,
  BookOpen,
  IndianRupee,
  Gift,
  Layout,
  Info,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { adminCoursesService } from "@/services/admin.service";
import { useAuth } from "@/contexts/AuthContext";
import { uploadToCloudinary } from "@/utils/cloudinary";

/* ===========================
   Types
=========================== */

type CourseStatus = "draft" | "published";
type CourseType = "free" | "paid";

interface ModuleInput {
  title: string;
  order: number;
}

interface CourseFormData {
  title: string;
  description: string;
  courseType: CourseType;
  price: number;
  status: CourseStatus;
  thumbnail: string;
  modules: ModuleInput[];
}

/* ===========================
   Helper Components
=========================== */

const SectionCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
      <Icon className="w-4 h-4 text-primary" />
      <span className="font-semibold text-sm">{title}</span>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

/* ===========================
   Component
=========================== */

const CourseWithModulesPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = `/${user?.role}`;

  const [loading, setLoading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    courseType: "free",
    price: 0,
    status: "draft",
    thumbnail: "",
    modules: [{ title: "", order: 1 }],
  });

  /* ===========================
     Load For Edit
  =========================== */

  useEffect(() => {
    if (isEdit && id) loadCourse(id);
  }, [id]);

  const loadCourse = async (courseId: string) => {
    try {
      const data = await adminCoursesService.getById(courseId);
      const price = Number(data.price);
      setFormData({
        title: data.title,
        description: data.description || "",
        courseType: price > 0 ? "paid" : "free",
        price,
        status: data.isPublished ? "published" : "draft",
        thumbnail: data.thumbnail || "",
        modules:
          data.modules?.length > 0
            ? data.modules.map((m: any) => ({ title: m.title, order: m.order }))
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
    value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    try {
      setThumbnailUploading(true);
      toast.info("Uploading banner...", { id: "thumb-upload" });
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, thumbnail: url }));
      toast.success("Banner uploaded!", { id: "thumb-upload" });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: "thumb-upload" });
    } finally {
      setThumbnailUploading(false);
      e.target.value = "";
    }
  };

  const addModule = () =>
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", order: prev.modules.length + 1 }],
    }));

  const removeModule = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));

  const handleModuleChange = (index: number, value: string) => {
    const updated = [...formData.modules];
    updated[index].title = value;
    setFormData((prev) => ({ ...prev, modules: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Course title is required");
    if (formData.courseType === "paid" && formData.price <= 0)
      return toast.error("Please enter a valid price for paid course");

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        slug: generateSlug(formData.title),
        price: formData.courseType === "free" ? 0 : Number(formData.price),
        thumbnail: formData.thumbnail || undefined,
        isPublished: formData.status === "published",
        modules: formData.modules
          .filter((m) => m.title.trim())
          .map((m, i) => ({ title: m.title, order: i + 1 })),
      };

      if (isEdit && id) {
        await adminCoursesService.update(id, payload);
        toast.success("Course updated successfully");
      } else {
        await adminCoursesService.create(payload);
        toast.success("Course created successfully");
      }
      navigate(`${basePath}/courses`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div className="animate-fade-in  mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`${basePath}/courses`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update course details and modules" : "Set up your course and add modules"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Info + Banner (2-column) ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
            <Info className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Basic Information</span>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-border">
            {/* Left — inputs */}
            <div className="p-5 space-y-4">
              <div>
                <FieldLabel>Course Title *</FieldLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Advanced Forex Trading Masterclass"
                  required
                  className="h-10"
                />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course..."
                  className="min-h-[160px] resize-none"
                />
              </div>
            </div>

            {/* Right — banner upload */}
            <div className="p-5">
              <FieldLabel>Course Banner</FieldLabel>
              <div
                className="relative w-full h-[196px] rounded-xl bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center cursor-pointer group border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden"
                style={
                  formData.thumbnail
                    ? { backgroundImage: `url(${formData.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" }
                    : {}
                }
                onClick={() => document.getElementById("thumb-input")?.click()}
              >
                {!formData.thumbnail && !thumbnailUploading && (
                  <div className="flex flex-col items-center gap-2.5 text-muted-foreground group-hover:text-primary transition-colors select-none">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Click to upload banner</p>
                      <p className="text-xs mt-0.5 text-muted-foreground/70">1280×720px · JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}

                {formData.thumbnail && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/30 transition flex items-center gap-1.5 border border-white/20"
                      onClick={(e) => { e.stopPropagation(); document.getElementById("thumb-input")?.click(); }}
                    >
                      <ImagePlus className="w-3.5 h-3.5" /> Change
                    </button>
                    <button
                      type="button"
                      className="bg-red-500/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition flex items-center gap-1.5 border border-red-400/30"
                      onClick={(e) => { e.stopPropagation(); setFormData((p) => ({ ...p, thumbnail: "" })); }}
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                )}

                {thumbnailUploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2.5">
                    <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-xs font-medium">Uploading...</p>
                  </div>
                )}
              </div>
              <input id="thumb-input" type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
            </div>
          </div>
        </div>
        {/* ── Pricing ── */}
        <SectionCard icon={IndianRupee} title="Pricing">
          {/* Free / Paid Toggle */}
          <div className="grid grid-cols-2 gap-3">
            {(["free", "paid"] as CourseType[]).map((type) => {
              const active = formData.courseType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      courseType: type,
                      price: type === "free" ? 0 : p.price || 0,
                    }))
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20 hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {type === "free" ? <Gift className="w-5 h-5" /> : <IndianRupee className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm capitalize">{type}</span>
                      {active ? (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {type === "free" ? "Anyone can enroll for free" : "Students pay to access"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Price input — only when paid */}
          {formData.courseType === "paid" && (
            <div className="animate-fade-in">
              <FieldLabel>Course Price (₹) *</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                  ₹
                </span>
                <Input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  placeholder="0"
                  min={1}
                  className="pl-7 h-10"
                  required
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Visibility ── */}
        <SectionCard icon={BookOpen} title="Visibility">
          <div className="grid grid-cols-2 gap-3">
            {(["draft", "published"] as CourseStatus[]).map((s) => {
              const active = formData.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, status: s }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20 hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      s === "published" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-sm capitalize">{s}</span>
                      {active && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s === "published" ? "Visible to students" : "Hidden from students"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Modules ── */}
        <SectionCard icon={Layout} title="Course Modules">
          <div className="space-y-3">
            {formData.modules.map((module, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <Input
                  value={module.title}
                  onChange={(e) => handleModuleChange(index, e.target.value)}
                  placeholder={`Module ${index + 1} title`}
                  className="flex-1 h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                />
                {formData.modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModule(index)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addModule}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Module
          </button>
        </SectionCard>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : isEdit ? (
              "Update Course"
            ) : (
              "Create Course"
            )}
          </Button>
          <Link to={`${basePath}/courses`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CourseWithModulesPage;
