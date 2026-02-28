import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, X, Upload, Video, FileText, Loader2, Sparkles } from "lucide-react";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { toast } from "sonner";
import { adminCourseContentService, adminAiService } from "@/services/admin.service";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const generateId = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "link",
  "image",
];

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
  const [videoUploading, setVideoUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [generatingDescriptionAI, setGeneratingDescriptionAI] = useState(false);
  const [generatingContentAI, setGeneratingContentAI] = useState(false);
  const [generatingQuizAI, setGeneratingQuizAI] = useState(false);
  const [quizCount, setQuizCount] = useState(5);
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

  const handleGenerateDescriptionAI = async () => {
    if (!formData.title.trim()) {
      return toast.error("Please enter a lesson title first");
    }

    try {
      setGeneratingDescriptionAI(true);
      const { description } = await adminAiService.generateLessonDescription(formData.title);
      setFormData((prev) => ({ ...prev, description }));
      toast.success("Description generated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate description");
    } finally {
      setGeneratingDescriptionAI(false);
    }
  };

  const handleGenerateContentAI = async () => {
    if (!formData.title.trim()) {
      return toast.error("Please enter a lesson title first");
    }

    try {
      setGeneratingContentAI(true);
      const { content } = await adminAiService.generateLessonContent(
        formData.title,
        formData.description || ""
      );
      setFormData((prev) => ({ ...prev, content }));
      toast.success("Content generated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate content");
    } finally {
      setGeneratingContentAI(false);
    }
  };

  const handleGenerateQuizAI = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return toast.error("Lesson title and content are required to generate a quiz");
    }

    try {
      setGeneratingQuizAI(true);
      toast.info(`Generating ${quizCount} quiz questions...`, { id: "generating-quiz" });

      const { questions } = await adminAiService.generateQuizQuestions(
        formData.title,
        formData.content,
        quizCount
      );

      if (questions && Array.isArray(questions)) {
        const newExercises: ExerciseData[] = questions.map((q: any) => ({

          type: "MCQ",
          question: q.question,
          options: q.options.map((opt: any) => ({

            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        }));

        setExercises((prev) => [...prev, ...newExercises]);
        toast.success(`Successfully generated ${questions.length} questions!`, { id: "generating-quiz" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate quiz", { id: "generating-quiz" });
    } finally {
      setGeneratingQuizAI(false);
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
                ? [{ id: generateId(), text: ex.answer, isCorrect: true }]
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

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    try {
      setVideoUploading(true);
      toast.info("Uploading video to Cloudinary...", { id: "video-upload" });
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        videoUrl: url,
      }));
      toast.success("Video uploaded successfully", { id: "video-upload" });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload video", { id: "video-upload" });
    } finally {
      setVideoUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    try {
      setPdfUploading(true);
      toast.info("Uploading PDF to Cloudinary...", { id: "pdf-upload" });
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        pdfUrl: url,
      }));
      toast.success("PDF uploaded successfully", { id: "pdf-upload" });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload PDF", { id: "pdf-upload" });
    } finally {
      setPdfUploading(false);
    }
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        type: "MCQ",
        question: "",
        options: [{ id: generateId(), text: "", isCorrect: true }],
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
        id: generateId(),
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
        lessonIdToUse = res?.id || res.id;
      }


      console.log("exercises", exercises)

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Short Description (Optional)</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateDescriptionAI}
                disabled={generatingDescriptionAI || !formData.title.trim()}
                className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5 border border-primary/20"
              >
                {generatingDescriptionAI ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {generatingDescriptionAI ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[80px]" />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5 flex items-center justify-between">
              <span>Video URL</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-bold">Recommended: MP4</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="Insert YouTube or Cloudinary URL"
                  className="pr-10"
                />
                {videoUploading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => document.getElementById('video-input')?.click()}
                disabled={videoUploading}
              >
                <Upload className="w-4 h-4" />
                {videoUploading ? "Uploading..." : "Upload"}
              </Button>
              <input
                id="video-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-1.5">Duration (Minutes)</label>
            <Input type="number" name="duration" value={formData.duration} onChange={handleChange} />
          </div>

          <div className="col-span-12">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Content (Rich Text Editor)</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateContentAI}
                disabled={generatingContentAI || !formData.title.trim()}
                className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5 border border-primary/20"
              >
                {generatingContentAI ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {generatingContentAI ? "Generating..." : "Generate Content with AI"}
              </Button>
            </div>
            <div className="bg-background rounded-lg border border-border overflow-hidden min-h-[150px] flex flex-col">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                className="flex-1 custom-quill-editor min-h-[150px]"
              />
            </div>
            <style>{`
              .custom-quill-editor .ql-editor {
                min-height: 150px;
                font-size: 0.875rem;
              }
              .custom-quill-editor .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
              }
              .custom-quill-editor .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: hsl(var(--muted) / 0.5);
              }
            `}</style>
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1.5 flex items-center justify-between">
              <span>PDF URL (Optional)</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-bold">Notes or Worksheets</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  name="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={handleChange}
                  placeholder="Insert PDF path or upload a file"
                  className="pr-10"
                />
                {pdfUploading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => document.getElementById('pdf-input')?.click()}
                disabled={pdfUploading}
              >
                <Upload className="w-4 h-4" />
                {pdfUploading ? "Uploading..." : "Upload File"}
              </Button>
              <input
                id="pdf-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
            </div>
          </div>

          {/* EXERCISES & QUIZZES */}
          <div className="col-span-12 mt-6 border-t border-border pt-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exercises / Quiz Questions</h3>
                <p className="text-sm text-muted-foreground">Add multiple choice or short answer questions</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted/50 border rounded-lg overflow-hidden h-9">
                  <span className="text-[10px] px-2 font-bold text-muted-foreground uppercase border-r bg-muted">Count</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-12 bg-transparent text-center text-sm focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateQuizAI}
                    disabled={generatingQuizAI || !formData.title.trim() || !formData.content.trim()}
                    className="h-full rounded-none border-l text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                  >
                    {generatingQuizAI ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {generatingQuizAI ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="h-9">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
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
                              updateExercise(index, "options", [{ id: generateId(), text: "", isCorrect: true }]);
                            } else if (ex.options.length < 2) {
                              updateExercise(index, "options", [
                                ...ex.options,
                                { id: generateId(), text: "", isCorrect: false }
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
