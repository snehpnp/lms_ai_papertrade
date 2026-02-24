import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { uploadToCloudinary } from "@/utils/cloudinary";
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

interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface ExerciseData {
  id?: string;
  type: "MCQ" | "FILL_IN_BLANKS";
  question: string;
  options: ExerciseOption[];
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

  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [deletedExercises, setDeletedExercises] = useState<string[]>([]);

  useEffect(() => {
    loadCourses();
    if (isEdit && id) loadLesson(id);
  }, [id]);

  const loadCourses = async () => {
    try {
      const res = await adminCourseContentService.coursewithmodule();
      setCourses(res || []);
    } catch {
      toast.error("Failed to load courses");
    }
  };

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
        order: data.order || 1,
      });

      if (data.exercises && Array.isArray(data.exercises)) {
        setExercises(
          data.exercises.map((ex: any) => ({
            id: ex.id,
            type: ex.type || "MCQ",
            question: ex.question || "",
            options: Array.isArray(ex.options)
              ? ex.options
              : ex.type === "FILL_IN_BLANKS" && ex.answer
              ? [{ id: crypto.randomUUID(), text: ex.answer, isCorrect: true }]
              : [],
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to load lesson");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "courseId") {
      setFormData((prev) => ({
        ...prev,
        courseId: value,
        moduleId: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" || name === "duration" ? Number(value) : value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      toast.info("Uploading image to Cloudinary...", { id: "uploading" });
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        thumbnail: url,
      }));
      toast.success("Image uploaded successfully", { id: "uploading" });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload to Cloudinary", { id: "uploading" });
    }
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        type: "MCQ",
        question: "",
        options: [{ id: crypto.randomUUID(), text: "", isCorrect: true }],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => {
      const clone = [...prev];
      const removed = clone.splice(index, 1)[0];
      if (removed.id) setDeletedExercises((d) => [...d, removed.id!]);
      return clone;
    });
  };

  const updateExercise = (index: number, key: keyof ExerciseData, value: any) => {
    setExercises((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [key]: value };
      return clone;
    });
  };

  const handleOptionTextChange = (exIndex: number, optIndex: number, val: string) => {
    setExercises((prev) => {
      const clone = [...prev];
      const currentOpts = [...clone[exIndex].options];
      currentOpts[optIndex] = { ...currentOpts[optIndex], text: val };
      clone[exIndex].options = currentOpts;
      return clone;
    });
  };

  const handleMakeCorrectOption = (exIndex: number, optIndex: number) => {
    setExercises((prev) => {
      const clone = [...prev];
      const currentOpts = clone[exIndex].options.map((o, i) => ({
        ...o,
        isCorrect: i === optIndex,
      }));
      clone[exIndex].options = currentOpts;
      return clone;
    });
  };

  const handleAddOption = (exIndex: number) => {
    setExercises((prev) => {
      const clone = [...prev];
      clone[exIndex].options.push({
        id: crypto.randomUUID(),
        text: "",
        isCorrect: false,
      });
      return clone;
    });
  };

  const handleRemoveOption = (exIndex: number, optIndex: number) => {
    setExercises((prev) => {
      const clone = [...prev];
      const currentOpts = [...clone[exIndex].options];
      currentOpts.splice(optIndex, 1);
      clone[exIndex].options = currentOpts;
      return clone;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || !formData.moduleId)
      return toast.error("Select course & module");

    if (!formData.title.trim()) return toast.error("Title is required");
    if (!formData.content.trim()) return toast.error("Content is required");
    if (!formData.videoUrl.trim()) return toast.error("Video URL is required");

    for (const ex of exercises) {
      if (!ex.question.trim()) {
        return toast.error("All exercises must have a question defined.");
      }
      if (ex.type === "FILL_IN_BLANKS" && !ex.options[0]?.text.trim()) {
        return toast.error("Fill in blanks exercises must have an answer.");
      }
      if (ex.type === "MCQ") {
        if (ex.options.length < 2) return toast.error("MCQ must have at least 2 options.");
        if (!ex.options.some((o) => o.isCorrect))
          return toast.error("MCQ must have a correct option selected.");
        for (const opt of ex.options) {
          if (!opt.text.trim()) return toast.error("All MCQ options must have text.");
        }
      }
    }

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

      let lessonIdToUse = id;

      if (isEdit && id) {
        await adminCourseContentService.updateLesson(id, payload);
      } else {
        const res: any = await adminCourseContentService.createLesson(
          formData.moduleId,
          payload
        );
        lessonIdToUse = res.data?.id || res.id;
      }

      if (lessonIdToUse) {
        // Sync Exercises
        for (const delId of deletedExercises) {
          await adminCourseContentService.deleteExercise(delId).catch(console.error);
        }

        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i];
          const exPayload = {
            type: ex.type,
            question: ex.question,
            order: i + 1,
            options: ex.type === "MCQ" ? ex.options : undefined,
            answer: ex.type === "FILL_IN_BLANKS" ? (ex.options[0]?.text || "") : undefined,
          };

          if (ex.id) {
            await adminCourseContentService.updateExercise(ex.id, exPayload).catch(console.error);
          } else {
            await adminCourseContentService.addExercise(lessonIdToUse, exPayload).catch(console.error);
          }
        }
      }

      toast.success(isEdit ? "Lesson updated successfully" : "Lesson created successfully");
      navigate(-1);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === formData.courseId);

  return (
    <div className="animate-fade-in pb-12">
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
        className="inline-flex items-center gap-1.5 text-sm mb-4 text-muted-foreground hover:text-foreground transition-colors"
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
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Select Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
              disabled={isEdit}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Select Module</label>
            <select
              name="moduleId"
              value={formData.moduleId}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="">Select Module</option>
              {selectedCourse?.modules?.map((module) => (
                <option key={module.id} value={module.id}>{module.title}</option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Lesson Title</label>
            <Input name="title" value={formData.title} onChange={handleChange} />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Order</label>
            <Input type="number" name="order" value={formData.order} onChange={handleChange} />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Lesson Banner / Thumbnail (Upload Image)</label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} className="cursor-pointer" />
            {formData.thumbnail && (
              <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-muted flex items-center justify-center p-2 relative h-40">
                {formData.thumbnail.startsWith("data:image") || formData.thumbnail.startsWith("http") ? (
                   <img src={formData.thumbnail} alt="Thumbnail Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                ) : (
                   <span className="text-sm text-muted-foreground p-4 break-all">[Preview unavailable]</span>
                )}
                <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 h-7 px-2 text-xs opacity-80 hover:opacity-100" onClick={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))}>Clear</Button>
              </div>
            )}
            {!formData.thumbnail && <p className="text-xs text-muted-foreground mt-1.5">Upload a JPEG, PNG, or WebP image.</p>}
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5">Short Description (Optional)</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[80px]" />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Video URL</label>
            <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Duration (Minutes)</label>
            <Input type="number" name="duration" value={formData.duration} onChange={handleChange} />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5">Content</label>
            <Textarea name="content" value={formData.content} onChange={handleChange} className="min-h-[120px]" />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5">PDF URL (Optional)</label>
            <Input name="pdfUrl" value={formData.pdfUrl} onChange={handleChange} />
          </div>

          {/* EXERCISES & QUIZZES */}
          <div className="col-span-12 mt-6 border-t border-border pt-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exercises / Quiz Questions</h3>
                <p className="text-sm text-muted-foreground">Add multiple choice or short answer questions</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-10 bg-muted/30 border border-dashed rounded-xl">
                <p className="text-sm text-muted-foreground">No questions added yet.</p>
                <Button type="button" variant="link" size="sm" onClick={addExercise} className="mt-2">
                  Click here to add the first question
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {exercises.map((ex, index) => (
                  <div key={index} className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b pb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm bg-background px-3 py-1 rounded-full border">Q{index + 1}</span>
                        <select
                          className="text-sm border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={ex.type}
                          onChange={(e) => {
                            const type = e.target.value as "MCQ" | "FILL_IN_BLANKS";
                            updateExercise(index, "type", type);
                            if (type === "FILL_IN_BLANKS") {
                              updateExercise(index, "options", [{ id: crypto.randomUUID(), text: "", isCorrect: true }]);
                            } else if (ex.options.length < 2) {
                               updateExercise(index, "options", [
                                 ...ex.options, 
                                 { id: crypto.randomUUID(), text: "", isCorrect: false }
                               ].slice(0, 2));
                            }
                          }}
                        >
                          <option value="MCQ">Multiple Choice Question</option>
                          <option value="FILL_IN_BLANKS">Short Text Answer</option>
                        </select>
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeExercise(index)}>
                        <Trash2 className="w-4 h-4 mr-1.5" /> Remove
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Question Text</label>
                        <Input value={ex.question} onChange={e => updateExercise(index, "question", e.target.value)} placeholder="E.g. What is the main thesis...?" required className="bg-background" />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          {ex.type === "MCQ" ? "Options & Select Correct Answer" : "Accepted Answer Text"}
                        </label>

                        {ex.type === "FILL_IN_BLANKS" && (
                          <Input value={ex.options[0]?.text || ""} onChange={e => handleOptionTextChange(index, 0, e.target.value)} placeholder="Type the correct answer needed to pass" required className="bg-background" />
                        )}

                        {ex.type === "MCQ" && (
                          <div className="space-y-3">
                            {ex.options.map((opt, optIndex) => (
                              <div key={opt.id} className="flex flex-wrap items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer shrank-0 bg-background border px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                                  <input type="radio" name={`correct-${index}`} checked={opt.isCorrect} onChange={() => handleMakeCorrectOption(index, optIndex)} className="w-4 h-4 text-primary cursor-pointer accent-primary" />
                                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Correct Option</span>
                                </label>
                                <Input className="flex-1 min-w-[200px] bg-background" value={opt.text} onChange={e => handleOptionTextChange(index, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} required />
                                {ex.options.length > 2 && (
                                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500" onClick={() => handleRemoveOption(index, optIndex)}>Remove</Button>
                                )}
                              </div>
                            ))}
                            <div className="pt-1">
                                <Button type="button" variant="secondary" size="sm" onClick={() => handleAddOption(index)} className="px-4 text-xs">
                                  + Add Another Option
                                </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 flex gap-3 pt-6 border-t border-border mt-4">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Please wait..." : isEdit ? "Update Lesson & Quizzes" : "Publish Lesson"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
              Cancel Setup
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LessonForm;
